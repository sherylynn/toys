// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 导航栏交互
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // 如果导航栏在移动设备上是展开的，点击后收起
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });

    // BMI计算器功能
    const calculateBMI = document.getElementById('calculate-bmi');
    if (calculateBMI) {
        calculateBMI.addEventListener('click', function() {
            const height = parseFloat(document.getElementById('height').value);
            const weight = parseFloat(document.getElementById('weight').value);
            const resultValue = document.querySelector('.result-value');
            const resultDescription = document.querySelector('.result-description');
            
            if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
                resultValue.textContent = '--';
                resultDescription.textContent = '请输入有效的身高和体重';
                return;
            }
            
            // 计算BMI: 体重(kg) / (身高(m) * 身高(m))
            const heightInMeters = height / 100;
            const bmi = weight / (heightInMeters * heightInMeters);
            const roundedBMI = bmi.toFixed(1);
            
            resultValue.textContent = roundedBMI;
            
            // 根据BMI值判断健康状况
            let healthStatus = '';
            if (bmi < 18.5) {
                healthStatus = '体重过轻';
                resultValue.style.color = '#FFC107';
            } else if (bmi >= 18.5 && bmi < 24) {
                healthStatus = '健康体重';
                resultValue.style.color = '#4CAF50';
            } else if (bmi >= 24 && bmi < 28) {
                healthStatus = '超重';
                resultValue.style.color = '#FF9800';
            } else {
                healthStatus = '肥胖';
                resultValue.style.color = '#F44336';
            }
            
            resultDescription.textContent = `您的BMI指数为${roundedBMI}，属于${healthStatus}范围。`;
        });
    }

    // 数据可视化 - 全球传染病趋势图表
    const diseaseChartElement = document.getElementById('disease-chart');
    if (diseaseChartElement && typeof Chart !== 'undefined') {
        const diseaseCtx = diseaseChartElement.getContext('2d');
        
        // 创建传染病趋势图表
        new Chart(diseaseCtx, {
            type: 'line',
            data: {
                labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
                datasets: [{
                    label: '流感',
                    data: [65, 78, 52, 45, 58, 70],
                    borderColor: '#00e5ff',
                    backgroundColor: 'rgba(0, 229, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: '新冠肺炎',
                    data: [0, 0, 100, 85, 60, 40],
                    borderColor: '#7b2ff7',
                    backgroundColor: 'rgba(123, 47, 247, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: '肺结核',
                    data: [40, 38, 35, 32, 30, 28],
                    borderColor: '#ff2a6d',
                    backgroundColor: 'rgba(255, 42, 109, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#a0aec0',
                            font: {
                                family: '"Roboto", sans-serif',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(19, 47, 76, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#a0aec0',
                        borderColor: 'rgba(0, 229, 255, 0.3)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(160, 174, 192, 0.1)'
                        },
                        ticks: {
                            color: '#a0aec0'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(160, 174, 192, 0.1)'
                        },
                        ticks: {
                            color: '#a0aec0'
                        }
                    }
                }
            }
        });
    }

    // 数据可视化 - 健康生活方式影响图表
    const lifestyleChartElement = document.getElementById('lifestyle-chart');
    if (lifestyleChartElement && typeof Chart !== 'undefined') {
        const lifestyleCtx = lifestyleChartElement.getContext('2d');
        
        // 创建健康生活方式影响图表
        new Chart(lifestyleCtx, {
            type: 'radar',
            data: {
                labels: ['心血管健康', '免疫系统', '精神健康', '睡眠质量', '体重管理', '能量水平'],
                datasets: [{
                    label: '健康生活方式',
                    data: [85, 80, 90, 88, 82, 87],
                    borderColor: '#00e5ff',
                    backgroundColor: 'rgba(0, 229, 255, 0.2)',
                    pointBackgroundColor: '#00e5ff',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#00e5ff'
                }, {
                    label: '不健康生活方式',
                    data: [50, 45, 40, 35, 55, 30],
                    borderColor: '#ff2a6d',
                    backgroundColor: 'rgba(255, 42, 109, 0.2)',
                    pointBackgroundColor: '#ff2a6d',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#ff2a6d'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#a0aec0',
                            font: {
                                family: '"Roboto", sans-serif',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(19, 47, 76, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#a0aec0',
                        borderColor: 'rgba(0, 229, 255, 0.3)',
                        borderWidth: 1
                    }
                },
                scales: {
                    r: {
                        angleLines: {
                            color: 'rgba(160, 174, 192, 0.2)'
                        },
                        grid: {
                            color: 'rgba(160, 174, 192, 0.2)'
                        },
                        pointLabels: {
                            color: '#a0aec0',
                            font: {
                                family: '"Roboto", sans-serif',
                                size: 12
                            }
                        },
                        ticks: {
                            color: '#a0aec0',
                            backdropColor: 'transparent'
                        }
                    }
                }
            }
        });
    }

    // 添加动画效果
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.card, .test-card, .chart-container');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('animate');
            }
        });
    };
    
    // 初始检查
    animateOnScroll();
    
    // 滚动时检查
    window.addEventListener('scroll', animateOnScroll);

    // 响应式导航
    function handleResponsiveNav() {
        if (window.innerWidth <= 768) {
            if (navLinks) {
                navLinks.classList.add('mobile-nav');
            }
        } else {
            if (navLinks) {
                navLinks.classList.remove('mobile-nav', 'active');
            }
            if (hamburger) {
                hamburger.classList.remove('active');
            }
        }
    }
    
    // 初始检查
    handleResponsiveNav();
    
    // 窗口大小改变时检查
    window.addEventListener('resize', handleResponsiveNav);
});

// 添加CSS动画
document.head.insertAdjacentHTML('beforeend', `
<style>
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes float {
    0% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-20px);
    }
    100% {
        transform: translateY(0px);
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 0.1;
    }
    50% {
        transform: scale(1.1);
        opacity: 0.15;
    }
    100% {
        transform: scale(1);
        opacity: 0.1;
    }
}

.card, .test-card, .chart-container {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.card.animate, .test-card.animate, .chart-container.animate {
    opacity: 1;
    transform: translateY(0);
}

/* 响应式样式 */
@media (max-width: 768px) {
    .hamburger {
        display: block;
    }
    
    .nav-links {
        position: fixed;
        top: 80px;
        left: 0;
        width: 100%;
        background-color: rgba(10, 25, 41, 0.95);
        flex-direction: column;
        align-items: center;
        padding: 20px 0;
        clip-path: circle(0px at 100% 0%);
        -webkit-clip-path: circle(0px at 100% 0%);
        transition: all 0.5s ease-out;
        pointer-events: none;
    }
    
    .nav-links.active {
        clip-path: circle(1000px at 100% 0%);
        -webkit-clip-path: circle(1000px at 100% 0%);
        pointer-events: all;
    }
    
    .nav-links li {
        margin: 15px 0;
    }
    
    .hamburger.active .line:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .hamburger.active .line:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active .line:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .hero-section {
        flex-direction: column;
        text-align: center;
    }
    
    .hero-content {
        margin-bottom: 50px;
    }
    
    .about-content {
        grid-template-columns: 1fr;
    }
    
    .team-stats {
        margin-bottom: 30px;
    }
}

@media (max-width: 480px) {
    .hero-content h1 {
        font-size: 2.5rem;
    }
    
    .section-header h2 {
        font-size: 2rem;
    }
    
    .visualization-container {
        grid-template-columns: 1fr;
    }
}