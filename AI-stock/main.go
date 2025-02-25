package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

//go:embed dist/*
var distFS embed.FS

type StockReportDownloader struct {
	BaseURL     string
	DownloadURL string
	Headers     map[string]string
}

type CompanyInfo struct {
	Code  string `json:"code"`
	OrgID string `json:"orgId"`
}

type DownloadRequest struct {
	CompanyName string `json:"company_name"`
	Year        int    `json:"year,omitempty"`
}

type DownloadedFile struct {
	Title    string `json:"title"`
	FileName string `json:"file_name"`
	FilePath string `json:"file_path"`
}

func NewStockReportDownloader() *StockReportDownloader {
	return &StockReportDownloader{
		BaseURL:     "http://www.cninfo.com.cn/new/hisAnnouncement/query",
		DownloadURL: "http://static.cninfo.com.cn/",
		Headers: map[string]string{
			"User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
			"Accept":          "*/*",
			"Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
		},
	}
}

func (d *StockReportDownloader) searchCompany(companyName string) (*CompanyInfo, error) {
	searchURL := "http://www.cninfo.com.cn/new/information/topSearch/query"

	params := map[string]string{
		"keyWord": companyName,
		"maxNum":  "10",
	}

	req, err := http.NewRequest("POST", searchURL, strings.NewReader(mapToFormData(params)))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	for k, v := range d.Headers {
		req.Header.Set(k, v)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("搜索公司信息失败：HTTP %d", resp.StatusCode)
	}

	var companies []CompanyInfo
	if err := json.NewDecoder(resp.Body).Decode(&companies); err != nil {
		return nil, err
	}

	if len(companies) == 0 {
		return nil, fmt.Errorf("未找到公司：%s", companyName)
	}

	return &companies[0], nil
}

func (d *StockReportDownloader) downloadReports(companyName string, year int) ([]DownloadedFile, error) {
	currentYear := time.Now().Year()
	if year == 0 {
		year = currentYear
	} else if year > currentYear {
		fmt.Printf("指定的年份%d尚未到来，将尝试下载%d年的报告...\n", year, currentYear)
		year = currentYear
	}

	companyInfo, err := d.searchCompany(companyName)
	if err != nil {
		return nil, err
	}

	// 从指定年份开始，逐年尝试下载直到找到可用的报告
	originalYear := year
	for year >= currentYear-2 { // 最多往前查找2年
		files, err := d.downloadReportsForYear(companyName, companyInfo, year)
		if err == nil && len(files) > 0 {
			if year != originalYear {
				fmt.Printf("已找到%d年的报告\n", year)
			}
			return files, nil
		}

		if strings.Contains(err.Error(), "未找到") && strings.Contains(err.Error(), "的任何报表") {
			if year > 1 {
				fmt.Printf("未找到%d年的报告，尝试下载%d年的报告...\n", year, year-1)
				year--
				continue
			}
		}
		return nil, err
	}

	return nil, fmt.Errorf("未能找到%d年及之前的报告", originalYear)
}

