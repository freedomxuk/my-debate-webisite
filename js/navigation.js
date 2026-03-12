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
    yearlyParticipationChart: null,
    participationTrendChart: null,
    winRateTrendChart: null,
    profileTrendChart: null,
    // 个人成绩分析图表
    playerRadarChart: null,
    playerPointsTrendChart: null,
    playerWinRateTrendChart: null,
    playerTournamentChart: null,
    playerPositionChart: null,
    playerMonthlyActivityChart: null
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
                    // 排名页面需要重新渲染积分榜和选手选择器
                    if (targetId === 'ranking') {
                        renderLeaderboard();
                        initPlayerSelector();
                    }
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
            const matchCard = this.closest('.match-card') || this.closest('.paper-match-card');
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
            renderMatchRecords(sortType);
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

    // 年度参与场次变化趋势图表
    const participationTrendCtx = document.getElementById('participationTrendChart');
    if (participationTrendCtx) {
        if (chartInstances.participationTrendChart) {
            chartInstances.participationTrendChart.destroy();
        }
        drawParticipationTrendChartWithChartJS(participationTrendCtx);
    }

    // 年度胜率变化趋势图表
    const winRateTrendCtx = document.getElementById('winRateTrendChart');
    if (winRateTrendCtx) {
        if (chartInstances.winRateTrendChart) {
            chartInstances.winRateTrendChart.destroy();
        }
        drawWinRateTrendChartWithChartJS(winRateTrendCtx);
    }

    // 年度获得履历数变化趋势图表
    const profileTrendCtx = document.getElementById('profileTrendChart');
    if (profileTrendCtx) {
        if (chartInstances.profileTrendChart) {
            chartInstances.profileTrendChart.destroy();
        }
        drawProfileTrendChartWithChartJS(profileTrendCtx);
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

// 使用Chart.js绘制年度参与场次变化趋势图表
function drawParticipationTrendChartWithChartJS(ctx) {
    const trendData = calculateTrendData();
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendData.labels,
            datasets: [{
                label: '参与场次',
                data: trendData.matchCounts,
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
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#666666'
                    }
                },
                y: {
                    grid: {
                        color: '#E0E0E0'
                    },
                    ticks: {
                        color: '#666666'
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            }
        }
    });
    chartInstances.participationTrendChart = chart;
}

// 使用Chart.js绘制年度胜率变化趋势图表
function drawWinRateTrendChartWithChartJS(ctx) {
    const trendData = calculateTrendData();
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendData.labels,
            datasets: [{
                label: '胜率',
                data: trendData.winRates,
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
                            return context.parsed.y + '% 胜率';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#666666'
                    }
                },
                y: {
                    grid: {
                        color: '#E0E0E0'
                    },
                    ticks: {
                        color: '#666666',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    min: 0,
                    max: 100
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            }
        }
    });
    chartInstances.winRateTrendChart = chart;
}

// 使用Chart.js绘制年度获得履历数变化趋势图表
function drawProfileTrendChartWithChartJS(ctx) {
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2021年', '2022年', '2023年', '2024年'],
            datasets: [{
                label: '获得履历数',
                data: [25, 42, 65, 89],
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
                            return context.parsed.y + ' 个履历';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#666666'
                    }
                },
                y: {
                    grid: {
                        color: '#E0E0E0'
                    },
                    ticks: {
                        color: '#666666'
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            }
        }
    });
    chartInstances.profileTrendChart = chart;
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

// ==========================================
// 数据管理功能 - 比赛记录和财务记录
// ==========================================

// 初始化默认数据（如果localStorage为空）
function initializeDefaultData() {
    // 初始化比赛记录
    if (!localStorage.getItem('matchRecords')) {
        const defaultMatches = [
            {
                id: 1,
                date: '2024-03-15',
                tournament: '春季联赛',
                homeTeam: '计算机学院',
                awayTeam: '文学院',
                homeScore: 3,
                awayScore: 2,
                bestDebater: '王五',
                goodDebater: '王五',
                topic: '人工智能是否会取代人类决策？',
                positions: { first: '张三', second: '李四', third: '王五', fourth: '赵六' }
            },
            {
                id: 2,
                date: '2024-03-18',
                tournament: '友谊赛',
                homeTeam: '研究生院',
                awayTeam: '本科部',
                homeScore: 2,
                awayScore: 1,
                bestDebater: '李明',
                goodDebater: '李明',
                topic: '金钱是衡量人生价值的唯一标准吗？',
                positions: { first: '李明', second: '王芳', third: '张强', fourth: '刘洋' }
            },
            {
                id: 3,
                date: '2024-03-20',
                tournament: '常规赛',
                homeTeam: '理学院',
                awayTeam: '艺术学院',
                homeScore: 1,
                awayScore: 3,
                bestDebater: '',
                goodDebater: '',
                topic: '科技发展让艺术创作更自由还是失去灵魂？',
                positions: { first: '陈晨', second: '林雨', third: '黄磊', fourth: '周杰' }
            }
        ];
        localStorage.setItem('matchRecords', JSON.stringify(defaultMatches));
    }

    // 初始化财务记录
    if (!localStorage.getItem('financeRecords')) {
        const defaultFinance = [
            { id: 1, date: '2024-03-10', project: '春季联赛报名费', category: 'income', amount: 5000, status: 'completed', remark: '' },
            { id: 2, date: '2024-03-09', project: '场地租赁费', category: 'expense', amount: 2000, status: 'completed', remark: '' },
            { id: 3, date: '2024-03-08', project: '辩论器材采购', category: 'expense', amount: 3500, status: 'completed', remark: '' }
        ];
        localStorage.setItem('financeRecords', JSON.stringify(defaultFinance));
    }
}

// 获取比赛记录
function getMatchRecords() {
    const records = localStorage.getItem('matchRecords');
    return records ? JSON.parse(records) : [];
}

// 保存比赛记录
function saveMatchRecords(records) {
    localStorage.setItem('matchRecords', JSON.stringify(records));
}

// 添加单条比赛记录
function addMatchRecord(record) {
    const records = getMatchRecords();
    record.id = Date.now();
    records.unshift(record); // 添加到开头
    saveMatchRecords(records);
    return record.id;
}

// 获取财务记录
function getFinanceRecords() {
    const records = localStorage.getItem('financeRecords');
    return records ? JSON.parse(records) : [];
}

// 保存财务记录
function saveFinanceRecords(records) {
    localStorage.setItem('financeRecords', JSON.stringify(records));
}

// 添加单条财务记录
function addFinanceRecord(record) {
    const records = getFinanceRecords();
    record.id = Date.now();
    record.status = 'completed';
    records.unshift(record); // 添加到开头
    saveFinanceRecords(records);
    return record.id;
}

// 计算财务概览数据
function calculateFinanceOverview() {
    const records = getFinanceRecords();
    let totalIncome = 0;
    let totalExpense = 0;

    records.forEach(record => {
        if (record.category === 'income') {
            totalIncome += parseFloat(record.amount) || 0;
        } else {
            totalExpense += parseFloat(record.amount) || 0;
        }
    });

    return {
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense
    };
}

// 计算比赛统计数据
function calculateMatchStats() {
    const records = getMatchRecords();
    const totalMatches = records.length;
    let wins = 0;
    let profileCount = 0;
    let uniqueDebaters = new Set();

    records.forEach(record => {
        // 判断胜负：优先使用record.result，否则根据比分判断
        let isWin = false;
        if (record.result === 'win') {
            isWin = true;
        } else if (record.result === 'loss') {
            isWin = false;
        } else if (record.homeScore > record.awayScore) {
            isWin = true;
        }

        if (isWin) wins++;

        // 统计履历
        if (record.profile) {
            profileCount++;
        }

        // 统计参赛人员（正方和反方都算）
        if (record.homeTeam && record.homeTeam !== '正方' && record.homeTeam !== '反方') {
            uniqueDebaters.add(record.homeTeam);
        }
        if (record.awayTeam && record.awayTeam !== '正方' && record.awayTeam !== '反方') {
            uniqueDebaters.add(record.awayTeam);
        }
        if (record.bestDebater) uniqueDebaters.add(record.bestDebater);
        if (record.staff) uniqueDebaters.add(record.staff);
        if (record.positions) {
            if (record.positions.first) uniqueDebaters.add(record.positions.first);
            if (record.positions.second) uniqueDebaters.add(record.positions.second);
            if (record.positions.third) uniqueDebaters.add(record.positions.third);
            if (record.positions.fourth) uniqueDebaters.add(record.positions.fourth);
        }
    });

    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    return {
        totalMatches: totalMatches,
        wins: wins,
        winRate: winRate,
        profileCount: profileCount,
        participantCount: uniqueDebaters.size
    };
}

