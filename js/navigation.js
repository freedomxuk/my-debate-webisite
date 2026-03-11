// 导航功能

// 检查Chart.js是否加载成功
if (typeof Chart === 'undefined') {
    console.error('Chart.js未能加载，请检查网络连接或浏览器设置');
    // 创建备用数据容器
    window.isChartLoaded = false;
    // 显示错误提示
    document.addEventListener('DOMContentLoaded', function() {
        const errors = document.querySelectorAll('.chart-error');
        errors.forEach(el => el.style.display = 'block');
    });
} else {
    console.log('Chart.js加载成功，版本:', Chart.version);
    window.isChartLoaded = true;
}

// 存储已创建的图表实例
let chartInstances = {
    trendChart: null,
    activityChart: null,
    financeTrendChart: null,
    rankingTrendChart: null,
    yearlyWinsChart: null,
    yearlyProfileChart: null,
    yearlyParticipationChart: null
};

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.page-section');

    // 页面切换功能
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // 移除所有活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // 添加当前活动状态
            this.classList.add('active');
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');

                // 滚动到顶部
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });

                // 重新初始化图表
                setTimeout(() => {
                    initCharts();
                }, 100);
            }
        });
    });

    // 筛选标签功能
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // 这里可以添加实际的筛选逻辑
            const filter = this.getAttribute('data-filter');
            console.log('筛选:', filter);
        });
    });

    // 按钮悬停效果
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // 成就卡片悬停效果
    const achievementCards = document.querySelectorAll('.achievement-card');
    achievementCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('locked')) {
                this.style.transform = 'translateY(-4px) scale(1.02)';
            }
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // 数据统计动画
    animateStats();

    // 初始化图表
    initCharts();

    // 初始化滚动动画
    animateOnScroll();

    // 展开详情功能
    const expandButtons = document.querySelectorAll('.expand-btn');
    expandButtons.forEach(button => {
        button.addEventListener('click', function() {
            const matchCard = this.closest('.match-card');
            const details = matchCard.querySelector('.match-details');
            const isExpanded = details.style.display !== 'none';

            if (isExpanded) {
                details.style.display = 'none';
                this.textContent = '展开详情';
            } else {
                details.style.display = 'block';
                this.textContent = '收起详情';
            }
        });
    });

    // 排序按钮功能
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(button => {
        button.addEventListener('click', function() {
            sortButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const sortType = this.getAttribute('data-sort');
            console.log('排序方式:', sortType);
            // 这里可以添加实际的排序逻辑
        });
    });
});

// 统计数字动画 - 性能优化版
function animateStats() {
    const statValues = document.querySelectorAll('.stat-value');

    // 使用节流函数优化
    const throttle = (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const finalValue = element.textContent;
                const isPercentage = finalValue.includes('%');
                const isNumber = /\d/.test(finalValue);

                if (isNumber) {
                    let numericValue = parseInt(finalValue.replace(/[^0-9]/g, ''));
                    let currentValue = 0;
                    const increment = numericValue / 50;
                    let lastTime = performance.now();

                    const timer = setInterval(() => {
                        const currentTime = performance.now();
                        const deltaTime = currentTime - lastTime;

                        if (deltaTime >= 16) { // 约60fps
                            currentValue += increment * (deltaTime / 16);
                            lastTime = currentTime;

                            if (currentValue >= numericValue) {
                                currentValue = numericValue;
                                clearInterval(timer);
                            }

                            if (isPercentage) {
                                element.textContent = Math.floor(currentValue) + '%';
                            } else if (finalValue.includes(',')) {
                                element.textContent = Math.floor(currentValue).toLocaleString();
                            } else {
                                element.textContent = Math.floor(currentValue);
                            }
                        }
                    }, 16);
                }

                observer.unobserve(element);
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1
    });

    statValues.forEach(value => {
        observer.observe(value);
    });
}

