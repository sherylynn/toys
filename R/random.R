# 清华源 bioconductor
options(BioC_mirror = "https://mirrors.tuna.tsinghua.edu.cn/bioconductor")
# styler 格式化代码
if (!require("styler", quietly = TRUE)) {
  install.packages("styler")
}
# 获取所有对象空间
# ls()
# 获取平均值
# mean(a)
roll <- function() {
  a <- 1:6
  dice <- sample(x = a, size = 2, replace = TRUE)
  sum(dice)
}
# 获取函数参数
# args(sample)
roll()
