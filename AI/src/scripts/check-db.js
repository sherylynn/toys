const { Patient, Diagnosis, Registration } = require('../models');

async function checkDatabase() {
  try {
    console.log('=== 检查数据库记录 ===');

    // 检查患者信息
    const patients = await Patient.findAll();
    console.log('\n患者记录数量:', patients.length);
    if (patients.length > 0) {
      console.log('\n患者信息示例:');
      patients.slice(0, 3).forEach(patient => {
        console.log('-------------------');
        console.log('ID:', patient.id);
        console.log('姓名:', patient.name);
        console.log('年龄:', patient.age);
        console.log('性别:', patient.gender);
        console.log('症状:', patient.symptoms);
        console.log('病史:', patient.medical_history || '无');
      });
    } else {
      console.log('警告: 数据库中没有患者记录');
    }

    // 检查诊断记录
    const diagnoses = await Diagnosis.findAll({
      include: [{
        model: Patient,
        attributes: ['name']
      }]
    });
    console.log('\n诊断记录数量:', diagnoses.length);
    if (diagnoses.length > 0) {
      console.log('\n诊断记录示例:');
      diagnoses.slice(0, 3).forEach(diagnosis => {
        console.log('-------------------');
        console.log('ID:', diagnosis.id);
        console.log('患者:', diagnosis.Patient ? diagnosis.Patient.name : '未知');
        console.log('可能疾病:', diagnosis.possible_diseases);
        console.log('建议:', diagnosis.recommendation);
        console.log('状态:', diagnosis.status);
        console.log('医生注释:', diagnosis.doctor_notes || '无');
      });
    } else {
      console.log('警告: 数据库中没有诊断记录');
    }

    // 检查挂号记录
    const registrations = await Registration.findAll({
      include: [{
        model: Patient,
        attributes: ['name']
      }]
    });
    console.log('\n挂号记录数量:', registrations.length);
    if (registrations.length > 0) {
      console.log('\n挂号记录示例:');
      registrations.slice(0, 3).forEach(reg => {
        console.log('-------------------');
        console.log('ID:', reg.id);
        console.log('患者:', reg.Patient ? reg.Patient.name : '未知');
        console.log('科室ID:', reg.department_id);
        console.log('状态:', reg.status);
        console.log('挂号时间:', reg.registration_time);
      });
    } else {
      console.log('警告: 数据库中没有挂号记录');
    }

  } catch (error) {
    console.error('检查数据库时出错:', error);
  } finally {
    process.exit(0);
  }
}

// 执行检查
checkDatabase();