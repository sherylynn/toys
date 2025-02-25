const axios = require('axios');

async function checkOllamaService() {
  console.log('正在检查Ollama服务状态...');
  
  try {
    // 检查Ollama服务是否运行
    const response = await axios.get('http://localhost:11434/api/tags');
    
    if (response.status === 200) {
      console.log('✅ Ollama服务运行正常');
      
      // 检查是否有deepseek-r1:1.5b模型
      const models = response.data.models || [];
      const hasModel = models.some(model => model.name === 'deepseek-r1:1.5b');
      
      if (hasModel) {
        console.log('✅ deepseek-r1:1.5b模型已安装');
        
        // 测试模型是否可用
        try {
          const testResponse = await axios.post('http://localhost:11434/api/generate', {
            model: 'deepseek-r1:1.5b',
            prompt: '你好',
            stream: false
          });
          
          if (testResponse.status === 200) {
            console.log('✅ 模型响应正常');
            return true;
          }
        } catch (error) {
          console.error('❌ 模型响应测试失败:', error.message);
          return false;
        }
      } else {
        console.error('❌ deepseek-r1:1.5b模型未安装');
        console.log('请运行以下命令安装模型：');
        console.log('ollama pull deepseek-r1:1.5b');
        return false;
      }
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Ollama服务未运行');
      console.log('请运行以下命令启动Ollama服务：');
      console.log('ollama serve');
    } else {
      console.error('❌ 检查Ollama服务失败:', error.message);
    }
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  checkOllamaService()
    .then(isAvailable => {
      if (!isAvailable) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('检查过程出错:', error);
      process.exit(1);
    });
}

module.exports = checkOllamaService;