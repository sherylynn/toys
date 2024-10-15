# 检查并安装readxl包
#if (!requiIreNamespace("readxl", quietly = TRUE)) {
#  install.packages("readxl")
#}

# 加载readxl包
#library(readxl)

# 检查并安装shiny包
if (!requireNamespace("shiny", quietly = TRUE)) {
  install.packages("shiny")
}

# 加载shiny包
library(shiny)

# 创建Shiny应用
ui <- fluidPage(
  titlePanel("Excel数据展示"),
  sidebarLayout(
    sidebarPanel(
      fileInput("file", "选择Excel文件", accept = ".xlsx")
    ),
    mainPanel(
      tableOutput("contents")
    )
  )
)

server <- function(input, output) {
  output$contents <- renderTable({
    req(input$file)
    inFile <- input$file
    data <- read_excel(inFile$datapath)
    head(data)
  })
}

# 运行应用
shinyApp(ui = ui, server = server)