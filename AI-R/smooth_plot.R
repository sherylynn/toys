# 加载必要的包
library(ggplot2)
library(reshape2)

# 读取CSV数据
data <- read.csv("data.csv", fileEncoding = "UTF-8")

# 提取发病率数据
incidence_data <- data[1:3, ]  # 选择前三行（合计、男性、女性发病率）
rownames(incidence_data) <- NULL
colnames(incidence_data)[1] <- "指标"

# 将发病率数据从宽格式转换为长格式
incidence_long <- melt(incidence_data, id.vars = "指标", 
                     variable.name = "年龄组", 
                     value.name = "发病率")

# 创建发病率图表
p1 <- ggplot(incidence_long, aes(x = 年龄组, y = 发病率, color = 指标, group = 指标)) +
  geom_point(size = 3, na.rm = TRUE) +
  geom_smooth(se = FALSE, na.rm = TRUE, size = 1) +
  scale_color_manual(values = c("合计" = "#4E79A7", 
                              "男性" = "#F28E2B", 
                              "女性" = "#E15759")) +
  scale_y_continuous(limits = c(0, 2500), breaks = seq(0, 2500, by = 500)) +
  labs(title = "不同年龄组发病率分布（含平滑连线）",
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

# 创建死亡率图表
p2 <- ggplot(mortality_long, aes(x = 年龄组, y = 死亡率, color = 指标, group = 指标)) +
  geom_point(size = 3, na.rm = TRUE) +
  geom_smooth(se = FALSE, na.rm = TRUE, size = 1) +
  scale_color_manual(values = c("合计" = "#4E79A7", 
                              "男性" = "#F28E2B", 
                              "女性" = "#E15759")) +
  scale_y_continuous(limits = c(0, 700), breaks = seq(0, 700, by = 100)) +
  labs(title = "不同年龄组死亡率分布（含平滑连线）",
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
ggsave("smooth_incidence_plot.png", plot = p1, width = 12, height = 8, dpi = 300)
ggsave("smooth_mortality_plot.png", plot = p2, width = 12, height = 8, dpi = 300)

# 显示图表
print(p1)
print(p2)