package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"
)

// TestValueInvestment 测试价值投资功能
func TestValueInvestment() {
	fmt.Println("=== 价值投资分析功能测试 ===")
	
	// 创建API实例
	api := NewEnhancedValueInvestmentAPI()
	
	// 测试股票列表
	testStocks := []struct {
		Code string
		Name string
	}{
		{"000538", "云南白药"},
		{"600036", "招商银行"},
		{"000858", "五粮液"},
		{"600276", "恒瑞医药"},
	}
	
	fmt.Printf("开始测试 %d 只股票的价值投资分析...\n\n", len(testStocks))
	
	// 测试每只股票
	for _, stock := range testStocks {
		fmt.Printf("正在测试: %s (%s)\n", stock.Name, stock.Code)
		fmt.Println("=====================================")
		
		// 测试基本信息获取
		fmt.Println("1. 测试基本信息获取...")
		basicInfo, err := api.GetStockBasicInfoWithCache(stock.Code)
		if err != nil {
			fmt.Printf("   ❌ 获取基本信息失败: %v\n", err)
			continue
		}
		fmt.Printf("   ✅ 基本信息: %s, 价格: %.2f, 涨跌: %.2f%%\n", 
			basicInfo.Name, basicInfo.Price, basicInfo.ChangePct)
		
		// 测试财务指标获取
		fmt.Println("2. 测试财务指标获取...")
		metrics, err := api.GetFinancialMetricsWithCache(stock.Code)
		if err != nil {
			fmt.Printf("   ❌ 获取财务指标失败: %v\n", err)
			continue
		}
		fmt.Printf("   ✅ 财务指标: P/E: %.2f, ROE: %.2f%%, 负债率: %.2f%%\n", 
			metrics.PERatio, metrics.ROE, metrics.DebtRatio)
		
		// 测试价值投资分析
		fmt.Println("3. 测试价值投资分析...")
		analysis, err := api.AnalyzeValueInvestmentWithCache(stock.Code)
		if err != nil {
			fmt.Printf("   ❌ 价值投资分析失败: %v\n", err)
			continue
		}
		fmt.Printf("   ✅ 价值评分: %d/100\n", analysis.ValueScore)
		fmt.Printf("   ✅ 投资建议: %s\n", analysis.Recommendation)
		
		// 测试图表生成
		fmt.Println("4. 测试图表生成...")
		chartGenerator := NewChartGenerator("charts")
		charts, err := chartGenerator.GenerateAllCharts(analysis)
		if err != nil {
			fmt.Printf("   ❌ 图表生成失败: %v\n", err)
			continue
		}
		fmt.Printf("   ✅ 生成了 %d 个图表\n", len(charts))
		
		// 保存分析结果
		fmt.Println("5. 保存分析结果...")
		if err := SaveAnalysisResult(analysis, charts); err != nil {
			fmt.Printf("   ❌ 保存结果失败: %v\n", err)
		} else {
			fmt.Printf("   ✅ 分析结果已保存\n")
		}
		
		fmt.Println()
	}
	
	fmt.Println("=== 测试完成 ===")
}

