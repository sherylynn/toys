package com.example.stock_viewer.ui.slideshow

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.example.stock_viewer.repository.CompanyReports
import com.example.stock_viewer.repository.ReportFile
import com.example.stock_viewer.repository.ReportManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * 报表列表状态密封类
 */
sealed class ReportListState {
    object Loading : ReportListState()
    data class Success(val reports: List<CompanyReports>) : ReportListState()
    data class Error(val message: String) : ReportListState()
}

class SlideshowViewModel(application: Application) : AndroidViewModel(application) {

    private val reportManager = ReportManager(application)
    
    private val _reportListState = MutableLiveData<ReportListState>(ReportListState.Loading)
    val reportListState: LiveData<ReportListState> = _reportListState
    
    // 选中的报表文件LiveData
    private val _selectedReport = MutableLiveData<ReportFile?>()
    val selectedReport: LiveData<ReportFile?> = _selectedReport
    
    /**
     * 加载报表列表
     */
    fun loadReportList() {
        _reportListState.value = ReportListState.Loading
        
        viewModelScope.launch {
            try {
                val reports = withContext(Dispatchers.IO) {
                    reportManager.getReportList()
                }
                
                _reportListState.postValue(ReportListState.Success(reports))
            } catch (e: Exception) {
                _reportListState.postValue(ReportListState.Error(e.message ?: "未知错误"))
            }
        }
    }
    
    /**
     * 获取报表文件路径
     */
    fun getReportFilePath(filePath: String): String? {
        val file = reportManager.getReportFile(filePath)
        return file?.absolutePath
    }
    
    /**
     * 选择报表
     */
    fun selectReport(report: ReportFile) {
        _selectedReport.value = report
    }
    
    /**
     * 清除选中的报表
     */
    fun clearSelectedReport() {
        _selectedReport.value = null
    }
}