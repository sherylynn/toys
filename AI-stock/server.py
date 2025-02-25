from flask import Flask, request, jsonify
from flask_cors import CORS
from download_reports import StockReportDownloader
from datetime import datetime
from api.reports import get_downloaded_reports
from api.routes import api
import logging
from collections import defaultdict

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# 配置CORS，允许所有来源的请求
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type"]}}, supports_credentials=True)

# 注册API蓝图
app.register_blueprint(api, url_prefix='/api')

def group_reports_by_company_and_year(reports):
    grouped = defaultdict(lambda: defaultdict(list))
    for report in reports:
        company = report['file_path'].split('/')[1]  # 从文件路径中提取公司名
        year = report['file_path'].split('/')[2]     # 从文件路径中提取年份
        grouped[company][year].append(report)
    
    # 转换为前端需要的格式
    result = []
    for company, years in grouped.items():
        company_data = {
            'name': company,
            'years': []
        }
        for year, reports in years.items():
            company_data['years'].append({
                'value': year,
                'reports': reports
            })
        result.append(company_data)
    return result

@app.route('/api/reports', methods=['GET'])
def get_reports():
    logger.info("收到获取历史财报列表请求")
    try:
        reports = get_downloaded_reports()
        grouped_reports = group_reports_by_company_and_year(reports)
        logger.info(f"成功获取到 {len(reports)} 个历史财报")
        return jsonify({
            'reports': reports,
            'groupedReports': grouped_reports
        })
    except Exception as e:
        logger.error(f"获取历史财报列表失败：{str(e)}")
        return jsonify({'error': '获取历史财报列表失败'}), 500

@app.route('/api/download', methods=['POST'])
def download_reports():
    logger.info("收到下载财报请求")
    try:
        data = request.get_json()
        company_name = data.get('company_name')
        year = data.get('year')
        logger.info(f"请求参数：公司名称={company_name}, 年份={year}")

        
        if not company_name:
            return jsonify({'error': '请输入公司名称'}), 400

        # 年份预处理
        current_year = datetime.now().year
        if year:
            try:
                year = int(year)
                if year > current_year:
                    return jsonify({
                        'error': f'指定的年份{year}尚未到来，请选择{current_year}或更早的年份'
                    }), 400
            except ValueError:
                return jsonify({'error': '年份格式不正确'}), 400
            
        downloader = StockReportDownloader()
        try:
            downloaded_files = downloader.download_reports(company_name, year)
            return jsonify({
                'message': '下载成功',
                'files': downloaded_files
            })
        except Exception as e:
            error_message = str(e)
            print(f"下载报告时出错：{error_message}")
            if '未找到公司' in error_message:
                return jsonify({'error': f'未找到公司：{company_name}，请检查公司名称是否正确'}), 404
            elif '未找到' in error_message and '的任何报表' in error_message:
                return jsonify({'error': f'未找到{year if year else current_year}年的报表，可能是因为报表尚未发布'}), 404
            else:
                return jsonify({'error': f'下载报告时发生错误：{error_message}'}), 500
    except Exception as e:
        print(f"服务器错误：{str(e)}")
        return jsonify({'error': '服务器内部错误，请稍后重试'}), 500

if __name__ == '__main__':
    app.run(port=5000)