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
    if (!statistics) {
      fetchStatistics();
    } else {
      setLastUpdated(state.dashboard.lastUpdated);
    }
  }, []);

  const fetchStatistics = async (forceRefresh = false) => {
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
    return diffInMinutes > 5;
  };

  const handleRefresh = () => {
    fetchStatistics(true);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Stock Line Chart Component
  const renderStockChart = (data, title, color = '#53a1dd') => {
    const values = Object.values(data);
    const maxValue = Math.max(...values);
    const labels = Object.keys(data);
    
    return (
      <div className="dashboard-stock-chart">
        <div className="dashboard-stock-chart-header">
          <h4>{title}</h4>
          <span className="dashboard-stock-change positive">
            <FiArrowUp /> +12.5%
          </span>
        </div>
        <div className="dashboard-stock-chart-content">
          <svg viewBox={`0 0 ${labels.length * 40} 100`} className="dashboard-stock-svg">
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            {/* Area */}
            <path
              className="dashboard-stock-area"
              d={`
                M 0,${100 - (values[0] / maxValue) * 80}
                ${values.map((value, index) => 
                  `L ${index * 40},${100 - (value / maxValue) * 80}`
                ).join(' ')}
                L ${(values.length - 1) * 40},100
                L 0,100
                Z
              `}
              fill={`url(#gradient-${title})`}
            />
            
            {/* Line */}
            <path
              className="dashboard-stock-line"
              d={`
                M 0,${100 - (values[0] / maxValue) * 80}
                ${values.map((value, index) => 
                  `L ${index * 40},${100 - (value / maxValue) * 80}`
                ).join(' ')}
              `}
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            
            {/* Data points */}
            {values.map((value, index) => (
              <circle
                key={index}
                cx={index * 40}
                cy={100 - (value / maxValue) * 80}
                r="3"
                fill={color}
                className="dashboard-stock-point"
              />
            ))}
          </svg>
        </div>
        <div className="dashboard-stock-labels">
          {labels.map((label, index) => (
            <span key={index} className="dashboard-stock-label">{label}</span>
          ))}
        </div>
      </div>
    );
  };

  // Flow Chart Component
  const renderFlowChart = (data, title) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    const items = Object.entries(data);
    
    return (
      <div className="dashboard-flow-chart">
        <h4>{title}</h4>
        <div className="dashboard-flow-container">
          {items.map(([key, value], index) => {
            const percentage = (value / total) * 100;
            const width = Math.max(20, percentage);
            
            return (
              <div key={key} className="dashboard-flow-item">
                <div className="dashboard-flow-label">
                  <span>{key}</span>
                  <span className="dashboard-flow-value">{formatNumber(value)}</span>
                </div>
                <div className="dashboard-flow-bar-container">
                  <div 
                    className="dashboard-flow-bar"
                    style={{ 
                      width: `${width}%`,
                      backgroundColor: `hsl(${210 + index * 30}, 70%, 55%)`
                    }}
                  >
                    <span className="dashboard-flow-percentage">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Modern Chart Component
  const renderModernChart = (data, title, type = 'bar') => {
    const values = Object.values(data);
    const labels = Object.keys(data);
    const maxValue = Math.max(...values);
    
    if (type === 'line') {
      return renderStockChart(data, title);
    }
    
    return (
      <div className="dashboard-modern-chart">
        <h4>{title}</h4>
        <div className="dashboard-chart-bars-modern">
          {values.map((value, index) => (
            <div key={index} className="dashboard-chart-bar-modern-wrapper">
              <div className="dashboard-chart-bar-modern">
                <div 
                  className="dashboard-chart-bar-fill"
                  style={{
                    height: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%`,
                    background: `linear-gradient(to top, #53a1dd, #7bb8e8)`
                  }}
                >
                  <span className="dashboard-chart-value-modern">{value}</span>
                </div>
              </div>
              <span className="dashboard-chart-label-modern">{labels[index]}</span>
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
          <div className="dashboard-loading-dots">
            <div className="dashboard-loading-dot"></div>
            <div className="dashboard-loading-dot"></div>
            <div className="dashboard-loading-dot"></div>
          </div>
          <p className="dashboard-loading-text">جاري تحميل الإحصائيات...</p>
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
      {/* Header - نفس العنوان كما هو */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1>
            <FiBarChart2 className="dashboard-header-icon" />
            لوحة التحكم والإحصائيات
          </h1>
          <p>نظرة عامة على أداء النظام والأنشطة</p>
        </div>
        <div className="dashboard-header-actions">
          <button onClick={handleRefresh} className="dashboard-refresh-btn">
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

      {/* Summary Cards - صف واحد فقط */}
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
                {calculateGrowth(users.monthly_trend.current_month, users.monthly_trend.last_month) >= 0 ? 
                  <FiArrowUp /> : <FiArrowDown />}
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

      {/* Charts Section - تصميم جديد */}
      <div className="dashboard-charts-section">
        {/* <h2 className="dashboard-section-title">الرسومات البيانية المتقدمة</h2> */}
        
        <div className="dashboard-charts-grid">
          {/* Stock Line Chart */}
          <div className="dashboard-chart-card dashboard-stock-chart-card">
            <div className="dashboard-chart-header">
              <h3>تسجيلات المستخدمين</h3>
              <span className="dashboard-chart-subtitle">اتجاه النمو</span>
            </div>
            <div className="dashboard-chart-content">
              {renderStockChart(charts.users_registration_chart, 'تسجيلات المستخدمين')}
            </div>
          </div>

          {/* Flow Chart */}
          <div className="dashboard-chart-card dashboard-flow-chart-card">
            <div className="dashboard-chart-header">
              <h3>توزيع المزادات</h3>
              <span className="dashboard-chart-subtitle">حسب الحالة</span>
            </div>
            <div className="dashboard-chart-content">
              {renderFlowChart(charts.auctions_status_chart, 'حالة المزادات')}
            </div>
          </div>

          {/* Modern Bar Chart */}
          <div className="dashboard-chart-card dashboard-modern-chart-card">
            <div className="dashboard-chart-header">
              <h3>العقارات المضافة</h3>
              <span className="dashboard-chart-subtitle">آخر 7 أيام</span>
            </div>
            <div className="dashboard-chart-content">
              {renderModernChart(charts.users_registration_chart, 'العقارات المضافة')}
            </div>
          </div>

          {/* Another Stock Chart */}
          <div className="dashboard-chart-card dashboard-stock-chart-card">
            <div className="dashboard-chart-header">
              <h3>الاهتمامات الشهرية</h3>
              <span className="dashboard-chart-subtitle">مقارنة بالأشهر</span>
            </div>
            <div className="dashboard-chart-content">
              {renderStockChart(charts.users_registration_chart, 'الاهتمامات', '#ff6b6b')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;