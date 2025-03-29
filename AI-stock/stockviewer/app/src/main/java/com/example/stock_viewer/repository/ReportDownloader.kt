package com.example.stock_viewer.repository

import android.content.Context
import android.content.SharedPreferences
import android.os.Environment
import android.util.Log
import androidx.preference.PreferenceManager
import com.example.stock_viewer.api.ApiClient
import com.example.stock_viewer.api.Announcement
import com.example.stock_viewer.api.CompanyInfo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.ResponseBody
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.util.Calendar
import java.util.regex.Pattern

/**
 * 财报下载器类，负责从巨潮信息网下载财报PDF
 */
class ReportDownloader(private val context: Context) {
    
    companion object {
        private const val TAG = "ReportDownloader"
        private val REPORT_TYPES = mapOf(
            "第一季度报告" to listOf("一季度报告", "第一季度报告", "年一季度报告"),
            "半年度报告" to listOf("半年度报告", "中期报告"),
            "第三季度报告" to listOf("三季度报告", "第三季度报告"),
            "年度报告" to listOf("年度报告", "年报")
        )
    }
    
    /**
     * 下载指定公司和年份的财报
     * @param companyName 公司名称
     * @param year 年份，如果为null则使用当前年份
     * @return 下载的文件列表
     */
    suspend fun downloadReports(companyName: String, year: Int? = null): List<ReportFile> {
        val currentYear = Calendar.getInstance().get(Calendar.YEAR)
        val targetYear = year ?: currentYear
        
        // 搜索公司获取股票代码
        val (stockCode, orgId) = searchCompany(companyName) ?: return emptyList()
        
        // 查询公告列表
        val announcements = queryAnnouncements(stockCode, orgId, targetYear)
        if (announcements.isEmpty()) {
            Log.d(TAG, "未找到${targetYear}年的任何报表")
            return emptyList()
        }
        
        // 过滤并下载报表
        return downloadReportFiles(announcements, companyName)
    }
    
    /**
     * 搜索公司获取股票代码
     * @param companyName 公司名称
     * @return Pair<股票代码, 组织ID>
     */
    private suspend fun searchCompany(companyName: String): Pair<String, String>? = withContext(Dispatchers.IO) {
        try {
            val response = ApiClient.cninfoService.searchCompany(companyName)
            if (response.isSuccessful && !response.body().isNullOrEmpty()) {
                val companyInfo = response.body()!!.first()
                return@withContext Pair(companyInfo.code, companyInfo.orgId)
            }
            Log.e(TAG, "未找到公司：$companyName")
            return@withContext null
        } catch (e: Exception) {
            Log.e(TAG, "搜索公司信息时出错：${e.message}")
            return@withContext null
        }
    }
    
    /**
     * 查询公告列表
     * @param stockCode 股票代码
     * @param orgId 组织ID
     * @param year 年份
     * @return 公告列表
     */
    private suspend fun queryAnnouncements(stockCode: String, orgId: String, year: Int): List<Announcement> = withContext(Dispatchers.IO) {
        try {
            val stock = "$stockCode,$orgId"
            val seDate = "$year-01-01~$year-12-31"
            
            val response = ApiClient.cninfoService.queryAnnouncements(
                stock = stock,
                seDate = seDate,
                pageSize = 100
            )
            
            if (response.isSuccessful) {
                return@withContext response.body()?.announcements ?: emptyList()
            }
            Log.e(TAG, "获取报表列表失败：HTTP ${response.code()}")
            return@withContext emptyList()
        } catch (e: Exception) {
            Log.e(TAG, "查询公告列表时出错：${e.message}")
            return@withContext emptyList()
        }
    }
    
