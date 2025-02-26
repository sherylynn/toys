from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import sys
import time
import os
import urllib.parse

def download_page(company_name):
    # 构建搜索URL
    search_term = f"{company_name}分红"
    base_url = "http://www.cninfo.com.cn/new/fulltextSearch?notautosubmit=&keyWord="
    # 使用urllib进行URL编码，确保中文字符正确处理
    encoded_term = urllib.parse.quote(search_term)
    url = base_url + encoded_term

    # 配置Chrome选项
    options = webdriver.ChromeOptions()
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

    try:
        # 初始化WebDriver
        driver = webdriver.Chrome(options=options)
        print(f"正在访问页面: {url}")
        driver.get(url)

        # 等待页面加载完成（等待搜索结果出现）
        wait = WebDriverWait(driver, 20)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "el-table__body-wrapper")))

        # 确保页面完全加载
        time.sleep(3)

        # 确保页面完全加载
        wait.until(EC.presence_of_element_located((By.XPATH, "//a[contains(text(), '利润分配') and contains(text(), '2023')]")))

        # 查找包含最近一年的“利润分配”字样的元素并点击
        profit_distribution_link = driver.find_element(By.XPATH, "//a[contains(text(), '利润分配') and contains(text(), '2023')]")
        profit_distribution_link.click()

        # 等待PDF链接出现
        wait.until(EC.presence_of_element_located((By.PARTIAL_LINK_TEXT, ".pdf")))

        # 获取PDF链接
        pdf_link = driver.find_element(By.PARTIAL_LINK_TEXT, ".pdf").get_attribute("href")

        # 下载PDF文件
        pdf_response = driver.request('GET', pdf_link)
        pdf_content = pdf_response.content

        # 创建输出目录
        output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dividend_reports", company_name)
        os.makedirs(output_dir, exist_ok=True)

        # 保存PDF文件
        output_file = os.path.join(output_dir, "dividend_report.pdf")
        with open(output_file, "wb") as f:
            f.write(pdf_content)

        print(f"PDF已保存到: {output_file}")

    except TimeoutException:
        print("错误：页面加载超时")
        sys.exit(1)
    except Exception as e:
        print(f"错误：{str(e)}")
        sys.exit(1)
    finally:
        driver.quit()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("使用方法: python download_page.py <公司名称>")
        sys.exit(1)

    company_name = sys.argv[1]
    download_page(company_name)