# setwd("~/toys/R")

library(dplyr)
A <- read.csv("file1.csv")
B <- read.csv("file2.csv")
result <- anti_join(A, B, "身份证号码")
# help(write.csv)
write.csv(result, file = "result.csv", fileEncoding = "UTF-8")
