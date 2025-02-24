const express = require('express');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const { Patient, Diagnosis, Department, Registration } = require('./models');
const modelService = require('./services/modelService');

// 检查并释放端口
async function ensurePortAvailable(port) {
  return new Promise((resolve, reject) => {
    // 在macOS上使用lsof命令检查端口占用
    exec(`lsof -i :${port}`, (error, stdout) => {
      if (stdout) {
        // 如果端口被占用，提取PID并终止进程
        const matches = stdout.match(/\n\w+\s+(\d+)/); // 匹配进程ID
        if (matches && matches[1]) {
          const pid = matches[1];
          exec(`kill -9 ${pid}`, (killError) => {
            if (killError) {
              console.error(`无法终止进程 ${pid}:`, killError);
              reject(killError);
            } else {
              console.log(`成功释放端口 ${port}（终止进程 ${pid}）`);
              // 等待一小段时间确保端口完全释放
              setTimeout(resolve, 1000);
            }
          });
        } else {
          resolve(); // 没有找到PID，可能是误报
        }
      } else {
        resolve(); // 端口未被占用
      }
    });
  });
}

const app = express();

// 配置中间件
app.use(cors());
app.use(express.json());

// 配置静态资源服务
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API路由
// 根路由
app.get('/', (req, res) => {
  res.json({ message: '欢迎使用医疗预诊智能问答系统' });
});

// 创建患者信息
app.post('/api/patient/info', async (req, res) => {
  try {
    const { name, age, gender, symptoms, medical_history, phone } = req.body;
    
    // 验证必要字段
    if (!name || !age || !gender || !symptoms || !phone) {
      return res.status(400).json({ 
        status: 'error', 
        message: '缺少必要的患者信息'
      });
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        status: 'error',
        message: '手机号格式不正确'
      });
    }

    // 检查是否存在相同手机号和姓名的患者
    const existingPatient = await Patient.findOne({
      where: {
        phone,
        name
      }
    });

    let patient;
    if (existingPatient) {
      // 更新现有患者信息
      await existingPatient.update({
        age,
        gender,
        symptoms,
        medical_history: medical_history || ''
      });
      patient = existingPatient;
    } else {
      // 创建新患者记录
      patient = await Patient.create({
        name,
        age,
        gender,
        symptoms,
        phone,
        medical_history: medical_history || ''
      });
    }

    res.json({ 
      status: 'success', 
      message: existingPatient ? '患者信息更新成功' : '患者信息提交成功',
      data: { patient_id: patient.id }
    });
  } catch (error) {
    console.error('Error saving patient info:', error);
    res.status(500).json({ 
      status: 'error', 
      message: '服务器内部错误',
      detail: error.message
    });
  }
});

// 获取科室列表
app.get('/departments', async (req, res) => {
  try {
    const departments = await Department.findAll();
    res.json({ status: 'success', data: departments });
  } catch (error) {
    console.error('获取科室列表失败:', error);
    res.status(500).json({ status: 'error', message: '获取科室列表失败' });
  }
});

// 创建挂号记录
app.post('/registration', async (req, res) => {
  try {
    const { patient_id, department_id } = req.body;
    
    // 验证患者和科室是否存在
    const [patient, department] = await Promise.all([
      Patient.findByPk(patient_id),
      Department.findByPk(department_id)
    ]);

    if (!patient || !department) {
      return res.status(404).json({ 
        status: 'error', 
        message: !patient ? '未找到患者信息' : '未找到科室信息'
      });
    }

    // 创建挂号记录
    const registration = await Registration.create({
      patient_id,
      department_id,
      status: 'waiting'
    });

    res.json({
      status: 'success',
      message: '挂号成功',
      data: registration
    });
  } catch (error) {
    console.error('创建挂号记录失败:', error);
    res.status(500).json({ status: 'error', message: '创建挂号记录失败' });
  }
});

// 更新诊断记录
app.post('/doctor/diagnosis/:diagnosisId/notes', async (req, res) => {
  try {
    const { diagnosisId } = req.params;
    const { doctor_notes } = req.body;

    const diagnosis = await Diagnosis.findByPk(diagnosisId);
    if (!diagnosis) {
      return res.status(404).json({ status: 'error', message: '未找到诊断记录' });
    }

    await diagnosis.update({
      doctor_notes,
      status: 'completed' // 更新状态为已完成
    });

    res.json({ status: 'success', message: '诊断意见已更新' });
  } catch (error) {
    console.error('更新诊断记录失败:', error);
    res.status(500).json({ status: 'error', message: '更新诊断记录失败' });
  }
});

