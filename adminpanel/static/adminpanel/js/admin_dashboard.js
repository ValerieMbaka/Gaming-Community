// Admin Dashboard JavaScript
(() => {
    // Dummy data for the dashboard
    const dummyData = {
        kpis: {
            users: 1247,
            communities: 23,
            competitions: 8,
            approvals: 5
        },
        activityData: {
            week: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                users: [45, 52, 38, 67, 89, 76, 92],
                posts: [23, 31, 19, 45, 67, 54, 78],
                communities: [2, 1, 3, 2, 4, 1, 2]
            },
            month: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                users: [234, 267, 298, 312],
                posts: [156, 189, 234, 267],
                communities: [8, 12, 15, 18]
            }
        },
        userGrowth: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [120, 190, 300, 500, 800, 1200]
        }
    };

    // Format numbers with commas
    const formatNumber = (num) => num.toLocaleString();

    // Animate KPI counters
    const animateCounter = (elementId, targetValue) => {
        const element = document.getElementById(elementId);
        if (!element) return;

        let currentValue = 0;
        const increment = targetValue / 50;
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            element.textContent = formatNumber(Math.floor(currentValue));
        }, 30);
    };

    // Initialize KPI counters
    const initializeKPIs = () => {
        animateCounter('kpi-users', dummyData.kpis.users);
        animateCounter('kpi-communities', dummyData.kpis.communities);
        animateCounter('kpi-competitions', dummyData.kpis.competitions);
        animateCounter('kpi-approvals', dummyData.kpis.approvals);
    };

    // Create activity chart
    const createActivityChart = () => {
        const ctx = document.getElementById('activityChart');
        if (!ctx || !window.Chart) return;

        const data = dummyData.activityData.week;
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'New Users',
                        data: data.users,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Posts',
                        data: data.posts,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Communities',
                        data: data.communities,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 2.5,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 8,
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    };

    // Create user growth chart
    const createUserGrowthChart = () => {
        const ctx = document.getElementById('userGrowthChart');
        if (!ctx || !window.Chart) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['New Users', 'Returning Users'],
                datasets: [{
                    data: [dummyData.kpis.users, dummyData.kpis.users * 0.3],
                    backgroundColor: ['#3b82f6', '#e5e7eb'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1.2,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 10
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    };

    // Handle chart period toggle
    const handleChartPeriodToggle = () => {
        const weekRadio = document.getElementById('week');
        const monthRadio = document.getElementById('month');
        
        if (weekRadio) {
            weekRadio.addEventListener('change', () => {
                // Update chart with week data
                console.log('Switched to week view');
            });
        }
        
        if (monthRadio) {
            monthRadio.addEventListener('change', () => {
                // Update chart with month data
                console.log('Switched to month view');
            });
        }
    };

    // Add activity item click handlers
    const initializeActivityItems = () => {
        const activityItems = document.querySelectorAll('.activity-item');
        activityItems.forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                // Add click functionality here
                console.log('Activity item clicked');
            });
        });
    };

    // Initialize dashboard when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for the page to fully load
        setTimeout(() => {
            initializeKPIs();
            createActivityChart();
            createUserGrowthChart();
            handleChartPeriodToggle();
            initializeActivityItems();
        }, 100);
    });

    // Add some interactive effects
    const addInteractiveEffects = () => {
        // Add hover effects to KPI cards
        const kpiCards = document.querySelectorAll('.kpi-card');
        kpiCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });

        // Add click effects to quick action buttons
        const quickActionBtns = document.querySelectorAll('.btn-outline-primary, .btn-outline-success, .btn-outline-warning, .btn-outline-info');
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Add a subtle click animation
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                }, 150);
            });
        });
    };

    // Initialize interactive effects
    document.addEventListener('DOMContentLoaded', addInteractiveEffects);

})();