# 清华源 bioconductor
options(BioC_mirror = "https://mirrors.tuna.tsinghua.edu.cn/bioconductor")
my_install <- function(my_package) {
  if (!require(my_package, quietly = TRUE)) {
    install.packages(my_package)
  }
}


# styler 格式化代码
#my_install("styler")
# 可视化
#my_install("ggplot2")
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
p <- qplot(x, y)
ggsave("/sdcard/Download/qplot.pdf", plot = p, width = 10, height = 10)

x2 <- c(1, 2, 2, 2, 3, 4, 4, 4, 5)
p2 <- qplot(x2, binwidth = 1)
ggsave("/sdcard/Download/qplot2.pdf", plot = p2, width = 10, height = 10)

rolls=replicate(10000,roll(1:20))
p3=qplot(rolls,binwidth=1)
ggsave("/sdcard/Download/qplot3.pdf", plot = p3, width = 10, height = 10)
