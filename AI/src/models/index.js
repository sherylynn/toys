const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// 初始化数据库连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../medical_qa.db')
});

// 定义Patient模型
// 定义Department模型（科室）
const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// 定义Registration模型（挂号记录）
const Registration = sequelize.define('Registration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'waiting' // waiting, in_progress, completed
  },
  registration_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^1[3-9]\d{9}$/ // 验证中国大陆手机号格式
    }
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false
  },
  symptoms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  medical_history: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// 定义Doctor模型
const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

// 定义Diagnosis模型
const Diagnosis = sequelize.define('Diagnosis', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  symptoms: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  possible_diseases: {
    type: DataTypes.TEXT, // 存储为JSON字符串
    allowNull: false
  },
  recommendation: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  doctor_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending' // pending, reviewed, completed
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// 设置模型关联
Patient.hasMany(Diagnosis, {
  foreignKey: 'patient_id'
});
Diagnosis.belongsTo(Patient, {
  foreignKey: 'patient_id'
});

Patient.hasMany(Registration);
Registration.belongsTo(Patient);

Department.hasMany(Registration);
Registration.belongsTo(Department);

// 同步数据库 - 使用force选项重新创建表结构
sequelize.sync({ force: true }).then(() => {
  console.log('数据库表结构已重新创建');
  // 初始化基础数据
  const initDb = require('./init-db');
  return initDb();
}).catch(err => {
  console.error('数据库同步失败:', err);
});

// 设置Doctor关联
Doctor.belongsTo(Department);
Department.hasMany(Doctor);

Diagnosis.belongsTo(Doctor, {
  foreignKey: 'doctor_id'
});
Doctor.hasMany(Diagnosis, {
  foreignKey: 'doctor_id'
});

module.exports = {
  sequelize,
  Patient,
  Doctor,
  Diagnosis,
  Department,
  Registration
};