// 计算年度趋势数据
function calculateTrendData() {
    const records = getMatchRecords();
    const yearData = {};

    // 获取最近5年的数据
    const currentYear = new Date().getFullYear();
    for (let i = 4; i >= 0; i--) {
        yearData[currentYear - i] = { matches: 0, wins: 0 };
    }

    records.forEach(record => {
        if (record.date) {
            const year = new Date(record.date).getFullYear();
            if (yearData[year]) {
                yearData[year].matches++;
                // 判断胜负
                let isWin = false;
                if (record.result === 'win') isWin = true;
                else if (record.result === 'loss') isWin = false;
                else if (record.homeScore > record.awayScore) isWin = true;

                if (isWin) yearData[year].wins++;
            }
        }
    });

    const labels = Object.keys(yearData).map(y => y + '年');
    const matchCounts = Object.values(yearData).map(d => d.matches);
    const winRates = Object.values(yearData).map(d => d.matches > 0 ? Math.round((d.wins / d.matches) * 100) : 0);

    return { labels, matchCounts, winRates };
}

// 计算个人积分榜
// 积分公式：上场 + 胜场 + 佳辩次数 + 工作人员×0.5
function calculateLeaderboard() {
    const records = getMatchRecords();
    const playerStats = {};

    // 过滤无效名字
    const invalidNames = ['无', '对方辩友', '', 'null', 'undefined', '柴宇飞', '周丽君', '待定', 'TBD'];

    records.forEach(record => {
        // 获取所有参赛人员
        const players = [];

        // 正方队伍（过滤无效名字）
        if (record.homeTeam && record.homeTeam !== '正方' && record.homeTeam !== 'AAU辩论队' && !invalidNames.includes(record.homeTeam)) {
            players.push({ name: record.homeTeam, isHome: true, isWin: false });
        }
        // 反方队伍（过滤无效名字）
        if (record.awayTeam && record.awayTeam !== '反方' && record.awayTeam !== 'AAU辩论队' && !invalidNames.includes(record.awayTeam)) {
            players.push({ name: record.awayTeam, isHome: false, isWin: false });
        }

        // 判断胜负
        let isHomeWin = false;
        if (record.result === 'win') {
            isHomeWin = true;
        } else if (record.result === 'loss') {
            isHomeWin = false;
        } else if (record.homeScore > record.awayScore) {
            isHomeWin = true;
        }

        // 更新每个队员的统计
        players.forEach(p => {
            p.isWin = p.isHome === isHomeWin;
        });

        // 统计最佳辩手（过滤无效名字）
        if (record.bestDebater && !invalidNames.includes(record.bestDebater)) {
            if (!playerStats[record.bestDebater]) {
                playerStats[record.bestDebater] = { name: record.bestDebater, appearances: 0, wins: 0, bestDebater: 0, staff: 0 };
            }
            playerStats[record.bestDebater].bestDebater++;
        }

        // 统计工作人员（过滤无效名字）
        if (record.staff && !invalidNames.includes(record.staff)) {
            if (!playerStats[record.staff]) {
                playerStats[record.staff] = { name: record.staff, appearances: 0, wins: 0, bestDebater: 0, staff: 0, judge: 0 };
            }
            playerStats[record.staff].staff++;
        }

        // 统计执评（过滤无效名字）
        if (record.judge && !invalidNames.includes(record.judge)) {
            if (!playerStats[record.judge]) {
                playerStats[record.judge] = { name: record.judge, appearances: 0, wins: 0, bestDebater: 0, staff: 0, judge: 0 };
            }
            playerStats[record.judge].judge = (playerStats[record.judge].judge || 0) + 1;
        }

        // 辩位分布（过滤无效名字）
        if (record.positions) {
            // 判断胜负：优先使用result字段，否则根据比分
            let aauWon = false;
            if (record.result === 'win') {
                aauWon = true;
            } else if (record.result === 'loss') {
                aauWon = false;
            } else {
                // 根据比分判断（假设正方是AAU）
                aauWon = record.homeScore > record.awayScore;
            }

            ['first', 'second', 'third', 'fourth'].forEach(pos => {
                const name = record.positions[pos];
                if (name && !invalidNames.includes(name)) {
                    if (!playerStats[name]) {
                        playerStats[name] = { name: name, appearances: 0, wins: 0, bestDebater: 0, staff: 0, judge: 0 };
                    }
                    playerStats[name].appearances++;
                    // 如果AAU获胜，这4位辩手都算获胜
                    if (aauWon) {
                        playerStats[name].wins++;
                    }
                }
            });
        }

        // 模辩统计（作为工作人员场次）
        if (record.mockPositions) {
            ['first', 'second', 'third', 'fourth'].forEach(pos => {
                const name = record.mockPositions[pos];
                if (name && !invalidNames.includes(name)) {
                    if (!playerStats[name]) {
                        playerStats[name] = { name: name, appearances: 0, wins: 0, bestDebater: 0, staff: 0, judge: 0 };
                    }
                    playerStats[name].staff++;
                }
            });
        }
    });

    // 计算积分并排序
    const leaderboard = Object.values(playerStats).map(player => {
        return {
            name: player.name,
            appearances: player.appearances,
            wins: player.wins,
            bestDebater: player.bestDebater,
            staff: player.staff,
            // 积分公式：上场 + 胜场 + 佳辩次数 + 工作人员×0.5
            points: player.appearances + player.wins + player.bestDebater + (player.staff * 0.5) + ((player.judge || 0) * 1)
        };
    });

    // 按积分降序排列
    leaderboard.sort((a, b) => b.points - a.points);

    return leaderboard;
}

// 更新数据大屏显示
function updateDashboard() {
    const matchStats = calculateMatchStats();
    const financeOverview = calculateFinanceOverview();

    // 更新统计卡片（数据大屏）
    const statCards = document.querySelectorAll('.magazine-stat-card .stat-value');
    if (statCards[0]) statCards[0].textContent = matchStats.totalMatches;
    if (statCards[1]) statCards[1].textContent = matchStats.profileCount;
    if (statCards[2]) statCards[2].textContent = matchStats.winRate + '%';
    if (statCards[3]) statCards[3].textContent = matchStats.participantCount;

    // 更新财务概览（财务管理页面）
    const executiveCards = document.querySelectorAll('.executive-stat-card .stat-value');
    if (executiveCards[0]) executiveCards[0].textContent = '¥' + financeOverview.income.toLocaleString();
    if (executiveCards[1]) executiveCards[1].textContent = '¥' + financeOverview.expense.toLocaleString();
    if (executiveCards[2]) executiveCards[2].textContent = '¥' + financeOverview.balance.toLocaleString();

    // 渲染积分榜
    renderLeaderboard();
}

