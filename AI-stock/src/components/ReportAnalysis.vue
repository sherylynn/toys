<template>
  <div class="report-analysis">
    <h2>财报分析</h2>
    
    <!-- 已下载报表选择区域 -->
    <div class="report-selector">
      <h3>选择要分析的报表</h3>
      <div v-if="loading" class="loading" v-loading="true">
      </div>
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-else-if="groupedReports.length > 0" class="report-list">
        <el-collapse>
          <el-collapse-item v-for="company in groupedReports" :key="company.name" :title="company.name">
            <div v-for="year in company.years" :key="year.value" class="year-group">
              <h4>{{ year.value }}年</h4>
              <div class="report-items">
                <div v-for="report in year.reports" :key="report.file_path" class="report-item">
                  <el-checkbox 
                    v-model="selectedReports[report.file_path]"
                    :true-value="true"
                    :false-value="false"
                    :label="report.title.split('_')[0]">
                  </el-checkbox>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
      <div v-else class="no-reports">
        暂无已下载的报表，请先在首页下载报表
      </div>
    </div>

    <!-- 解析选项 -->
    <div class="analysis-options" v-if="reports.length > 0">
      <h3>解析选项</h3>
      <div class="option-group">
        <input type="checkbox" id="excel" v-model="analysisOptions.excel">
        <label for="excel">转换财务数据为Excel格式</label>
      </div>
      <div class="option-group">
        <input type="checkbox" id="word" v-model="analysisOptions.word">
        <label for="word">转换文字说明为Word格式</label>
      </div>
      <div class="process-mode">
        <h4>处理模式</h4>
        <el-radio-group v-model="processMode">
          <el-radio value="doc2x">Doc2x处理</el-radio>
          <el-radio value="ragflow">RAGFlow处理</el-radio>
          <el-radio value="ollama">本地大模型</el-radio>
          <el-radio value="api">在线API</el-radio>
        </el-radio-group>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions" v-if="reports.length > 0">
      <button @click="startAnalysis" 
              :disabled="!canStartAnalysis || isAnalyzing"
              class="analyze-btn">
        {{ isAnalyzing ? '正在解析...' : '开始解析' }}
      </button>
    </div>

    <!-- 解析结果 -->
    <div class="analysis-results" v-if="analysisResults.length > 0">
      <h3>解析结果</h3>
      <div class="result-list">
        <div v-for="result in analysisResults" :key="result.id" class="result-item">
          <span class="result-title">{{ result.title }}</span>
          <div class="result-files">
            <div v-if="result.excelPath" class="file-actions">
              <el-button type="primary" @click="previewExcel(result.excelPath)" size="small">
                <el-icon><View /></el-icon> 预览Excel
              </el-button>
              <el-button type="success" @click="downloadFile(result.excelPath)" size="small">
                <el-icon><Download /></el-icon> 下载Excel
              </el-button>
            </div>
            <div v-if="result.wordPath" class="file-actions">
              <el-button type="primary" @click="previewWord(result.wordPath)" size="small">
                <el-icon><View /></el-icon> 预览Word
              </el-button>
              <el-button type="success" @click="downloadFile(result.wordPath)" size="small">
                <el-icon><Download /></el-icon> 下载Word
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览对话框 -->
    <el-dialog v-model="showExcelPreview" title="Excel预览" width="80%">
      <excel-viewer :file-path="currentPreviewPath" v-if="showExcelPreview"></excel-viewer>
    </el-dialog>

    <el-dialog v-model="showWordPreview" title="Word预览" width="80%">
      <div class="word-preview" v-html="wordContent"></div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { ElCollapse, ElCollapseItem, ElCheckbox, ElLoading, ElDialog, ElButton, ElRadioGroup, ElRadio } from 'element-plus'
import { View, Download, Loading } from '@element-plus/icons-vue'
import ExcelViewer from './ExcelViewer.vue'
import 'element-plus/dist/index.css'
import axios from '../utils/axios'

