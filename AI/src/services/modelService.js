const axios = require('axios');
class MedicalQAModel {
  constructor() {
    // 初始化Ollama API配置
    this.apiBase = 'http://localhost:11434';
    this.modelName = 'deepseek-r1:1.5b'; // 默认模型
  }

  setModel(modelName) {
    // 验证模型名称是否有效
    const validModels = ['deepseek-r1:1.5b', 'qwen2.5:1.5b'];
    if (validModels.includes(modelName)) {
      this.modelName = modelName;
    }
  }

  async analyzeSymptoms(patientInfo) {
    // 导入模型配置
    const modelConfig = require('../config/modelConfig');
    // 获取当前模型的提示词
    const prompt = modelConfig.getPromptTemplate(this.modelName, 'analyzeSymptoms', patientInfo);

    try {
      console.log('正在调用Ollama API进行症状分析...');
      console.log('使用模型:', this.modelName);
      
      // 调用Ollama API
      const response = await axios.post(`${this.apiBase}/api/generate`, {
        model: this.modelName,
        prompt,
        stream: false
      });

      console.log('API响应状态:', response.status);
      
      if (response.status === 200) {
        const responseText = response.data.response || '';
        console.log('API返回内容:', responseText);
        
        // 尝试解析响应内容
        const result = this._parseResponse(responseText);
        if (result) {
          return result;
        }

        console.error('无法从AI响应中提取有效信息');
        return this._getDefaultResponse();
      } else {
        console.error('API请求失败，状态码:', response.status);
        return this._getDefaultResponse();
      }
    } catch (error) {
      console.error('调用Ollama API失败:', error.message);
      if (error.response) {
        console.error('错误响应:', error.response.data);
      }
      return this._getDefaultResponse();
    }
  }

  _parseResponse(responseText) {
    // 1. 尝试直接解析JSON
    try {
      const result = JSON.parse(responseText);
      if (this._isValidResult(result)) {
        return result;
      }
    } catch (e) {
      console.log('直接JSON解析失败，尝试其他方法');
    }

    // 2. 尝试提取JSON内容
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/); // 匹配最外层的花括号及其内容
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        if (this._isValidResult(result)) {
          return result;
        }
      }
    } catch (e) {
      console.log('JSON提取解析失败，尝试文本解析');
    }

    // 3. 尝试从文本中提取信息
    return this._extractFromText(responseText);
  }

  _isValidResult(result) {
    return result && 
           Array.isArray(result.possible_diseases) && 
           typeof result.recommendation === 'string' &&
           result.possible_diseases.length > 0 &&
           result.recommendation.length > 0;
  }

  _extractFromText(text) {
    const diseases = [];
    const recommendations = [];

    // 提取可能的疾病
    const diseasePatterns = [
      /可能(?:是|患有|存在)(?:的疾病)?[：:](.*?)(?=\n|$)/,
      /诊断[：:](.*?)(?=\n|$)/,
      /考虑(.*?)(?=\n|$)/
    ];

    // 提取建议
    const recommendationPatterns = [
      /建议[：:](.*?)(?=\n|$)/,
      /注意事项[：:](.*?)(?=\n|$)/,
      /治疗方案[：:](.*?)(?=\n|$)/
    ];

    // 尝试所有疾病匹配模式
    for (const pattern of diseasePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        // 分割并清理疾病名称
        const extracted = match[1].split(/[,，、]/).map(d => d.trim()).filter(d => d);
        diseases.push(...extracted);
      }
    }

    // 尝试所有建议匹配模式
    for (const pattern of recommendationPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        recommendations.push(match[1].trim());
      }
    }

    // 如果成功提取到信息，返回标准格式
    if (diseases.length > 0 || recommendations.length > 0) {
      return {
        possible_diseases: diseases.length > 0 ? diseases : ['需要进一步诊断'],
        recommendation: recommendations.length > 0 
          ? recommendations.join('\n')
          : '建议及时就医，由专业医生进行详细检查。'
      };
    }

    return null;
  }

  _getDefaultResponse() {
    return {
      possible_diseases: ['需要进一步诊断'],
      recommendation: '建议及时就医，由专业医生进行详细检查。'
    };
  }

  async getSimilarCases(symptoms, topK = 3) {
    // TODO: 实现基于症状的相似病例检索
    // 这里需要配合向量数据库实现
    return [];
  }
}

// 创建模型服务实例
const modelService = new MedicalQAModel();

module.exports = modelService;