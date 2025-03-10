# 加载必要的包
library(ggplot2)
library(reshape2)

# 读取发病率数据
incidence_data <- read.csv("age_incidence.csv", fileEncoding = "UTF-8")

# 设置年龄组的因子水平顺序
age_levels <- c("0-", "5-", "10-", "15-", "20-", "25-", "30-", "35-", "40-", "45-", "50-", "55-", "60-", "65-", "70-", "75-", "80-", "≥85")
incidence_data$年龄组 <- factor(incidence_data$年龄组, levels = age_levels)

# 将数据从宽格式转换为长格式
incidence_long <- melt(incidence_data, id.vars = "年龄组", 
                      variable.name = "指标", 
                      value.name = "发病率")

# 创建发病率图表
p1 <- ggplot(incidence_long, aes(x = 年龄组, y = 发病率, color = 指标, group = 指标)) +
  geom_line(size = 1) +
  geom_point(size = 3) +
  scale_color_manual(values = c("合计" = "#4E79A7", 
                              "男性" = "#F28E2B", 
                              "女性" = "#E15759")) +
  scale_y_continuous(limits = c(0, 2500), breaks = seq(0, 2500, by = 500)) +
  labs(title = "不同年龄组发病率分布",
       x = "年龄组",
       y = "发病率(1/10万)") +
  theme_minimal() +
  theme(legend.position = "bottom",
        legend.box = "vertical",
        plot.title = element_text(hjust = 0.5, size = 16, face = "bold"),
        axis.title = element_text(size = 12),
        axis.text.x = element_text(angle = 45, hjust = 1, size = 10),
        axis.text.y = element_text(size = 10),
        legend.title = element_blank(),
        legend.text = element_text(size = 10),
        panel.grid.major = element_line(color = "gray90", size = 0.2),
        panel.grid.minor = element_blank(),
        panel.background = element_rect(fill = "white", color = NA),
        plot.background = element_rect(fill = "white", color = NA),
        axis.line = element_line(color = "black", size = 0.5),
        axis.ticks = element_line(color = "black", size = 0.5),
        axis.ticks.length = unit(2, "pt"))

# 读取死亡率数据
mortality_data <- read.csv("age_mortality.csv", fileEncoding = "UTF-8")

# 设置死亡率数据的年龄组因子水平顺序
mortality_data$年龄组 <- factor(mortality_data$年龄组, levels = age_levels)

# 将数据从宽格式转换为长格式
mortality_long <- melt(mortality_data, id.vars = "年龄组", 
                      variable.name = "指标", 
                      value.name = "死亡率")

# 创建死亡率图表
p2 <- ggplot(mortality_long, aes(x = 年龄组, y = 死亡率, color = 指标, group = 指标)) +
  geom_line(size = 1) +
  geom_point(size = 3) +
  scale_color_manual(values = c("合计" = "#4E79A7", 
                              "男性" = "#F28E2B", 
                              "女性" = "#E15759")) +
  scale_y_continuous(limits = c(0, 700), breaks = seq(0, 700, by = 100)) +
  labs(title = "不同年龄组死亡率分布",
       x = "年龄组",
       y = "死亡率(1/10万)") +
  theme_minimal() +
  theme(legend.position = "bottom",
        legend.box = "vertical",
        plot.title = element_text(hjust = 0.5, size = 16, face = "bold"),
        axis.title = element_text(size = 12),
        axis.text.x = element_text(angle = 45, hjust = 1, size = 10),
        axis.text.y = element_text(size = 10),
        legend.title = element_blank(),
        legend.text = element_text(size = 10),
        panel.grid.major = element_line(color = "gray90", size = 0.2),
        panel.grid.minor = element_blank(),
        panel.background = element_rect(fill = "white", color = NA),
        plot.background = element_rect(fill = "white", color = NA),
        axis.line = element_line(color = "black", size = 0.5),
        axis.ticks = element_line(color = "black", size = 0.5),
        axis.ticks.length = unit(2, "pt"))

# 保存图表
ggsave("age_incidence_plot.png", plot = p1, width = 12, height = 8, dpi = 300)
ggsave("age_mortality_plot.png", plot = p2, width = 12, height = 8, dpi = 300)

# 显示图表
print(p1)
print(p2)