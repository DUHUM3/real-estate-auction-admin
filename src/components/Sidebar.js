import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';
import { 
  FiHome, 
  FiUsers, 
  FiMap, 
  FiShoppingCart, 
  FiBarChart2, 
  FiLogOut,
  FiChevronDown,
  FiChevronUp,
  FiUserCheck,
  FiMapPin,
  FiBriefcase,
  FiClock,
  FiCheckCircle,
  FiTag,
  FiHeart // 🔹 أيقونة للمهتمين بالشراء
} from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  };

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  const toggleDropdown = (dropdownName) => {
    if (activeDropdown === dropdownName) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdownName);
    }
  };

  const isDropdownActive = (dropdownName) => {
    return activeDropdown === dropdownName;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <h2>LOGO</h2>
        </div>
      </div>
      
      <ul className="sidebar-menu">
        <li>
          <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
            <FiHome className="menu-icon" />
            <span className="menu-text">لوحة التحكم</span>
          </Link>
        </li>

        {/* إدارة المستخدمين بدون قائمة منسدلة */}
        <li>
          <Link to="/all-users" className={location.pathname === '/all-users' ? 'active' : ''}>
            <FiUsers className="menu-icon" />
            <span className="menu-text">إدارة المستخدمين</span>
          </Link>
        </li>

      
        {/* إدارة الأراضي */}
        <li className={`dropdown ${isDropdownActive('lands') ? 'active' : ''}`}>
          <div className="dropdown-toggle" onClick={() => toggleDropdown('lands')}>
            <div className="dropdown-title">
              <FiMapPin className="menu-icon" />
              <span className="menu-text">إدارة الأراضي</span>
            </div>
            {isDropdownActive('lands') ? <FiChevronUp className="dropdown-arrow" /> : <FiChevronDown className="dropdown-arrow" />}
          </div>
          <ul className={`dropdown-menu ${isDropdownActive('lands') ? 'show' : ''}`}>
            <li>
              <Link to="/all-lands" className={location.pathname === '/all-lands' ? 'active' : ''}>
                <FiMap className="submenu-icon" />
                <span className="submenu-text">عرض جميع الأراضي</span>
              </Link>
            </li>
            <li>
              <Link to="/pending-lands" className={location.pathname === '/lands/pending' ? 'active' : ''}>
                <FiClock className="submenu-icon" />
                <span className="submenu-text">الأراضي قيد المراجعة</span>
              </Link>
            </li>
            <li>
              <Link to="/lands/status" className={location.pathname === '/lands/status' ? 'active' : ''}>
                <FiCheckCircle className="submenu-icon" />
                <span className="submenu-text">تغيير حالة الأرض</span>
              </Link>
            </li>
          </ul>
        </li>

        {/* إدارة المزادات */}
      <li>
  <Link to="/all-auctions" className={location.pathname === '/all-auctions' ? 'active' : ''}>
    <FiTag className="menu-icon" />
    <span className="menu-text">إدارة المزادات</span>
  </Link>
</li>

  {/* 🔹 شاشة المهتمين بالشراء */}
        <li>
          <Link to="/inventory" className={location.pathname === '/inventory' ? 'active' : ''}>
            <FiHeart className="menu-icon" />
            <span className="menu-text">المهتمين بالشراء</span>
          </Link>
        </li>

        <li>
          <Link to="/orders" className={location.pathname === '/orders' ? 'active' : ''}>
            <FiShoppingCart className="menu-icon" />
            <span className="menu-text">الطلبات</span>
          </Link>
        </li>

        <li>
          <Link to="/clients-management" className={location.pathname === '/clients-management' ? 'active' : ''}>
            <FiBriefcase className="menu-icon" />
            <span className="menu-text">العملاء</span>
          </Link>
        </li>
        
        <li>
          <Link to="/reports" className={location.pathname === '/reports' ? 'active' : ''}>
            <FiBarChart2 className="menu-icon" />
            <span className="menu-text">التقارير</span>
          </Link>
        </li>
      </ul>
      
      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <FiLogOut className="logout-icon" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
