# setwd("~/toys/R")
getwd()
# library(dplyr)
# Big <- read.csv("file1.csv",stringsAsFactors = FALSE)
# Small <- read.csv("file2.csv",stringsAsFactors = FALSE)
# result <- anti_join(Big, Small, "身份证号码")
# help(write.csv)
# write.csv(result, file = "result.csv", fileEncoding = "UTF-8")


# 安装和加载必要包

library(readxl)
library(dplyr)
library(writexl)

# 读取Excel文件，第一个表，并去掉首行，因为首行是标题
A <- read_excel("数据导入模版20241117 .xlsx", sheet = 1, skip = 1)
B <- read_excel("数据上传阳性20241118 .xlsx", sheet = 1, skip = 1)

# 筛选A中有但不在B中的元素
result <- anti_join(A, B, by = "身份证号码")

# 查看结果
print(result)

# 保存结果到新的Excel文件
write_xlsx(result, "path_to_result.xlsx")
# 加载必要的库
library(readxl)
library(dplyr)
library(writexl)

# 1. 读取 Excel 文件
file_path <- "data.xlsx"
data <- read_excel(file_path, sheet = "Sheet1")

# 2. 根据某列去重（假设列名为 "ColumnName"）
distinct_data <- data %>%
  distinct(ColumnName, .keep_all = TRUE)

# 3. 保存去重后的数据到新文件
write_xlsx(distinct_data, "distinct_data.xlsx")

# 提示完成
cat("去重后的数据已保存到 distinct_data.xlsx\n")