// 滚动显示动画
function animateOnScroll() {
    // 需要动画的元素选择器
    const animatedElements = {
        '.fade-in-up': 'fadeInUp',
        '.fade-in-left': 'fadeInLeft',
        '.fade-in-right': 'fadeInRight',
        '.scale-in': 'scaleIn',
        '.slide-in-btm': 'slideInBottom'
    };

    // 创建交集观察器
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;

                // 添加动画类
                for (const [selector, animation] of Object.entries(animatedElements)) {
                    if (element.matches(selector)) {
                        element.classList.add('animate-' + animation);

                        // 如果是图表，触发绘制动画
                        if (element.classList.contains('chart-container')) {
                            animateChart(element);
                        }

                        // 观察一次后就停止
                        scrollObserver.unobserve(element);
                        break;
                    }
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // 观察所有需要动画的元素
    Object.keys(animatedElements).forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            scrollObserver.observe(element);
        });
    });
}

// 图表绘制动画
function animateChart(chartContainer) {
    const canvas = chartContainer.querySelector('canvas');
    if (!canvas) return;

    // 添加加载动画类
    chartContainer.classList.add('chart-loading');

    // 模拟加载延迟，然后移除加载状态
    setTimeout(() => {
        chartContainer.classList.remove('chart-loading');
        chartContainer.classList.add('chart-loaded');

        // 触发图表绘制动画
        if (canvas.getContext) {
            const ctx = canvas.getContext('2d');
            // 这里可以添加具体的图表动画逻辑
            animateChartDraw(ctx, canvas);
        }
    }, 500);
}

// 图表绘制过程动画
function animateChartDraw(ctx, canvas) {
    // 简单的绘制动画效果
    ctx.globalAlpha = 0;
    let alpha = 0;

    const fadeIn = setInterval(() => {
        alpha += 0.05;
        ctx.globalAlpha = alpha;

        if (alpha >= 1) {
            clearInterval(fadeIn);
            ctx.globalAlpha = 1;
        }
    }, 30);
}

// 图表初始化函数
function initCharts() {
    console.log('初始化图表...');

    // 检查Chart.js是否已加载
    if (typeof Chart === 'undefined' || !window.isChartLoaded) {
        console.error('Chart.js未加载，跳过图表初始化');
        return;
    }

    // 赛事趋势图表
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
        // 先销毁旧实例
        if (chartInstances.trendChart) {
            chartInstances.trendChart.destroy();
        }
        drawTrendChartWithChartJS(trendCtx);
    }

    // 选手活跃度图表
    const activityCtx = document.getElementById('activityChart');
    if (activityCtx) {
        // 先销毁旧实例
        if (chartInstances.activityChart) {
            chartInstances.activityChart.destroy();
        }
        drawActivityChartWithChartJS(activityCtx);
    }

    // 财务趋势图表
    const financeTrendCtx = document.getElementById('financeTrendChart');
    if (financeTrendCtx) {
        // 先销毁旧实例
        if (chartInstances.financeTrendChart) {
            chartInstances.financeTrendChart.destroy();
        }
        drawFinanceTrendChartWithChartJS(financeTrendCtx);
    }

    // 积分趋势图表
    const rankingTrendCtx = document.getElementById('rankingTrendChart');
    if (rankingTrendCtx) {
        // 先销毁旧实例
        if (chartInstances.rankingTrendChart) {
            chartInstances.rankingTrendChart.destroy();
        }
        drawRankingTrendChartWithChartJS(rankingTrendCtx);
    }

    // 年度胜场对比图表
    const yearlyWinsCtx = document.getElementById('yearlyWinsChart');
    if (yearlyWinsCtx) {
        // 先销毁旧实例
        if (chartInstances.yearlyWinsChart) {
            chartInstances.yearlyWinsChart.destroy();
        }
        drawYearlyWinsChartWithChartJS(yearlyWinsCtx);
    }

    // 年度履历数对比图表
    const yearlyProfileCtx = document.getElementById('yearlyProfileChart');
    if (yearlyProfileCtx) {
        // 先销毁旧实例
        if (chartInstances.yearlyProfileChart) {
            chartInstances.yearlyProfileChart.destroy();
        }
        drawYearlyProfileChartWithChartJS(yearlyProfileCtx);
    }

    // 年度参与场次对比图表
    const yearlyParticipationCtx = document.getElementById('yearlyParticipationChart');
    if (yearlyParticipationCtx) {
        // 先销毁旧实例
        if (chartInstances.yearlyParticipationChart) {
            chartInstances.yearlyParticipationChart.destroy();
        }
        drawYearlyParticipationChartWithChartJS(yearlyParticipationCtx);
    }

    // 添加 chart-loaded 类以触发图表淡入动画
    setTimeout(() => {
        document.querySelectorAll('.chart-container').forEach(container => {
            container.classList.add('chart-loaded');
        });
    }, 300);
}

