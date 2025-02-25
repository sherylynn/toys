<template>
  <div class="report-history">
    <el-card>
      <template #header>
        <h2>历史财报浏览</h2>
      </template>
      <div v-if="loading" class="loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        加载中...
      </div>
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      <template v-else>
        <div v-if="companies.length === 0" class="empty-message">
          暂无已下载的财报
        </div>
        <div v-else class="company-list">
          <el-collapse>
            <el-collapse-item v-for="company in companies" :key="company.name" :title="company.name">
              <div v-for="year in company.years" :key="year.value" class="year-group">
                <h4>{{ year.value }}年</h4>
                <el-table :data="year.reports" style="width: 100%">
                  <el-table-column prop="title" label="报表名称">
                    <template #default="scope">
                      <a :href="scope.row.file_path" target="_blank" class="report-link">{{ scope.row.title }}</a>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElIcon } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import axios from '../utils/axios'

const loading = ref(false)
const error = ref('')
const companies = ref([])

const fetchReports = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await axios.get('reports')
    const reports = response.data?.reports || []

    // 按公司和年份组织数据
    const companyMap = new Map()

    if (reports.length === 0) {
      companies.value = []
      return
    }

    reports.forEach(report => {
      if (!report?.file_path) return
      
      const pathParts = report.file_path.split('/')
      if (pathParts.length < 3) return

      const company = pathParts[pathParts.length - 3]
      const year = pathParts[pathParts.length - 2]
      
      if (!companyMap.has(company)) {
        companyMap.set(company, new Map())
      }

      const yearMap = companyMap.get(company)
      if (!yearMap.has(year)) {
        yearMap.set(year, [])
      }

      yearMap.get(year).push(report)
    })

    // 转换数据结构为组件所需格式
    companies.value = Array.from(companyMap.entries())
      .filter(([name]) => name) // 过滤掉空的公司名
      .map(([name, yearMap]) => ({
        name,
        years: Array.from(yearMap.entries())
          .filter(([value]) => value) // 过滤掉空的年份
          .sort((a, b) => b[0] - a[0]) // 年份降序排序
          .map(([value, reports]) => ({
            value,
            reports: reports
              .filter(report => report?.title) // 过滤掉没有标题的报表
              .sort((a, b) => a.title.localeCompare(b.title)) // 报表名称升序排序
          }))
      }))
  } catch (e) {
    error.value = '获取历史财报列表失败'
    console.error('获取历史财报列表失败:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReports()
})
</script>

<style scoped>
.report-history {
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 20px;
}

.error-message {
  color: #f56c6c;
  text-align: center;
  padding: 20px;
}

.empty-message {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.company-list {
  margin-top: 20px;
}

.year-group {
  margin-bottom: 20px;
}

.year-group h4 {
  margin: 10px 0;
  color: #606266;
}

.report-link {
  color: #409eff;
  text-decoration: none;
}

.report-link:hover {
  text-decoration: underline;
}
</style>