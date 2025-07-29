package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

func main() {
	// 创建必要的目录
	os.MkdirAll("cache", 0755)
	os.MkdirAll("charts", 0755)
	os.MkdirAll("reports", 0755)
	
	// 创建价值投资API实例
	api := NewEnhancedValueInvestmentAPI()
	
	// 设置HTTP服务器用于API测试
	go func() {
		mux := http.NewServeMux()
		
		// 价值投资分析API
		mux.HandleFunc("/api/value-investment/", func(w http.ResponseWriter, r *http.Request) {
			stockCode := r.URL.Path[len("/api/value-investment/"):]
			if stockCode == "" {
				http.Error(w, "股票代码不能为空", http.StatusBadRequest)
				return
			}
			
			fmt.Printf("API请求: 分析股票 %s\n", stockCode)
			
			data, err := api.AnalyzeValueInvestmentWithCache(stockCode)
			if err != nil {
				http.Error(w, fmt.Sprintf("分析失败: %v", err), http.StatusInternalServerError)
				return
			}
			
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"data": data,
			})
		})
		
		fmt.Println("测试服务器启动在 http://localhost:8081")
		log.Fatal(http.ListenAndServe(":8081", mux))
	}()
	
	// 等待服务器启动
	time.Sleep(1 * time.Second)
	
	// 测试云南白药
	fmt.Println("=== 测试云南白药 (000538) ===")
	testYunnanBaiyaoAPI("http://localhost:8081")
	
	fmt.Println("\n=== 测试完成 ===")
	fmt.Println("你可以手动测试其他API:")
	fmt.Println("  curl http://localhost:8081/api/value-investment/000538")
	fmt.Println("  curl http://localhost:8081/api/value-investment/600036")
	
	// 保持服务器运行
	select {}
}

func testYunnanBaiyaoAPI(baseURL string, api *EnhancedValueInvestmentAPI) {
	stockCode := "000538"
	url := fmt.Sprintf("%s/api/value-investment/%s", baseURL, stockCode)
	
	fmt.Printf("正在请求: %s\n", url)
	
	resp, err := http.Get(url)
	if err != nil {
		fmt.Printf("❌ 请求失败: %v\n", err)
		return
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != 200 {
		fmt.Printf("❌ HTTP错误: %d\n", resp.StatusCode)
		return
	}
	
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		fmt.Printf("❌ 解析响应失败: %v\n", err)
		return
	}
	
	data, ok := result["data"].(map[string]interface{})
	if !ok {
		fmt.Printf("❌ 响应格式错误\n")
		return
	}
	
	fmt.Printf("✅ 分析成功!\n")
	fmt.Printf("股票名称: %s\n", data["name"])
	fmt.Printf("股票代码: %s\n", data["code"])
	
	if price, ok := data["price"].(float64); ok {
		fmt.Printf("当前价格: %.2f元\n", price)
	}
	
	if score, ok := data["value_score"].(float64); ok {
		fmt.Printf("价值评分: %.0f/100\n", score)
	}
	
	if recommendation, ok := data["recommendation"].(string); ok {
		fmt.Printf("投资建议: %s\n", recommendation)
	}
	
	// 生成图表分析
	if analysisData, err := api.AnalyzeValueInvestmentWithCache(stockCode); err == nil {
		chartGenerator := NewChartGenerator("charts")
		charts, err := chartGenerator.GenerateAllCharts(analysisData)
		if err == nil {
			fmt.Printf("✅ 生成了 %d 个分析图表\n", len(charts))
		}
	}
}