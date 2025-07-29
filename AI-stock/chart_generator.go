package main

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"time"
)

// ChartData 图表数据结构
type ChartData struct {
	Title     string      `json:"title"`
	Type      string      `json:"type"`
	Data      interface{} `json:"data"`
	Options   interface{} `json:"options,omitempty"`
	Timestamp string      `json:"timestamp"`
}

// RadarChartItem 雷达图数据项
type RadarChartItem struct {
	Axis string  `json:"axis"`
	Value float64 `json:"value"`
	Max   float64 `json:"max"`
}

// TrendChartData 趋势图数据
type TrendChartData struct {
	Date   string  `json:"date"`
	Value  float64 `json:"value"`
	Label  string  `json:"label,omitempty"`
}

// ComparisonData 对比数据
type ComparisonData struct {
	Name  string  `json:"name"`
	Value float64 `json:"value"`
	Color string  `json:"color,omitempty"`
}

// ChartGenerator 图表生成器
type ChartGenerator struct {
	outputDir string
}

// NewChartGenerator 创建图表生成器
func NewChartGenerator(outputDir string) *ChartGenerator {
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		fmt.Printf("创建图表目录失败: %v\n", err)
	}
	
	return &ChartGenerator{
		outputDir: outputDir,
	}
}

// GenerateRadarChart 生成雷达图数据 (价值投资评分)
func (cg *ChartGenerator) GenerateRadarChart(data *ValueInvestmentData) *ChartData {
	// 雷达图维度
	items := []RadarChartItem{
		{Axis: "P/E比率", Value: cg.normalizePERatio(data.PERatio), Max: 20},
		{Axis: "ROE", Value: data.ROE, Max: 25},
		{Axis: "负债率", Value: 100 - data.DebtRatio, Max: 100}, // 负债率越低越好
		{Axis: "流动比率", Value: math.Min(data.CurrentRatio*10, 100), Max: 100},
		{Axis: "营收增长", Value: math.Max(data.RevenueGrowth*5, 0), Max: 100},
		{Axis: "利润增长", Value: math.Max(data.ProfitGrowth*4, 0), Max: 100},
		{Axis: "毛利率", Value: data.GrossMargin, Max: 100},
		{Axis: "净利率", Value: data.NetMargin, Max: 100},
	}
	
	chartData := &ChartData{
		Title:     fmt.Sprintf("%s (%s) 价值投资评分", data.Name, data.Code),
		Type:      "radar",
		Data:      items,
		Timestamp: time.Now().Format("2006-01-02 15:04:05"),
	}
	
	return chartData
}

// GenerateComparisonChart 生成对比图数据
func (cg *ChartGenerator) GenerateComparisonChart(data *ValueInvestmentData, industryAvg *FinancialMetrics) *ChartData {
	comparisons := []ComparisonData{
		{Name: "P/E比率", Value: data.PERatio, Color: "#36a2eb"},
		{Name: "行业平均P/E", Value: industryAvg.PERatio, Color: "#ff6384"},
		{Name: "ROE", Value: data.ROE, Color: "#36a2eb"},
		{Name: "行业平均ROE", Value: industryAvg.ROE, Color: "#ff6384"},
		{Name: "负债率", Value: data.DebtRatio, Color: "#36a2eb"},
		{Name: "行业平均负债率", Value: industryAvg.DebtRatio, Color: "#ff6384"},
	}
	
	chartData := &ChartData{
		Title:     fmt.Sprintf("%s 与行业对比", data.Name),
		Type:      "bar",
		Data:      comparisons,
		Timestamp: time.Now().Format("2006-01-02 15:04:05"),
	}
	
	return chartData
}

// GenerateTrendChart 生成趋势图数据 (模拟历史数据)
func (cg *ChartGenerator) GenerateTrendChart(data *ValueInvestmentData) *ChartData {
	// 生成模拟的历史趋势数据
	trendData := []TrendChartData{}
	
	// 生成过去12个月的模拟数据
	for i := 11; i >= 0; i-- {
		date := time.Now().AddDate(0, -i, 0)
		// 模拟价格波动
		priceVariation := (float64(i%7) - 3) * 0.05 // ±15%的随机波动
		price := data.Price * (1 + priceVariation)
		
		trendData = append(trendData, TrendChartData{
			Date:  date.Format("2006-01"),
			Value: price,
		})
	}
	
	chartData := &ChartData{
		Title:     fmt.Sprintf("%s 股价趋势", data.Name),
		Type:      "line",
		Data:      trendData,
		Timestamp: time.Now().Format("2006-01-02 15:04:05"),
	}
	
	return chartData
}