// 使用Chart.js绘制赛事趋势图表
function drawTrendChartWithChartJS(ctx) {
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            datasets: [{
                label: '比赛场次',
                data: [12, 19, 15, 25, 22, 30],
                borderColor: '#0A0A0A',
                backgroundColor: 'rgba(10, 10, 10, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#0A0A0A',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    borderColor: '#0A0A0A',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + ' 场比赛';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            animation: {
                duration: 2000
            }
        }
    });
    // 存储实例
    chartInstances.trendChart = chart;
}

// 使用Chart.js绘制选手活跃度图表
function drawActivityChartWithChartJS(ctx) {
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['张三', '李四', '王五', '赵六', '钱七'],
            datasets: [{
                label: '参赛次数',
                data: [25, 30, 28, 22, 35],
                backgroundColor: 'rgba(10, 10, 10, 0.8)',
                borderColor: '#0A0A0A',
                borderWidth: 1,
                borderRadius: 8,
                barThickness: 60
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    borderColor: '#0A0A0A',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + ' 次参赛';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            animation: {
                duration: 2000
            }
        }
    });
    // 存储实例
    chartInstances.activityChart = chart;
}

// 使用Chart.js绘制财务趋势图表
function drawFinanceTrendChartWithChartJS(ctx) {
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1月', '2月', '3月', '4月', '5月'],
            datasets: [{
                label: '收入',
                data: [12000, 19000, 15000, 25000, 22000],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }, {
                label: '支出',
                data: [8000, 12000, 10000, 15000, 14000],
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 3,
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
                        color: '#666666',
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    borderColor: '#0A0A0A',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ¥' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return '¥' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            animation: {
                duration: 2000
            }
        }
    });
    // 存储实例
    chartInstances.financeTrendChart = chart;
}

// 使用Chart.js绘制积分趋势图表
function drawRankingTrendChartWithChartJS(ctx) {
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1月', '2月', '3月', '4月', '5月'],
            datasets: [{
                label: '张三',
                data: [85, 88, 92, 90, 95],
                borderColor: '#0A0A0A',
                backgroundColor: 'rgba(10, 10, 10, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: false,
                pointBackgroundColor: '#0A0A0A',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2,
                pointRadius: 4
            }, {
                label: '李四',
                data: [75, 78, 82, 85, 88],
                borderColor: '#666666',
                backgroundColor: 'rgba(102, 102, 102, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: false,
                pointBackgroundColor: '#666666',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2,
                pointRadius: 4
            }, {
                label: '王五',
                data: [70, 72, 75, 78, 82],
                borderColor: '#999999',
                backgroundColor: 'rgba(153, 153, 153, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: false,
                pointBackgroundColor: '#999999',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#666666',
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    borderColor: '#0A0A0A',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + ' 分';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 60,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            animation: {
                duration: 2000
            }
        }
    });
    // 存储实例
    chartInstances.rankingTrendChart = chart;
}

// 使用Chart.js绘制年度胜场对比图表
function drawYearlyWinsChartWithChartJS(ctx) {
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2021年', '2022年', '2023年', '2024年'],
            datasets: [{
                label: '胜场数',
                data: [45, 62, 78, 89],
                borderColor: '#0A0A0A',
                backgroundColor: 'rgba(10, 10, 10, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#0A0A0A',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    borderColor: '#0A0A0A',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + ' 场胜利';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            animation: {
                duration: 2000
            }
        }
    });
    // 存储实例
    chartInstances.yearlyWinsChart = chart;
}

// 使用Chart.js绘制年度履历数对比图表
function drawYearlyProfileChartWithChartJS(ctx) {
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2021年', '2022年', '2023年', '2024年'],
            datasets: [{
                label: '履历数',
                data: [25, 42, 65, 89],
                borderColor: '#666666',
                backgroundColor: 'rgba(102, 102, 102, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#666666',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    borderColor: '#0A0A0A',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + ' 个履历';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            animation: {
                duration: 2000
            }
        }
    });
    // 存储实例
    chartInstances.yearlyProfileChart = chart;
}

