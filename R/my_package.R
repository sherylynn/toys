# 清华源 bioconductor
options(BioC_mirror = "https://mirrors.tuna.tsinghua.edu.cn/bioconductor")
my_install <- function(my_package) {
  # local_package <- my_package
  # print(my_package)
  # print(!require(package = my_package))
  # print(!require(package = local_package))
  # ?library
  # print(library(my_package, character.only = TRUE))
  # print(library(my_package, character.only = TRUE, quietly = TRUE))
  # print(require(my_package, character.only = TRUE, quietly = TRUE))

  if (!require(my_package, character.only = TRUE, quietly = TRUE)) {
    # 如果没有character就会把变量名直接认成包啦
    install.packages(my_package,repos="https://mirrors.tuna.tsinghua.edu.cn/CRAN/")
  }
}
install_all <- function() {
  # 操作 xlsx
  my_install("openxlsx")
  my_install("Hmisc")
  # styler 格式化代码
  my_install("styler")
  # 图形可视化
  my_install("ggplot2")

  # 终端可视化
  my_install("txtplot")

  # 网页 UI
  my_install("shiny")
  # rstudio 包
  my_install("rstudioapi")
  # httpgd 包
  # 负责把plot输出到http
  my_install("httpgd")
  # code 语言包
  my_install("languageserver")
  # dplyr
  my_install("dplyr")
  my_install("readxl")
  my_install("writexl")
}

install_all()
# ?require

.libPaths()