// TestYunnanBaiyao 专门测试云南白药
func TestYunnanBaiyao() {
	fmt.Println("=== 云南白药专项测试 ===")
	
	stockCode := "000538"
	stockName := "云南白药"
	
	fmt.Printf("开始分析 %s (%s) 的投资价值...\n", stockName, stockCode)
	
	// 创建API实例
	api := NewEnhancedValueInvestmentAPI()
	
	// 获取详细分析
	analysis, err := api.AnalyzeValueInvestmentWithCache(stockCode)
	if err != nil {
		fmt.Printf("❌ 分析失败: %v\n", err)
		return
	}
	
	// 打印详细分析结果
	fmt.Println("\n📊 详细分析结果:")
	fmt.Printf("股票名称: %s\n", analysis.Name)
	fmt.Printf("股票代码: %s\n", analysis.Code)
	fmt.Printf("当前价格: %.2f元\n", analysis.Price)
	fmt.Printf("涨跌幅: %.2f%%\n", analysis.ChangePct)
	fmt.Printf("成交量: %d\n", analysis.Volume)
	
	fmt.Println("\n💰 估值指标:")
	fmt.Printf("市盈率 (P/E): %.2f\n", analysis.PERatio)
	fmt.Printf("市净率 (P/B): %.2f\n", analysis.PBRatio)
	fmt.Printf("市销率 (P/S): %.2f\n", analysis.PSRatio)
	fmt.Printf("股息率: %.2f%%\n", analysis.DividendYield)
	
	fmt.Println("\n📈 财务指标:")
	fmt.Printf("净资产收益率 (ROE): %.2f%%\n", analysis.ROE)
	fmt.Printf("资产负债率: %.2f%%\n", analysis.DebtRatio)
	fmt.Printf("流动比率: %.2f\n", analysis.CurrentRatio)
	fmt.Printf("毛利率: %.2f%%\n", analysis.GrossMargin)
	fmt.Printf("净利率: %.2f%%\n", analysis.NetMargin)
	fmt.Printf("营收增长率: %.2f%%\n", analysis.RevenueGrowth)
	fmt.Printf("净利润增长率: %.2f%%\n", analysis.ProfitGrowth)
	
	fmt.Println("\n🎯 投资评估:")
	fmt.Printf("价值评分: %d/100\n", analysis.ValueScore)
	fmt.Printf("投资建议: %s\n", analysis.Recommendation)
	fmt.Printf("分析时间: %s\n", analysis.AnalysisTime)
	
	// 生成图表
	fmt.Println("\n📊 生成分析图表...")
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
	
	// 保存详细报告
	if err := SaveDetailedReport(analysis, charts); err != nil {
		fmt.Printf("❌ 保存详细报告失败: %v\n", err)
	} else {
		fmt.Printf("✅ 详细报告已保存到 reports/yunnan_baiyao_report.json\n")
	}
	
	// 投资建议分析
	fmt.Println("\n💡 投资要点分析:")
	PrintInvestmentAnalysis(analysis)
}

// SaveAnalysisResult 保存分析结果
func SaveAnalysisResult(analysis *ValueInvestmentData, charts map[string]*ChartData) error {
	// 创建报告目录
	if err := os.MkdirAll("reports", 0755); err != nil {
		return err
	}
	
	result := map[string]interface{}{
		"analysis":      analysis,
		"charts":        charts,
		"generated_at":  time.Now().Format("2006-01-02 15:04:05"),
	}
	
	data, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		return err
	}
	
	filename := fmt.Sprintf("reports/%s_analysis.json", analysis.Code)
	return os.WriteFile(filename, data, 0644)
}

// SaveDetailedReport 保存详细报告
func SaveDetailedReport(analysis *ValueInvestmentData, charts map[string]*ChartData) error {
	// 创建报告目录
	if err := os.MkdirAll("reports", 0755); err != nil {
		return err
	}
	
	report := map[string]interface{}{
		"stock_info": analysis.StockBasicInfo,
		"financial_metrics": analysis.FinancialMetrics,
		"value_analysis": map[string]interface{}{
			"score":          analysis.ValueScore,
			"recommendation": analysis.Recommendation,
			"analysis_time":  analysis.AnalysisTime,
		},
		"charts":       charts,
		"investment_thesis": GenerateInvestmentThesis(analysis),
		"risk_factors":  GenerateRiskFactors(analysis),
		"generated_at":  time.Now().Format("2006-01-02 15:04:05"),
	}
	
	data, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		return err
	}
	
	return os.WriteFile("reports/yunnan_baiyao_report.json", data, 0644)
}