    /**
     * 过滤并下载报表文件
     * @param announcements 公告列表
     * @param companyName 公司名称
     * @return 下载的文件列表
     */
    private suspend fun downloadReportFiles(announcements: List<Announcement>, companyName: String): List<ReportFile> = withContext(Dispatchers.IO) {
        val downloadedFiles = mutableListOf<ReportFile>()
        
        for (announcement in announcements) {
            val title = announcement.announcementTitle
            
            // 排除摘要和英文版报告
            if (title.contains("摘要") || title.contains("英文") || 
                title.contains("补充") || title.contains("更正")) {
                continue
            }
            
            // 从标题中提取实际年份
            val yearPattern = Pattern.compile("20\\d{2}")
            val yearMatcher = yearPattern.matcher(title)
            if (!yearMatcher.find()) continue
            
            val actualYear = yearMatcher.group()
            
            // 检查是否为所需的报告类型
            var isTargetReport = false
            var reportCategory = ""
            
            for ((category, patterns) in REPORT_TYPES) {
                if (patterns.any { title.contains(it) }) {
                    isTargetReport = true
                    reportCategory = category
                    break
                }
            }
            
            if (isTargetReport) {
                // 创建下载目录
                val downloadDir = getDownloadDir(companyName, actualYear)
                
                // 生成标准化的文件名
                val standardTitle = "${actualYear}年${reportCategory}_${companyName}"
                val fileName = "${standardTitle}.pdf"
                val file = File(downloadDir, fileName)
                
                // 检查文件是否已存在
                if (file.exists()) {
                    Log.d(TAG, "文件已存在，跳过下载：$fileName")
                    downloadedFiles.add(
                        ReportFile(
                            title = announcement.announcementTitle,
                            fileName = fileName,
                            filePath = file.absolutePath
                        )
                    )
                    continue
                }
                
                // 下载PDF文件
                val pdfUrl = ApiClient.getDownloadUrl(announcement.adjunctUrl)
                Log.d(TAG, "正在下载：$fileName")
                
                try {
                    val response = ApiClient.cninfoService.downloadFile(pdfUrl)
                    if (response.isSuccessful) {
                        response.body()?.let { responseBody ->
                            if (saveFile(responseBody, file)) {
                                Log.d(TAG, "下载完成：$fileName")
                                downloadedFiles.add(
                                    ReportFile(
                                        title = announcement.announcementTitle,
                                        fileName = fileName,
                                        filePath = file.absolutePath
                                    )
                                )
                            } else {
                                Log.e(TAG, "保存文件失败：$fileName")
                            }
                        }
                    } else {
                        Log.e(TAG, "下载失败：$fileName，HTTP ${response.code()}")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "下载文件时出错：${e.message}")
                }
            }
        }
        
        return@withContext downloadedFiles
    }
    
    /**
     * 获取下载目录
     * @param companyName 公司名称
     * @param year 年份
     * @return 下载目录
     */
    private fun getDownloadDir(companyName: String, year: String): File {
        // 从设置中获取下载路径，默认为外部存储的Download目录
        val prefs = PreferenceManager.getDefaultSharedPreferences(context)
        val useCustomPath = prefs.getBoolean("use_custom_download_path", false)
        val customPath = prefs.getString("download_path", "")
        
        val baseDir = if (useCustomPath && !customPath.isNullOrEmpty()) {
            // 使用自定义路径
            File(customPath)
        } else {
            // 使用默认路径（外部存储的Download目录）
            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        }
        
        val reportsDir = File(baseDir, "reports")
        val companyDir = File(reportsDir, companyName)
        val yearDir = File(companyDir, year)
        
        if (!yearDir.exists()) {
            yearDir.mkdirs()
        }
        
        return yearDir
    }
    
    /**
     * 保存文件
     * @param body 响应体
     * @param file 目标文件
     * @return 是否保存成功
     */
    private fun saveFile(body: ResponseBody, file: File): Boolean {
        return try {
            var inputStream: InputStream? = null
            var outputStream: FileOutputStream? = null
            
            try {
                val fileReader = ByteArray(4096)
                var fileSizeDownloaded: Long = 0
                
                inputStream = body.byteStream()
                outputStream = FileOutputStream(file)
                
                while (true) {
                    val read = inputStream.read(fileReader)
                    if (read == -1) break
                    
                    outputStream.write(fileReader, 0, read)
                    fileSizeDownloaded += read
                }
                
                outputStream.flush()
                true
            } finally {
                inputStream?.close()
                outputStream?.close()
            }
        } catch (e: Exception) {
            Log.e(TAG, "保存文件时出错：${e.message}")
            false
        }
    }
}

/**
 * 报表文件数据类
 */
data class ReportFile(
    val title: String,
    val fileName: String,
    val filePath: String
)