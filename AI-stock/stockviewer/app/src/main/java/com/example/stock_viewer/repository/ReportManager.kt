package com.example.stock_viewer.repository

import android.content.Context
import android.os.Environment
import android.util.Log
import java.io.File

/**
 * 财报管理器类，负责管理已下载的财报文件
 */
class ReportManager(private val context: Context) {
    
    companion object {
        private const val TAG = "ReportManager"
    }
    
    /**
     * 获取当前配置的报表存储目录
     */
    fun getBaseDirectory(): File {
        val prefs = context.getSharedPreferences("StockViewerPrefs", Context.MODE_PRIVATE)
        val useCustomPath = prefs.getBoolean("use_custom_download_path", false)
        val customPath = prefs.getString("download_path", "")
        val formattedPath = when {
            customPath?.startsWith("content://") == true -> customPath
            
            else -> customPath?.takeIf { it.isNotEmpty() }?.let {
                // 过滤冗余路径段
                val sanitizedPath = if (it.contains("/document/primary:")) {
                    // 移除/document/primary:及其后续内容
                    val index = it.indexOf("/document/primary:")
                    it.substring(0, index)
                } else {
                    it
                }
                val file = File(sanitizedPath)
                try {
                    file.canonicalPath
                } catch (e: Exception) {
                    file.absolutePath
                }
            }
        }.also { path ->
            Log.d(TAG, "路径规范化验证 -> \n原始路径: ${customPath}\n最终路径: $path")
        }
        
        val baseDir = if (useCustomPath && !formattedPath.isNullOrEmpty()) {
            File(File(formattedPath), "reports").apply {
                if (!exists()) mkdirs()
                Log.d(TAG, "最终存储目录: $absolutePath")
            }
        } else {
            File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "reports").apply {
                if (!exists()) mkdirs()
            }
        }
        
        if (!baseDir.exists()) {
            baseDir.mkdirs()
            Log.d(TAG, "创建基础目录: ${baseDir.absolutePath}")
        }
        
        return baseDir
    }

    /**
     * 获取所有已下载的财报列表
     * @return 按公司和年份组织的财报列表
     */
    fun getReportList(): List<CompanyReports> {
        val prefs = context.getSharedPreferences("StockViewerPrefs", Context.MODE_PRIVATE)
        val useCustomPath = prefs.getBoolean("use_custom_download_path", false)
        val customPath = prefs.getString("download_path", "")
        val formattedPath = when {
            customPath?.startsWith("content://") == true -> customPath
            
            else -> customPath?.takeIf { it.isNotEmpty() }?.let {
                // 过滤冗余路径段
                val sanitizedPath = if (it.contains("/document/primary:")) {
                    // 移除/document/primary:及其后续内容
                    val index = it.indexOf("/document/primary:")
                    it.substring(0, index)
                } else {
                    it
                }
                File(sanitizedPath).absolutePath
            }
        }.also { path ->
            Log.d(TAG, "路径规范化验证 -> \n原始路径: ${customPath}\n最终路径: $path")
        }
        Log.d(TAG, "当前下载路径配置: useCustomPath=$useCustomPath, formattedPath=$formattedPath")
        val baseDir = if (useCustomPath && !formattedPath.isNullOrEmpty()) {
            File(File(formattedPath), "reports").apply {
                if (!exists()) mkdirs()
                Log.d(TAG, "最终存储目录: $absolutePath")
            }
        } else {
            getBaseDirectory()
        }
        if (!baseDir.exists()) {
            return emptyList()
        }
        
        val companyReports = mutableListOf<CompanyReports>()
        
        // 遍历公司目录
        baseDir.listFiles()?.forEach { companyDir ->
            if (companyDir.isDirectory) {
                val companyName = companyDir.name
                val yearReports = mutableListOf<YearReports>()
                
                // 遍历年份目录
                companyDir.listFiles()?.forEach { yearDir ->
                    if (yearDir.isDirectory) {
                        val year = yearDir.name
                        val reports = mutableListOf<ReportFile>()
                        
                        // 遍历报表文件
                        yearDir.listFiles()?.forEach { file ->
                            if (file.isFile && file.name.endsWith(".pdf")) {
                                reports.add(
                                    ReportFile(
                                        title = file.nameWithoutExtension,
                                        fileName = file.name,
                                        filePath = file.absolutePath
                                    )
                                )
                            }
                        }
                        
                        if (reports.isNotEmpty()) {
                            yearReports.add(
                                YearReports(
                                    year = year,
                                    reports = reports.sortedBy { it.title }
                                )
                            )
                        }
                    }
                }
                
                if (yearReports.isNotEmpty()) {
                    companyReports.add(
                        CompanyReports(
                            name = companyName,
                            years = yearReports.sortedByDescending { it.year }
                        )
                    )
                }
            }
        }
        
        return companyReports
    }
    
    /**
     * 获取报表文件
     * @param filePath 文件路径
     * @return 报表文件
     */
    fun getReportFile(filePath: String): File? {
        val file = File(filePath)
        return if (file.exists() && file.isFile) file else null
    }
}

/**
 * 公司报表数据类
 */
data class CompanyReports(
    val name: String,
    val years: List<YearReports>
)

/**
 * 年度报表数据类
 */
data class YearReports(
    val year: String,
    val reports: List<ReportFile>
)
