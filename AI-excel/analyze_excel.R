library(readxl)
library(writexl)

# 读取Excel文件
data <- read_excel("金山检验项目.xlsx")

# 统计B列项目代码出现次数
code_counts <- table(data$B)

# 初始化标记列
data$D <- 0
data$E <- 0
data$F <- 0

# 处理每个项目代码
for (i in 1:nrow(data)) {
  code <- data$B[i]
  count <- code_counts[code]
  
  # 条件1：B列项目代码只出现一次
  if (count == 1) {
    data$D[i] <- 1
  } 
  # 条件2：B列项目代码不只出现一次
  else if (count > 1) {
    data$E[i] <- 1
    
    # 获取相同代码的所有项目名称
    same_code_rows <- data[data$B == code, ]
    names <- same_code_rows$C
    
    # 条件3：项目名称完全一致
    if (length(unique(names)) == 1) {
      data$F[i] <- 1
    }
    # 条件4：项目名称不一致
    else {
      # 这里不需要标记，因为E列已经标记了
    }
  }
}

# 输出结果到新Excel文件
write_xlsx(data, "分析结果.xlsx")