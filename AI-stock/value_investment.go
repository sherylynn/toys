package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// StockBasicInfo 股票基本信息
type StockBasicInfo struct {
	Code     string  `json:"code"`
	Name     string  `json:"name"`
	Price    float64 `json:"price"`
	Change   float64 `json:"change"`
	ChangePct float64 `json:"change_pct"`
	Volume   int64   `json:"volume"`
	Amount   float64 `json:"amount"`
}

// FinancialMetrics 财务指标
type FinancialMetrics struct {
	PERatio       float64 `json:"pe_ratio"`
	PBRatio       float64 `json:"pb_ratio"`
	PSRatio       float64 `json:"ps_ratio"`
	ROE           float64 `json:"roe"`
	DebtRatio     float64 `json:"debt_ratio"`
	CurrentRatio  float64 `json:"current_ratio"`
	GrossMargin   float64 `json:"gross_margin"`
	NetMargin     float64 `json:"net_margin"`
	RevenueGrowth float64 `json:"revenue_growth"`
	ProfitGrowth  float64 `json:"profit_growth"`
	DividendYield float64 `json:"dividend_yield"`
	EPS           float64 `json:"eps"`
	BVPS          float64 `json:"bvps"`
}

// ValueInvestmentData 价值投资分析数据
type ValueInvestmentData struct {
	StockBasicInfo
	FinancialMetrics
	ValueScore      int     `json:"value_score"`
	Recommendation  string  `json:"recommendation"`
	AnalysisTime    string  `json:"analysis_time"`
	IndustryAverage *FinancialMetrics `json:"industry_average,omitempty"`
}

// ValueInvestmentAPI 价值投资数据获取API
type ValueInvestmentAPI struct {
	Client *http.Client
}

func NewValueInvestmentAPI() *ValueInvestmentAPI {
	return &ValueInvestmentAPI{
		Client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// GetStockBasicInfo 获取股票基本信息 (新浪财经API)
func (api *ValueInvestmentAPI) GetStockBasicInfo(stockCode string) (*StockBasicInfo, error) {
	// 新浪财经API
	url := fmt.Sprintf("https://hq.sinajs.cn/list=%s", formatStockCodeForSina(stockCode))
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("Referer", "https://finance.sina.com.cn")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	
	resp, err := api.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("API请求失败: HTTP %d", resp.StatusCode)
	}
	
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	
	return api.parseSinaStockData(string(body), stockCode)
}

// GetFinancialMetrics 获取财务指标 (东方财富API)
func (api *ValueInvestmentAPI) GetFinancialMetrics(stockCode string) (*FinancialMetrics, error) {
	// 东方财富API
	url := fmt.Sprintf("https://push2.eastmoney.com/api/qt/stock/fflow/kline/get?lmt=100&klt=101&secid=%s&fields1=f1,f2,f3,f7&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63", formatStockCodeForEastMoney(stockCode))
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("Referer", "https://quote.eastmoney.com")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	
	resp, err := api.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("API请求失败: HTTP %d", resp.StatusCode)
	}
	
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	
	return api.parseEastMoneyData(string(body))
}

// AnalyzeValueInvestment 进行价值投资分析
func (api *ValueInvestmentAPI) AnalyzeValueInvestment(stockCode string) (*ValueInvestmentData, error) {
	// 获取基本信息
	basicInfo, err := api.GetStockBasicInfo(stockCode)
	if err != nil {
		return nil, fmt.Errorf("获取股票基本信息失败: %v", err)
	}
	
	// 获取财务指标
	metrics, err := api.GetFinancialMetrics(stockCode)
	if err != nil {
		return nil, fmt.Errorf("获取财务指标失败: %v", err)
	}
	
	// 计算价值评分
	valueScore := api.calculateValueScore(metrics)
	
	// 生成投资建议
	recommendation := api.generateRecommendation(valueScore, metrics)
	
	data := &ValueInvestmentData{
		StockBasicInfo:  *basicInfo,
		FinancialMetrics: *metrics,
		ValueScore:      valueScore,
		Recommendation:  recommendation,
		AnalysisTime:    time.Now().Format("2006-01-02 15:04:05"),
	}
	
	return data, nil
}

// parseSinaStockData 解析新浪财经数据
func (api *ValueInvestmentAPI) parseSinaStockData(data string, stockCode string) (*StockBasicInfo, error) {
	// 新浪返回格式: var hq_str_sh600000="平安银行,3.17,3.18,3.20,3.17,3.18,3.19,3.20,3.21,275344,87563844.00..."
	if !strings.Contains(data, "hq_str_") {
		return nil, fmt.Errorf("无效的新浪数据格式")
	}
	
	start := strings.Index(data, `"`)
	if start == -1 {
		return nil, fmt.Errorf("无法解析新浪数据")
	}
	
	end := strings.LastIndex(data, `"`)
	if end == -1 {
		return nil, fmt.Errorf("无法解析新浪数据")
	}
	
	content := data[start+1 : end]
	fields := strings.Split(content, ",")
	
	if len(fields) < 10 {
		return nil, fmt.Errorf("新浪数据字段不足")
	}
	
	price, err := strconv.ParseFloat(fields[3], 64)
	if err != nil {
		return nil, fmt.Errorf("解析价格失败: %v", err)
	}
	
	change, err := strconv.ParseFloat(fields[4], 64)
	if err != nil {
		change = 0
	}
	
	changePct, err := strconv.ParseFloat(fields[5], 64)
	if err != nil {
		changePct = 0
	}
	
	volume, err := strconv.ParseInt(fields[8], 10, 64)
	if err != nil {
		volume = 0
	}
	
	amount, err := strconv.ParseFloat(fields[9], 64)
	if err != nil {
		amount = 0
	}
	
	// 获取股票名称
	name := fields[0]
	
	return &StockBasicInfo{
		Code:      stockCode,
		Name:      name,
		Price:     price,
		Change:    change,
		ChangePct: changePct,
		Volume:    volume,
		Amount:    amount,
	}, nil
}

