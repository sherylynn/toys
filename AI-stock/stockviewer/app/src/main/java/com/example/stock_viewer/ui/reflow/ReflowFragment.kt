package com.example.stock_viewer.ui.reflow

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.example.stock_viewer.R
import com.example.stock_viewer.databinding.FragmentReflowBinding
import java.util.Calendar

class ReflowFragment : Fragment() {

    private var _binding: FragmentReflowBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: ReflowViewModel

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        viewModel = ViewModelProvider(this).get(ReflowViewModel::class.java)
        _binding = FragmentReflowBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupYearSpinner()
        setupDownloadButton()
        observeViewModel()
    }

    private fun setupYearSpinner() {
        // 设置年份下拉列表，从当前年份开始，往前推5年
        val currentYear = Calendar.getInstance().get(Calendar.YEAR)
        val years = (0..5).map { (currentYear - it).toString() }.toTypedArray()
        
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, years)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.yearSpinner.adapter = adapter
    }

    private fun setupDownloadButton() {
        binding.downloadButton.setOnClickListener {
            val companyName = binding.companyNameEditText.text.toString().trim()
            if (companyName.isEmpty()) {
                Toast.makeText(requireContext(), R.string.no_company_name, Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            val year = binding.yearSpinner.selectedItem.toString().toInt()
            viewModel.downloadReports(companyName, year)
        }
    }

    private fun observeViewModel() {
        // 观察下载状态
        viewModel.downloadState.observe(viewLifecycleOwner) { state ->
            when (state) {
                is DownloadState.Loading -> {
                    binding.progressBar.visibility = View.VISIBLE
                    binding.downloadButton.isEnabled = false
                }
                is DownloadState.Success -> {
                    binding.progressBar.visibility = View.GONE
                    binding.downloadButton.isEnabled = true
                    Toast.makeText(requireContext(), R.string.download_success, Toast.LENGTH_SHORT).show()
                }
                is DownloadState.Error -> {
                    binding.progressBar.visibility = View.GONE
                    binding.downloadButton.isEnabled = true
                    Toast.makeText(requireContext(), "${getString(R.string.download_failed)}: ${state.message}", Toast.LENGTH_LONG).show()
                }
                else -> {
                    binding.progressBar.visibility = View.GONE
                    binding.downloadButton.isEnabled = true
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}