package com.example.stock_viewer.api

import com.google.gson.annotations.SerializedName
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query
import retrofit2.http.Streaming
import retrofit2.http.Url

/**
 * 巨潮信息网API服务接口
 */
interface CninfoService {
    
    /**
     * 搜索公司获取股票代码
     */
    @POST("http://www.cninfo.com.cn/new/information/topSearch/query")
    @FormUrlEncoded
    suspend fun searchCompany(
        @Field("keyWord") companyName: String,
        @Field("maxNum") maxNum: Int = 10
    ): Response<List<CompanyInfo>>
    
    /**
     * 查询公司公告列表
     */
    @POST("http://www.cninfo.com.cn/new/hisAnnouncement/query")
    @FormUrlEncoded
    suspend fun queryAnnouncements(
        @Field("pageNum") pageNum: Int = 1,
        @Field("pageSize") pageSize: Int = 30,
        @Field("column") column: String = "szse",
        @Field("tabName") tabName: String = "fulltext",
        @Field("plate") plate: String = "",
        @Field("stock") stock: String,
        @Field("searchkey") searchKey: String = "",
        @Field("secid") secid: String = "",
        @Field("category") category: String = "category_ndbg_szsh;category_bndbg_szsh;category_yjdbg_szsh;category_sjdbg_szsh",
        @Field("trade") trade: String = "",
        @Field("seDate") seDate: String,
        @Field("sortName") sortName: String = "code",
        @Field("sortType") sortType: String = "asc"
    ): Response<AnnouncementResponse>
    
    /**
     * 下载PDF文件
     */
    @GET
    @Streaming
    suspend fun downloadFile(@Url fileUrl: String): Response<ResponseBody>
}

/**
 * 公司信息数据类
 */
data class CompanyInfo(
    @SerializedName("code") val code: String,
    @SerializedName("orgId") val orgId: String,
    @SerializedName("zwjc") val shortName: String,
    @SerializedName("category") val category: String
)

/**
 * 公告响应数据类
 */
data class AnnouncementResponse(
    @SerializedName("announcements") val announcements: List<Announcement>?,
    @SerializedName("hasMore") val hasMore: Boolean,
    @SerializedName("totalpages") val totalPages: Int
)

/**
 * 公告数据类
 */
data class Announcement(
    @SerializedName("announcementId") val announcementId: String,
    @SerializedName("announcementTitle") val announcementTitle: String,
    @SerializedName("announcementTime") val announcementTime: Long,
    @SerializedName("adjunctUrl") val adjunctUrl: String,
    @SerializedName("adjunctSize") val adjunctSize: Long
)