export default {
  name: 'ReportAnalysis',
  components: {
    ElCollapse,
    ElCollapseItem,
    ElCheckbox,
    ElDialog,
    ElButton,
    ElRadioGroup,
    ElRadio,
    ExcelViewer,
    View,
    Download,
    Loading
  },
  setup() {
    const reports = ref([])
    const selectedReports = ref({})
    const analysisOptions = ref({
      excel: true,
      word: true
    })
    const processMode = ref('local')
    const isAnalyzing = ref(false)
    const analysisResults = ref([])
    const showExcelPreview = ref(false)
    const showWordPreview = ref(false)
    const currentPreviewPath = ref('')
    const wordContent = ref('')
    const loading = ref(false)
    const error = ref('')
    const groupedReports = ref([])

    // 获取已下载的报表列表
    const fetchReports = async () => {
      loading.value = true
      error.value = ''
      try {
        const response = await axios.get('reports')
        if (response.data && response.data.reports) {
          reports.value = response.data.reports
          groupedReports.value = response.data.groupedReports || []
        }
      } catch (err) {
        error.value = '加载报表列表失败：' + (err.response?.data?.message || err.message)
        console.error('加载报表失败：', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchReports()
    })

    // 判断是否可以开始解析
    const canStartAnalysis = computed(() => {
      const selectedCount = Object.values(selectedReports.value).filter(Boolean).length
      return selectedCount > 0 && (analysisOptions.value.excel || analysisOptions.value.word)
    })

    // 开始解析
    const startAnalysis = async () => {
      const selectedFiles = Object.entries(selectedReports.value)
        .filter(([_, selected]) => selected)
        .map(([filePath]) => filePath)

      if (selectedFiles.length === 0) {
        error.value = '请至少选择一个报表进行解析'
        return
      }

      if (!analysisOptions.value.excel && !analysisOptions.value.word) {
        error.value = '请至少选择一种解析选项'
        return
      }

      isAnalyzing.value = true
      error.value = ''

      try {
        const response = await axios.post('analyze', {
          reports: selectedFiles,
          options: {
            ...analysisOptions.value,
            processMode: processMode.value
          }
        })

        if (response.data.results && response.data.results.length > 0) {
          analysisResults.value = response.data.results
          error.value = ''
        } else {
          error.value = '解析完成，但未生成任何结果文件'
        }
      } catch (err) {
        error.value = err.response?.data?.message || '解析失败，请检查选择的文件是否正确'
        console.error('解析错误：', err)
      } finally {
        isAnalyzing.value = false
      }
    }

    const previewExcel = (path) => {
      currentPreviewPath.value = path
      showExcelPreview.value = true
    }

    const previewWord = async (path) => {
      try {
        showWordPreview.value = true
        wordContent.value = ''
        const response = await axios.get(path)
        wordContent.value = response.data
      } catch (error) {
        console.error('加载Word文件失败:', error)
        wordContent.value = '加载失败：' + error.message
      }
    }

    const downloadFile = (path) => {
      const link = document.createElement('a')
      link.href = path
      link.download = path.split('/').pop()
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    return {
      reports,
      selectedReports,
      analysisOptions,
      processMode,
      isAnalyzing,
      analysisResults,
      loading,
      error,
      groupedReports,
      canStartAnalysis,
      startAnalysis,
      showExcelPreview,
      showWordPreview,
      currentPreviewPath,
      wordContent,
      previewExcel,
      previewWord,
      downloadFile
    }
  }
}
</script>

<style scoped>
.report-analysis {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.report-selector, .analysis-options, .analysis-results {
  margin-bottom: 30px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.report-list {
  margin-top: 15px;
}

.year-group {
  margin: 15px 0;
}

.year-group h4 {
  margin: 10px 0;
  color: #606266;
}

.report-items {
  display: grid;
  gap: 10px;
  padding: 10px;
}

.report-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.report-item:hover {
  background: #f0f2f5;
}

.option-group {
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.analyze-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.analyze-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 10px;
}

.result-files {
  display: flex;
  gap: 10px;
}

.word-preview {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
  background: #fff;
  font-family: 'Microsoft YaHei', sans-serif;
  line-height: 1.6;
}

.word-preview h1, .word-preview h2, .word-preview h3 {
  margin: 1em 0;
  color: #333;
}

.word-preview p {
  margin: 0.8em 0;
  text-align: justify;
}

.el-dialog__body {
  padding: 0;
}

.result-files {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.result-files .el-button {
  margin: 0;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  font-size: 16px;
  color: #909399;
}

.loading .el-icon {
  margin-right: 8px;
  font-size: 20px;
}
</style>