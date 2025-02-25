const { Department } = require('./index');

async function initializeDatabase() {
  try {
    console.log('开始初始化数据库...');

    // 定义初始科室数据
    const departments = [
      {
        name: '皮肤科',
        description: '专门诊治各类皮肤疾病，包括皮炎、湿疹、痤疮等皮肤问题。'
      },
      {
        name: '发热门诊',
        description: '专门接诊发热病人，进行发热原因筛查和诊治。'
      }
    ];

    // 批量创建科室记录
    const createdDepartments = await Department.bulkCreate(departments, {
      ignoreDuplicates: true
    });

    console.log(`成功创建 ${createdDepartments.length} 个科室`);
    console.log('数据库初始化完成！');

  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

// 如果这个文件被直接运行
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;