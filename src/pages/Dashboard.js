// Dashboard.js
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
  FiCheckCircle,
  FiTarget,
  FiAward
} from 'react-icons/fi';
import {
  fetchDashboardStatistics,
  formatNumber,
  calculateGrowth,
  isDataStale,
  chartColors,
  iconConfig
} from '../Services/DashboardAPI';

const Dashboard = () => {
  const { state, dispatch } = useData();
  const [localLoading, setLocalLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const statistics = state.dashboard.data;
  const loading = state.dashboard.isLoading || localLoading;

  useEffect(() => {
    if (!statistics) {
      fetchDashboardData();
    } else {
      setLastUpdated(state.dashboard.lastUpdated);
    }
  }, []);

  const fetchDashboardData = async (forceRefresh = false) => {
    if (statistics && !forceRefresh && !isDataStale(state.dashboard.lastUpdated)) {
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      setLocalLoading(true);
      
      const result = await fetchDashboardStatistics();

      if (result.success && result.data) {
        dispatch({
          type: 'SET_DASHBOARD_DATA',
          payload: result.data
        });
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
      alert(error.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      setLocalLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Stock Line Chart Component
  const renderStockChart = (data, title, color = '#3b82f6') => {
    const values = Object.values(data);
    const maxValue = Math.max(...values);
    const labels = Object.keys(data);
    
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }}></div>
            <span className="text-xs text-gray-500">آخر 7 أيام</span>
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold text-green-500">
            <FiArrowUp className="text-xs" />
            <span>+12.5%</span>
          </span>
        </div>
        <div className="flex-1 relative">
          <svg viewBox={`0 0 ${labels.length * 40} 100`} className="w-full h-full">
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0.05" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2={labels.length * 40}
                y2={y}
                stroke="#f3f4f6"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            ))}
            
            {/* Area */}
            <path
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
              d={`
                M 0,${100 - (values[0] / maxValue) * 80}
                ${values.map((value, index) => 
                  `L ${index * 40},${100 - (value / maxValue) * 80}`
                ).join(' ')}
              `}
              stroke={color}
              strokeWidth="2.5"
              fill="none"
              filter="url(#glow)"
              className="transition-all duration-300"
            />
            
            {/* Data points */}
            {values.map((value, index) => (
              <g key={index}>
                <circle
                  cx={index * 40}
                  cy={100 - (value / maxValue) * 80}
                  r="5"
                  fill="white"
                  stroke={color}
                  strokeWidth="2"
                  className="transition-all duration-300 hover:r-7"
                />
                <circle
                  cx={index * 40}
                  cy={100 - (value / maxValue) * 80}
                  r="2"
                  fill={color}
                />
              </g>
            ))}
          </svg>
        </div>
        <div className="flex justify-between mt-3 px-1">
          {labels.map((label, index) => (
            <span key={index} className="text-xs text-gray-400 font-medium">{label}</span>
          ))}
        </div>
      </div>
    );
  };

  // Flow Chart Component
  const renderFlowChart = (data, title) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    const items = Object.entries(data);
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
    
    return (
      <div className="w-full h-full flex flex-col">
        <div className="space-y-3">
          {items.map(([key, value], index) => {
            const percentage = (value / total) * 100;
            
            return (
              <div key={key} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="text-sm font-medium text-gray-700">{key}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">{formatNumber(value)}</span>
                    <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 right-0 rounded-full transition-all duration-700 ease-out group-hover:shadow-lg"
                    style={{ 
                      width: `${percentage}%`,
                      background: `linear-gradient(90deg, ${colors[index % colors.length]}, ${colors[index % colors.length]}dd)`
                    }}
                  >
                    <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Modern Bar Chart Component
  const renderModernChart = (data, title) => {
    const values = Object.values(data);
    const labels = Object.keys(data);
    const maxValue = Math.max(...values);
    
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 flex items-end justify-between gap-3 px-2">
          {values.map((value, index) => {
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e'];
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full flex items-end justify-center" style={{ height: '140px' }}>
                  <div className="absolute bottom-0 w-full flex flex-col items-center">
                    <span className="text-xs font-bold text-gray-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {value}
                    </span>
                    <div 
                      className="w-full rounded-t-lg transition-all duration-700 ease-out relative overflow-hidden group-hover:scale-105"
                      style={{ 
                        height: `${height}%`,
                        background: `linear-gradient(to top, ${colors[index % colors.length]}, ${colors[index % colors.length]}dd)`,
                        minHeight: '20px'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 animate-pulse" />
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-600 text-center">{labels[index]}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping" />
            <div className="absolute inset-0 border-4 border-t-blue-600 border-r-purple-600 rounded-full animate-spin" />
          </div>
          <p className="text-lg font-semibold text-gray-700 animate-pulse">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (!statistics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">فشل في تحميل البيانات</h3>
          <p className="text-gray-600 mb-6">حدث خطأ أثناء جلب الإحصائيات</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const { users, auctions, interests, properties, general, charts } = statistics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiBarChart2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">لوحة التحكم والإحصائيات</h1>
                <p className="text-sm text-gray-600">نظرة عامة شاملة على أداء النظام</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                  آخر تحديث: {lastUpdated.toLocaleTimeString('ar-SA')}
                </span>
              )}
              <button 
                onClick={handleRefresh}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>تحديث</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Users Card */}
          <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiUsers className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-lg bg-green-100 text-green-700">
                  <FiArrowUp className="w-3 h-3" />
                  <span>{Math.abs(calculateGrowth(users.monthly_trend.current_month, users.monthly_trend.last_month)).toFixed(1)}%</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(users.total)}</h3>
              <p className="text-sm text-gray-600 font-medium">إجمالي المستخدمين</p>
            </div>
          </div>

          {/* Auctions Card */}
          <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiCalendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-purple-700">
                  <FiTrendingUp className="w-3 h-3" />
                  <span>{formatNumber(auctions.weekly_auctions)} أسبوعياً</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(auctions.total)}</h3>
              <p className="text-sm text-gray-600 font-medium">إجمالي المزادات</p>
            </div>
          </div>

          {/* Interests Card */}
          <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-pink-600" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiHeart className="w-6 h-6 text-pink-600" />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-pink-700">
                  <FiTrendingUp className="w-3 h-3" />
                  <span>{formatNumber(interests.recent_month)} شهرياً</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(interests.total)}</h3>
              <p className="text-sm text-gray-600 font-medium">إجمالي الاهتمامات</p>
            </div>
          </div>

          {/* Properties Card */}
          <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiHome className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-orange-700">
                  <FiTrendingUp className="w-3 h-3" />
                  <span>{formatNumber(properties.weekly_properties)} أسبوعياً</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(properties.total)}</h3>
              <p className="text-sm text-gray-600 font-medium">إجمالي العقارات</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Chart 1 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">تسجيلات المستخدمين</h3>
                <p className="text-xs text-gray-500">اتجاه النمو الأسبوعي</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            {renderStockChart(charts.users_registration_chart, 'users', '#3b82f6')}
          </div>

          {/* Flow Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">توزيع المزادات</h3>
                <p className="text-xs text-gray-500">حسب الحالة</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiCalendar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            {renderFlowChart(charts.auctions_status_chart, 'auctions')}
          </div>

          {/* Modern Bar Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">العقارات المضافة</h3>
                <p className="text-xs text-gray-500">آخر 7 أيام</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FiHome className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            {renderModernChart(charts.users_registration_chart, 'properties')}
          </div>

          {/* Stock Chart 2 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">الاهتمامات الشهرية</h3>
                <p className="text-xs text-gray-500">مقارنة بالأشهر السابقة</p>
              </div>
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <FiHeart className="w-5 h-5 text-pink-600" />
              </div>
            </div>
            {renderStockChart(charts.users_registration_chart, 'interests', '#ec4899')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;