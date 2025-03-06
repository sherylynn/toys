# 加载必要的包
library(ggplot2)
library(reshape2)

# 读取数据
data <- read.csv("mortality_data.csv", fileEncoding = "UTF-8")

# 将数据从宽格式转换为长格式，便于ggplot2绘图
data_long <- melt(data, id.vars = "年度", 
                 variable.name = "指标", 
                 value.name = "值")

# 创建图表
p <- ggplot(data_long, aes(x = 年度, y = 值, color = 指标, group = 指标)) +
  geom_line(size = 1.2, linetype = "solid") +
  geom_point(size = 3, shape = 19) +
  scale_color_manual(values = c("男性死亡率" = "#1f77b4", 
                             "男性标化率" = "#aec7e8", 
                             "女性死亡率" = "#d62728", 
                             "女性标化率" = "#ff9896", 
                             "合计死亡率" = "#9467bd", 
                             "合计标化率" = "#ff7f0e")) +
  scale_y_continuous(limits = c(0, 85), breaks = seq(0, 85, by = 10)) +
  labs(title = "2011-2021年死亡率和标化率趋势",
       x = "年份",
       y = "死亡率/标化率",
       color = "指标") +
  theme_minimal() +
  theme(legend.position = "right",
        plot.title = element_text(hjust = 0.5, size = 16, face = "bold"),
        axis.title = element_text(size = 14),
        axis.text = element_text(size = 12),
        legend.title = element_text(size = 14),
        legend.text = element_text(size = 12),
        panel.grid.major = element_line(color = "gray90"),
        panel.grid.minor = element_line(color = "gray95"))

# 显示图表
print(p)

# 保存图表
ggsave("mortality_plot.png", plot = p, width = 12, height = 8, dpi = 300)