// GenerateScoreChart 生成评分分解图
func (cg *ChartGenerator) GenerateScoreChart(data *ValueInvestmentData) *ChartData {
	scoreBreakdown := []ComparisonData{
		{Name: "P/E评分", Value: cg.calculatePEScore(data.PERatio), Color: "#ff6384"},
		{Name: "ROE评分", Value: cg.calculateROEScore(data.ROE), Color: "#36a2eb"},
		{Name: "负债率评分", Value: cg.calculateDebtScore(data.DebtRatio), Color: "#ffce56"},
		{Name: "流动性评分", Value: cg.calculateLiquidityScore(data.CurrentRatio), Color: "#4bc0c0"},
		{Name: "成长性评分", Value: cg.calculateGrowthScore(data.RevenueGrowth, data.ProfitGrowth), Color: "#9966ff"},
		{Name: "股息评分", Value: cg.calculateDividendScore(data.DividendYield), Color: "#ff9f40"},
	}
	
	chartData := &ChartData{
		Title:     fmt.Sprintf("%s 价值评分分解", data.Name),
		Type:      "doughnut",
		Data:      scoreBreakdown,
		Timestamp: time.Now().Format("2006-01-02 15:04:05"),
	}
	
	return chartData
}

// SaveChart 保存图表数据到文件
func (cg *ChartGenerator) SaveChart(chartData *ChartData, filename string) error {
	filePath := filepath.Join(cg.outputDir, filename)
	
	dataBytes, err := json.MarshalIndent(chartData, "", "  ")
	if err != nil {
		return err
	}
	
	return os.WriteFile(filePath, dataBytes, 0644)
}

// GenerateAllCharts 生成所有图表
func (cg *ChartGenerator) GenerateAllCharts(data *ValueInvestmentData) (map[string]*ChartData, error) {
	charts := make(map[string]*ChartData)
	
	// 雷达图
	radarChart := cg.GenerateRadarChart(data)
	charts["radar"] = radarChart
	
	// 趋势图
	trendChart := cg.GenerateTrendChart(data)
	charts["trend"] = trendChart
	
	// 评分分解图
	scoreChart := cg.GenerateScoreChart(data)
	charts["score"] = scoreChart
	
	// 保存图表文件
	for chartType, chart := range charts {
		filename := fmt.Sprintf("%s_%s_chart.json", data.Code, chartType)
		if err := cg.SaveChart(chart, filename); err != nil {
			return nil, fmt.Errorf("保存%s图表失败: %v", chartType, err)
		}
	}
	
	return charts, nil
}

// 辅助函数

// normalizePERatio 标准化P/E比率
func (cg *ChartGenerator) normalizePERatio(pe float64) float64 {
	if pe <= 0 {
		return 0
	}
	// P/E在15-25之间为最佳，给满分20分
	if pe >= 15 && pe <= 25 {
		return 20
	}
	// 超出范围按距离扣分
	if pe < 15 {
		return math.Max(0, 20-(15-pe)*0.5)
	}
	return math.Max(0, 20-(pe-25)*0.3)
}

// calculatePEScore 计算P/E评分
func (cg *ChartGenerator) calculatePEScore(pe float64) float64 {
	if pe <= 0 {
		return 0
	}
	if pe >= 15 && pe <= 25 {
		return 20
	}
	if pe < 15 {
		return math.Max(0, 20-(15-pe)*0.5)
	}
	return math.Max(0, 20-(pe-25)*0.3)
}

// calculateROEScore 计算ROE评分
func (cg *ChartGenerator) calculateROEScore(roe float64) float64 {
	if roe >= 15 {
		return 20
	}
	if roe >= 10 {
		return 15
	}
	if roe >= 5 {
		return 10
	}
	return math.Max(0, roe * 2)
}

// calculateDebtScore 计算负债率评分
func (cg *ChartGenerator) calculateDebtScore(debtRatio float64) float64 {
	if debtRatio < 30 {
		return 15
	}
	if debtRatio < 50 {
		return 10
	}
	if debtRatio < 70 {
		return 5
	}
	return math.Max(0, 15-debtRatio*0.2)
}

// calculateLiquidityScore 计算流动性评分
func (cg *ChartGenerator) calculateLiquidityScore(currentRatio float64) float64 {
	if currentRatio >= 2 {
		return 10
	}
	if currentRatio >= 1.5 {
		return 8
	}
	if currentRatio >= 1 {
		return 5
	}
	return math.Max(0, currentRatio * 5)
}

// calculateGrowthScore 计算成长性评分
func (cg *ChartGenerator) calculateGrowthScore(revenueGrowth, profitGrowth float64) float64 {
	revenueScore := 0.0
	if revenueGrowth >= 10 {
		revenueScore = 10
	} else if revenueGrowth >= 5 {
		revenueScore = 7
	} else if revenueGrowth >= 0 {
		revenueScore = 5
	}
	
	profitScore := 0.0
	if profitGrowth >= 15 {
		profitScore = 10
	} else if profitGrowth >= 8 {
		profitScore = 7
	} else if profitGrowth >= 0 {
		profitScore = 5
	}
	
	return revenueScore + profitScore
}

// calculateDividendScore 计算股息评分
func (cg *ChartGenerator) calculateDividendScore(dividendYield float64) float64 {
	if dividendYield >= 3 {
		return 5
	}
	if dividendYield >= 1.5 {
		return 3
	}
	if dividendYield > 0 {
		return 1
	}
	return 0
}