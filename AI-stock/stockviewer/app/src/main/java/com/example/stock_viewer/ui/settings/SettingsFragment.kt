package com.example.stock_viewer.ui.settings

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.DocumentsContract
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.documentfile.provider.DocumentFile
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.example.stock_viewer.R
import com.example.stock_viewer.databinding.FragmentSettingsBinding

class SettingsFragment : Fragment() {

    private var _binding: FragmentSettingsBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!
    
    private lateinit var settingsViewModel: SettingsViewModel
    
    // 文件选择器结果处理
    private val directoryPickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            result.data?.data?.let { uri ->
                // 获取持久权限
                val takeFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                requireContext().contentResolver.takePersistableUriPermission(uri, takeFlags)
                
                // 获取路径并保存
                val path = getPathFromUri(uri)
                if (path.isNotEmpty()) {
                    settingsViewModel.setDownloadPath(path)
                    updatePathDisplay()
                }
            }
        }
    }
    
    // 权限请求结果处理
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        if (permissions.entries.all { it.value }) {
            // 所有权限都已授予，可以选择目录
            openDirectoryPicker()
        } else {
            Toast.makeText(requireContext(), "需要存储权限才能自定义下载路径", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        settingsViewModel = ViewModelProvider(this).get(SettingsViewModel::class.java)

        _binding = FragmentSettingsBinding.inflate(inflater, container, false)
        val root: View = binding.root

        // 初始化UI状态
        initUI()
        
        return root
    }
    
    private fun initUI() {
        // 设置开关状态
        binding.switchCustomPath.isChecked = settingsViewModel.useCustomPath.value ?: false
        binding.buttonSelectPath.isEnabled = binding.switchCustomPath.isChecked
        
        // 更新路径显示
        updatePathDisplay()
        
        // 设置开关监听器
        binding.switchCustomPath.setOnCheckedChangeListener { _, isChecked ->
            settingsViewModel.setUseCustomPath(isChecked)
            binding.buttonSelectPath.isEnabled = isChecked
            updatePathDisplay()
        }
        
        // 设置选择路径按钮监听器
        binding.buttonSelectPath.setOnClickListener {
            checkPermissionsAndOpenPicker()
        }
    }
    
    private fun updatePathDisplay() {
        val currentPath = if (settingsViewModel.useCustomPath.value == true && 
                           !settingsViewModel.downloadPath.value.isNullOrEmpty()) {
            settingsViewModel.downloadPath.value
        } else {
            getString(R.string.path_note)
        }
        
        binding.textCurrentPath.text = getString(R.string.current_path, currentPath)
    }
    
    private fun checkPermissionsAndOpenPicker() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11及以上使用存储访问框架，不需要请求权限
            openDirectoryPicker()
        } else {
            // Android 10及以下需要请求存储权限
            val permissions = arrayOf(
                Manifest.permission.READ_EXTERNAL_STORAGE,
                Manifest.permission.WRITE_EXTERNAL_STORAGE
            )
            
            if (permissions.all { ContextCompat.checkSelfPermission(requireContext(), it) == PackageManager.PERMISSION_GRANTED }) {
                openDirectoryPicker()
            } else {
                requestPermissionLauncher.launch(permissions)
            }
        }
    }
    
    private fun openDirectoryPicker() {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION or Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION)
        directoryPickerLauncher.launch(intent)
    }
    
    private fun getPathFromUri(uri: Uri): String {
        // 尝试获取真实路径
        try {
            val documentFile = DocumentFile.fromTreeUri(requireContext(), uri)
            return documentFile?.uri?.path ?: ""
        } catch (e: Exception) {
            e.printStackTrace()
            return ""
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}