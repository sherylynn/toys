# ls()
# 获取平均值
# mean(a)
setwd("~/toys/R")
# mac 的图形 emacs 下可以直接跳出窗口绘制图形

# 示例：检测端口是否被占用
port <- 10001
# dev.off()
library("httpgd")
hgd(
  host = getOption("httpgd.host", "0.0.0.0"),
  port = getOption("httpgd.port", port),
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
rolls <- replicate(10000, roll())
sdcard_path <- "/sdcard/Download/"
if (file.exists(sdcard_path)) {
  x <- c(1, 2, 3, 4, 5)
  y <- x * 2
  data1 <- data.frame(x = x, y = y)
  # p <- qplot(x, y)
  p <- ggplot(data1)
  ggsave("/sdcard/Download/qplot.pdf", plot = p, width = 10, height = 10)

  x2 <- c(1, 2, 2, 2, 3, 4, 4, 4, 5)
  data2 <- data.frame(x = x2)
  # p2 <- qplot(x2, binwidth = 1)
  p2 <- ggplot(data2)
  ggsave("/sdcard/Download/qplot2.pdf", plot = p2, width = 10, height = 10)

  # p3 <- qplot(rolls, binwidth = 1)
  data3 <- data.frame(x = rolls)
  p3 <- ggplot(data3)
  ggsave("/sdcard/Download/qplot3.pdf", plot = p3, width = 10, height = 10)
}
# 不带变量存储就直接绘图
data4 <- data.frame(x = rolls)
ggplot(data4, binwidth = 1)
# library("txtplot")
# ?txtplot
# !require("txtplot")
# system('pwd')

m <- matrix(die, nrow = 2)
n <- matrix(die, nrow = 2, byrow = TRUE)

mil <- 10000000
class(mil) <- c("POSIXct", "POSIXt")
mil
sum(c(TRUE, TRUE, FALSE, TRUE))


as.character(1)
a <- data.frame(name = c("张三", "李四", "王五"), gender = c("male", "female", "male"))
a
b <- list(姓名 = "张三", 性别 = "男", value = 1)
b
c <- c(姓名 = "张三", 性别 = "男", value = "one")

deck <-
  read.csv("./deck.csv")
head(deck)

write.csv(deck, file = "./deck_save.csv", row.names = FALSE)

deck[1, 1:3]
# 如果是提取一列
deck[1:3, 1, drop = FALSE]

# R 的索引真奇怪，负数是排除而不是倒序，空格则是取所有的集
# TRUE FLASE 索引可以选择是否索引进去
deck[1, c("face", "suit", "value")]

deck[, "value"]

shuffle <- function(cards) {
  random <- sample(1:52, size = 52)
  cards[random, ]
}


shuffle(deck)
vec <- c(0, 0, 0, 0, 0, 0)
vec[1] <- 1000
vec[c(1, 3, 5)] <- c(1, 1, 1)
vec[4:6] <- vec[4:6] + 1
vec[7] <- 0
age <- c(1, 3, 5, 7, 11)
weight <- c(4.1, 4.5, 5.1, 5.8, 6.9)
mean(weight)
sd(weight)
cor(age, weight)
# 最简单的画图
plot(age, weight)

lmfit <- lm(mpg ~ wt, data = mtcars)

# 比较
1 > 2
# 逐个比较
1 > c(0, 1, 2)
# 元素挨个比较, 出三个结果
c(1, 2, 3) == c(3, 2, 1)

# 元素单个比较
1 %in% c(3, 4, 5)
# cell 中的元素单个比较
c(1, 2) %in% c(3, 4, 5)
c(1, 2, 3, 4) %in% c(3, 4, 5)

deck$face == "ace"

sum(deck$face == "ace")
