import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';

import {
  FiUsers,
  FiCalendar,
  FiTrendingUp,
  FiDollarSign,
  FiActivity,
  FiHome,
  FiHeart,
  FiBarChart2,
  FiArrowUp,
  FiArrowDown,
  FiRefreshCw,
  FiSettings,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { state, dispatch } = useData();
  const [localLoading, setLocalLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const statistics = state.dashboard.data;
  const loading = state.dashboard.isLoading || localLoading;

  useEffect(() => {
    // إذا البيانات موجودة مسبقاً ولا تحتاج تحديث، لا تقم بجلبها مجدداً
    if (!statistics) {
      fetchStatistics();
    } else {
      setLastUpdated(state.dashboard.lastUpdated);
    }
  }, []); // [] تعني التشغيل مرة واحدة فقط

  const fetchStatistics = async (forceRefresh = false) => {
    // إذا البيانات موجودة وليست forced refresh، لا تعيد الجلب
    if (statistics && !forceRefresh && !isDataStale()) {
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      setLocalLoading(true);
      
      const token = localStorage.getItem('access_token');

      if (!token) {
        alert('لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.');
        window.location.href = '/login';
        return;
      }

      const response = await fetch('https://shahin-tqay.onrender.com/api/admin/dashboard/statistics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        alert('انتهت جلسة الدخول أو التوكن غير صالح');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return;
      }

 if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          dispatch({ 
            type: 'SET_DASHBOARD_DATA', 
            payload: result.data 
          });
          setLastUpdated(new Date());
        }
      }
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      setLocalLoading(false);
    }
  };
  
    const isDataStale = () => {
    if (!state.dashboard.lastUpdated) return true;
    const now = new Date();
    const lastUpdate = new Date(state.dashboard.lastUpdated);
    const diffInMinutes = (now - lastUpdate) / (1000 * 60);
    return diffInMinutes > 5; // تحديث إذا مرت أكثر من 5 دقائق
  };

  const handleRefresh = () => {
    fetchStatistics(true); // forced refresh
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const renderStatCard = (icon, title, value, growth, subtitle) => {
    const isPositive = growth >= 0;
    const growthClass = isPositive ? 'positive' : 'negative';
    
    return (
      <div className="dashboard-stat-card">
        <div className="dashboard-stat-icon">
          {icon}
        </div>
        <div className="dashboard-stat-content">
          <h3>{formatNumber(value)}</h3>
          <p className="dashboard-stat-title">{title}</p>
          <div className="dashboard-stat-trend">
            <span className={`dashboard-trend-indicator ${growthClass}`}>
              {isPositive ? <FiArrowUp /> : <FiArrowDown />}
              {Math.abs(growth).toFixed(1)}%
            </span>
            <span className="dashboard-stat-subtitle">{subtitle}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderModernChart = (data) => {
    const values = Object.values(data);
    const maxValue = Math.max(...values);
    const total = values.reduce((sum, value) => sum + value, 0);
    
    return (
      <div className="dashboard-modern-chart">
        <div className="dashboard-chart-bars">
          {values.map((value, index) => (
            <div
              key={index}
              className="dashboard-chart-bar-wrapper"
            >
              <div
                className="dashboard-chart-bar"
                style={{
                  height: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%`,
                  backgroundColor: 'var(--primary-color)'
                }}
              >
                <span className="dashboard-chart-value">{value}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="dashboard-chart-info">
          <span className="dashboard-chart-total">المجموع: {formatNumber(total)}</span>
        </div>
      </div>
    );
  };

  const renderDonutChart = (data, title) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    const entries = Object.entries(data);
    
    const colors = [
      'var(--primary-color)',
      'var(--secondary-color)',
      '#2c4d6b',
      '#3a6185',
      '#4a75a0'
    ];
    
    let startAngle = 0;
    const segments = entries.map(([key, value], index) => {
      const percentage = (value / total) * 100;
      const angle = (percentage / 100) * 360;
      const segmentData = {
        key,
        value,
        percentage,
        startAngle,
        endAngle: startAngle + angle,
        color: colors[index % colors.length]
      };
      startAngle += angle;
      return segmentData;
    });

    return (
      <div className="dashboard-donut-chart-container">
        <h4 className="dashboard-donut-title">{title}</h4>
        <div className="dashboard-donut-chart">
          <svg viewBox="0 0 100 100">
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              fill="none" 
              stroke="#f0f0f0" 
              strokeWidth="15"
            />
            {segments.map((segment) => {
              const startRad = (segment.startAngle - 90) * Math.PI / 180;
              const endRad = (segment.endAngle - 90) * Math.PI / 180;
              
              const x1 = 50 + 40 * Math.cos(startRad);
              const y1 = 50 + 40 * Math.sin(startRad);
              const x2 = 50 + 40 * Math.cos(endRad);
              const y2 = 50 + 40 * Math.sin(endRad);
              
              const largeArc = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
              
              return (
                <path 
                  key={segment.key}
                  d={`M 50,50 L ${x1},${y1} A 40,40 0 ${largeArc} 1 ${x2},${y2} Z`}
                  fill={segment.color}
                />
              );
            })}
            <circle cx="50" cy="50" r="25" fill="white" />
            <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="dashboard-donut-text">
              {formatNumber(total)}
            </text>
          </svg>
        </div>
        <div className="dashboard-donut-legend">
          {segments.map(segment => (
            <div className="dashboard-legend-item" key={segment.key}>
              <span className="dashboard-legend-color" style={{ backgroundColor: segment.color }}></span>
              <span className="dashboard-legend-label">{segment.key}</span>
              <span className="dashboard-legend-value">{formatNumber(segment.value)} ({segment.percentage.toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <FiRefreshCw className="dashboard-loading-spinner" />
          <p>جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <FiAlertCircle className="dashboard-error-icon" />
          <p>فشل في تحميل البيانات</p>
          <button onClick={fetchStatistics} className="dashboard-btn-retry">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const { users, auctions, interests, properties, general, charts } = statistics;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1>
            <FiBarChart2 className="dashboard-header-icon" />
            لوحة التحكم والإحصائيات
          </h1>
          <p>نظرة عامة على أداء النظام والأنشطة</p>
        </div>
        <div className="dashboard-header-actions">
          <button onClick={fetchStatistics} className="dashboard-refresh-btn">
            <FiRefreshCw />
            تحديث البيانات
          </button>
          {lastUpdated && (
            <span className="dashboard-last-updated">
              آخر تحديث: {lastUpdated.toLocaleTimeString('ar-SA')}
            </span>
          )}
        </div>
      </div>

      {/* Summary Cards - Single Row */}
      <div className="dashboard-summary-header">
        <h2>الملخص العام</h2>
      </div>

      <div className="dashboard-summary-cards-single-row">
        <div className="dashboard-summary-stat-card dashboard-summary-users">
          <div className="dashboard-summary-stat-icon">
            <FiUsers />
          </div>
          <div className="dashboard-summary-stat-content">
            <h3>{formatNumber(users.total)}</h3>
            <p className="dashboard-summary-stat-title">إجمالي المستخدمين</p>
            <div className="dashboard-summary-stat-trend">
              <span className="dashboard-summary-trend-indicator">
                {calculateGrowth(users.monthly_trend.current_month, users.monthly_trend.last_month) >= 0 ? <FiArrowUp /> : <FiArrowDown />}
                {Math.abs(calculateGrowth(users.monthly_trend.current_month, users.monthly_trend.last_month)).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-summary-stat-card dashboard-summary-auctions">
          <div className="dashboard-summary-stat-icon">
            <FiCalendar />
          </div>
          <div className="dashboard-summary-stat-content">
            <h3>{formatNumber(auctions.total)}</h3>
            <p className="dashboard-summary-stat-title">إجمالي المزادات</p>
            <div className="dashboard-summary-stat-trend">
              <span className="dashboard-summary-trend-indicator">
                <FiTrendingUp />
                {formatNumber(auctions.weekly_auctions)} هذا الأسبوع
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-summary-stat-card dashboard-summary-interests">
          <div className="dashboard-summary-stat-icon">
            <FiHeart />
          </div>
          <div className="dashboard-summary-stat-content">
            <h3>{formatNumber(interests.total)}</h3>
            <p className="dashboard-summary-stat-title">إجمالي الاهتمامات</p>
            <div className="dashboard-summary-stat-trend">
              <span className="dashboard-summary-trend-indicator">
                <FiTrendingUp />
                {formatNumber(interests.recent_month)} هذا الشهر
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-summary-stat-card dashboard-summary-properties">
          <div className="dashboard-summary-stat-icon">
            <FiHome />
          </div>
          <div className="dashboard-summary-stat-content">
            <h3>{formatNumber(properties.total)}</h3>
            <p className="dashboard-summary-stat-title">إجمالي العقارات</p>
            <div className="dashboard-summary-stat-trend">
              <span className="dashboard-summary-trend-indicator">
                <FiTrendingUp />
                {formatNumber(properties.weekly_properties)} هذا الأسبوع
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="dashboard-quick-stats-section">
        {/* <h2 className="dashboard-section-title">إحصائيات سريعة</h2> */}
        <div className="dashboard-quick-stats-grid">
          <div className="dashboard-quick-stat">
            <div className="dashboard-quick-stat-icon dashboard-quick-stat-pending">
              <FiUsers />
            </div>
            <div className="dashboard-quick-stat-content">
              <span className="dashboard-quick-stat-value">{formatNumber(users.pending)}</span>
              <span className="dashboard-quick-stat-label">مستخدم قيد المراجعة</span>
            </div>
          </div>

          <div className="dashboard-quick-stat">
            <div className="dashboard-quick-stat-icon dashboard-quick-stat-active">
              <FiCalendar />
            </div>
            <div className="dashboard-quick-stat-content">
              <span className="dashboard-quick-stat-value">{formatNumber(auctions.active)}</span>
              <span className="dashboard-quick-stat-label">مزاد نشط</span>
            </div>
          </div>

          <div className="dashboard-quick-stat">
            <div className="dashboard-quick-stat-icon dashboard-quick-stat-reviewed">
              <FiHeart />
            </div>
            <div className="dashboard-quick-stat-content">
              <span className="dashboard-quick-stat-value">{formatNumber(interests.reviewed)}</span>
              <span className="dashboard-quick-stat-label">اهتمام تمت مراجعته</span>
            </div>
          </div>

          <div className="dashboard-quick-stat">
            <div className="dashboard-quick-stat-icon dashboard-quick-stat-today">
              <FiTrendingUp />
            </div>
            <div className="dashboard-quick-stat-content">
              <span className="dashboard-quick-stat-value">{formatNumber(general.today_registrations)}</span>
              <span className="dashboard-quick-stat-label">تسجيل اليوم</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="dashboard-charts-section">
        <h2 className="dashboard-section-title">الرسومات البيانية</h2>
        
        <div className="dashboard-charts-row">
          {/* Registration Chart */}
          <div className="dashboard-chart-card">
            <div className="dashboard-chart-header">
              <h3>تسجيلات المستخدمين</h3>
              <span className="dashboard-chart-subtitle">آخر 7 أيام</span>
            </div>
            <div className="dashboard-chart-content">
              {renderModernChart(charts.users_registration_chart)}
            </div>
          </div>

          {/* Auctions Chart */}
          <div className="dashboard-chart-card">
            <div className="dashboard-chart-header">
              <h3>حالة المزادات</h3>
              <span className="dashboard-chart-subtitle">التوزيع الكلي</span>
            </div>
            <div className="dashboard-chart-content">
              {renderDonutChart(charts.auctions_status_chart, 'توزيع المزادات حسب الحالة')}
            </div>
          </div>
        </div>

        <div className="dashboard-charts-row">
          {/* Properties Chart */}
          <div className="dashboard-chart-card">
            <div className="dashboard-chart-header">
              <h3>حالة العقارات</h3>
              <span className="dashboard-chart-subtitle">التوزيع الكلي</span>
            </div>
            <div className="dashboard-chart-content">
              {renderDonutChart(charts.properties_status_chart, 'توزيع العقارات حسب الحالة')}
            </div>
          </div>

          {/* Interests Chart */}
          <div className="dashboard-chart-card">
            <div className="dashboard-chart-header">
              <h3>حالة الاهتمامات</h3>
              <span className="dashboard-chart-subtitle">التوزيع الكلي</span>
            </div>
            <div className="dashboard-chart-content">
              {renderDonutChart(charts.interests_status_chart, 'توزيع الاهتمامات حسب الحالة')}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="dashboard-detailed-stats">
        <h2 className="dashboard-section-title">إحصائيات مفصلة</h2>
        <div className="dashboard-detailed-grid">
          <div className="dashboard-detailed-card">
            <div className="dashboard-detailed-header">
              <FiUsers className="dashboard-detailed-icon" />
              <h4>المستخدمين</h4>
            </div>
            <div className="dashboard-detailed-list">
              <div className="dashboard-detailed-item">
                <span>المقبولون:</span>
                <span className="dashboard-detailed-value">{formatNumber(users.approved)}</span>
              </div>
              <div className="dashboard-detailed-item">
                <span>قيد المراجعة:</span>
                <span className="dashboard-detailed-value">{formatNumber(users.pending)}</span>
              </div>
              <div className="dashboard-detailed-item">
                <span>المرفوضون:</span>
                <span className="dashboard-detailed-value">{formatNumber(users.rejected)}</span>
              </div>
              <div className="dashboard-detailed-item">
                <span>تسجيلات الأسبوع:</span>
                <span className="dashboard-detailed-value">{formatNumber(users.weekly_registrations)}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-detailed-card">
            <div className="dashboard-detailed-header">
              <FiCalendar className="dashboard-detailed-icon" />
              <h4>المزادات</h4>
            </div>
            <div className="dashboard-detailed-list">
              <div className="dashboard-detailed-item">
                <span>النشطة:</span>
                <span className="dashboard-detailed-value">{formatNumber(auctions.active)}</span>
              </div>
              <div className="dashboard-detailed-item">
                <span>المكتملة:</span>
                <span className="dashboard-detailed-value">{formatNumber(auctions.completed)}</span>
              </div>
              <div className="dashboard-detailed-item">
                <span>الملغاة:</span>
                <span className="dashboard-detailed-value">{formatNumber(auctions.cancelled)}</span>
              </div>
              <div className="dashboard-detailed-item">
                <span>قيد المراجعة:</span>
                <span className="dashboard-detailed-value">{formatNumber(auctions.pending)}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-detailed-card">
            <div className="dashboard-detailed-header">
              <FiHeart className="dashboard-detailed-icon" />
              <h4>الاهتمامات</h4>
            </div>
            <div className="dashboard-detailed-list">
              <div className="dashboard-detailed-item">
                <span>قيد المراجعة:</span>
                <span className="dashboard-detailed-value">{formatNumber(interests.pending)}</span>
              </div>
              <div className="dashboard-detailed-item">
                <span>تمت المراجعة:</span>
                <span className="dashboard-detailed-value">{formatNumber(interests.reviewed)}</span>
              </div>
              <div className="dashboard-detailed-item">
                <span>تم التواصل:</span>
                <span className="dashboard-detailed-value">{formatNumber(interests.contacted)}</span>
              </div>
              <div className="dashboard-detailed-item">
                <span>الملغاة:</span>
                <span className="dashboard-detailed-value">{formatNumber(interests.cancelled)}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-detailed-card">
            <div className="dashboard-detailed-header">
              <FiHome className="dashboard-detailed-icon" />
              <h4>العقارات</h4>
            </div>
            <div className="dashboard-detailed-list">
              <div className="dashboard-detailed-item">
                <span>المعروضة:</span>
                <span className="dashboard-detailed-value">{formatNumber(properties.listed || 0)}</span>
              </div>
              <div className="dashboard-detailed-item">
                <span>المباعة:</span>
                <span className="dashboard-detailed-value">{formatNumber(properties.sold || 0)}</span>
              </div>
              <div className="dashboard-detailed-item">
                <span>قيد المراجعة:</span>
                <span className="dashboard-detailed-value">{formatNumber(properties.pending || 0)}</span>
              </div>
              <div className="dashboard-detailed-item">
                <span>إضافات هذا الشهر:</span>
                <span className="dashboard-detailed-value">{formatNumber(properties.monthly_additions || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;