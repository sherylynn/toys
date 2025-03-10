# 加载必要的包
library(ggplot2)
library(reshape2)

# 读取数据
data <- read.csv("age_data.csv", fileEncoding = "UTF-8", check.names = FALSE)
# 获取年龄组列名
age_levels <- colnames(data)[-1]  # 除去第一列的所有列名

# 提取发病率数据
incidence_data <- data[1:3, ]  # 选择前三行（合计、男性、女性发病率）
rownames(incidence_data) <- NULL
colnames(incidence_data)[1] <- "指标"

# 将发病率数据从宽格式转换为长格式
incidence_long <- melt(incidence_data, id.vars = "指标", 
                     variable.name = "年龄组", 
                     value.name = "发病率")

# 设置年龄组为因子型变量，使用从数据中读取的顺序
incidence_long$年龄组 <- factor(incidence_long$年龄组, levels = age_levels)

# 创建发病率图表
p1 <- ggplot(incidence_long, aes(x = 年龄组, y = 发病率, color = 指标, group = 指标)) +
  geom_line(size = 1) +
  geom_point(size = 3) +
  scale_color_manual(values = c("合计发病率" = "#4E79A7", 
                             "男性发病率" = "#F28E2B", 
                             "女性发病率" = "#E15759")) +
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

# 提取死亡率数据
mortality_data <- data[4:6, ]  # 选择后三行（合计、男性、女性死亡率）
rownames(mortality_data) <- NULL
colnames(mortality_data)[1] <- "指标"

# 将死亡率数据从宽格式转换为长格式
mortality_long <- melt(mortality_data, id.vars = "指标", 
                     variable.name = "年龄组", 
                     value.name = "死亡率")

# 设置年龄组为因子型变量，使用从数据中读取的顺序
mortality_long$年龄组 <- factor(mortality_long$年龄组, levels = age_levels)

# 创建死亡率图表
p2 <- ggplot(mortality_long, aes(x = 年龄组, y = 死亡率, color = 指标, group = 指标)) +
  geom_line(size = 1) +
  geom_point(size = 3) +
  scale_color_manual(values = c("合计死亡率" = "#4E79A7", 
                             "男性死亡率" = "#F28E2B", 
                             "女性死亡率" = "#E15759")) +
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
ggsave("age_incidence_plot.png", p1, width = 10, height = 6)
ggsave("age_mortality_plot.png", p2, width = 10, height = 6)