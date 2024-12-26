# 获取所有对象空间
# ls()
# 获取平均值
# mean(a)
setwd("~/toys/R")
library("httpgd")
# dev.off()
hgd(
  # host = getOption("httpgd.host", "0.0.0.0"),
  port = getOption("httpgd.port", 10001),
  token = getOption("httpgd.token", FALSE),
)
roll <- function(bones = 1:6) {
  # a <- 1:6
  # dice <- sample(x = a, size = 2, replace = TRUE)
  dice <- sample(
    x = bones, size = 2, replace = TRUE,
    prob = c(1 / 8, 1 / 8, 1 / 8, 1 / 8, 1 / 8, 3 / 8)
  )
  sum(dice)
}
# 获取函数参数
# args(sample)
# roll()
die <- 1:6
names(die) <- c("one", "two", "three", "four", "fivr", "six")
roll(1:6)
names(die)
attributes(die)
dim(die) <- c(3, 2)
die
# ?dim
# roll(bones = 1:20)
library("ggplot2")
x <- c(1, 2, 3, 4, 5)
y <- x * 2
p <- qplot(x, y)
ggsave("/sdcard/Download/qplot.pdf", plot = p, width = 10, height = 10)

x2 <- c(1, 2, 2, 2, 3, 4, 4, 4, 5)
p2 <- qplot(x2, binwidth = 1)
ggsave("/sdcard/Download/qplot2.pdf", plot = p2, width = 10, height = 10)

rolls <- replicate(10000, roll())
p3 <- qplot(rolls, binwidth = 1)
ggsave("/sdcard/Download/qplot3.pdf", plot = p3, width = 10, height = 10)

# 不带变量存储就直接绘图
qplot(rolls, binwidth = 1)
# library("txtplot")
# ?txtplot
# !require("txtplot")
# system('pwd')