// 渲染积分榜
function renderLeaderboard() {
    const leaderboard = calculateLeaderboard();

    // 渲染赛事管理页面的积分榜列表
    const leaderboardList = document.getElementById('leaderboardList');
    if (leaderboardList) {
        if (leaderboard.length === 0) {
            leaderboardList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">暂无数据</p>';
            return;
        }

        const top10 = leaderboard.slice(0, 10);
        leaderboardList.innerHTML = top10.map((player, index) => {
            const rankClass = index < 3 ? `top-${index + 1}` : '';
            return `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
                    <div class="leaderboard-name">${player.name}</div>
                    <div class="leaderboard-stats">
                        <div class="leaderboard-stat">
                            <div class="leaderboard-stat-label">上场</div>
                            <div class="leaderboard-stat-value">${player.appearances}</div>
                        </div>
                        <div class="leaderboard-stat">
                            <div class="leaderboard-stat-label">胜场</div>
                            <div class="leaderboard-stat-value">${player.wins}</div>
                        </div>
                        <div class="leaderboard-stat">
                            <div class="leaderboard-stat-label">佳辩</div>
                            <div class="leaderboard-stat-value">${player.bestDebater}</div>
                        </div>
                        <div class="leaderboard-stat">
                            <div class="leaderboard-stat-label">执评</div>
                            <div class="leaderboard-stat-value">${player.staff}</div>
                        </div>
                    </div>
                    <div class="leaderboard-points">
                        <div class="leaderboard-points-value">${player.points}</div>
                    </div>
                </div>
            `;
        }).join('');

        if (leaderboard.length > 10) {
            leaderboardList.innerHTML += `<p style="text-align: center; color: var(--text-secondary); padding: 16px;">还有 ${leaderboard.length - 10} 名选手...</p>`;
        }
    }

    // 渲染排名页面的锦标赛风格榜单
    const rankingBracket = document.getElementById('rankingBracket');
    if (rankingBracket) {
        if (leaderboard.length === 0) {
            rankingBracket.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">暂无数据</p>';
            return;
        }

        const top3 = leaderboard.slice(0, 3);
        const rest = leaderboard.slice(3);

        // 计算胜率
        const getWinRate = (player) => {
            return player.appearances > 0 ? Math.round((player.wins / player.appearances) * 100) : 0;
        };

        // 生成完整的stats HTML
        const getFullStats = (player) => {
            return `
                <div class="ranking-full-stats">
                    <span class="stat-item"><strong>${player.points}</strong>分</span>
                    <span class="stat-item"><strong>${player.appearances}</strong>场</span>
                    <span class="stat-item"><strong>${getWinRate(player)}%</strong>胜率</span>
                    <span class="stat-item"><strong>${player.bestDebater}</strong>佳辩</span>
                </div>
            `;
        };

        let html = '';

        // 冠军
        if (top3[0]) {
            html += `
                <div class="champion-spotlight">
                    <div class="champion-badge">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 3l14 9-14 9V3z"/>
                        </svg>
                    </div>
                    <div class="champion-card stat-card ink-card">
                        <div class="rank-number rank-1">1</div>
                        <div class="champion-info">
                            <h3 class="champion-name">${top3[0].name}</h3>
                            ${getFullStats(top3[0])}
                        </div>
                    </div>
                </div>
            `;
        }

        // 亚军和季军
        if (top3[1] || top3[2]) {
            html += '<div class="podium-row">';
            if (top3[1]) {
                html += `
                    <div class="podium-card rank-2">
                        <div class="rank-number">2</div>
                        <div class="podium-content">
                            <h4>${top3[1].name}</h4>
                            ${getFullStats(top3[1])}
                        </div>
                    </div>
                `;
            }
            if (top3[2]) {
                html += `
                    <div class="podium-card rank-3">
                        <div class="rank-number">3</div>
                        <div class="podium-content">
                            <h4>${top3[2].name}</h4>
                            ${getFullStats(top3[2])}
                        </div>
                    </div>
                `;
            }
            html += '</div>';
        }

        // 其他排名 - 使用可滚动容器
        if (rest.length > 0) {
            html += `
                <div class="ranking-tiers-scroll">
                    <div class="ranking-tiers">
                        <div class="tier-card">
                            <h4>选手排名</h4>
                            <div class="tier-list">
            `;
            rest.forEach((player, index) => {
                html += `
                    <div class="tier-item">
                        <span class="tier-rank">${index + 4}</span>
                        <span class="tier-name">${player.name}</span>
                        <span class="tier-score">${player.points}分</span>
                        <span class="tier-win-rate">${player.appearances}场</span>
                        <span class="tier-win-rate">${getWinRate(player)}%</span>
                        <span class="tier-win-rate">${player.bestDebater}佳辩</span>
                    </div>
                `;
            });
            html += '</div></div></div></div>';
        }

        rankingBracket.innerHTML = html;
    }
}

// ==========================================
// 个人成绩分析功能
// ==========================================

// 获取选手详情数据
function getPlayerDetails(playerName) {
    const records = getMatchRecords();
    const invalidNames = ['无', '对方辩友', '', 'null', 'undefined', '柴宇飞', '周丽君', '待定', 'TBD'];

    if (!playerName || invalidNames.includes(playerName)) {
        return null;
    }

    // 筛选该选手的所有记录
    const playerRecords = records.filter(record => {
        // 检查是否在positions中
        if (record.positions) {
            return Object.values(record.positions).includes(playerName);
        }
        // 检查是否在mockPositions中
        if (record.mockPositions) {
            return Object.values(record.mockPositions).includes(playerName);
        }
        // 检查是否是最佳辩手
        if (record.bestDebater === playerName) return true;
        // 检查是否是工作人员
        if (record.staff === playerName) return true;
        // 检查是否是随评
        if (record.judge === playerName) return true;
        return false;
    });

    if (playerRecords.length === 0) {
        return null;
    }

    // 基本统计
    let appearances = 0;
    let wins = 0;
    let bestDebaterCount = 0;
    let staffCount = 0;  // 其他工作人员
    let judgeCount = 0;   // 执评次数
    const tournaments = new Set();
    const monthlyData = {};
    const positionData = { first: { total: 0, wins: 0 }, second: { total: 0, wins: 0 }, third: { total: 0, wins: 0 }, fourth: { total: 0, wins: 0 } };
    const profileHistory = [];  // 履历记录
    const tournamentAchievements = {};  // 赛事成绩记录

    playerRecords.forEach(record => {
        // 判断胜负
        let isWin = false;
        if (record.result === 'win') {
            isWin = true;
        } else if (record.result === 'loss') {
            isWin = false;
        } else {
            isWin = record.homeScore > record.awayScore;
        }

        const tournamentName = record.tournament || '友谊赛';

        // 统计出场
        if (record.positions && Object.values(record.positions).includes(playerName)) {
            appearances++;
            if (isWin) wins++;

            // 统计辩位
            let playerPosition = '';
            ['first', 'second', 'third', 'fourth'].forEach(pos => {
                if (record.positions[pos] === playerName) {
                    positionData[pos].total++;
                    if (isWin) positionData[pos].wins++;
                    playerPosition = pos;
                }
            });

            // 记录赛事成绩（用于履历）
            // 判断名次：需要从记录中获取，这里简化为记录是否获胜
            const resultRank = isWin ? '胜' : '负';
            if (!tournamentAchievements[tournamentName]) {
                tournamentAchievements[tournamentName] = { rank: resultRank, date: record.date };
            }
        }

        // 统计佳辩
        if (record.bestDebater === playerName) {
            bestDebaterCount++;
        }

        // 统计其他工作人员
        if (record.staff === playerName) {
            staffCount++;
        }

        // 统计执评
        if (record.judge === playerName) {
            judgeCount++;
        }

        // 统计模辩（作为工作人员场次）
        if (record.mockPositions) {
            ['first', 'second', 'third', 'fourth'].forEach(pos => {
                if (record.mockPositions[pos] === playerName) {
                    staffCount++;
                }
            });
        }

        // 统计赛事
        if (record.tournament) {
            tournaments.add(record.tournament);
        }

        // 按年-月统计
        const monthKey = record.date ? record.date.substring(0, 7) : 'unknown';
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { appearances: 0, wins: 0, points: 0 };
        }
        // 只统计出场，不统计执评
        if (record.positions && Object.values(record.positions).includes(playerName)) {
            monthlyData[monthKey].appearances++;
            if (isWin) monthlyData[monthKey].wins++;
            // 该月积分
            monthlyData[monthKey].points += (1 + (isWin ? 1 : 0) + (record.bestDebater === playerName ? 1 : 0));
        }
    });

    // 计算胜率
    const winRate = appearances > 0 ? Math.round((wins / appearances) * 100) : 0;
    // 计算佳辩率
    const bestDebaterRate = appearances > 0 ? Math.round((bestDebaterCount / appearances) * 100) : 0;
    // 计算积分
    const points = appearances + wins + bestDebaterCount + (staffCount * 0.5) + (judgeCount * 1);

    // 按日期排序履历（最新在前）
    profileHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 生成完整月份序列（从最初有成绩的月份到现在）
    const sortedMonths = Object.keys(monthlyData).sort();
    let firstMonth = sortedMonths[0] || '2024-01';
    const now = new Date();
    const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    const fullMonthSequence = [];
    let current = firstMonth;
    while (current <= currentMonth) {
        fullMonthSequence.push(current);
        // 下一个月
        const [year, month] = current.split('-');
        const nextMonth = parseInt(month) + 1;
        if (nextMonth > 12) {
            current = (parseInt(year) + 1) + '-01';
        } else {
            current = year + '-' + String(nextMonth).padStart(2, '0');
        }
    }

    return {
        name: playerName,
        appearances,
        wins,
        winRate,
        bestDebaterCount,
        bestDebaterRate,
        staffCount,
        judgeCount,
        points,
        tournamentCount: tournaments.size,
        monthlyData,
        fullMonthSequence,
        positionData,
        tournamentAchievements
    };
}

