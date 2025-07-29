#!/bin/bash

echo "🎯 AI股票价值投资分析系统 - 持仓管理功能测试"
echo "================================================"
echo ""

# 测试后端API
echo "1. 测试持仓管理API..."
echo ""

# 测试获取持仓列表
echo "📋 获取持仓列表:"
POSITIONS_RESPONSE=$(curl -s http://localhost:8084/api/positions)
echo "$POSITIONS_RESPONSE" | jq . 2>/dev/null || echo "$POSITIONS_RESPONSE"
echo ""

# 测试添加持仓
echo "➕ 添加测试持仓:"
ADD_RESPONSE=$(curl -s -X POST http://localhost:8084/api/positions \
  -H "Content-Type: application/json" \
  -d '{"stock_code": "600036", "stock_name": "招商银行", "shares": 200, "buy_price": 35.80, "notes": "银行股测试"}')
echo "$ADD_RESPONSE" | jq . 2>/dev/null || echo "$ADD_RESPONSE"
echo ""

# 再次获取持仓列表
echo "📋 更新后的持仓列表:"
POSITIONS_RESPONSE=$(curl -s http://localhost:8084/api/positions)
echo "$POSITIONS_RESPONSE" | jq . 2>/dev/null || echo "$POSITIONS_RESPONSE"
echo ""

# 测试价值投资分析
echo "🔍 测试价值投资分析:"
ANALYSIS_RESPONSE=$(curl -s -X POST http://localhost:8084/api/value-investment/analyze \
  -H "Content-Type: application/json" \
  -d '{"stock_name": "云南白药"}')

# 提取关键信息
SCORE=$(echo "$ANALYSIS_RESPONSE" | grep -o '"value_score":[0-9]*' | cut -d: -f2)
RECOMMENDATION=$(echo "$ANALYSIS_RESPONSE" | grep -o '"recommendation":"[^\"]*"' | cut -d: -f2 | tr -d '"')
PRICE=$(echo "$ANALYSIS_RESPONSE" | grep -o '"price":[0-9.]*' | cut -d: -f2)
CHANGE=$(echo "$ANALYSIS_RESPONSE" | grep -o '"change_pct":[0-9.-]*' | cut -d: -f2)

echo "📈 分析结果:"
echo "   股票名称: 云南白药 (000538)"
echo "   当前价格: ¥$PRICE"
echo "   涨跌幅: $CHANGE%"
echo "   价值评分: $SCORE/100"
echo "   投资建议: $RECOMMENDATION"
echo ""

# 测试Web页面
echo "🌐 测试Web页面访问..."
if curl -s http://localhost:8084/ | grep -q "AI股票价值投资分析系统"; then
    echo "✅ 主页面正常访问 (http://localhost:8084/)"
else
    echo "❌ 主页面访问异常"
fi

if curl -s http://localhost:8084/ | grep -q "持仓管理"; then
    echo "✅ 持仓管理功能已集成"
else
    echo "❌ 持仓管理功能异常"
fi
echo ""

# 测试财报下载API
echo "📄 测试财报下载API..."
DOWNLOAD_RESPONSE=$(curl -s -X POST http://localhost:8084/api/download \
  -H "Content-Type: application/json" \
  -d '{"company_name": "云南白药"}')

if echo "$DOWNLOAD_RESPONSE" | grep -q "message"; then
    echo "✅ 财报下载API正常"
else
    echo "❌ 财报下载API异常"
fi
echo ""

echo "🎉 功能测试完成！"
echo ""
echo "🌐 访问地址: http://localhost:8084"
echo ""
echo "📊 主要功能:"
echo "   ✅ 财报下载 - 支持按公司名称下载财务报告"
echo "   ✅ 价值投资分析 - 基于多个维度的智能评分"
echo "   ✅ 持仓管理 - SQLite数据库管理股票持仓"
echo "   ✅ 实时数据 - 获取股票价格和财务指标"
echo "   ✅ 图表展示 - 雷达图和柱状图可视化"
echo "   ✅ 中文显示 - 已修复中文显示乱码问题"
echo ""
echo "🗄️ 数据库文件: positions.db"
echo "📋 日志文件: server.log"
echo ""
echo "🔧 新增API接口:"
echo "   GET  /api/positions - 获取持仓列表"
echo "   POST /api/positions - 添加持仓"
echo "   PUT  /api/positions/:id - 更新持仓"
echo "   DELETE /api/positions/:id - 删除持仓"
echo "   POST /api/positions/update-prices - 更新持仓价格"
echo ""
echo "💡 持仓管理特色:"
echo "   - 自动获取实时股票价格"
echo "   - 实时计算盈亏金额和收益率"
echo "   - 支持添加备注信息"
echo "   - 持仓统计汇总"
echo "   - 一键更新所有持仓价格"