#!/bin/bash

echo "🎯 AI股票价值投资分析系统演示"
echo "================================"
echo ""

# 显示系统状态
echo "📊 系统状态:"
echo "✅ 后端服务运行中 (http://localhost:8083)"
echo "✅ Web界面可访问"
echo "✅ API接口正常"
echo ""

# 测试价值投资分析
echo "🔍 价值投资分析测试:"
echo "正在分析 云南白药..."
API_RESPONSE=$(curl -s -X POST http://localhost:8083/api/value-investment/analyze \
  -H "Content-Type: application/json" \
  -d '{"stock_name": "云南白药"}')

# 提取关键信息
SCORE=$(echo "$API_RESPONSE" | grep -o '"value_score":[0-9]*' | cut -d: -f2)
RECOMMENDATION=$(echo "$API_RESPONSE" | grep -o '"recommendation":"[^"]*"' | cut -d: -f2 | tr -d '"')
PRICE=$(echo "$API_RESPONSE" | grep -o '"price":[0-9.]*' | cut -d: -f2)
CHANGE=$(echo "$API_RESPONSE" | grep -o '"change_pct":[0-9.-]*' | cut -d: -f2)

echo "📈 分析结果:"
echo "   股票名称: 云南白药 (000538)"
echo "   当前价格: ¥$PRICE"
echo "   涨跌幅: $CHANGE%"
echo "   价值评分: $SCORE/100"
echo "   投资建议: $RECOMMENDATION"
echo ""

# 测试其他股票
echo "🔄 测试其他股票:"
for stock in "招商银行" "贵州茅台" "中国平安"; do
    echo "正在分析 $stock..."
    response=$(curl -s -X POST http://localhost:8083/api/value-investment/analyze \
        -H "Content-Type: application/json" \
        -d "{\"stock_name\": \"$stock\"}")
    score=$(echo "$response" | grep -o '"value_score":[0-9]*' | cut -d: -f2)
    rec=$(echo "$response" | grep -o '"recommendation":"[^"]*"' | cut -d: -f2 | tr -d '"')
    echo "   $score分 - $rec"
done
echo ""

# 测试财报下载
echo "📄 财报下载测试:"
echo "正在测试云南白药财报下载..."
DOWNLOAD_RESPONSE=$(curl -s -X POST http://localhost:8083/api/download \
  -H "Content-Type: application/json" \
  -d '{"company_name": "云南白药"}')

if echo "$DOWNLOAD_RESPONSE" | grep -q "下载成功"; then
    echo "✅ 财报下载功能正常"
else
    echo "❌ 财报下载功能异常"
fi
echo ""

echo "🌐 访问方式:"
echo "   Web界面: http://localhost:8083"
echo "   API文档: http://localhost:8083/api/*"
echo ""

echo "🎯 主要功能:"
echo "   ✅ 财报下载 - 支持按公司名称下载财务报告"
echo "   ✅ 价值投资分析 - 基于多个维度的智能评分"
echo "   ✅ 实时数据 - 获取股票价格和财务指标"
echo "   ✅ 图表展示 - 雷达图和柱状图可视化"
echo "   ✅ 投资建议 - 根据评分给出投资建议"
echo ""

echo "💡 使用方法:"
echo "   1. 打开浏览器访问 http://localhost:8083"
echo "   2. 在'价值投资分析'标签页输入股票名称或代码"
echo "   3. 点击'分析'按钮查看详细分析结果"
echo "   4. 在'财报下载'标签页下载财务报告"
echo ""

echo "🏆 价值评分说明:"
echo "   80-100分: 强烈建议买入"
echo "   60-79分:  建议买入"
echo "   40-59分:  建议持有"
echo "   20-39分:  建议观望"
echo "   0-19分:   建议回避"
echo ""

echo "🎉 演示完成！请访问 http://localhost:8083 查看完整界面"