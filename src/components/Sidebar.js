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
  FiHeart,
  FiBell,
  FiShield,
  FiSend,
  FiCreditCard  // 🔹 أيقونة الحساب البنكي
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
        <div className="logo2">
          <img 
            src={process.env.PUBLIC_URL + "/images/logo2.png"} 
            alt="شاهين Logo" 
            className="brand-logo2"
          />
        </div>
      </div>
      
      <ul className="sidebar-menu">
        <li>
          <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
            <FiHome className="menu-icon" />
            <span className="menu-text">لوحة التحكم</span>
          </Link>
        </li>

        {/* إدارة المستخدمين */}
        <li>
          <Link to="/all-users" className={location.pathname === '/all-users' ? 'active' : ''}>
            <FiUsers className="menu-icon" />
            <span className="menu-text">إدارة المستخدمين</span>
          </Link>
        </li>

        {/* إدارة الأراضي */}
        <li>
          <Link to="/all-lands" className={location.pathname === '/all-lands' ? 'active' : ''}>
            <FiMap className="menu-icon" />
            <span className="menu-text">عرض جميع الأراضي</span>
          </Link>
        </li>

        {/* إدارة المزادات */}
        <li>
          <Link to="/all-auctions" className={location.pathname === '/all-auctions' ? 'active' : ''}>
            <FiTag className="menu-icon" />
            <span className="menu-text">إدارة المزادات</span>
          </Link>
        </li>

        {/* المهتمين بالشراء */}
        <li>
          <Link to="/inventory" className={location.pathname === '/inventory' ? 'active' : ''}>
            <FiHeart className="menu-icon" />
            <span className="menu-text">المهتمين بشراء الأراضي</span>
          </Link>
        </li>

        {/* طلبات شراء الأراضي */}
        <li>
          <Link to="/land-requests" className={location.pathname === '/land-requests' ? 'active' : ''}>
            <FiShoppingCart className="menu-icon" />
            <span className="menu-text">طلبات شراء الاراضي</span>
          </Link>
        </li>

        {/* طلبات التسويق */}
        <li>
          <Link to="/auctions-requests" className={location.pathname === '/auctions-requests' ? 'active' : ''}>
            <FiSend className="menu-icon" />
            <span className="menu-text">طلبات تسويق الأراضي لشركات المزاد</span>
          </Link>
        </li>
        
        {/* العملاء */}
        <li>
          <Link to="/clients-management" className={location.pathname === '/clients-management' ? 'active' : ''}>
            <FiBriefcase className="menu-icon" />
            <span className="menu-text">العملاء</span>
          </Link>
        </li>
        
        {/* التقارير */}
        <li>
          <Link to="/reports" className={location.pathname === '/reports' ? 'active' : ''}>
            <FiBarChart2 className="menu-icon" />
            <span className="menu-text">التقارير</span>
          </Link>
        </li>
        {/* الحساب البنكي */}
        <li>
          <Link to="/Contact" className={location.pathname === '/Contact' ? 'active' : ''}>
            <FiCreditCard className="menu-icon" />
            <span className="menu-text"> تواصل معنا</span>
          </Link>
        </li>

        {/* سياسة الخصوصية */}
        <li>
          <Link to="/privacy-policy" className={location.pathname === '/privacy-policy' ? 'active' : ''}>
            <FiShield className="menu-icon" />
            <span className="menu-text">سياسة الخصوصية</span>
          </Link>
        </li>
        {/* الادمن  */}
        <li>
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
            <FiShield className="menu-icon" />
            <span className="menu-text"> إدارة حسابات الأدمن</span>
          </Link>
        </li>
      </ul>
      
      <div className="sidebar-footer">
        <div className="footer-buttons horizontal">
          <Link to="/bank-account" className="bank-account-btn">
            <FiCreditCard className="bank-icon" />
            <span>الحساب</span>
          </Link>
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <FiLogOut className="logout-icon" />
            <span>خروج</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;