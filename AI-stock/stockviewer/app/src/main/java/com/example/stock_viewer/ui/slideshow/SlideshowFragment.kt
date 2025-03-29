package com.example.stock_viewer.ui.slideshow

import android.Manifest
import android.content.pm.PackageManager
import android.util.Log
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.example.stock_viewer.databinding.FragmentSlideshowBinding
import com.example.stock_viewer.repository.CompanyReports
import com.example.stock_viewer.repository.ReportFile
import com.example.stock_viewer.repository.ReportManager
import com.example.stock_viewer.repository.YearReports
import android.content.Intent
import java.io.File
import androidx.core.content.FileProvider

class SlideshowFragment : Fragment() {

    private companion object {
        const val STORAGE_PERMISSION_REQUEST_CODE = 1001
    }

    private var _binding: FragmentSlideshowBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        val slideshowViewModel =
            ViewModelProvider(this).get(SlideshowViewModel::class.java)

        _binding = FragmentSlideshowBinding.inflate(inflater, container, false)
        val root: View = binding.root

        // 显示当前报表路径
        val reportManager = ReportManager(requireContext())
        val baseDir = reportManager.getBaseDirectory()
        Log.d("PathDebug", "当前配置的报表存储路径: ${baseDir.absolutePath}")
        Toast.makeText(requireContext(), "当前报表存储路径：${baseDir.absolutePath}", Toast.LENGTH_LONG).show()

        // 初始化加载报表列表
        slideshowViewModel.loadReportList()
        
        // 观察报表列表状态
        slideshowViewModel.reportListState.observe(viewLifecycleOwner) { state ->
            when (state) {
                is ReportListState.Loading -> {
                    binding.progressLoading.visibility = View.VISIBLE
                    binding.recyclerReports.visibility = View.GONE
                    binding.textMessage.visibility = View.GONE
                }
                is ReportListState.Success -> {
                    binding.progressLoading.visibility = View.GONE
                    if (state.reports.isEmpty()) {
                        binding.recyclerReports.visibility = View.GONE
                        binding.textMessage.visibility = View.VISIBLE
                        binding.textMessage.text = "暂无报表数据"
                    } else {
                        binding.recyclerReports.visibility = View.VISIBLE
                        binding.textMessage.visibility = View.GONE
                        // 设置RecyclerView适配器显示报表列表
                        setupReportAdapter(state.reports)
                    }
                }
                is ReportListState.Error -> {
                    binding.progressLoading.visibility = View.GONE
                    binding.recyclerReports.visibility = View.GONE
                    binding.textMessage.visibility = View.VISIBLE
                    binding.textMessage.text = "加载失败: ${state.message}"
                }
            }
        }
        return root
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        when (requestCode) {
            STORAGE_PERMISSION_REQUEST_CODE -> {
                if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    // 权限授予后重新执行打开操作
                    binding.recyclerReports.adapter?.notifyDataSetChanged()
                } else {
                    Toast.makeText(requireContext(), "需要存储权限查看报表", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
    
    /**
     * 设置报表适配器
     * @param reports 报表列表
     */
    private fun setupReportAdapter(reports: List<CompanyReports>) {
        // 设置布局管理器
        binding.recyclerReports.layoutManager = androidx.recyclerview.widget.LinearLayoutManager(requireContext())
        
        // 创建适配器
        val adapter = ReportAdapter(reports) { reportFile ->
            // 处理报表文件点击事件
            val slideshowViewModel = ViewModelProvider(this).get(SlideshowViewModel::class.java)
            slideshowViewModel.selectReport(reportFile)
            
            // 这里可以添加打开报表文件的逻辑，例如跳转到报表查看页面
            val filePath = slideshowViewModel.getReportFilePath(reportFile.filePath)
            if (filePath != null) {
                try {
                    // 使用MuPDF的DocumentActivity打开PDF文件
                    // 检查存储权限
                    if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                        ActivityCompat.requestPermissions(
                            requireActivity(),
                            arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE),
                            STORAGE_PERMISSION_REQUEST_CODE
                        )
                        return@ReportAdapter
                    }

                    val file = File(filePath)
                    if (!file.exists()) {
                        Log.e("SlideshowFragment", "文件不存在: $filePath")
                        return@ReportAdapter
                    }
                    val intent = Intent(requireContext(), com.artifex.mupdf.viewer.DocumentActivity::class.java)
                    // 删除重复的intent声明
                    intent.action = Intent.ACTION_VIEW
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    // 保留原有的intent配置
                    // 启用连续滚动模式并设置页面间距
                    intent.putExtra("viewmode", "scroll")
                    intent.putExtra("continuous", true)
                    intent.putExtra("page_margin", 16)  // 设置页面间距为16像素
                    // 设置文件类型和URI
                    val uri = FileProvider.getUriForFile(
                        requireContext(),
                        "com.example.stock_viewer.fileprovider",
                        file
                    )
                    Log.d("FileURI", "生成URI路径: ${file.absolutePath}")
                    Log.d("FileLocation", "绝对路径: ${file.absolutePath}")
                    Log.d("FileURI", "URI: $uri")
                    intent.setDataAndType(uri, "application/pdf")
                    startActivity(intent)
                } catch (e: Exception) {
                    // 如果出现异常，打印日志
                    android.util.Log.e("SlideshowFragment", "打开PDF文件失败: ${e.message}")
                    e.printStackTrace()
                }
            }
        }
        
        // 设置适配器
        binding.recyclerReports.adapter = adapter
    }
}