# 价值投资分析功能设计

## 功能概述
为AI财报分析系统增加价值投资分析功能，通过公开API获取A股股票的价值投资相关数据，提供基础分析和可视化功能。

## 价值投资核心指标

### 1. 基础面指标
- 市盈率 (P/E Ratio)
- 市净率 (P/B Ratio) 
- 市销率 (P/S Ratio)
- 股息率 (Dividend Yield)
- 每股收益 (EPS)
- 每股净资产 (BVPS)
- 净资产收益率 (ROE)
- 总股本、流通股本

### 2. 财务健康指标
- 资产负债率
- 流动比率、速动比率
- 毛利率、净利率
- 营业收入增长率
- 净利润增长率
- 经营活动现金流

### 3. 估值指标
- PEG指标 (市盈率相对盈利增长比)
- 股价自由现金流比 (P/FCF)
- 企业价值倍数 (EV/EBITDA)

## 系统架构设计

### 数据获取模块 (ValueInvestmentAPI)
- 集成多个免费A股数据源
- 实现数据缓存机制
- 提供统一的数据接口

### 分析引擎 (AnalysisEngine)
- 计算价值投资指标
- 实现评分算法
- 生成投资建议

### 可视化模块 (Visualization)
- 生成图表数据
- 支持多种图表类型
- 前端图表展示

## API接口设计

### 新增后端接口
```
GET /api/value-investment/:stockCode
- 获取股票价值投资分析数据

GET /api/stock-info/:stockCode  
- 获取股票基本信息

GET /api/financial-metrics/:stockCode
- 获取财务指标数据

POST /api/analyze-value
- 批量价值投资分析
```

### 数据结构
```go
type ValueInvestmentData struct {
    StockCode     string  `json:"stock_code"`
    StockName     string  `json:"stock_name"`
    CurrentPrice  float64 `json:"current_price"`
    
    // 估值指标
    PERatio       float64 `json:"pe_ratio"`
    PBRatio       float64 `json:"pb_ratio"`
    PSRatio       float64 `json:"ps_ratio"`
    DividendYield float64 `json:"dividend_yield"`
    
    // 财务指标
    ROE           float64 `json:"roe"`
    DebtRatio     float64 `json:"debt_ratio"`
    CurrentRatio  float64 `json:"current_ratio"`
    GrossMargin   float64 `json:"gross_margin"`
    NetMargin    float64 `json:"net_margin"`
    RevenueGrowth float64 `json:"revenue_growth"`
    ProfitGrowth  float64 `json:"profit_growth"`
    
    // 分析结果
    ValueScore    int     `json:"value_score"`
    Recommendation string `json:"recommendation"`
    AnalysisTime  string  `json:"analysis_time"`
}
```

## 免费数据源

### 1. 新浪财经API
- 实时行情数据
- 基本面数据
- 财务数据

### 2. 腾讯股票API  
- 股价信息
- 交易数据

### 3. 东方财富API
- 财务指标
- 行业对比数据

### 4. 雪球API
- 投资者情绪数据
- 分析评论

## 前端功能

### 1. 价值投资分析页面
- 股票搜索输入
- 分析结果展示
- 指标说明

### 2. 图表可视化
- 雷达图展示综合指标
- 历史趋势图
- 同行对比图

### 3. 投资建议
- 买入/持有/卖出建议
- 风险提示
- 投资逻辑说明

## 实现计划

1. **数据获取层**：实现多API数据源整合
2. **分析引擎**：开发价值投资评分算法  
3. **可视化**：前端图表组件开发
4. **测试验证**：云南白药案例测试
5. **性能优化**：缓存机制和错误处理