// 初始化选手选择器
function initPlayerSelector() {
    const select = document.getElementById('playerSelect');
    if (!select) return;

    const leaderboard = calculateLeaderboard();
    select.innerHTML = '<option value="">-- 请选择选手 --</option>';

    leaderboard.forEach(player => {
        const option = document.createElement('option');
        option.value = player.name;
        option.textContent = `${player.name} (${player.points}分)`;
        select.appendChild(option);
    });

    // 添加选择事件
    select.addEventListener('change', function() {
        const playerName = this.value;
        if (playerName) {
            renderPlayerAnalysis(playerName);
        } else {
            clearPlayerAnalysis();
        }
    });
}

// 渲染选手分析图表
function renderPlayerAnalysis(playerName) {
    const playerData = getPlayerDetails(playerName);
    if (!playerData) {
        alert('未找到该选手的数据');
        return;
    }

    // 渲染各个图表
    drawPlayerRadarChart(playerData);
    drawPlayerPointsTrendChart(playerData);
    drawPlayerWinRateTrendChart(playerData);
    drawPlayerPositionChart(playerData);

    // 初始化年份选择器
    initYearSelectors(playerData);
    drawPlayerMonthlyActivityChart(playerData);
}

// 初始化所有年份选择器
function initYearSelectors(playerData) {
    // 提取所有年份
    const years = new Set();
    if (playerData.monthlyData) {
        Object.keys(playerData.monthlyData).forEach(month => {
            years.add(month.substring(0, 4));
        });
    }
    const sortedYears = Array.from(years).sort().reverse();

    // 积分趋势年份选择器
    const pointsSelect = document.getElementById('pointsYearSelect');
    if (pointsSelect) {
        pointsSelect.innerHTML = '<option value="">全部</option>';
        sortedYears.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year + '年';
            pointsSelect.appendChild(option);
        });
        pointsSelect.onchange = function() {
            drawPlayerPointsTrendChart(playerData, this.value);
        };
    }

    // 胜率趋势年份选择器
    const winRateSelect = document.getElementById('winRateYearSelect');
    if (winRateSelect) {
        winRateSelect.innerHTML = '<option value="">全部</option>';
        sortedYears.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year + '年';
            winRateSelect.appendChild(option);
        });
        winRateSelect.onchange = function() {
            drawPlayerWinRateTrendChart(playerData, this.value);
        };
    }

    // 月度活跃度年份选择器
    const monthlySelect = document.getElementById('monthlyYearSelect');
    if (monthlySelect) {
        monthlySelect.innerHTML = '<option value="">全部</option>';
        sortedYears.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year + '年';
            monthlySelect.appendChild(option);
        });
        monthlySelect.onchange = function() {
            drawPlayerMonthlyActivityChart(playerData, this.value);
        };
    }
}

// 清空选手分析
function clearPlayerAnalysis() {
    const chartIds = [
        'playerRadarChart',
        'playerPointsTrendChart',
        'playerWinRateTrendChart',
        'playerPositionChart',
        'playerMonthlyActivityChart'
    ];

    chartIds.forEach(id => {
        const ctx = document.getElementById(id);
        if (ctx) {
            ctx.style.display = 'none';
        }
    });

    // 清空年份选择器
    const yearSelectIds = ['pointsYearSelect', 'winRateYearSelect', 'monthlyYearSelect'];
    yearSelectIds.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.innerHTML = '<option value="">全部</option>';
        }
    });
}

// 五维雷达图
function drawPlayerRadarChart(playerData) {
    const ctx = document.getElementById('playerRadarChart');
    if (!ctx) return;

    ctx.style.display = 'block';

    // 销毁旧实例
    if (chartInstances.playerRadarChart) {
        chartInstances.playerRadarChart.destroy();
    }

    // 归一化数据（0-100）
    const maxAppearances = 50;
    const maxBestDebater = 20;
    const maxStaff = 10;
    const maxJudge = 20;

    chartInstances.playerRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['出场次数', '胜率', '佳辩数', '工作场次', '执评次数'],
            datasets: [{
                label: playerData.name,
                data: [
                    Math.min(playerData.appearances / maxAppearances * 100, 100),
                    playerData.winRate,
                    Math.min(playerData.bestDebaterCount / maxBestDebater * 100, 100),
                    Math.min(playerData.staffCount / maxStaff * 100, 100),
                    Math.min(playerData.judgeCount / maxJudge * 100, 100)
                ],
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: '#6366F1',
                borderWidth: 2,
                pointBackgroundColor: '#6366F1',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}

// 积分趋势图
function drawPlayerPointsTrendChart(playerData, selectedYear) {
    const ctx = document.getElementById('playerPointsTrendChart');
    if (!ctx) return;

    ctx.style.display = 'block';

    if (chartInstances.playerPointsTrendChart) {
        chartInstances.playerPointsTrendChart.destroy();
    }

    let months = playerData.fullMonthSequence || playerData.sortedMonths;

    // 如果选择了年份，筛选该年份的月份
    if (selectedYear) {
        months = months.filter(m => m.startsWith(selectedYear));
    }

    // 按年份分组数据
    const yearlyData = {};
    let cumulativePoints = 0;

    months.forEach(month => {
        const year = month.substring(0, 4);
        if (!yearlyData[year]) {
            yearlyData[year] = [];
        }

        const monthData = playerData.monthlyData[month];
        if (monthData) {
            cumulativePoints += monthData.points;
        }
        yearlyData[year].push(cumulativePoints);
    });

    // 颜色配置
    const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444'];

    // 构建数据集
    const datasets = Object.entries(yearlyData).map(([year, data], index) => ({
        label: year + '年',
        data: data,
        borderColor: colors[index % colors.length],
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 2,
        fill: false
    }));

    // 获取x轴标签（只显示每月的后两位）
    const labels = months.map(m => m.substring(5));

    chartInstances.playerPointsTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 胜率趋势图
function drawPlayerWinRateTrendChart(playerData, selectedYear) {
    const ctx = document.getElementById('playerWinRateTrendChart');
    if (!ctx) return;

    ctx.style.display = 'block';

    if (chartInstances.playerWinRateTrendChart) {
        chartInstances.playerWinRateTrendChart.destroy();
    }

    let months = playerData.fullMonthSequence || playerData.sortedMonths;

    // 如果选择了年份，筛选该年份的月份
    if (selectedYear) {
        months = months.filter(m => m.startsWith(selectedYear));
    }

    // 按年份分组数据
    const yearlyData = {};
    let totalWins = 0;
    let totalAppearances = 0;

    months.forEach(month => {
        const year = month.substring(0, 4);
        if (!yearlyData[year]) {
            yearlyData[year] = [];
        }

        const monthData = playerData.monthlyData[month];
        if (monthData) {
            totalWins += monthData.wins;
            totalAppearances += monthData.appearances;
        }
        yearlyData[year].push(totalAppearances > 0 ? Math.round((totalWins / totalAppearances) * 100) : 0);
    });

    // 颜色配置
    const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444'];

    // 构建数据集
    const datasets = Object.entries(yearlyData).map(([year, data], index) => ({
        label: year + '年',
        data: data,
        borderColor: colors[index % colors.length],
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 2,
        fill: false
    }));

    // 获取x轴标签
    const labels = months.map(m => m.substring(5));

    chartInstances.playerWinRateTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: value => value + '%'
                    }
                }
            }
        }
    });
}

