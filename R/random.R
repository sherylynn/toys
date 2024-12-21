# 清华源 bioconductor
options(BioC_mirror = "https://mirrors.tuna.tsinghua.edu.cn/bioconductor")
# styler 格式化代码
if (!require("styler", quietly = TRUE)) {
  install.packages("styler")
}
a=1:6
ls()
mean(a)
sample(x=1:4,size=2)
sample(x=a,size=1)
args(sample)
sample(x=a,size=2,replace=TRUE)
