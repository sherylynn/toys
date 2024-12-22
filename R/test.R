# 清华源 bioconductor
options(BioC_mirror = "https://mirrors.tuna.tsinghua.edu.cn/bioconductor")
# 安装shiny包
if (!requireNamespace("shiny", quietly = TRUE)) {
  install.packages("shiny")
}
if (!requireNamespace("ggplot2", quietly = TRUE)) {
  install.packages("ggplot2")
}
#!requireNamespace("shiny", quietly = TRUE)
#!require("shiny", quietly = TRUE)
#!require("shiny")
#.libPaths()
#file.exists(file.path(.libPaths(), "ggplot2"))
#library('ggplot2')
#library('shiny')
require('styler')
?sample
test=c(1,2,3)
#names(test)=c('q')
# 相关性包
#corrplot
#printer(width=79) #这个是原始S语言中的功能，建议用txtplot作为txt界面下的替代选择

