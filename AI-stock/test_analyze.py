import os
import sys
from api.analyze import analyze_reports

def test_analyze_report():
    # 设置测试目录
    test_dir = os.path.join(os.getcwd(), 'downloads')
    if not os.path.exists(test_dir):
        print("错误：downloads目录不存在，请确保已下载测试用的财报文件")
        return
    
    # 获取第一个可用的PDF文件进行测试
    test_file = None
    for root, _, files in os.walk(test_dir):
        for file in files:
            if file.endswith('.pdf'):
                test_file = os.path.relpath(os.path.join(root, file))
                break
        if test_file:
            break
    
    if not test_file:
        print("错误：未找到任何PDF文件进行测试，请确保downloads目录中有PDF文件")
        return
    
    print(f"\n开始测试文件解析功能...")
    print(f"测试文件：{test_file}")
    
    try:
        # 测试单个文件的解析
        results = analyze_reports([test_file])
        
        # 验证解析结果
        if results and len(results) > 0:
            result = results[0]
            print("\n解析结果验证:")
            print(f"文件标题: {result['title']}")
            
            if result['excelPath']:
                excel_path = os.path.join(os.getcwd(), result['excelPath'])
                if os.path.exists(excel_path):
                    print(f"Excel文件已生成: {result['excelPath']}")
                    print(f"文件大小: {os.path.getsize(excel_path)} 字节")
                else:
                    print(f"警告：Excel文件未找到: {result['excelPath']}")
            else:
                print("提示：未生成Excel文件，可能没有识别到表格数据")
            
            if result['wordPath']:
                word_path = os.path.join(os.getcwd(), result['wordPath'])
                if os.path.exists(word_path):
                    print(f"Word文件已生成: {result['wordPath']}")
                    print(f"文件大小: {os.path.getsize(word_path)} 字节")
                else:
                    print(f"警告：Word文件未找到: {result['wordPath']}")
            else:
                print("提示：未生成Word文件，可能没有识别到文本内容")
                
            print("\n测试完成：文件解析成功")
        else:
            print("\n测试失败：解析结果为空")
            
    except Exception as e:
        print(f"\n测试过程中出现错误：")
        print(f"错误类型: {type(e).__name__}")
        print(f"错误信息: {str(e)}")
        print("\n完整的错误追踪信息:")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_analyze_report()