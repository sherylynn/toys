// 模型配置和提示词模板管理
module.exports = {
  // 不同模型的配置
  models: {
    // DeepSeek 模型配置
    'deepseek-r1:1.5b': {
      name: 'deepseek-r1:1.5b',
      apiBase: 'http://localhost:11434',
      prompts: {
        // 症状分析提示词
        analyzeSymptoms: (patientInfo) => `[INST]请作为一个专业的医疗AI助手，根据以下患者信息进行诊断分析。

患者信息：
年龄：${patientInfo.age || '未知'}
性别：${patientInfo.gender || '未知'}
主诉症状：${patientInfo.symptoms}
${patientInfo.medical_history ? `病史：${patientInfo.medical_history}\n` : ''}

请分析上述症状，给出可能的疾病诊断和建议。请以JSON格式返回，格式如下：
{
  "possible_diseases": ["疾病1", "疾病2"],
  "recommendation": "具体的就医建议和注意事项"
}[/INST]`
      }
    },
    
    // Qwen 模型配置
    'qwen2.5:1.5b': {
      name: 'qwen2.5:1.5b',
      apiBase: 'http://localhost:11434',
      prompts: {
        // 症状分析提示词
        analyzeSymptoms: (patientInfo) => `作为一个专业的医疗AI助手，请对以下患者信息进行分析。

患者资料：
年龄：${patientInfo.age || '未知'}
性别：${patientInfo.gender || '未知'}
主诉：${patientInfo.symptoms}
${patientInfo.medical_history ? `既往病史：${patientInfo.medical_history}\n` : ''}

请根据以上信息进行分析，并以下面的JSON格式返回：
{
  "possible_diseases": ["疾病1", "疾病2"],
  "recommendation": "具体的就医建议和注意事项"
}`
      }
    }
  },

  // 获取指定模型的配置
  getModelConfig(modelName) {
    return this.models[modelName] || this.models['deepseek-r1:1.5b']; // 默认使用deepseek模型
  },

  // 获取指定模型的提示词模板
  getPromptTemplate(modelName, templateName, ...args) {
    const modelConfig = this.getModelConfig(modelName);
    const promptTemplate = modelConfig.prompts[templateName];
    
    if (typeof promptTemplate === 'function') {
      return promptTemplate(...args);
    }
    return promptTemplate;
  }
};