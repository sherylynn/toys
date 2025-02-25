import requests
import json
import os
from datetime import datetime

class StockReportDownloader:
    def __init__(self):
        self.base_url = "http://www.cninfo.com.cn/new/hisAnnouncement/query"
        self.download_url = "http://static.cninfo.com.cn/"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
        }

    def search_company(self, company_name):
        """搜索公司获取股票代码"""
        search_url = "http://www.cninfo.com.cn/new/information/topSearch/query"
        params = {
            'keyWord': company_name,
            'maxNum': 10
        }
        
        try:
            response = requests.post(search_url, data=params, headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    # 返回第一个匹配的公司信息
                    return data[0]['code'], data[0]['orgId']
            return None, None
        except Exception as e:
            print(f"搜索公司信息时出错：{str(e)}")
            return None, None

    def download_reports(self, company_name, year=None):
        """下载指定公司的季度报表，如果指定年份没有报告会尝试下载最近可用年份的报告"""
        current_year = datetime.now().year
        
        if year is None:
            year = current_year
        elif year > current_year:
            print(f"指定的年份{year}尚未到来，将尝试下载{current_year}年的报告...")
            year = current_year

        # 获取公司代码
        stock_code, org_id = self.search_company(company_name)
        if not stock_code:
            raise Exception(f"未找到公司：{company_name}")

        # 从指定年份开始，逐年尝试下载直到找到可用的报告
        original_year = year
        while year >= current_year - 2:  # 最多往前查找2年
            try:
                result = self._download_reports_for_year(company_name, stock_code, org_id, year)
                if result:
                    if year != original_year:
                        print(f"已找到{year}年的报告")
                    return result
            except Exception as e:
                if "未找到" in str(e) and "的任何报表" in str(e):
                    if year > 1:
                        print(f"未找到{year}年的报告，尝试下载{year-1}年的报告...")
                        year -= 1
                        continue
                raise e
        
        raise Exception(f"未能找到{original_year}年及之前的报告")

    def _download_reports_for_year(self, company_name, stock_code, org_id, year):
        """下载指定年份的报表"""
        # 创建基础下载目录
        base_download_dir = os.path.join(os.getcwd(), 'downloads', company_name)

        # 设置查询参数
        params = {
            'pageNum': 1,
            'pageSize': 100,  # 增加页面大小以获取更多报告
            'column': 'szse',
            'tabName': 'fulltext',
            'plate': '',
            'stock': f'{stock_code},{org_id}',
            'searchkey': '',
            'secid': '',
            'category': 'category_ndbg_szsh;category_bndbg_szsh;category_yjdbg_szsh;category_sjdbg_szsh',
            'trade': '',
            'seDate': f'{year}-01-01~{year}-12-31',
            'sortName': 'code',
            'sortType': 'asc'
        }

        downloaded_files = []
        try:
            response = requests.post(self.base_url, data=params, headers=self.headers)
            if response.status_code != 200:
                raise Exception(f"获取报表列表失败：HTTP {response.status_code}")

            data = response.json()
            announcements = data.get('announcements', [])
            if not announcements:
                raise Exception(f"未找到{year}年的任何报表")

            for announcement in announcements:
                title = announcement['announcementTitle']
                # 排除摘要和英文版报告
                if ('摘要' in title) or ('英文' in title) or ('补充' in title) or ('更正' in title):
                    continue
                
                # 从标题中提取实际年份
                import re
                year_match = re.search(r'20\d{2}', title)
                if not year_match:
                    continue
                actual_year = year_match.group()
                
                # 检查是否为所需的报告类型，使用更精确的匹配
                report_types = {
                    '第一季度报告': ['一季度报告', '第一季度报告', '年一季度报告'],
                    '半年度报告': ['半年度报告', '中期报告'],
                    '第三季度报告': ['三季度报告', '第三季度报告'],
                    '年度报告': ['年度报告', '年报']
                }
                
                is_target_report = False
                report_category = None
                for category, patterns in report_types.items():
                    if any(pattern in title for pattern in patterns):
                        is_target_report = True
                        report_category = category
                        break
                
                if is_target_report:
                    # 使用实际年份创建目录
                    download_dir = os.path.join(base_download_dir, actual_year)
                    os.makedirs(download_dir, exist_ok=True)
                    
                    # 生成标准化的文件名，使用公司名称而不是股票代码
                    standard_title = f"{actual_year}年{report_category}_{company_name}"
                    file_name = f"{standard_title}.pdf"
                    file_path = os.path.join(download_dir, file_name)
                    
                    # 检查文件是否已存在
                    if os.path.exists(file_path):
                        print(f"文件已存在，跳过下载：{file_name}")
                        downloaded_files.append({
                            'title': announcement['announcementTitle'],
                            'file_name': file_name,
                            'file_path': os.path.join('downloads', company_name, actual_year, file_name)
                        })
                        continue

                    pdf_url = self.download_url + announcement['adjunctUrl']
                    print(f"正在下载：{file_name}")
                    pdf_response = requests.get(pdf_url, headers=self.headers)
                    if pdf_response.status_code == 200:
                        with open(file_path, 'wb') as f:
                            f.write(pdf_response.content)
                        print(f"下载完成：{file_name}")
                        downloaded_files.append({
                            'title': announcement['announcementTitle'],
                            'file_name': file_name,
                            'file_path': os.path.join('downloads', company_name, actual_year, file_name)
                        })
                    else:
                        print(f"下载失败：{file_name}，HTTP {pdf_response.status_code}")

            if not downloaded_files:
                raise Exception(f"未找到{year}年的季度报表或年度报表")

            return downloaded_files

        except Exception as e:
            print(f"下载报表时出错：{str(e)}")
            raise e

def main():
    downloader = StockReportDownloader()
    company_name = input("请输入公司名称：")
    year = input("请输入年份（直接回车使用当前年份）：")
    
    if year.strip():
        try:
            year = int(year)
        except ValueError:
            print("年份格式不正确，将使用当前年份")
            year = None
    else:
        year = None

    downloader.download_reports(company_name, year)

if __name__ == "__main__":
    main()