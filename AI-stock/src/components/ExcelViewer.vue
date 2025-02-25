<template>
  <div class="excel-viewer">
    <div v-if="loading" class="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      加载中...
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else>
      <el-table
        :data="tableData"
        :border="true"
        style="width: 100%"
        max-height="500">
        <el-table-column
          v-for="(col, index) in columns"
          :key="index"
          :prop="col.prop"
          :label="col.label"
          :min-width="120">
        </el-table-column>
      </el-table>
      <div v-if="sheets.length > 1" class="sheet-tabs">
        <el-tabs v-model="currentSheet" @tab-click="handleSheetChange">
          <el-tab-pane
            v-for="sheet in sheets"
            :key="sheet"
            :label="sheet"
            :name="sheet">
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElTable, ElTableColumn, ElTabs, ElTabPane, ElIcon } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import 'element-plus/dist/index.css'

const props = defineProps({
  filePath: {
    type: String,
    required: true
  }
})

const loading = ref(true)
const error = ref(null)
const tableData = ref([])
const columns = ref([])
const sheets = ref([])
const currentSheet = ref('')
const workbook = ref(null)
const sheetLoading = ref(false)

const loadExcel = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await fetch(props.filePath)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const blob = await response.blob()
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        workbook.value = XLSX.read(data, { type: 'array' })
        
        sheets.value = workbook.value.SheetNames
        currentSheet.value = sheets.value[0]
        
        loadSheet(currentSheet.value)
        loading.value = false
      } catch (err) {
        error.value = '解析Excel文件失败：' + err.message
        loading.value = false
      }
    }
    
    reader.onerror = () => {
      error.value = '读取文件失败'
      loading.value = false
    }
    
    reader.readAsArrayBuffer(blob)
  } catch (err) {
    error.value = '加载Excel文件失败：' + err.message
    loading.value = false
  }
}

const loadSheet = async (sheetName) => {
  try {
    sheetLoading.value = true
    const worksheet = workbook.value.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    if (jsonData.length === 0) {
      tableData.value = []
      columns.value = []
      return
    }
    
    // 处理表头
    const headers = jsonData[0]
    columns.value = headers.map((header, index) => ({
      prop: `col${index}`,
      label: header || `列${index + 1}`
    }))
    
    // 处理数据行
    tableData.value = jsonData.slice(1).map(row => {
      const rowData = {}
      columns.value.forEach((col, index) => {
        rowData[col.prop] = row[index] || ''
      })
      return rowData
    })
  } catch (err) {
    error.value = '加载工作表失败：' + err.message
    console.error('工作表加载错误：', err)
  } finally {
    sheetLoading.value = false
  }
}

const handleSheetChange = async (tab) => {
  await loadSheet(tab.props.name)
}

watch(() => props.filePath, async (newPath) => {
  if (newPath) {
    await loadExcel()
  }
}, { immediate: true })

onMounted(() => {
  if (props.filePath) {
    loadExcel()
  }
})
</script>

<style scoped>
.excel-viewer {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
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

.error {
  padding: 20px;
  color: #f56c6c;
  text-align: center;
  background-color: #fef0f0;
  border-radius: 4px;
  margin-bottom: 20px;
}

.sheet-tabs {
  margin-bottom: 20px;
}

:deep(.el-table) {
  --el-table-header-bg-color: #f5f7fa;
}

:deep(.el-table th) {
  font-weight: bold;
  color: #606266;
}

:deep(.el-table td) {
  color: #606266;
}

:deep(.el-tabs__item) {
  font-size: 14px;
  color: #606266;
}

:deep(.el-tabs__item.is-active) {
  color: #409eff;
}
</style>