// 使用Chart.js绘制年度参与场次对比图表
function drawYearlyParticipationChartWithChartJS(ctx) {
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2021年', '2022年', '2023年', '2024年'],
            datasets: [{
                label: '参与场次',
                data: [52, 71, 89, 105],
                borderColor: '#999999',
                backgroundColor: 'rgba(153, 153, 153, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#999999',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    borderColor: '#0A0A0A',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + ' 场比赛';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            animation: {
                duration: 2000
            }
        }
    });
    // 存储实例
    chartInstances.yearlyParticipationChart = chart;
}

// 绘制选手活跃度图表
function drawActivityChart(ctx) {
    const svg = `
        <svg viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="activityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#6366F1;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#6366F1;stop-opacity:0.05" />
                </linearGradient>
            </defs>

            <!-- 柱状图 -->
            <g fill="url(#activityGradient)">
                <rect x="50" y="180" width="60" height="70" rx="4" />
                <rect x="130" y="150" width="60" height="100" rx="4" />
                <rect x="210" y="120" width="60" height="130" rx="4" />
            </g>

            <!-- 边框 -->
            <g stroke="#6366F1" stroke-width="2" fill="none">
                <rect x="50" y="180" width="60" height="70" rx="4" />
                <rect x="130" y="150" width="60" height="100" rx="4" />
                <rect x="210" y="120" width="60" height="130" rx="4" />
            </g>

            <!-- 底部线 -->
            <line x1="50" y1="250" x2="270" y2="250" stroke="#E5E7EB" stroke-width="1" />

            <!-- 标签 -->
            <g fill="#6B7280" font-size="12">
                <text x="80" y="270">张三</text>
                <text x="160" y="270">李四</text>
                <text x="240" y="270">王五</text>
            </g>
        </svg>
    `;
    ctx.innerHTML = svg;
}

// 绘制财务趋势图表
function drawFinanceTrendChart(ctx) {
    const svg = `
        <svg viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#10B981;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#10B981;stop-opacity:0.05" />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#EF4444;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#EF4444;stop-opacity:0.05" />
                </linearGradient>
            </defs>

            <!-- 图例 -->
            <g font-size="14">
                <rect x="350" y="40" width="20" height="3" fill="#10B981" />
                <text x="375" y="45" fill="#6B7280">收入</text>
                <rect x="350" y="60" width="20" height="3" fill="#EF4444" />
                <text x="375" y="65" fill="#6B7280">支出</text>
            </g>

            <!-- 网格线 -->
            <g stroke="#E5E7EB" stroke-width="1" opacity="0.5">
                <line x1="50" y1="100" x2="350" y2="100" stroke-dasharray="5,5" />
                <line x1="50" y1="150" x2="350" y2="150" stroke-dasharray="5,5" />
                <line x1="50" y1="200" x2="350" y2="200" stroke-dasharray="5,5" />
            </g>

            <!-- 收入线 -->
            <polyline
                points="50,180 125,170 200,140 275,120 350,100"
                fill="none"
                stroke="#10B981"
                stroke-width="3"
            />

            <!-- 支出线 -->
            <polyline
                points="50,200 125,190 200,180 275,170 350,160"
                fill="none"
                stroke="#EF4444"
                stroke-width="3"
            />

            <!-- X轴 -->
            <line x1="50" y1="250" x2="350" y2="250" stroke="#E5E7EB" stroke-width="1" />

            <!-- X轴标签 -->
            <g fill="#6B7280" font-size="12">
                <text x="50" y="270" text-anchor="middle">1月</text>
                <text x="125" y="270" text-anchor="middle">2月</text>
                <text x="200" y="270" text-anchor="middle">3月</text>
                <text x="275" y="270" text-anchor="middle">4月</text>
                <text x="350" y="270" text-anchor="middle">5月</text>
            </g>
        </svg>
    `;
    ctx.innerHTML = svg;
}

