# 清华源 bioconductor
options(BioC_mirror = "https://mirrors.tuna.tsinghua.edu.cn/bioconductor")
# 安装shiny包
if (!requireNamespace("shiny", quietly = TRUE)) {
  install.packages("shiny")
}
# 安装BiocManager包
# R4.3.x对应的bioconductor版本是3.18，R4.4.x对应的版本就是3.19了，注意不要搞错，
# 否则会报错哦

if (!require("BiocManager", quietly = TRUE)) {
  install.packages("BiocManager")
}

# 没改镜像的记得先改镜像
# if (!require("devtools", quietly = TRUE))
# install.packages("devtools")
# library(devtools)
# install_github("ayueme/easyTCGA")

# styler 格式化代码
if (!require("styler", quietly = TRUE)) {
  install.packages("styler")
}


# 加载shiny包
library(shiny)

# 定义UI
ui <- fluidPage(
  titlePanel("中式木鱼"),
  sidebarLayout(
    sidebarPanel(
      actionButton("add", "敲击木鱼")
    ),
    mainPanel(
      h3(textOutput("count")),
      verbatimTextOutput("muyu")
    )
  )
)

# 定义服务器逻辑
server <- function(input, output, session) {
  # 创建一个反应值来存储计数
  count <- reactiveVal(0)

  # 更新计数
  observeEvent(input$add, {
    count(count() + 1)
  })
  # 使用空格作为分隔符
  # 输出计数
  output$count <- renderText({
    paste("今日功德：", count())
  })

  # 输出木鱼形状
  output$muyu <- renderText({
    "           _ooOoo_
          o8888888o
          88x * x88
          (| -_- |)
          O\\  =  /O
       ____/`---'\\____
       '  \\|     |//  '
         |  |   |  |
        / \\\\| |// \\
    / _||||| -:- |||||- \\
   |   | \\\\  -  /// |   |
   | \\_|  ''\\---/''  |_/ |
   \\  .-\\__  '-'  ___/-. /
   ___'. .'  /--.--\\  `. .'___
    . '<  `.___\\_<|>_/___.' >'
| | :  `- \\`.;`\\ _ /`;.`/ - ` : | |
\\  \\ `_.   \\_ __\\ /__ _/   .-` /  /
`-._`.___\\_____/___.-`____.-'_.-'
    "
  })
}

# 运行Shiny应用
shinyApp(ui = ui, server = server, options = list(host = "0.0.0.0", port = 1234))