// 赛事分布饼图
// 绘制个人履历列表
function drawPlayerProfileList(playerData) {
    const container = document.getElementById('playerProfileList');
    if (!container) return;

    if (!playerData.tournamentAchievements || Object.keys(playerData.tournamentAchievements).length === 0) {
        container.innerHTML = '<p class="profile-empty">暂无履历数据</p>';
        return;
    }

    let html = '<div class="profile-items">';

    // 转换为数组并按日期排序
    const achievements = Object.entries(playerData.tournamentAchievements)
        .map(([tournament, data]) => ({ tournament, rank: data.rank, date: data.date }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    achievements.forEach(item => {
        const rankClass = item.rank === '胜' ? 'win' : 'loss';
        html += '<div class="profile-item">';
        html += '<div class="profile-tournament">' + item.tournament + '</div>';
        html += '<div class="profile-result ' + rankClass + '">' + item.rank + '</div>';
        html += '</div>';
    });

    html += '</div>';
    container.innerHTML = html;
}

// 辩位表现柱状图
function drawPlayerPositionChart(playerData) {
    const ctx = document.getElementById('playerPositionChart');
    if (!ctx) return;

    ctx.style.display = 'block';

    if (chartInstances.playerPositionChart) {
        chartInstances.playerPositionChart.destroy();
    }

    const positions = ['first', 'second', 'third', 'fourth'];
    const positionLabels = ['一辩', '二辩', '三辩', '四辩'];
    const winRates = positions.map(pos => {
        const data = playerData.positionData[pos];
        return data.total > 0 ? Math.round((data.wins / data.total) * 100) : 0;
    });

    chartInstances.playerPositionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: positionLabels,
            datasets: [{
                label: '胜率',
                data: winRates,
                backgroundColor: [
                    'rgba(99, 102, 241, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(239, 68, 68, 0.7)'
                ],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: value => value + '%'
                    }
                }
            }
        }
    });
}

