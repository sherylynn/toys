# 清华源 bioconductor
options(BioC_mirror = "https://mirrors.tuna.tsinghua.edu.cn/bioconductor")
my_install <- function(my_package) {
  if (!require(my_package, quietly = TRUE)) {
    install.packages(my_package)
  }
}


# styler 格式化代码
my_install("styler")
# 可视化
my_install("ggplot2")
# 获取所有对象空间
# ls()
# 获取平均值
# mean(a)
roll <- function(bones = 1:6) {
  # a <- 1:6
  # dice <- sample(x = a, size = 2, replace = TRUE)
  dice <- sample(x = bones, size = 2, replace = TRUE)
  sum(dice)
}
# 获取函数参数
# args(sample)
# roll()
roll(1:6)
# roll(bones = 1:20)
library("ggplot2")
x <- c(1, 2, 3, 4, 5)
y <- x * 2
qplot(x, y)
