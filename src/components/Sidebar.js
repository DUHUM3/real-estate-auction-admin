import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Map,
  ShoppingCart,
  BarChart2,
  LogOut,
  ChevronDown,
  ChevronUp,
  UserCheck,
  MapPin,
  Briefcase,
  Clock,
  CheckCircle,
  Tag,
  Heart,
  Bell,
  Shield,
  Send,
  CreditCard,
  Menu,
  X,
  Search,
  BookOpen,
  Filter,
  Building,
  LandPlot,
  FileText,
  MessageCircle,
  Settings,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState({});

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("access_token");
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

  // بيانات القائمة الرئيسية
  const menuItems = [
    { icon: Search, text: "بحث وتصفية", path: "/search-filter" },
    { icon: BookOpen, text: "صندوق الكتاب", path: "/document-box" },
    { icon: Building, text: "المكتبة", path: "/library" },
  ];

  // بيانات القائمة الفرعية
  const filterItems = [
    { text: "المنطقة", path: "/area" },
    { text: "السنة", path: "/year" },
    { text: "نوع الأرض", path: "/land-type" },
    { text: "الموضوع الأول", path: "/primary-subject" },
    { text: "جميع الأراضي", path: "/all-lands" },
    { text: "أكبر مساحة", path: "/largest-area" },
    { text: "ترتيب حسب", path: "/sort-by" },
  ];

  // بيانات القائمة الإدارية
  const adminMenuItems = [
    { icon: Users, text: "إدارة المستخدمين", path: "/all-users" },
    { icon: Map, text: "عرض جميع الأراضي", path: "/all-lands" },
    { icon: Tag, text: "إدارة المزادات", path: "/all-auctions" },
    { icon: Heart, text: "المهتمين بشراء الأراضي", path: "/inventory" },
    { icon: ShoppingCart, text: "طلبات شراء الأراضي", path: "/land-requests" },
    {
      icon: Send,
      text: "طلبات تسويق الأراضي لشركات المزاد",
      path: "/auctions-requests",
    },
    { icon: Briefcase, text: "العملاء", path: "/clients-management" },
    { icon: BarChart2, text: "التقارير", path: "/reports" },
    { icon: MessageCircle, text: "تواصل معنا", path: "/contact" },
    { icon: UserCheck, text: "إدارة حسابات الأدمن", path: "/admin" },
    { icon: Shield, text: "سياسة الخصوصية", path: "/privacy-policy" },
  ];

  // جلب بيانات المستخدم من الـ API عند التحميل
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(
          "https://core-api-x41.shaheenplus.sa/api/admin/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "حدث خطأ");
        setUserData(data.data); // تخزين بيانات المستخدم
        localStorage.setItem("userData", JSON.stringify(data.data)); // حفظ نسخة محلية
      } catch (err) {
        console.error(err.message);
        // fallback لبيانات موجودة في localStorage
        const localUser = JSON.parse(localStorage.getItem("userData") || "{}");
        setUserData(localUser);
      }
    };

    fetchProfile();
  }, []);

  return (
    <>
      {/* زر القائمة للشاشات الصغيرة */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-md shadow-lg"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* خلفية شفافة للشاشات الصغيرة */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
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
                  {userData.role === "ADMIN"
                    ? "مدير"
                    : userData.role === "SUPERADMIN"
                    ? "مدير إدارة"
                    : "مسؤول النظام"}
                </p>
              </div>
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
              <CreditCard className="w-4 h-4" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center px-3 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 flex-1 shadow-sm hover:shadow-md"
            >
              <span className="text-sm font-medium ml-2">تسجيل خروج</span>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
