package main

import (
	"fmt"
	"os"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("使用方法:")
		fmt.Println("  go run test_value_investment.go all     # 运行所有测试")
		fmt.Println("  go run test_value_investment.go 000538  # 测试指定股票")
		fmt.Println("  go run test_value_investment.go yunnan   # 测试云南白药")
		return
	}
	
	command := os.Args[1]
	
	switch command {
	case "all":
		TestValueInvestment()
		fmt.Println("\n" + strings.Repeat("=", 50) + "\n")
		TestYunnanBaiyao()
	case "yunnan":
		TestYunnanBaiyao()
	default:
		// 测试指定股票
		TestSingleStock(command)
	}
}

// TestSingleStock 测试单个股票
func TestSingleStock(stockCode string) {
	fmt.Printf("=== 测试股票 %s ===\n", stockCode)
	
	api := NewEnhancedValueInvestmentAPI()
	
	analysis, err := api.AnalyzeValueInvestmentWithCache(stockCode)
	if err != nil {
		fmt.Printf("❌ 分析失败: %v\n", err)
		return
	}
	
	fmt.Printf("股票: %s (%s)\n", analysis.Name, analysis.Code)
	fmt.Printf("价格: %.2f元\n", analysis.Price)
	fmt.Printf("评分: %d/100\n", analysis.ValueScore)
	fmt.Printf("建议: %s\n", analysis.Recommendation)
	
	// 生成图表
	chartGenerator := NewChartGenerator("charts")
	charts, err := chartGenerator.GenerateAllCharts(analysis)
	if err != nil {
		fmt.Printf("❌ 图表生成失败: %v\n", err)
		return
	}
	
	fmt.Printf("✅ 生成了 %d 个图表\n", len(charts))
}