func (d *StockReportDownloader) downloadReportsForYear(companyName string, companyInfo *CompanyInfo, year int) ([]DownloadedFile, error) {
	// 创建基础下载目录
	baseDownloadDir := filepath.Join("downloads", companyName)

	// 设置查询参数
	params := map[string]string{
		"pageNum":   "1",
		"pageSize":  "100",
		"column":    "szse",
		"tabName":   "fulltext",
		"plate":     "",
		"stock":     fmt.Sprintf("%s,%s", companyInfo.Code, companyInfo.OrgID),
		"searchkey": "",
		"secid":     "",
		"category":  "category_ndbg_szsh;category_bndbg_szsh;category_yjdbg_szsh;category_sjdbg_szsh",
		"trade":     "",
		"seDate":    fmt.Sprintf("%d-01-01~%d-12-31", year, year),
		"sortName":  "code",
		"sortType":  "asc",
	}

	req, err := http.NewRequest("POST", d.BaseURL, strings.NewReader(mapToFormData(params)))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	for k, v := range d.Headers {
		req.Header.Set(k, v)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("获取报表列表失败：HTTP %d", resp.StatusCode)
	}

	var result struct {
		Announcements []struct {
			AnnouncementTitle string `json:"announcementTitle"`
			AdjunctUrl       string `json:"adjunctUrl"`
		} `json:"announcements"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	if len(result.Announcements) == 0 {
		return nil, fmt.Errorf("未找到%d年的任何报表", year)
	}

	downloadedFiles := []DownloadedFile{}
	reportTypes := map[string][]string{
		"第一季度报告": {"一季度报告", "第一季度报告", "年一季度报告"},
		"半年度报告":  {"半年度报告", "中期报告"},
		"第三季度报告": {"三季度报告", "第三季度报告"},
		"年度报告":   {"年度报告", "年报"},
	}

	for _, announcement := range result.Announcements {
		title := announcement.AnnouncementTitle
		// 排除摘要和英文版报告
		if strings.Contains(title, "摘要") || strings.Contains(title, "英文") ||
			strings.Contains(title, "补充") || strings.Contains(title, "更正") {
			continue
		}

		// 从标题中提取实际年份
		yearRegex := regexp.MustCompile(`20\d{2}`)
		yearMatch := yearRegex.FindString(title)
		if yearMatch == "" {
			continue
		}
		actualYear := yearMatch

		// 检查是否为所需的报告类型
		var isTargetReport bool
		var reportCategory string
		for category, patterns := range reportTypes {
			for _, pattern := range patterns {
				if strings.Contains(title, pattern) {
					isTargetReport = true
					reportCategory = category
					break
				}
			}
			if isTargetReport {
				break
			}
		}

		if isTargetReport {
			// 使用实际年份创建目录
			downloadDir := filepath.Join(baseDownloadDir, actualYear)
			if err := os.MkdirAll(downloadDir, 0755); err != nil {
				return nil, err
			}

			// 生成标准化的文件名
			standardTitle := fmt.Sprintf("%s年%s_%s", actualYear, reportCategory, companyName)
			fileName := standardTitle + ".pdf"
			filePath := filepath.Join(downloadDir, fileName)

			// 检查文件是否已存在
			if _, err := os.Stat(filePath); err == nil {
				fmt.Printf("文件已存在，跳过下载：%s\n", fileName)
				downloadedFiles = append(downloadedFiles, DownloadedFile{
					Title:    announcement.AnnouncementTitle,
					FileName: fileName,
					FilePath: filepath.Join("downloads", companyName, actualYear, fileName),
				})
				continue
			}

			// 下载PDF文件
			pdfURL := d.DownloadURL + announcement.AdjunctUrl
			fmt.Printf("正在下载：%s\n", fileName)

			pdfResp, err := http.Get(pdfURL)
			if err != nil {
				fmt.Printf("下载失败：%s，错误：%v\n", fileName, err)
				continue
			}
			defer pdfResp.Body.Close()

			if pdfResp.StatusCode != 200 {
				fmt.Printf("下载失败：%s，HTTP %d\n", fileName, pdfResp.StatusCode)
				continue
			}

			file, err := os.Create(filePath)
			if err != nil {
				return nil, err
			}
			defer file.Close()

			if _, err := io.Copy(file, pdfResp.Body); err != nil {
				return nil, err
			}

			fmt.Printf("下载完成：%s\n", fileName)
			downloadedFiles = append(downloadedFiles, DownloadedFile{
				Title:    announcement.AnnouncementTitle,
				FileName: fileName,
				FilePath: filepath.Join("downloads", companyName, actualYear, fileName),
			})
		}
	}

	if len(downloadedFiles) == 0 {
		return nil, fmt.Errorf("未找到%d年的季度报表或年度报表", year)
	}

	return downloadedFiles, nil
}

func mapToFormData(params map[string]string) string {
	var parts []string
	for k, v := range params {
		parts = append(parts, fmt.Sprintf("%s=%s", k, v))
	}
	return strings.Join(parts, "&")
}

func main() {
	// 创建下载目录
	os.MkdirAll("downloads", 0755)

	// 创建下载器实例
	downloader := NewStockReportDownloader()

	// 设置gin路由
	r := gin.Default()

	// 提供下载文件的静态服务
	r.Static("/downloads", "downloads")

	// API路由
	r.POST("/api/download", func(c *gin.Context) {
		var req DownloadRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误"})
			return
		}

		if req.CompanyName == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "请输入公司名称"})
			return
		}

		// 下载报告
		files, err := downloader.downloadReports(req.CompanyName, req.Year)
		if err != nil {
			if strings.Contains(err.Error(), "未找到公司") {
				c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			} else if strings.Contains(err.Error(), "未找到") && strings.Contains(err.Error(), "的任何报表") {
				c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "下载报告时发生错误：" + err.Error()})
			}
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "下载成功",
			"files":   files,
		})
	})

	// 提供嵌入的静态文件服务
	distFileSys, err := fs.Sub(distFS, "dist")
	if err != nil {
		panic(err)
	}

	// 处理前端路由
	r.NoRoute(func(c *gin.Context) {
		fileServer := http.FileServer(http.FS(distFileSys))
		fileServer.ServeHTTP(c.Writer, c.Request)
	})

	// 启动服务器
	fmt.Println("服务器已启动，访问 http://localhost:8080")
	r.Run(":8080")
}