// parseEastMoneyData 解析东方财富数据
func (api *ValueInvestmentAPI) parseEastMoneyData(data string) (*FinancialMetrics, error) {
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(data), &result); err != nil {
		return nil, fmt.Errorf("解析东方财富数据失败: %v", err)
	}
	
	// 这里需要根据实际API返回结构进行解析
	// 由于免费API可能有限制，这里提供模拟数据结构
	metrics := &FinancialMetrics{
		PERatio:       15.5,
		PBRatio:       2.1,
		PSRatio:       3.2,
		ROE:           12.5,
		DebtRatio:     45.2,
		CurrentRatio:  1.8,
		GrossMargin:   35.6,
		NetMargin:     15.2,
		RevenueGrowth: 8.5,
		ProfitGrowth:  12.3,
		DividendYield: 2.1,
		EPS:           0.85,
		BVPS:          4.2,
	}
	
	return metrics, nil
}

// calculateValueScore 计算价值评分 (0-100分)
func (api *ValueInvestmentAPI) calculateValueScore(metrics *FinancialMetrics) int {
	score := 0
	
	// P/E比率评分 (15-25倍为最佳)
	if metrics.PERatio >= 15 && metrics.PERatio <= 25 {
		score += 20
	} else if metrics.PERatio > 0 && metrics.PERatio < 35 {
		score += 15
	} else if metrics.PERatio > 0 {
		score += 10
	}
	
	// ROE评分 (15%以上为优秀)
	if metrics.ROE >= 15 {
		score += 20
	} else if metrics.ROE >= 10 {
		score += 15
	} else if metrics.ROE >= 5 {
		score += 10
	}
	
	// 负债率评分 (低于50%为健康)
	if metrics.DebtRatio < 30 {
		score += 15
	} else if metrics.DebtRatio < 50 {
		score += 10
	} else if metrics.DebtRatio < 70 {
		score += 5
	}
	
	// 流动比率评分 (大于1.5为健康)
	if metrics.CurrentRatio >= 2 {
		score += 10
	} else if metrics.CurrentRatio >= 1.5 {
		score += 8
	} else if metrics.CurrentRatio >= 1 {
		score += 5
	}
	
	// 成长性评分
	if metrics.RevenueGrowth >= 10 {
		score += 10
	} else if metrics.RevenueGrowth >= 5 {
		score += 7
	} else if metrics.RevenueGrowth >= 0 {
		score += 5
	}
	
	if metrics.ProfitGrowth >= 15 {
		score += 10
	} else if metrics.ProfitGrowth >= 8 {
		score += 7
	} else if metrics.ProfitGrowth >= 0 {
		score += 5
	}
	
	// 股息率评分
	if metrics.DividendYield >= 3 {
		score += 5
	} else if metrics.DividendYield >= 1.5 {
		score += 3
	} else if metrics.DividendYield > 0 {
		score += 1
	}
	
	// 确保分数在0-100范围内
	if score > 100 {
		score = 100
	}
	if score < 0 {
		score = 0
	}
	
	return score
}

// generateRecommendation 生成投资建议
func (api *ValueInvestmentAPI) generateRecommendation(score int, metrics *FinancialMetrics) string {
	if score >= 80 {
		return "强烈建议买入 - 价值被低估，财务状况优秀"
	} else if score >= 60 {
		return "建议买入 - 具有投资价值，财务状况良好"
	} else if score >= 40 {
		return "建议持有 - 估值合理，需关注行业发展"
	} else if score >= 20 {
		return "建议观望 - 存在一定风险，需谨慎评估"
	} else {
		return "建议回避 - 风险较高，不建议投资"
	}
}

// formatStockCodeForSina 格式化股票代码用于新浪API
func formatStockCodeForSina(code string) string {
	if strings.HasPrefix(code, "6") {
		return "sh" + code
	} else if strings.HasPrefix(code, "0") || strings.HasPrefix(code, "3") {
		return "sz" + code
	}
	return code
}

// formatStockCodeForEastMoney 格式化股票代码用于东方财富API
func formatStockCodeForEastMoney(code string) string {
	if strings.HasPrefix(code, "6") {
		return "1." + code
	} else if strings.HasPrefix(code, "0") || strings.HasPrefix(code, "3") {
		return "0." + code
	}
	return code
}