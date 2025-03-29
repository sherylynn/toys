package com.example.stock_viewer.ui.settings

import android.app.Application
import android.os.Environment
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.preference.PreferenceManager

class SettingsViewModel(application: Application) : AndroidViewModel(application) {

    private val _text = MutableLiveData<String>().apply {
        value = "This is settings Fragment"
    }
    val text: LiveData<String> = _text
    
    // 默认下载路径
    private val _defaultPath = MutableLiveData<String>().apply {
        value = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).absolutePath
    }
    val defaultPath: LiveData<String> = _defaultPath
    
    // 自定义下载路径
    private val _downloadPath = MutableLiveData<String>()
    val downloadPath: LiveData<String> = _downloadPath
    
    // 是否使用自定义路径
    private val _useCustomPath = MutableLiveData<Boolean>()
    val useCustomPath: LiveData<Boolean> = _useCustomPath
    
    // 偏好设置
    private val prefs = PreferenceManager.getDefaultSharedPreferences(application)
    
    /**
     * 设置是否使用自定义下载路径
     */
    fun setUseCustomPath(use: Boolean) {
        prefs.edit().putBoolean("use_custom_download_path", use).apply()
        _useCustomPath.value = use
    }
    
    /**
     * 设置自定义下载路径
     */
    fun setDownloadPath(path: String) {
        prefs.edit().putString("download_path", path).apply()
        _downloadPath.value = path
    }
    
    /**
     * 获取当前实际使用的下载路径
     */
    fun getCurrentDownloadPath(): String {
        return if (_useCustomPath.value == true && !_downloadPath.value.isNullOrEmpty()) {
            _downloadPath.value ?: _defaultPath.value ?: ""
        } else {
            _defaultPath.value ?: ""
        }
    }
    
    init {
        // 初始化设置值
        _useCustomPath.value = prefs.getBoolean("use_custom_download_path", false)
        _downloadPath.value = prefs.getString("download_path", "")
    }
}