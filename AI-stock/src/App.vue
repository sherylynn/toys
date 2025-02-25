<template>
  <div class="container">
    <el-menu mode="horizontal" class="nav-menu">
      <el-menu-item index="1" @click="currentView = '财报下载'">财报下载</el-menu-item>
      <el-menu-item index="2" @click="currentView = '财报分析'">财报分析</el-menu-item>
    </el-menu>
    <div class="content">
      <div v-if="currentView === '财报下载'">
        <el-card class="form-card">
          <template #header>
            <h2>财报下载系统</h2>
          </template>
          <el-form :model="form" label-width="120px">
            <el-form-item label="公司名称">
              <el-input v-model="form.companyName" placeholder="请输入公司名称"></el-input>
            </el-form-item>
            <el-form-item label="年份">
              <el-input v-model="form.year" placeholder="请输入年份（可选）"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="downloadReports" :loading="loading">下载财报</el-button>
            </el-form-item>
          </el-form>
          <div v-if="message" :class="['message', messageType]">
            {{ message }}
          </div>
          
          <!-- 添加文件预览区域 -->
          <div v-if="downloadedFiles.length > 0" class="report-list">
            <h3>已下载的报表：</h3>
            <el-table :data="downloadedFiles" style="width: 100%">
              <el-table-column prop="title" label="报表名称">
                <template #default="scope">
                  <a :href="scope.row.file_path" target="_blank" class="report-link">{{ scope.row.title }}</a>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
        
        <!-- 添加历史财报浏览组件 -->
        <ReportHistory class="history-card" />
      </div>
      <div v-else>
        <ReportAnalysis />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from './utils/axios'
import ReportHistory from './components/ReportHistory.vue'
import ReportAnalysis from './components/ReportAnalysis.vue'

const currentView = ref('财报下载')
const form = ref({
  companyName: '云南白药',
  year: new Date().getFullYear().toString()
})

const loading = ref(false)
const message = ref('')
const messageType = ref('')
const downloadedFiles = ref([])

const downloadReports = async () => {
  if (!form.value.companyName) {
    message.value = '请输入公司名称'
    messageType.value = 'error'
    return
  }

  loading.value = true
  message.value = ''
  downloadedFiles.value = []

  try {
    const response = await axios.post('download', {
      company_name: form.value.companyName,
      year: form.value.year || null
    })

    downloadedFiles.value = response.data.files
    message.value = '财报下载成功！'
    messageType.value = 'success'
  } catch (error) {
    message.value = error.response?.data?.message || '下载失败，请稍后重试'
    messageType.value = 'error'
    console.error('下载错误：', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.nav-menu {
  margin-bottom: 20px;
}

.content {
  padding: 0 20px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.form-card {
  height: fit-content;
}

.history-card {
  height: fit-content;
}

.message {
  margin-top: 16px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.success {
  background-color: #f0f9eb;
  color: #67c23a;
}

.error {
  background-color: #fef0f0;
  color: #f56c6c;
}
</style>