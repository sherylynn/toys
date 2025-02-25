import os
import json

def get_downloaded_reports():
    """获取已下载的财报列表"""
    downloads_dir = os.path.join(os.getcwd(), 'downloads')
    if not os.path.exists(downloads_dir):
        return []

    reports = []
    for company in os.listdir(downloads_dir):
        company_dir = os.path.join(downloads_dir, company)
        if not os.path.isdir(company_dir):
            continue

        for year in os.listdir(company_dir):
            year_dir = os.path.join(company_dir, year)
            if not os.path.isdir(year_dir):
                continue

            for file_name in os.listdir(year_dir):
                if not file_name.endswith('.pdf'):
                    continue

                file_path = os.path.join('downloads', company, year, file_name)
                reports.append({
                    'title': file_name.replace('.pdf', ''),
                    'file_name': file_name,
                    'file_path': file_path
                })

    return reports