// 月度活跃度柱状图
function drawPlayerMonthlyActivityChart(playerData, selectedYear) {
    const ctx = document.getElementById('playerMonthlyActivityChart');
    if (!ctx) return;

    ctx.style.display = 'block';

    if (chartInstances.playerMonthlyActivityChart) {
        chartInstances.playerMonthlyActivityChart.destroy();
    }

    // 筛选月份数据
    let months = playerData.fullMonthSequence || playerData.sortedMonths;
    if (selectedYear) {
        months = months.filter(m => m.startsWith(selectedYear));
    }

    const activityData = months.map(month => {
        return playerData.monthlyData[month] ? playerData.monthlyData[month].appearances : 0;
    });

    // x轴标签只显示月份
    const labels = months.map(m => m.substring(5));

    chartInstances.playerMonthlyActivityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '出场次数',
                data: activityData,
                backgroundColor: 'rgba(139, 92, 246, 0.7)',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// 渲染比赛记录列表
function renderMatchRecords(sortType = 'desc') {
    let records = getMatchRecords();
    const grid = document.querySelector('.paper-matches-grid');

    if (!grid) return;

    // 排序处理
    if (sortType === 'asc') {
        // 时间正序
        records.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortType === 'desc') {
        // 时间倒序（默认）
        records.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortType === 'by-tournament') {
        // 按赛事分组排序
        records.sort((a, b) => {
            if (a.tournament === b.tournament) {
                return new Date(b.date) - new Date(a.date);
            }
            return a.tournament.localeCompare(b.tournament);
        });
    }

    // 保留第一张卡片（纸质风格），更新其他卡片
    const existingCards = grid.querySelectorAll('.match-card');
    existingCards.forEach(card => card.remove());

    // 添加存储的记录
    records.forEach(record => {
        // 如果有赛果字段则使用，否则根据比分判断
        let resultText = '-';
        if (record.result === 'win') {
            isWinner = true;
            resultText = '胜';
        } else if (record.result === 'loss') {
            isWinner = false;
            resultText = '负';
        } else {
            isWinner = record.homeScore > record.awayScore;
            resultText = record.homeScore > record.awayScore ? '胜' : (record.homeScore < record.awayScore ? '负' : '-');
        }

        const card = document.createElement('div');
        card.className = 'match-card';
        card.dataset.id = record.id;
        card.innerHTML = `
            <div class="match-header">
                <span class="match-date">${record.date}</span>
                <span class="match-type">${record.tournament || '友谊赛'}</span>
                ${record.stage ? `<span class="match-stage">${record.stage}</span>` : ''}
                <div class="card-actions">
                    <button class="action-btn edit-btn" title="编辑" onclick="editMatchRecord(${record.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn delete-btn" title="删除" onclick="deleteMatchRecord(${record.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="match-teams">
                <div class="team team-home">
                    <div class="team-info">
                        <h4>${record.homeTeam}</h4>
                    </div>
                    <div class="team-score">${record.homeScore}</div>
                </div>
                <div class="match-vs">VS</div>
                <div class="team team-away">
                    <div class="team-info">
                        <h4>${record.awayTeam}</h4>
                    </div>
                    <div class="team-score">${record.awayScore}</div>
                </div>
            </div>
            <div class="match-footer">
                <span class="match-result ${resultText === '胜' ? 'winner' : (resultText === '负' ? 'loser' : '')}">${resultText}</span>
                <button class="expand-btn btn btn-outline">展开详情</button>
            </div>
            <div class="match-details" style="display: none;">
                <div class="topic-section">
                    <blockquote class="match-topic">${record.topic || '暂无辩题'}</blockquote>
                </div>
                ${record.profile ? `
                <div class="profile-section">
                    <span>🏅 履历: ${record.profile}</span>
                </div>
                ` : ''}
                ${record.staff ? `
                <div class="staff-section">
                    <span>👤 工作人员: ${record.staff}</span>
                </div>
                ` : ''}
                ${record.bestDebater ? `
                <div class="best-debater-section">
                    <span>🏆 最佳辩手: ${record.bestDebater}</span>
                </div>
                ` : ''}
                <div class="position-distribution">
                    <h4>辩位分布</h4>
                    <div class="position-grid">
                        <div class="position-item">
                            <span class="position-label">一辩:</span>
                            <span class="position-value">${record.positions?.first || '-'}</span>
                        </div>
                        <div class="position-item">
                            <span class="position-label">二辩:</span>
                            <span class="position-value">${record.positions?.second || '-'}</span>
                        </div>
                        <div class="position-item">
                            <span class="position-label">三辩:</span>
                            <span class="position-value">${record.positions?.third || '-'}</span>
                        </div>
                        <div class="position-item">
                            <span class="position-label">四辩:</span>
                            <span class="position-value">${record.positions?.fourth || '-'}</span>
                        </div>
                    </div>
                </div>
                ${record.mockPositions ? `
                <div class="detail-section">
                    <h4>模辩分布</h4>
                    <div class="position-grid">
                        <div class="position-item">
                            <span class="position-label">模辩一辩:</span>
                            <span class="position-value">${record.mockPositions?.first || '-'}</span>
                        </div>
                        <div class="position-item">
                            <span class="position-label">模辩二辩:</span>
                            <span class="position-value">${record.mockPositions?.second || '-'}</span>
                        </div>
                        <div class="position-item">
                            <span class="position-label">模辩三辩:</span>
                            <span class="position-value">${record.mockPositions?.third || '-'}</span>
                        </div>
                        <div class="position-item">
                            <span class="position-label">模辩四辩:</span>
                            <span class="position-value">${record.mockPositions?.fourth || '-'}</span>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        // 添加展开/收起功能
        const expandBtn = card.querySelector('.expand-btn');
        const details = card.querySelector('.match-details');
        expandBtn.addEventListener('click', () => {
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
            expandBtn.textContent = details.style.display === 'none' ? '展开详情' : '收起详情';
        });

        grid.appendChild(card);
    });
}

// 渲染财务记录表格
function renderFinanceRecords() {
    const records = getFinanceRecords();
    const tbody = document.querySelector('.transaction-table tbody');

    if (!tbody) return;

    tbody.innerHTML = records.map(record => `
        <tr data-id="${record.id}">
            <td>${record.date}</td>
            <td>${record.project}</td>
            <td><span class="category ${record.category}">${record.category === 'income' ? '收入' : '支出'}</span></td>
            <td class="amount ${record.category}">${record.category === 'income' ? '+' : '-'}¥${parseFloat(record.amount).toLocaleString()}</td>
            <td><span class="status completed">已完成</span></td>
            <td class="table-actions">
                <button class="action-btn edit-btn" title="编辑" onclick="editFinanceRecord(${record.id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button class="action-btn delete-btn" title="删除" onclick="deleteFinanceRecord(${record.id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');
}

// 赛果管理 - 手动添加按钮
function setupMatchFormHandlers() {
    const addBtn = document.getElementById('addMatchBtn');
    const cancelBtn = document.getElementById('cancelMatchBtn');
    const formContainer = document.getElementById('addMatchForm');
    const form = document.getElementById('matchForm');
    const deleteAllBtn = document.getElementById('deleteAllMatchBtn');

    if (!addBtn || !formContainer) return;

    // 一键删除所有记录
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', deleteAllMatchRecords);
    }

    // 显示/隐藏表单
    addBtn.addEventListener('click', () => {
        formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
    });

    cancelBtn.addEventListener('click', () => {
        formContainer.style.display = 'none';
        form.reset();
    });

    // 表单提交
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const record = {
            date: formData.get('matchDate'),
            tournament: formData.get('tournament'),
            stage: formData.get('stage'),
            profile: formData.get('profile'),
            homeTeam: formData.get('homeTeam'),
            awayTeam: formData.get('awayTeam'),
            homeScore: parseInt(formData.get('homeScore')),
            awayScore: parseInt(formData.get('awayScore')),
            bestDebater: formData.get('bestDebater'),
            staff: formData.get('staff'),
            judge: formData.get('judge'),
            result: formData.get('result'),
            topic: formData.get('topic'),
            positions: {
                first: formData.get('firstDebater'),
                second: formData.get('secondDebater'),
                third: formData.get('thirdDebater'),
                fourth: formData.get('fourthDebater')
            },
            mockPositions: {
                first: formData.get('mockFirst'),
                second: formData.get('mockSecond'),
                third: formData.get('mockThird'),
                fourth: formData.get('mockFourth')
            }
        };

        addMatchRecord(record);
        updateDashboard();
        renderMatchRecords();

        // 重置并隐藏表单
        form.reset();
        formContainer.style.display = 'none';

        alert('比赛记录添加成功！');
    });
}

// 财务管理 - 手动添加按钮
function setupFinanceFormHandlers() {
    const addBtn = document.getElementById('addFinanceBtn');
    const cancelBtn = document.getElementById('cancelFinanceBtn');
    const formContainer = document.getElementById('addFinanceForm');
    const form = document.getElementById('financeForm');

    if (!addBtn || !formContainer) return;

    // 显示/隐藏表单
    addBtn.addEventListener('click', () => {
        formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
    });

    cancelBtn.addEventListener('click', () => {
        formContainer.style.display = 'none';
        form.reset();
    });

    // 表单提交
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const record = {
            date: formData.get('financeDate'),
            project: formData.get('project'),
            category: formData.get('category'),
            amount: parseFloat(formData.get('amount')),
            remark: formData.get('remark')
        };

        addFinanceRecord(record);
        updateDashboard();
        renderFinanceRecords();

        // 重置并隐藏表单
        form.reset();
        formContainer.style.display = 'none';

        alert('财务记录添加成功！');
    });
}

// 模糊匹配表头列索引
function findColumnIndex(headers, possibleNames) {
    // possibleNames: 数组，包含所有可能的表头名称（不区分大小写，支持部分匹配）
    for (const name of possibleNames) {
        const normalizedName = name.toString().toLowerCase().trim();
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i].toString().toLowerCase().trim();
            // 完全匹配
            if (header === normalizedName) return i;
            // 包含匹配（用于匹配"比赛日期"包含"日期"等）
            if (header.includes(normalizedName) || normalizedName.includes(header)) return i;
        }
    }
    return -1;
}

// Excel上传处理 - 比赛记录
function setupMatchExcelUpload() {
    const fileInput = document.getElementById('matchExcelUpload');

    if (!fileInput) return;

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array', bookVBA: true });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                // 解析Excel数据（假设第一行是表头）
                if (jsonData.length < 2) {
                    alert('Excel文件为空或格式不正确');
                    return;
                }

                const headers = jsonData[0].map(h => h.toString().toLowerCase());
                let addedCount = 0;

                // 定义各字段的可能表头名称（按优先级排序）
                const dateHeaders = ['日期', '比赛日期', '时间', '时间日期', 'date'];
                const tournamentHeaders = ['赛事', '赛事名称', '比赛名称', '类型', 'tournament'];
                const stageHeaders = ['赛段', '阶段', '环节', 'stage'];  // 赛段
                const profileHeaders = ['履历', '荣誉', 'profile'];  // 履历
                const sideHeaders = ['持方', '立场', 'side'];  // 正/反
                const opponentHeaders = ['正方', '对阵', '对手', 'opponent'];  // 对阵队伍
                const scoreHeaders = ['比分', 'score'];  // 4:5 或 四比五 格式
                const homeScoreHeaders = ['正方比分', '主队得分', '主队比分', '得分', 'homescore'];
                const awayScoreHeaders = ['反方比分', '客队得分', '客队比分', 'awayscore'];
                const bestDebaterHeaders = ['最佳辩手', '佳辩', '最佳', 'bestdebater'];
                const staffHeaders = ['工作人员', '主计', '领队', 'staff'];  // 工作人员
                const topicHeaders = ['辩题', '题目', '话题', 'topic'];
                const resultHeaders = ['赛果', '结果', '胜负', 'result'];  // 胜/负
                const firstPosHeaders = ['一辩', '正赛一辩', 'first'];
                const secondPosHeaders = ['二辩', '正赛二辩', 'second'];
                const thirdPosHeaders = ['三辩', '正赛三辩', 'third'];
                const fourthPosHeaders = ['四辩', '正赛四辩', 'fourth'];
                const mockFirstHeaders = ['模辩一辩', '模一', 'mockfirst'];
                const mockSecondHeaders = ['模辩二辩', '模二', 'mocksecond'];
                const mockThirdHeaders = ['模辩三辩', '模三', 'mockthird'];
                const mockFourthHeaders = ['模辩四辩', '模四', 'mockfourth'];
                const judgeHeaders = ['随评', '执评', '评委', 'judge'];  // 随评

                // 解析比分字符串，返回 {homeScore, awayScore}
                function parseScore(scoreStr) {
                    console.log('原始比分值:', scoreStr, typeof scoreStr);

                    if (!scoreStr) return { homeScore: 0, awayScore: 0 };

                    // 处理Excel可能返回的数字格式
                    if (typeof scoreStr === 'number') {
                        return { homeScore: 0, awayScore: 0 };
                    }

                    let str = scoreStr.toString().trim();
                    if (!str) return { homeScore: 0, awayScore: 0 };

                    console.log('处理前字符串:', str);

                    // 用正则提取所有数字（最简单可靠的方法）
                    const numbers = str.match(/\d+/g);
                    console.log('提取的数字:', numbers);

                    if (numbers && numbers.length >= 2) {
                        return {
                            homeScore: parseInt(numbers[0]) || 0,
                            awayScore: parseInt(numbers[1]) || 0
                        };
                    } else if (numbers && numbers.length === 1) {
                        return { homeScore: parseInt(numbers[0]) || 0, awayScore: 0 };
                    }

                    return { homeScore: 0, awayScore: 0 };
                }

                // 解析日期
                function parseDate(dateValue) {
                    if (!dateValue) return new Date().toISOString().split('T')[0];

                    // 如果已经是日期格式字符串
                    if (typeof dateValue === 'string') {
                        const trimmed = dateValue.trim();
                        // 尝试解析各种日期格式
                        const date = new Date(trimmed);
                        if (!isNaN(date.getTime())) {
                            return date.toISOString().split('T')[0];
                        }
                        // 处理 Excel 可能的日期格式如 2024/3/15
                        const parts = trimmed.split(/[/\-_]/);
                        if (parts.length === 3) {
                            const year = parseInt(parts[0]);
                            const month = parseInt(parts[1]);
                            const day = parseInt(parts[2]);
                            if (year > 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                                // 判断是 Y/M/D 还是 D/M/Y
                                if (year > 31) {
                                    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                } else if (day > 31) {
                                    return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
                                }
                            }
                        }
                    }

                    // 处理 Excel 数字日期格式
                    if (typeof dateValue === 'number') {
                        // Excel 日期序列数（从1900-01-01开始）
                        const excelEpoch = new Date(1899, 11, 30);
                        const date = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
                        if (!isNaN(date.getTime())) {
                            return date.toISOString().split('T')[0];
                        }
                    }

                    return new Date().toISOString().split('T')[0];
                }

                // 解析赛果，返回 win/loss
                function parseResult(resultStr) {
                    if (!resultStr) return '';
                    const str = resultStr.toString().toLowerCase().trim();
                    if (str.includes('胜') || str.includes('赢') || str === 'win' || str === 'w') return 'win';
                    if (str.includes('负') || str.includes('输') || str === 'loss' || str === 'l') return 'loss';
                    return '';
                }

                // 使用模糊匹配获取各列索引（只需获取一次）
                const dateIdx = findColumnIndex(headers, dateHeaders);
                const tournamentIdx = findColumnIndex(headers, tournamentHeaders);
                const stageIdx = findColumnIndex(headers, stageHeaders);
                const profileIdx = findColumnIndex(headers, profileHeaders);
                const sideIdx = findColumnIndex(headers, sideHeaders);
                const opponentIdx = findColumnIndex(headers, opponentHeaders);
                const scoreIdx = findColumnIndex(headers, scoreHeaders);
                const homeScoreIdx = findColumnIndex(headers, homeScoreHeaders);
                const awayScoreIdx = findColumnIndex(headers, awayScoreHeaders);
                const bestDebaterIdx = findColumnIndex(headers, bestDebaterHeaders);
                const staffIdx = findColumnIndex(headers, staffHeaders);
                const topicIdx = findColumnIndex(headers, topicHeaders);
                const resultIdx = findColumnIndex(headers, resultHeaders);
                const firstPosIdx = findColumnIndex(headers, firstPosHeaders);
                const secondPosIdx = findColumnIndex(headers, secondPosHeaders);
                const thirdPosIdx = findColumnIndex(headers, thirdPosHeaders);
                const fourthPosIdx = findColumnIndex(headers, fourthPosHeaders);
                const mockFirstIdx = findColumnIndex(headers, mockFirstHeaders);
                const mockSecondIdx = findColumnIndex(headers, mockSecondHeaders);
                const mockThirdIdx = findColumnIndex(headers, mockThirdHeaders);
                const mockFourthIdx = findColumnIndex(headers, mockFourthHeaders);
                const judgeIdx = findColumnIndex(headers, judgeHeaders);

                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!row[0]) continue; // 跳过空行

                    // 根据持方判断正反方
                    let homeTeam = '正方';
                    let awayTeam = '反方';
                    const sideValue = sideIdx >= 0 ? row[sideIdx]?.toString().trim() : '';
                    const opponent = opponentIdx >= 0 ? row[opponentIdx] : '';

                    if (sideValue === '正') {
                        // AAU是正方
                        homeTeam = 'AAU辩论队';
                        awayTeam = opponent || '反方';
                    } else if (sideValue === '反') {
                        // AAU是反方
                        homeTeam = opponent || '正方';
                        awayTeam = 'AAU辩论队';
                    }

                    // 解析比分
                    let homeScore = 0, awayScore = 0;
                    if (scoreIdx >= 0) {
                        const scoreObj = parseScore(row[scoreIdx]);
                        homeScore = scoreObj.homeScore;
                        awayScore = scoreObj.awayScore;
                    } else {
                        // 兼容旧格式：分别读取正方比分和反方比分
                        homeScore = homeScoreIdx >= 0 ? parseInt(row[homeScoreIdx]) || 0 : 0;
                        awayScore = awayScoreIdx >= 0 ? parseInt(row[awayScoreIdx]) || 0 : 0;
                    }

                    // 解析赛果
                    const result = resultIdx >= 0 ? parseResult(row[resultIdx]) : '';

                    const record = {
                        date: dateIdx >= 0 ? parseDate(row[dateIdx]) : new Date().toISOString().split('T')[0],
                        tournament: tournamentIdx >= 0 ? row[tournamentIdx] : '友谊赛',
                        stage: stageIdx >= 0 ? row[stageIdx] : '',
                        profile: profileIdx >= 0 ? row[profileIdx] : '',
                        homeTeam: homeTeam,
                        awayTeam: awayTeam,
                        homeScore: homeScore,
                        awayScore: awayScore,
                        bestDebater: bestDebaterIdx >= 0 ? row[bestDebaterIdx] : '',
                        staff: staffIdx >= 0 ? row[staffIdx] : '',  // 工作人员
                        topic: topicIdx >= 0 ? row[topicIdx] : '',
                        result: result,  // 赛果：win/loss
                        judge: judgeIdx >= 0 ? row[judgeIdx] : '',  // 随评
                        positions: {
                            first: firstPosIdx >= 0 ? row[firstPosIdx] : '',
                            second: secondPosIdx >= 0 ? row[secondPosIdx] : '',
                            third: thirdPosIdx >= 0 ? row[thirdPosIdx] : '',
                            fourth: fourthPosIdx >= 0 ? row[fourthPosIdx] : ''
                        },
                        mockPositions: {
                            first: mockFirstIdx >= 0 ? row[mockFirstIdx] : '',
                            second: mockSecondIdx >= 0 ? row[mockSecondIdx] : '',
                            third: mockThirdIdx >= 0 ? row[mockThirdIdx] : '',
                            fourth: mockFourthIdx >= 0 ? row[mockFourthIdx] : ''
                        }
                    };

                    addMatchRecord(record);
                    addedCount++;
                }

                updateDashboard();
                renderMatchRecords();

                // 统计各字段匹配情况
                const totalRows = jsonData.length - 1;
                const skippedRows = totalRows - addedCount;
                const dateMatched = dateIdx >= 0 ? '日期' : '日期(未匹配)';
                const tournamentMatched = tournamentIdx >= 0 ? '赛事' : '赛事(未匹配)';
                const sideMatched = sideIdx >= 0 ? '持方' : '持方(未匹配)';
                const scoreMatched = scoreIdx >= 0 ? '比分' : (homeScoreIdx >= 0 || awayScoreIdx >= 0 ? '正方/反方比分' : '比分(未匹配)');
                const resultMatched = resultIdx >= 0 ? '赛果' : '赛果(未匹配)';
                const staffMatched = staffIdx >= 0 ? '工作人员' : '工作人员(未匹配)';
                const profileMatched = profileIdx >= 0 ? '履历' : '履历(未匹配)';

                let message = `成功导入 ${addedCount} 条比赛记录！`;
                if (skippedRows > 0) {
                    message += `\n跳过了 ${skippedRows} 行空行`;
                }
                message += `\n\n字段匹配情况：`;
                message += `\n- ${dateMatched}`;
                message += `\n- ${tournamentMatched}`;
                message += `\n- ${profileMatched}`;
                message += `\n- ${sideMatched}`;
                message += `\n- ${scoreMatched}`;
                message += `\n- ${resultMatched}`;
                message += `\n- ${staffMatched}`;

                alert(message);

            } catch (error) {
                console.error('Excel解析错误:', error);
                alert('Excel文件解析失败，请检查格式\n错误信息: ' + error.message);
            }
        };
        reader.readAsArrayBuffer(file);

        // 清空文件输入，以便再次选择同一文件
        fileInput.value = '';
    });
}

// Excel上传处理 - 财务记录
function setupFinanceExcelUpload() {
    const fileInput = document.getElementById('financeExcelUpload');

    if (!fileInput) return;

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array', bookVBA: true });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                // 解析Excel数据（假设第一行是表头）
                if (jsonData.length < 2) {
                    alert('Excel文件为空或格式不正确');
                    return;
                }

                const headers = jsonData[0].map(h => h.toString().toLowerCase());
                let addedCount = 0;

                // 定义各字段的可能表头名称（按优先级排序）
                const dateHeaders = ['日期', '比赛日期', '时间', '时间日期', 'date'];
                const projectHeaders = ['项目', '项目名称', '名称', 'project'];
                const categoryHeaders = ['分类', '类别', 'type', 'category'];
                const amountHeaders = ['金额', '数额', '数量', 'amount'];
                const remarkHeaders = ['备注', '说明', 'remark', 'note'];

                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!row[0]) continue; // 跳过空行

                    // 使用模糊匹配获取各列索引
                    const dateIdx = findColumnIndex(headers, dateHeaders);
                    const projectIdx = findColumnIndex(headers, projectHeaders);
                    const categoryIdx = findColumnIndex(headers, categoryHeaders);
                    const amountIdx = findColumnIndex(headers, amountHeaders);
                    const remarkIdx = findColumnIndex(headers, remarkHeaders);

                    const categoryValue = categoryIdx >= 0 ? row[categoryIdx] : '';
                    const category = categoryValue.toString().includes('收') || categoryValue.toString().includes('支')
                        ? (categoryValue.toString().includes('收') ? 'income' : 'expense')
                        : (categoryValue.toString().toLowerCase().includes('income') ? 'income' : 'expense');

                    const record = {
                        date: dateIdx >= 0 ? parseDate(row[dateIdx]) : new Date().toISOString().split('T')[0],
                        project: projectIdx >= 0 ? row[projectIdx] : '未命名',
                        category: category,
                        amount: amountIdx >= 0 ? parseFloat(row[amountIdx]) || 0 : 0,
                        remark: remarkIdx >= 0 ? row[remarkIdx] : ''
                    };

                    addFinanceRecord(record);
                    addedCount++;
                }

                updateDashboard();
                renderFinanceRecords();
                alert(`成功导入 ${addedCount} 条财务记录！`);

            } catch (error) {
                console.error('Excel解析错误:', error);
                alert('Excel文件解析失败，请检查格式');
            }
        };
        reader.readAsArrayBuffer(file);

        // 清空文件输入，以便再次选择同一文件
        fileInput.value = '';
    });
}

// ==========================================
// 编辑和删除功能
// ==========================================

// 编辑比赛记录
function editMatchRecord(id) {
    const records = getMatchRecords();
    const record = records.find(r => r.id === id);
    if (!record) return;

    // 填充表单数据
    const form = document.getElementById('matchForm');
    form.matchDate.value = record.date;
    form.tournament.value = record.tournament || '';
    form.homeTeam.value = record.homeTeam || '';
    form.awayTeam.value = record.awayTeam || '';
    form.homeScore.value = record.homeScore || 0;
    form.awayScore.value = record.awayScore || 0;
    form.bestDebater.value = record.bestDebater || '';
    form.goodDebater.value = record.goodDebater || '';
    form.topic.value = record.topic || '';
    form.firstDebater.value = record.positions?.first || '';
    form.secondDebater.value = record.positions?.second || '';
    form.thirdDebater.value = record.positions?.third || '';
    form.fourthDebater.value = record.positions?.fourth || '';
    form.mockFirst.value = record.mockPositions?.first || '';
    form.mockSecond.value = record.mockPositions?.second || '';
    form.mockThird.value = record.mockPositions?.third || '';
    form.mockFourth.value = record.mockPositions?.fourth || '';
    form.judge.value = record.judge || '';

    // 修改表单提交处理为更新
    const originalSubmitHandler = form.onsubmit;
    form.onsubmit = function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const updatedRecord = {
            id: id,
            date: formData.get('matchDate'),
            tournament: formData.get('tournament'),
            homeTeam: formData.get('homeTeam'),
            awayTeam: formData.get('awayTeam'),
            homeScore: parseInt(formData.get('homeScore')),
            awayScore: parseInt(formData.get('awayScore')),
            bestDebater: formData.get('bestDebater'),
            goodDebater: formData.get('goodDebater'),
            staff: formData.get('staff'),
            judge: formData.get('judge'),
            topic: formData.get('topic'),
            positions: {
                first: formData.get('firstDebater'),
                second: formData.get('secondDebater'),
                third: formData.get('thirdDebater'),
                fourth: formData.get('fourthDebater')
            },
            mockPositions: {
                first: formData.get('mockFirst'),
                second: formData.get('mockSecond'),
                third: formData.get('mockThird'),
                fourth: formData.get('mockFourth')
            }
        };

        // 更新记录
        const index = records.findIndex(r => r.id === id);
        if (index !== -1) {
            records[index] = updatedRecord;
            saveMatchRecords(records);
            updateDashboard();
            renderMatchRecords();
            alert('比赛记录更新成功！');
        }

        // 恢复表单并隐藏
        form.reset();
        form.onsubmit = originalSubmitHandler;
        document.getElementById('addMatchForm').style.display = 'none';
    };

    // 显示表单
    document.getElementById('addMatchForm').style.display = 'block';
    window.scrollTo({
        top: document.getElementById('addMatchForm').offsetTop - 100,
        behavior: 'smooth'
    });
}

// 删除比赛记录
function deleteMatchRecord(id) {
    if (!confirm('确定要删除这条比赛记录吗？')) return;

    const records = getMatchRecords();
    const filteredRecords = records.filter(r => r.id !== id);
    saveMatchRecords(filteredRecords);

    updateDashboard();
    renderMatchRecords();
    alert('比赛记录已删除');
}

// 一键删除所有比赛记录
function deleteAllMatchRecords() {
    if (!confirm('确定要清空所有比赛记录吗？此操作不可恢复！')) return;

    saveMatchRecords([]);
    updateDashboard();
    renderMatchRecords();
    alert('所有比赛记录已清空');
}

// 编辑财务记录
function editFinanceRecord(id) {
    const records = getFinanceRecords();
    const record = records.find(r => r.id === id);
    if (!record) return;

    // 填充表单数据
    const form = document.getElementById('financeForm');
    form.financeDate.value = record.date;
    form.project.value = record.project || '';
    form.category.value = record.category || '';
    form.amount.value = record.amount || 0;
    form.remark.value = record.remark || '';

    // 修改表单提交处理为更新
    const originalSubmitHandler = form.onsubmit;
    form.onsubmit = function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const updatedRecord = {
            id: id,
            date: formData.get('financeDate'),
            project: formData.get('project'),
            category: formData.get('category'),
            amount: parseFloat(formData.get('amount')),
            remark: formData.get('remark'),
            status: 'completed'
        };

        // 更新记录
        const index = records.findIndex(r => r.id === id);
        if (index !== -1) {
            records[index] = updatedRecord;
            saveFinanceRecords(records);
            updateDashboard();
            renderFinanceRecords();
            alert('财务记录更新成功！');
        }

        // 恢复表单并隐藏
        form.reset();
        form.onsubmit = originalSubmitHandler;
        document.getElementById('addFinanceForm').style.display = 'none';
    };

    // 显示表单
    document.getElementById('addFinanceForm').style.display = 'block';
    window.scrollTo({
        top: document.getElementById('addFinanceForm').offsetTop - 100,
        behavior: 'smooth'
    });
}

// 删除财务记录
function deleteFinanceRecord(id) {
    if (!confirm('确定要删除这条财务记录吗？')) return;

    const records = getFinanceRecords();
    const filteredRecords = records.filter(r => r.id !== id);
    saveFinanceRecords(filteredRecords);

    updateDashboard();
    renderFinanceRecords();
    alert('财务记录已删除');
}

// 初始化所有数据管理功能
function initDataManagement() {
    initializeDefaultData();
    setupMatchFormHandlers();
    setupFinanceFormHandlers();
    setupMatchExcelUpload();
    setupFinanceExcelUpload();
    updateDashboard();
    renderMatchRecords();
    renderFinanceRecords();
    initPlayerSelector();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initDataManagement);