package main

import (
	"fmt"
	"os"
)

func main() {
	fmt.Println("=== 云南白药价值投资分析测试 ===")
	
	// 创建必要的目录
	os.MkdirAll("cache", 0755)
	os.MkdirAll("charts", 0755)
	os.MkdirAll("reports", 0755)
	
	// 创建价值投资API实例
	api := NewEnhancedValueInvestmentAPI()
	
	stockCode := "000538"
	stockName := "云南白药"
	
	fmt.Printf("开始分析 %s (%s)...\n", stockName, stockCode)
	
	// 获取价值投资分析
	analysis, err := api.AnalyzeValueInvestmentWithCache(stockCode)
	if err != nil {
		fmt.Printf("❌ 分析失败: %v\n", err)
		return
	}
	
	// 打印基本信息
	fmt.Printf("\n📊 基本信息:\n")
	fmt.Printf("股票名称: %s\n", analysis.Name)
	fmt.Printf("股票代码: %s\n", analysis.Code)
	fmt.Printf("当前价格: %.2f元\n", analysis.Price)
	fmt.Printf("涨跌幅: %.2f%%\n", analysis.ChangePct)
	
	// 打印估值指标
	fmt.Printf("\n💰 估值指标:\n")
	fmt.Printf("市盈率 (P/E): %.2f\n", analysis.PERatio)
	fmt.Printf("市净率 (P/B): %.2f\n", analysis.PBRatio)
	fmt.Printf("市销率 (P/S): %.2f\n", analysis.PSRatio)
	fmt.Printf("股息率: %.2f%%\n", analysis.DividendYield)
	
	// 打印财务指标
	fmt.Printf("\n📈 财务指标:\n")
	fmt.Printf("净资产收益率 (ROE): %.2f%%\n", analysis.ROE)
	fmt.Printf("资产负债率: %.2f%%\n", analysis.DebtRatio)
	fmt.Printf("流动比率: %.2f\n", analysis.CurrentRatio)
	fmt.Printf("毛利率: %.2f%%\n", analysis.GrossMargin)
	fmt.Printf("净利率: %.2f%%\n", analysis.NetMargin)
	fmt.Printf("营收增长率: %.2f%%\n", analysis.RevenueGrowth)
	fmt.Printf("净利润增长率: %.2f%%\n", analysis.ProfitGrowth)
	
	// 打印投资评估
	fmt.Printf("\n🎯 投资评估:\n")
	fmt.Printf("价值评分: %d/100\n", analysis.ValueScore)
	fmt.Printf("投资建议: %s\n", analysis.Recommendation)
	fmt.Printf("分析时间: %s\n", analysis.AnalysisTime)
	
	// 生成图表
	fmt.Printf("\n📊 生成分析图表...\n")
	chartGenerator := NewChartGenerator("charts")
	charts, err := chartGenerator.GenerateAllCharts(analysis)
	if err != nil {
		fmt.Printf("❌ 图表生成失败: %v\n", err)
		return
	}
	
	fmt.Printf("✅ 成功生成 %d 个分析图表\n", len(charts))
	for chartType := range charts {
		fmt.Printf("   - %s 图表\n", chartType)
	}
	
	// 保存分析结果
	fmt.Printf("\n💾 保存分析结果...\n")
	if err := SaveAnalysisResult(analysis, charts); err != nil {
		fmt.Printf("❌ 保存结果失败: %v\n", err)
	} else {
		fmt.Printf("✅ 分析结果已保存到 reports/%s_analysis.json\n", analysis.Code)
	}
	
	// 投资建议分析
	fmt.Printf("\n💡 投资要点分析:\n")
	PrintInvestmentAnalysis(analysis)
	
	fmt.Printf("\n✅ 云南白药价值投资分析完成!\n")
}