// GenerateInvestmentThesis 生成投资论点
func GenerateInvestmentThesis(analysis *ValueInvestmentData) []string {
	thesis := []string{}
	
	// 基于评分生成论点
	if analysis.ValueScore >= 80 {
		thesis = append(thesis, "股票价值被低估，具有较好的投资安全边际")
	}
	
	if analysis.ROE >= 15 {
		thesis = append(thesis, "公司盈利能力强，ROE表现优秀")
	}
	
	if analysis.DebtRatio < 30 {
		thesis = append(thesis, "财务结构稳健，负债水平较低")
	}
	
	if analysis.RevenueGrowth >= 10 {
		thesis = append(thesis, "公司成长性良好，营收持续增长")
	}
	
	if analysis.DividendYield >= 2 {
		thesis = append(thesis, "股息率较高，提供稳定的现金流回报")
	}
	
	return thesis
}

// GenerateRiskFactors 生成风险因素
func GenerateRiskFactors(analysis *ValueInvestmentData) []string {
	risks := []string{}
	
	if analysis.PERatio > 30 {
		risks = append(risks, "估值偏高，存在回调风险")
	}
	
	if analysis.DebtRatio > 60 {
		risks = append(risks, "负债率较高，财务风险需要关注")
	}
	
	if analysis.CurrentRatio < 1 {
		risks = append(risks, "流动性不足，短期偿债压力大")
	}
	
	if analysis.RevenueGrowth < 0 {
		risks = append(risks, "营收下滑，基本面恶化风险")
	}
	
	if analysis.ProfitGrowth < 0 {
		risks = append(risks, "净利润下降，盈利能力减弱")
	}
	
	return risks
}

// PrintInvestmentAnalysis 打印投资分析
func PrintInvestmentAnalysis(analysis *ValueInvestmentData) {
	// 优势分析
	fmt.Println("✅ 投资优势:")
	if analysis.ROE >= 15 {
		fmt.Printf("   - 盈利能力强: ROE达到%.2f%%，高于15%的优秀标准\n", analysis.ROE)
	}
	if analysis.DebtRatio < 30 {
		fmt.Printf("   - 财务稳健: 资产负债率仅为%.2f%%，财务风险较低\n", analysis.DebtRatio)
	}
	if analysis.GrossMargin > 30 {
		fmt.Printf("   - 毛利率高: 达到%.2f%%，具有较强的定价能力\n", analysis.GrossMargin)
	}
	if analysis.DividendYield >= 2 {
		fmt.Printf("   - 股息回报: 股息率%.2f%%，提供稳定现金流\n", analysis.DividendYield)
	}
	
	// 风险提示
	fmt.Println("⚠️  风险提示:")
	if analysis.PERatio > 25 {
		fmt.Printf("   - 估值风险: P/E比率%.2f倍，相对较高\n", analysis.PERatio)
	}
	if analysis.DebtRatio > 50 {
		fmt.Printf("   - 负债风险: 资产负债率%.2f%%，需要关注\n", analysis.DebtRatio)
	}
	if analysis.CurrentRatio < 1.5 {
		fmt.Printf("   - 流动性风险: 流动比率%.2f，短期偿债能力一般\n", analysis.CurrentRatio)
	}
	if analysis.RevenueGrowth < 5 {
		fmt.Printf("   - 成长性风险: 营收增长%.2f%%，增速放缓\n", analysis.RevenueGrowth)
	}
	
	// 估值判断
	fmt.Println("📊 估值判断:")
	if analysis.PERatio < 15 {
		fmt.Println("   - 估值偏低: 相对于盈利能力，当前股价具有吸引力")
	} else if analysis.PERatio <= 25 {
		fmt.Println("   - 估值合理: P/E比率在合理区间")
	} else {
		fmt.Println("   - 估值偏高: 需要等待更好的买入时机")
	}
}

// main 测试函数入口
func main() {
	// 运行所有测试
	TestValueInvestment()
	
	fmt.Println("\n" + strings.Repeat("=", 50) + "\n")
	
	// 专门测试云南白药
	TestYunnanBaiyao()
}