// 获取医生端患者列表
app.get('/api/doctor/patients', async (req, res) => {
  try {
    console.log('开始获取医生端患者列表...');
    // 获取所有患者的诊断记录，并预加载患者信息
    const diagnoses = await Diagnosis.findAll({
      attributes: ['id', 'patient_id', 'possible_diseases', 'recommendation', 'doctor_notes', 'status', 'createdAt'],
      include: [{
        model: Patient,
        required: true, // 使用INNER JOIN确保只返回有患者信息的诊断记录
        attributes: ['id', 'name', 'age', 'gender', 'symptoms', 'medical_history']
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log(`成功获取诊断记录，数量: ${diagnoses.length}`);

    // 如果没有诊断记录，返回空数组
    if (!diagnoses || diagnoses.length === 0) {
      console.log('没有找到诊断记录');
      return res.json({
        status: 'success',
        data: []
      });
    }

    // 格式化返回数据
    const patients = diagnoses
      .filter(diagnosis => {
        if (!diagnosis.Patient) {
          console.error(`诊断记录 ${diagnosis.id} 缺少患者信息`);
          return false;
        }
        return true;
      })
      .map(diagnosis => ({
        id: diagnosis.id,
        patient_id: diagnosis.Patient.id,
        name: diagnosis.Patient.name,
        age: diagnosis.Patient.age,
        gender: diagnosis.Patient.gender,
        symptoms: diagnosis.symptoms || diagnosis.Patient.symptoms,
        medical_history: diagnosis.Patient.medical_history,
        possible_diseases: typeof diagnosis.possible_diseases === 'string' ?
          JSON.parse(diagnosis.possible_diseases) :
          diagnosis.possible_diseases || [],
        recommendation: diagnosis.recommendation,
        status: diagnosis.status || 'pending',
        created_at: diagnosis.createdAt,
        doctor_notes: diagnosis.doctor_notes,
        patient: diagnosis.Patient // 添加完整的患者信息
      }));

    console.log(`成功处理患者数据，返回 ${patients.length} 条记录`);

    res.json({
      status: 'success',
      data: patients
    });
  } catch (error) {
    console.error('获取医生端患者列表失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      status: 'error',
      message: '获取患者列表失败',
      error: error.message
    });
  }
});

// 获取患者列表（按科室）
app.get('/department/:department_id/patients', async (req, res) => {
  try {
    const { department_id } = req.params;
    const registrations = await Registration.findAll({
      where: { 
        department_id,
        status: 'waiting'
      },
      include: [{
        model: Patient,
        attributes: ['id', 'name', 'age', 'gender', 'symptoms', 'medical_history']
      }],
      order: [['registration_time', 'ASC']]
    });

    const patients = registrations.map(reg => ({
      ...reg.Patient.toJSON(),
      registration_id: reg.id,
      registration_time: reg.registration_time
    }));

    res.json({ status: 'success', data: patients });
  } catch (error) {
    console.error('获取患者列表失败:', error);
    res.status(500).json({ status: 'error', message: '获取患者列表失败' });
  }
});

// 分析症状
app.post('/api/diagnosis/analyze', async (req, res) => {
  console.log('收到症状分析请求:', JSON.stringify(req.body, null, 2));
  console.log('请求头信息:', req.headers);
  try {
    const { patient_id, symptoms, model } = req.body;
    
    // 如果指定了模型，设置使用的模型
    if (model) {
      modelService.setModel(model);
    }
    
    // 如果直接传入symptoms，则不需要查询患者信息
    let patientInfo;
    if (patient_id) {
      console.log('查询患者ID:', patient_id);
      const patient = await Patient.findByPk(patient_id);
      if (!patient) {
        console.log('未找到患者信息');
        return res.status(404).json({ status: 'error', message: '未找到患者信息' });
      }
      patientInfo = {
        age: patient.age,
        gender: patient.gender,
        symptoms: symptoms || patient.symptoms, // 使用新提供的症状或原有症状
        medical_history: patient.medical_history
      };

      // 不再更新患者的症状信息，因为症状信息现在保存在诊断记录中
    } else if (symptoms) {
      console.log('使用直接提供的症状信息');
      patientInfo = {
        symptoms,
        age: req.body.age || null,
        gender: req.body.gender || null,
        medical_history: req.body.medical_history || null
      };
    } else {
      console.log('缺少必要的症状信息');
      return res.status(400).json({ status: 'error', message: '请提供症状信息' });
    }

    console.log('开始分析症状:', patientInfo);
    // 分析症状
    const analysisResult = await modelService.analyzeSymptoms(patientInfo);

    console.log('分析结果:', analysisResult);
    
    // 保存诊断结果（仅当有患者ID时）
    let diagnosisId;
    if (patient_id) {
      const diagnosisData = {
        patient_id,
        symptoms: symptoms || patientInfo.symptoms,
        possible_diseases: JSON.stringify(analysisResult.possible_diseases),
        recommendation: analysisResult.recommendation,
        status: 'pending'
      };

      try {
        const diagnosis = await Diagnosis.create(diagnosisData);
        console.log('诊断记录已保存:', diagnosis.id);
        diagnosisId = diagnosis.id;
      } catch (error) {
        console.error('保存诊断记录失败:', error);
        return res.status(500).json({ 
          status: 'error', 
          message: '保存诊断记录失败',
          detail: error.message
        });
      }
    }

    res.json({
      status: 'success',
      message: '症状分析完成',
      data: {
        diagnosis_id: diagnosisId,
        ...analysisResult
      }
    });
  } catch (error) {
    console.error('症状分析失败:', error);
    res.status(500).json({ status: 'error', message: '症状分析失败' });
  }
});

// 所有未匹配的路由都返回前端应用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// 启动服务器
const PORT = process.env.PORT || 8000;

// 确保端口可用后再启动服务器
ensurePortAvailable(PORT)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('服务器启动失败:', error);
    process.exit(1);
  });