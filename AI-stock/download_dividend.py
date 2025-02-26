import requests
from bs4 import BeautifulSoup
import os
from datetime import datetime
import json

class DividendReportDownloader:
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
                    return data[0]['code'], data[0]['orgId']
            return None, None
        except Exception as e:
            print(f"搜索公司信息时出错：{str(e)}")
            return None, None

    def download_dividend_reports(self, company_name, year=None):
        """下载指定公司的分红公告"""
        current_year = datetime.now().year
        
        if year is None:
            year = current_year
        elif year > current_year:
            print(f"指定的年份{year}尚未到来，将尝试下载{current_year}年的公告...")
            year = current_year

        # 获取公司代码
        stock_code, org_id = self.search_company(company_name)
        if not stock_code:
            raise Exception(f"未找到公司：{company_name}")

        # 创建下载目录
        base_download_dir = os.path.join('dividend_reports', company_name)
        os.makedirs(base_download_dir, exist_ok=True)

        # 设置查询参数
        params = {
            'pageNum': 1,
            'pageSize': 30,
            'column': 'szse',
            'tabName': 'fulltext',
            'plate': '',
            'stock': f'{stock_code},{org_id}',
            'searchkey': '分红 利润分配 权益分派',  # 扩展搜索关键词
            'secid': '',
            'category': 'category_gszl_szsh',  # 添加公司治理类别
            'trade': '',
            'seDate': f'{year}-01-01~{year}-12-31',
            'sortName': '',
            'sortType': '',
            'isHLtitle': True
        }

        try:
            response = requests.post(self.base_url, data=params, headers=self.headers)
            if response.status_code != 200:
                raise Exception(f"获取公告列表失败：HTTP {response.status_code}")

            data = response.json()
            announcements = data.get('announcements', [])
            if not announcements:
                raise Exception(f"未找到{year}年的分红公告")

            downloaded_files = []
            for announcement in announcements:
                title = announcement['announcementTitle']
                # 检查标题是否包含分红相关关键词
                if not any(keyword in title for keyword in [
                    '利润分配', '分红', '权益分派', '利润分派', 
                    '现金分红', '年度利润分配', '中期利润分配',
                    '分配预案', '分配方案'
                ]):
                    continue

                # 从标题中提取年份
                import re
                year_match = re.search(r'20\d{2}', title)
                if not year_match:
                    continue
                actual_year = year_match.group()

                # 生成文件名
                file_name = f"{actual_year}年分红公告_{company_name}.pdf"
                file_path = os.path.join(base_download_dir, file_name)

                # 检查文件是否已存在
                if os.path.exists(file_path):
                    print(f"文件已存在，跳过下载：{file_name}")
                    downloaded_files.append({
                        'title': title,
                        'file_name': file_name,
                        'file_path': os.path.join('dividend_reports', company_name, file_name)
                    })
                    continue

                # 下载PDF文件
                pdf_url = self.download_url + announcement['adjunctUrl']
                print(f"正在下载：{file_name}")
                pdf_response = requests.get(pdf_url, headers=self.headers)
                if pdf_response.status_code == 200:
                    with open(file_path, 'wb') as f:
                        f.write(pdf_response.content)
                    print(f"下载完成：{file_name}")
                    downloaded_files.append({
                        'title': title,
                        'file_name': file_name,
                        'file_path': os.path.join('dividend_reports', company_name, file_name)
                    })
                else:
                    print(f"下载失败：{file_name}，HTTP {pdf_response.status_code}")

            if not downloaded_files:
                raise Exception(f"未找到{year}年的分红公告")

            return downloaded_files

        except Exception as e:
            print(f"下载分红公告时出错：{str(e)}")
            raise e

def main():
    downloader = DividendReportDownloader()
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

    try:
        downloaded_files = downloader.download_dividend_reports(company_name, year)
        print("\n下载完成的文件：")
        for file_info in downloaded_files:
            print(f"- {file_info['file_name']}")
    except Exception as e:
        print(f"\n错误：{str(e)}")

if __name__ == "__main__":
    main()