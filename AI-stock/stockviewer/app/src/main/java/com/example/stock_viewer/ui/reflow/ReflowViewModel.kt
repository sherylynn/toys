package com.example.stock_viewer.ui.reflow

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.example.stock_viewer.repository.ReportDownloader
import com.example.stock_viewer.repository.ReportFile
import kotlinx.coroutines.launch

/**
 * 下载状态密封类
 */
sealed class DownloadState {
    object Idle : DownloadState()
    object Loading : DownloadState()
    data class Success(val reports: List<ReportFile>) : DownloadState()
    data class Error(val message: String) : DownloadState()
}

class ReflowViewModel(application: Application) : AndroidViewModel(application) {

    private val reportDownloader = ReportDownloader(application)
    
    private val _downloadState = MutableLiveData<DownloadState>(DownloadState.Idle)
    val downloadState: LiveData<DownloadState> = _downloadState
    
    /**
     * 下载指定公司和年份的财报
     * @param companyName 公司名称
     * @param year 年份
     */
    fun downloadReports(companyName: String, year: Int) {
        _downloadState.value = DownloadState.Loading
        
        viewModelScope.launch {
            try {
                val reports = reportDownloader.downloadReports(companyName, year)
                if (reports.isEmpty()) {
                    _downloadState.postValue(DownloadState.Error("未找到任何报表"))
                } else {
                    _downloadState.postValue(DownloadState.Success(reports))
                }
            } catch (e: Exception) {
                _downloadState.postValue(DownloadState.Error(e.message ?: "未知错误"))
            }
        }
    }
}