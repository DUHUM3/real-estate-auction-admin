import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

// استيراد الأيقونات من الملف المنفصل
import Icons from "../icons";
// استيراد خدمة الـ API
import { adminService } from "../Services/SidebarApi.js";

const Sidebar = () => {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("access_token");
    localStorage.removeItem("admin_token");
    window.location.href = "/login";
  };

  const toggleDropdown = (dropdownName) => {
    if (activeDropdown === dropdownName) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdownName);
    }
  };

  const isDropdownActive = (dropdownName) => activeDropdown === dropdownName;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const closeSidebar = () => setIsSidebarOpen(false);

  // جلب بيانات المستخدم من الـ API عند التحميل
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await adminService.getProfile();
        setUserData(data.data);
        localStorage.setItem("userData", JSON.stringify(data.data));
      } catch (err) {
        console.error("فشل في جلب بيانات الملف الشخصي:", err.message);
        // محاولة استخدام البيانات المحفوظة محلياً
        const localUser = JSON.parse(localStorage.getItem("userData") || "{}");
        setUserData(localUser);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // بيانات القائمة الرئيسية
  const menuItems = [
    { icon: Icons.Search, text: "بحث وتصفية", path: "/search-filter" },
    { icon: Icons.BookOpen, text: "صندوق الكتاب", path: "/document-box" },
    { icon: Icons.Building, text: "المكتبة", path: "/library" },
  ];

  // بيانات القائمة الإدارية
  const adminMenuItems = [
    { icon: Icons.Users, text: "إدارة المستخدمين", path: "/all-users" },
    { icon: Icons.Map, text: "عرض جميع الأراضي", path: "/all-lands" },
    { icon: Icons.Tag, text: "إدارة المزادات", path: "/all-auctions" },
    { icon: Icons.Heart, text: "المهتمين بشراء الأراضي", path: "/inventory" },
    { icon: Icons.ShoppingCart, text: "طلبات شراء الأراضي", path: "/land-requests" },
    {
      icon: Icons.Send,
      text: "طلبات تسويق الأراضي لشركات المزاد",
      path: "/auctions-requests",
    },
    { icon: Icons.Briefcase, text: "العملاء", path: "/clients-management" },
    { icon: Icons.BarChart2, text: "التقارير", path: "/reports" },
    { icon: Icons.MessageCircle, text: "تواصل معنا", path: "/contact" },
    { icon: Icons.UserCheck, text: "إدارة حسابات الأدمن", path: "/admin" },
    { icon: Icons.Shield, text: "سياسة الخصوصية", path: "/privacy-policy" },
  ];

  // دالة لتنسيق دور المستخدم
  const formatUserRole = (role) => {
    const roles = {
      ADMIN: "مدير",
      SUPERADMIN: "مدير إدارة",
      MODERATOR: "مسؤول النظام",
      USER: "مستخدم",
    };
    return roles[role] || "مستخدم النظام";
  };

  return (
    <>
      {/* زر القائمة للشاشات الصغيرة */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-md shadow-lg"
        aria-label={isSidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
      >
        {isSidebarOpen ? <Icons.X size={24} /> : <Icons.Menu size={24} />}
      </button>

      {/* خلفية شفافة للشاشات الصغيرة */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* السايد بار */}
      <div
        className={`
          fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-blue-50 to-gray-50 shadow-xl z-40 transform transition-transform duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "translate-x-full lg:translate-x-0"
          }
          flex flex-col
        `}
      >
        {/* رأس السايد بار */}
        <div className="p-6 border-b border-blue-200 bg-white">
          <div className="flex items-center justify-center mb-4">
            <img
              src={process.env.PUBLIC_URL + "/images/logo2.png"}
              alt="شاهين Logo"
              className="h-14 w-auto"
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mt-1">
              نظام إدارة الأراضي والعقارات
            </p>
          </div>
        </div>

        {/* محتوى السايد بار مع التمرير */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
          {/* القائمة الإدارية */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 mb-3">
              الإدارة والنظام
            </h3>
            <ul className="space-y-1 px-4">
              {adminMenuItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <li key={index}>
                    <Link
                      to={item.path}
                      onClick={closeSidebar}
                      className={`
                        flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                        ${
                          location.pathname === item.path
                            ? "bg-blue-100 text-blue-700 border-r-4 border-blue-700 shadow-sm"
                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        }
                      `}
                    >
                      <span className="flex-1 text-right font-medium text-sm">
                        {item.text}
                      </span>
                      <IconComponent className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* بطاقة معلومات المستخدم */}
          <div className="mt-auto px-4 mb-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              {loading ? (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-xs text-gray-500 mt-2">جاري التحميل...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">الحالة</span>
                    <div className="flex items-center">
                      <span className="text-xs text-green-600 ml-1">نشط</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-800">
                      {userData.full_name || "مستخدم النظام"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatUserRole(userData.role)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* تذييل السايد بار */}
        <div className="p-4 border-t border-blue-200 bg-white">
          <div className="flex gap-2">
            <Link
              to="/bank-account"
              onClick={closeSidebar}
              className="flex items-center justify-center px-3 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex-1 shadow-sm hover:shadow-md"
            >
              <span className="text-sm font-medium ml-2">الحساب البنكي</span>
              <Icons.CreditCard className="w-4 h-4" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center px-3 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 flex-1 shadow-sm hover:shadow-md"
            >
              <span className="text-sm font-medium ml-2">تسجيل خروج</span>
              <Icons.LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;