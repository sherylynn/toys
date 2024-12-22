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
