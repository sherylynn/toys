package com.example.stock_viewer.ui.slideshow

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.stock_viewer.R
import com.example.stock_viewer.repository.CompanyReports
import com.example.stock_viewer.repository.ReportFile
import com.example.stock_viewer.repository.YearReports

/**
 * 报表适配器，用于显示公司报表列表
 */
class ReportAdapter(
    private val reports: List<CompanyReports>,
    private val onReportFileClick: (ReportFile) -> Unit
) : RecyclerView.Adapter<ReportAdapter.CompanyViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CompanyViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_report, parent, false)
        return CompanyViewHolder(view)
    }

    override fun onBindViewHolder(holder: CompanyViewHolder, position: Int) {
        val company = reports[position]
        holder.bind(company)
    }

    override fun getItemCount(): Int = reports.size

    /**
     * 公司报表视图持有者
     */
    inner class CompanyViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val textCompanyName: TextView = itemView.findViewById(R.id.text_company_name)
        private val recyclerYears: RecyclerView = itemView.findViewById(R.id.recycler_years)

        fun bind(company: CompanyReports) {
            textCompanyName.text = company.name
            
            // 设置年份列表
            recyclerYears.layoutManager = androidx.recyclerview.widget.LinearLayoutManager(itemView.context)
            val yearAdapter = YearAdapter(company.years)
            recyclerYears.adapter = yearAdapter
        }
    }

    /**
     * 年份适配器，用于显示年份报表列表
     */
    inner class YearAdapter(private val years: List<YearReports>) : 
            RecyclerView.Adapter<YearAdapter.YearViewHolder>() {

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): YearViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_year, parent, false)
            return YearViewHolder(view)
        }

        override fun onBindViewHolder(holder: YearViewHolder, position: Int) {
            val year = years[position]
            holder.bind(year)
        }

        override fun getItemCount(): Int = years.size

        /**
         * 年份报表视图持有者
         */
        inner class YearViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            private val textYear: TextView = itemView.findViewById(R.id.text_year)
            private val containerReports: LinearLayout = itemView.findViewById(R.id.layout_reports)

            fun bind(year: YearReports) {
                textYear.text = "${year.year}年"
                
                // 清除之前的报表文件视图
                containerReports.removeAllViews()
                
                // 添加报表文件视图
                for (report in year.reports) {
                    val reportView = LayoutInflater.from(itemView.context)
                        .inflate(R.layout.item_report_file, containerReports, false)
                    
                    val textFileName = reportView.findViewById<TextView>(R.id.text_file_name)
                    textFileName.text = report.title
                    
                    // 设置点击事件
                    reportView.setOnClickListener {
                        onReportFileClick(report)
                    }
                    
                    containerReports.addView(reportView)
                }
            }
        }
    }
}