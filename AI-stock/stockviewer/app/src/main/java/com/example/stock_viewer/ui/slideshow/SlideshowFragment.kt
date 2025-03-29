package com.example.stock_viewer.ui.slideshow

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

class SlideshowFragment : Fragment() {

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
                // TODO: 打开报表文件
            }
        }
        
        // 设置适配器
        binding.recyclerReports.adapter = adapter
    }
}