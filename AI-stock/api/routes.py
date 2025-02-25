from flask import Blueprint, request, jsonify
from .processors import create_processor
import logging

logger = logging.getLogger(__name__)
api = Blueprint('api', __name__)

@api.route('/analyze', methods=['POST'])
def analyze():
    logger.info("收到报表解析请求")
    try:
        data = request.get_json()
        if not data or 'reports' not in data:
            logger.warning("未选择要解析的报表")
            return jsonify({'error': '请选择要解析的报表'}), 400

        reports = data['reports']
        if not reports or len(reports) == 0:
            logger.warning("未选择任何报表进行解析")
            return jsonify({'error': '未选择任何报表进行解析'}), 400

        options = data.get('options', {})
        process_mode = options.get('processMode', 'doc2x')
        
        logger.info(f"解析请求参数：reports={reports}, options={options}")

        results = []
        errors = []

        for report_path in reports:
            try:
                processor = create_processor(report_path, process_mode)
                result = processor.process()
                if result:
                    results.append(result)
            except Exception as e:
                error_msg = f'处理文件 {report_path} 时出错：{str(e)}'
                logger.error(error_msg)
                errors.append(error_msg)

        if not results and errors:
            return jsonify({
                'error': '解析失败',
                'details': errors
            }), 500

        logger.info(f"成功解析 {len(results)} 个报表")
        return jsonify({
            'results': results,
            'errors': errors if errors else None
        })

    except Exception as e:
        logger.error(f"解析报表时出错：{str(e)}")
        return jsonify({'error': f'服务器错误：{str(e)}'}), 500