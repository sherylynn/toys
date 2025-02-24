// API配置
const API_BASE_URL = import.meta.env.DEV ? '/api' : window.location.origin;

export const API_ENDPOINTS = {
  // 患者相关
  PATIENT_INFO: `${API_BASE_URL}/patient/info`,
  DIAGNOSIS_ANALYZE: `${API_BASE_URL}/diagnosis/analyze`,
  SUBMIT_DIAGNOSIS: `${API_BASE_URL}/patient/info`, // 提交患者信息
  SUBMIT_DIAGNOSIS_RESULT: (patientId) => `${API_BASE_URL}/diagnosis/${patientId}/result`, // 提交诊断结果
  
  // 医生相关
  DOCTOR_PATIENTS: `${API_BASE_URL}/doctor/patients`,
  DOCTOR_DIAGNOSIS_NOTES: (diagnosisId) => `${API_BASE_URL}/doctor/diagnosis/${diagnosisId}/notes`,
  DOCTOR_DIAGNOSIS_UPDATE: (diagnosisId) => `${API_BASE_URL}/doctor/diagnosis/${diagnosisId}`,
  
  // 科室相关
  DEPARTMENTS: `${API_BASE_URL}/departments`,
  DEPARTMENT_PATIENTS: (departmentId) => `${API_BASE_URL}/department/${departmentId}/patients`
};