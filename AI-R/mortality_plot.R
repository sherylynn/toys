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
  geom_line(size = 1, linetype = "solid") +
  geom_point(aes(shape = 指标), size = 3) +
  scale_color_manual(values = c("男性死亡率" = "#4E79A7", 
                             "男性标化率" = "#76B7B2", 
                             "女性死亡率" = "#F28E2B", 
                             "女性标化率" = "#E15759", 
                             "合计死亡率" = "#59A14F", 
                             "合计标化率" = "#B07AA1")) +
  scale_shape_manual(values = c("男性死亡率" = 16, 
                             "男性标化率" = 17, 
                             "女性死亡率" = 15, 
                             "女性标化率" = 18, 
                             "合计死亡率" = 19, 
                             "合计标化率" = 14)) +
  scale_y_continuous(limits = c(0, 85), breaks = seq(0, 85, by = 10)) +
  labs(title = "2011-2021年死亡率和标化率趋势",
       x = "年份",
       y = "死亡率/标化率") +
  theme_minimal() +
  theme(legend.position = "bottom",
        legend.box = "vertical",
        plot.title = element_text(hjust = 0.5, size = 16, face = "bold"),
        axis.title = element_text(size = 12),
        axis.text = element_text(size = 10),
        legend.title = element_blank(),
        legend.text = element_text(size = 10),
        panel.grid.major = element_line(color = "gray90", size = 0.2),
        panel.grid.minor = element_blank(),
        panel.background = element_rect(fill = "white", color = NA),
        plot.background = element_rect(fill = "white", color = NA),
        axis.line = element_line(color = "black", size = 0.5),
        axis.ticks = element_line(color = "black", size = 0.5),
        axis.ticks.length = unit(2, "pt"))

# 显示图表
print(p)

# 保存图表
ggsave("mortality_plot.png", plot = p, width = 12, height = 8, dpi = 300)