// 绘制积分趋势图表
function drawRankingTrendChart(ctx) {
    const svg = `
        <svg viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="rankingGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#F59E0B;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#F59E0B;stop-opacity:0.05" />
                </linearGradient>
                <linearGradient id="rankingGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#6366F1;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#6366F1;stop-opacity:0.05" />
                </linearGradient>
                <linearGradient id="rankingGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:0.05" />
                </linearGradient>
            </defs>

            <!-- 数据线 -->
            <polyline
                points="50,200 150,180 250,160 350,140 450,120"
                fill="none"
                stroke="#F59E0B"
                stroke-width="3"
                stroke-linejoin="round"
            />

            <polyline
                points="50,220 150,210 250,190 350,170 450,160"
                fill="none"
                stroke="#6366F1"
                stroke-width="3"
                stroke-linejoin="round"
            />

            <polyline
                points="50,240 150,230 250,220 350,210 450,200"
                fill="none"
                stroke="#8B5CF6"
                stroke-width="3"
                stroke-linejoin="round"
            />

            <!-- 数据点 -->
            <g>
                <circle cx="50" cy="200" r="4" fill="#F59E0B" />
                <circle cx="150" cy="180" r="4" fill="#F59E0B" />
                <circle cx="250" cy="160" r="4" fill="#F59E0B" />
                <circle cx="350" cy="140" r="4" fill="#F59E0B" />
                <circle cx="450" cy="120" r="4" fill="#F59E0B" />
            </g>

            <g>
                <circle cx="50" cy="220" r="4" fill="#6366F1" />
                <circle cx="150" cy="210" r="4" fill="#6366F1" />
                <circle cx="250" cy="190" r="4" fill="#6366F1" />
                <circle cx="350" cy="170" r="4" fill="#6366F1" />
                <circle cx="450" cy="160" r="4" fill="#6366F1" />
            </g>

            <g>
                <circle cx="50" cy="240" r="4" fill="#8B5CF6" />
                <circle cx="150" cy="230" r="4" fill="#8B5CF6" />
                <circle cx="250" cy="220" r="4" fill="#8B5CF6" />
                <circle cx="350" cy="210" r="4" fill="#8B5CF6" />
                <circle cx="450" cy="200" r="4" fill="#8B5CF6" />
            </g>

            <!-- 底部线 -->
            <line x1="50" y1="250" x2="450" y2="250" stroke="#E5E7EB" stroke-width="1" />

            <!-- X轴标签 -->
            <g fill="#6B7280" font-size="12">
                <text x="50" y="270" text-anchor="middle">1月</text>
                <text x="150" y="270" text-anchor="middle">2月</text>
                <text x="250" y="270" text-anchor="middle">3月</text>
                <text x="350" y="270" text-anchor="middle">4月</text>
                <text x="450" y="270" text-anchor="middle">5月</text>
            </g>
        </svg>
    `;
    ctx.innerHTML = svg;
}

// 图片懒加载
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('fade-in-up');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// 性能监控
function monitorPerformance() {
    if ('performance' in window) {
        // 监听页面加载时间
        window.addEventListener('load', () => {
            const timing = performance.timing;
            const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
            console.log(`页面加载时间: ${pageLoadTime}ms`);

            // 如果加载时间超过3秒，显示提示
            if (pageLoadTime > 3000) {
                const warning = document.createElement('div');
                warning.className = 'performance-warning';
                warning.textContent = '页面加载较慢，建议检查网络连接';
                warning.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--color-gray-800);
                    color: var(--color-white);
                    padding: 12px 24px;
                    border-radius: var(--radius-md);
                    z-index: 1000;
                    font-size: var(--text-sm);
                    box-shadow: var(--shadow-paper-lg);
                `;
                document.body.appendChild(warning);

                setTimeout(() => {
                    warning.remove();
                }, 5000);
            }
        });
    }
}

// 事件监听器优化 - 使用 passive 选项
function setupOptimizedEventListeners() {
    // 优化滚动事件
    let ticking = false;
    function updateScroll() {
        // 滚动相关逻辑
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateScroll);
            ticking = true;
        }
    }, { passive: true });

    // 优化触摸事件
    document.addEventListener('touchmove', () => {
        // 触摸相关逻辑
    }, { passive: true });
}

// 初始化性能优化
document.addEventListener('DOMContentLoaded', () => {
    lazyLoadImages();
    monitorPerformance();
    setupOptimizedEventListeners();
});