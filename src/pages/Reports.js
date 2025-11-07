import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiHome,
  FiCalendar,
  FiHeart,
  FiFilter,
  FiSearch,
  FiDownload,
  FiFileText,
  FiFile,
  FiSlash,
} from "react-icons/fi";
import * as XLSX from "xlsx";

/**
 * =============================================
 * نظام التقارير - Reports System
 * =============================================
 *
 * الفهرس:
 * 1. State Management - إدارة الحالة
 * 2. Constants - الثوابت
 * 3. API Functions - دوال API
 * 4. Filter Handlers - معالجات الفلاتر
 * 5. Export Functions - دوال التصدير
 * 6. UI Components - مكونات الواجهة
 *
 * المكونات الرئيسية:
 * - Filters Section - قسم الفلاتر
 * - Reports Table - جدول التقارير
 * - Export Options - خيارات التصدير
 */

const ReportsPage = () => {
  // =========================================================================
  // 1. STATE MANAGEMENT - إدارة الحالة
  // =========================================================================
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: "users",
    period: "daily",
    status: "all",
    search: "",
    region: "",
  });
  const [totalCount, setTotalCount] = useState(0);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // =========================================================================
  // 2. CONSTANTS - الثوابت
  // =========================================================================
  const reportTypes = [
    { value: "users", label: "المستخدمين", icon: <FiUsers /> },
    { value: "properties", label: "العقارات", icon: <FiHome /> },
    { value: "auctions", label: "المزادات", icon: <FiCalendar /> },
    { value: "interests", label: "طلبات الاهتمام", icon: <FiHeart /> },
  ];

  const periodTypes = [
    { value: "daily", label: "يومي" },
    { value: "weekly", label: "أسبوعي" },
    { value: "monthly", label: "شهري" },
  ];

  const statusOptions = {
    properties: [
      { value: "all", label: "الكل" },
      { value: "approved", label: "مقبول" },
      { value: "pending", label: "قيد المراجعة" },
      { value: "rejected", label: "مرفوض" },
    ],
    users: [
      { value: "all", label: "الكل" },
      { value: "approved", label: "مقبول" },
      { value: "pending", label: "قيد المراجعة" },
      { value: "rejected", label: "مرفوض" },
    ],
    auctions: [
      { value: "all", label: "الكل" },
      { value: "مفتوح", label: "مفتوح" },
      { value: "مغلق", label: "مغلق" },
      { value: "قيد المراجعة", label: "قيد المراجعة" },
      { value: "مرفوض", label: "مرفوض" },
    ],
    interests: [
      { value: "all", label: "الكل" },
      { value: "pending", label: "قيد المراجعة" },
      { value: "reviewed", label: "تمت المراجعة" },
      { value: "cancelled", label: "ملغي" },
    ],
  };

  const regions = [
    { value: "", label: "كل المناطق" },
    { value: "عدن", label: "عدن" },
    { value: "صنعاء", label: "صنعاء" },
    { value: "تعز", label: "تعز" },
    { value: "حضرموت", label: "حضرموت" },
    { value: "الحديدة", label: "الحديدة" },
    { value: "إب", label: "إب" },
    { value: "ذمار", label: "ذمار" },
    { value: "المكلا", label: "المكلا" },
    { value: "سيئون", label: "سيئون" },
    { value: "شبوة", label: "شبوة" },
    { value: "حجة", label: "حجة" },
    { value: "المهرة", label: "المهرة" },
    { value: "الضالع", label: "الضالع" },
    { value: "لحج", label: "لحج" },
    { value: "أبين", label: "أبين" },
    { value: "عمران", label: "عمران" },
    { value: "البيضاء", label: "البيضاء" },
    { value: "صعدة", label: "صعدة" },
    { value: "الجوف", label: "الجوف" },
    { value: "المحويت", label: "المحويت" },
    { value: "ريمة", label: "ريمة" },
    { value: "أرخبيل سقطرى", label: "أرخبيل سقطرى" },
  ];

  const tableHeaders = {
    users: [
      "الاسم الكامل",
      "البريد الإلكتروني",
      "الحالة",
      "نوع المستخدم",
      "تاريخ التسجيل",
    ],
    properties: [
      "العنوان",
      "المنطقة",
      "المدينة",
      "الحالة",
      "المالك",
      "تاريخ الإضافة",
    ],
    auctions: [
      "العنوان",
      "الحالة",
      "تاريخ المزاد",
      "الشركة",
      "المالك",
      "تاريخ الإنشاء",
    ],
    interests: [
      "المستخدم",
      "البريد الإلكتروني",
      "العقار",
      "الحالة",
      "تاريخ الاهتمام",
    ],
  };

  // =========================================================================
  // 3. API FUNCTIONS - دوال API
  // =========================================================================
  useEffect(() => {
    fetchReports();
  }, [filters.type, filters.period]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `https://shahin-tqay.onrender.com/api/admin/reports?period=${filters.period}&type=${filters.type}`;

      if (filters.status && filters.status !== "all") {
        url += `&status=${filters.status}`;
      }

      if (filters.search) {
        url += `&search=${encodeURIComponent(filters.search)}`;
      }

      if (filters.type === "properties" && filters.region) {
        url += `&region=${encodeURIComponent(filters.region)}`;
      }

      const token = localStorage.getItem("access_token");
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("فشل في جلب البيانات");
      }

      const result = await response.json();

      if (result.success) {
        setReports(result.data || []);
        setTotalCount(result.count || 0);
        setDateRange({
          from: result.range?.from
            ? new Date(result.range.from).toLocaleDateString("ar-SA")
            : "",
          to: result.range?.to
            ? new Date(result.range.to).toLocaleDateString("ar-SA")
            : "",
        });
      } else {
        throw new Error(result.message || "حدث خطأ غير معروف");
      }
    } catch (err) {
      setError(err.message);
      setReports([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // 4. FILTER HANDLERS - معالجات الفلاتر
  // =========================================================================
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const clearFilters = () => {
    setFilters({
      type: "users",
      period: "daily",
      status: "all",
      search: "",
      region: "",
    });
  };

  const hasActiveFilters =
    filters.status !== "all" || filters.search || filters.region;

  // =========================================================================
  // 5. EXPORT FUNCTIONS - دوال التصدير
  // =========================================================================
  const exportToExcel = () => {
    try {
      if (reports.length === 0) {
        alert("لا توجد بيانات للتصدير");
        return;
      }

      const reportTitle =
        reportTypes.find((t) => t.value === filters.type)?.label || "تقرير";
      const periodTitle =
        periodTypes.find((p) => p.value === filters.period)?.label || "";
      const fileName = `${reportTitle}_${periodTitle}_${new Date().toLocaleDateString(
        "ar-SA"
      )}.xlsx`;

      const headers = tableHeaders[filters.type];

      // تحضير البيانات للتقرير
      const dataForExport = reports.map((item) => {
        const row = {};

        if (filters.type === "users") {
          headers.forEach((header) => {
            if (header === "الاسم الكامل")
              row[header] = item.full_name || "غير محدد";
            else if (header === "البريد الإلكتروني")
              row[header] = item.email || "غير متوفر";
            else if (header === "الحالة")
              row[header] = getStatusText(item.status);
            else if (header === "نوع المستخدم")
              row[header] = item.user_type || "غير محدد";
            else if (header === "تاريخ التسجيل")
              row[header] = item.created_at || "غير محدد";
          });
        } else if (filters.type === "properties") {
          headers.forEach((header) => {
            if (header === "العنوان") row[header] = item.title || "غير محدد";
            else if (header === "المنطقة")
              row[header] = item.region || "غير محدد";
            else if (header === "المدينة")
              row[header] = item.city || "غير محدد";
            else if (header === "الحالة")
              row[header] = getStatusText(item.status);
            else if (header === "المالك")
              row[header] = item.owner || "غير محدد";
            else if (header === "تاريخ الإضافة")
              row[header] = item.created_at || "غير محدد";
          });
        } else if (filters.type === "auctions") {
          headers.forEach((header) => {
            if (header === "العنوان") row[header] = item.title || "غير محدد";
            else if (header === "الحالة")
              row[header] = getStatusText(item.status);
            else if (header === "تاريخ المزاد")
              row[header] = item.auction_date || "غير محدد";
            else if (header === "الشركة")
              row[header] = item.company || "غير محدد";
            else if (header === "المالك")
              row[header] = item.owner || "غير محدد";
            else if (header === "تاريخ الإنشاء")
              row[header] = item.created_at || "غير محدد";
          });
        } else if (filters.type === "interests") {
          headers.forEach((header) => {
            if (header === "المستخدم") row[header] = item.user || "غير محدد";
            else if (header === "البريد الإلكتروني")
              row[header] = item.email || "غير متوفر";
            else if (header === "العقار")
              row[header] = item.property || "غير محدد";
            else if (header === "الحالة")
              row[header] = getStatusText(item.status);
            else if (header === "تاريخ الاهتمام")
              row[header] = item.created_at || "غير محدد";
          });
        }

        return row;
      });

      // إنشاء ورقة العمل
      const worksheet = XLSX.utils.json_to_sheet(dataForExport);

      // إنشاء المصنف وإضافة الورقة
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, reportTitle);

      // تصدير الملف
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("خطأ في تصدير Excel:", error);
      alert("حدث خطأ أثناء تصدير الملف: " + error.message);
    }
  };

  const exportToPdf = () => {
    try {
      if (reports.length === 0) {
        alert("لا توجد بيانات للتصدير");
        return;
      }

      const reportTitle =
        reportTypes.find((t) => t.value === filters.type)?.label || "تقرير";
      const periodTitle =
        periodTypes.find((p) => p.value === filters.period)?.label || "";
      const fileName = `${reportTitle}_${periodTitle}_${new Date().toLocaleDateString(
        "ar-SA"
      )}.pdf`;

      // إنشاء محتوى HTML للPDF
      let htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Tajawal', 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            direction: rtl;
            background-color: #fff;
            color: #333;
          }
          .container {
            max-width: 1000px;
            margin: 0 auto;
            background-color: #fff;
            border-radius: 8px;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #16354d 0%, #1e5b8d 100%);
            color: white;
            padding: 15px 25px;
            position: relative;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-height: 80px;
            border-radius: 8px 8px 0 0;
          }
          .header-left {
            flex: 1;
            text-align: right;
          }
          .header-center {
            flex: 1;
            text-align: center;
          }
          .header-right {
            flex: 1;
            text-align: left;
          }
          .logo {
            max-height: 60px;
            max-width: 150px;
            object-fit: contain;
          }
          .header-stats {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            padding: 2px 0;
          }
          .stat-label {
            color: rgba(255,255,255,0.8);
            margin-left: 10px;
          }
          .stat-value {
            font-weight: bold;
            color: #fff;
            background: rgba(255,255,255,0.1);
            padding: 2px 8px;
            border-radius: 12px;
            min-width: 40px;
            text-align: center;
          }
          .report-title {
            text-align: center;
            margin: 0;
          }
          .report-title h1 {
            margin: 0 0 5px;
            font-size: 20px;
            font-weight: bold;
          }
          .report-title .subtitle {
            color: rgba(255,255,255,0.9);
            font-size: 14px;
            margin: 0;
          }
          .content {
            padding: 30px;
            border: 1px solid #e0e0e0;
            border-top: none;
            border-radius: 0 0 8px 8px;
          }
          .report-info {
            background-color: #f8f9fa;
            border-radius: 6px;
            padding: 15px 20px;
            margin-bottom: 20px;
            border-right: 4px solid #16354d;
          }
          .report-info-item {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
          }
          .report-info-label {
            font-weight: bold;
            color: #16354d;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            margin: 20px 0;
          }
          th {
            background: linear-gradient(to bottom, #16354d 0%, #143c5a 100%);
            color: white;
            padding: 15px 10px;
            text-align: right;
            font-weight: bold;
            border: none;
          }
          td {
            padding: 12px 10px;
            border-bottom: 1px solid #e0e0e0;
            text-align: right;
          }
          tr:last-child td {
            border-bottom: none;
          }
          tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            min-width: 90px;
          }
          .status-approved { background-color: #d4edda; color: #155724; }
          .status-rejected { background-color: #f8d7da; color: #721c24; }
          .status-pending { background-color: #fff3cd; color: #856404; }
          .status-reviewed { background-color: #cce7ff; color: #004085; }
          .status-cancelled { background-color: #e2e3e5; color: #383d41; }
          .status-open { background-color: #d1ecf1; color: #0c5460; }
          .status-closed { background-color: #d6d8d9; color: #1b1e21; }
          .footer {
            padding: 20px 30px;
            text-align: center;
            color: #6c757d;
            font-size: 13px;
            border-top: 1px solid #eee;
            background-color: #f8f9fa;
            margin-top: 20px;
            border-radius: 0 0 8px 8px;
          }
          .signature {
            margin-top: 10px;
            font-weight: bold;
            color: #16354d;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            opacity: 0.03;
            font-size: 120px;
            font-weight: bold;
            color: #000;
            white-space: nowrap;
            pointer-events: none;
            z-index: -1;
          }
          .report-summary {
            margin: 30px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 6px;
            border-right: 4px solid #ffc107;
          }
          .summary-title {
            font-weight: bold;
            font-size: 18px;
            color: #16354d;
            margin-bottom: 15px;
          }
          .summary-data {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
          }
          .summary-item {
            text-align: center;
            padding: 10px 20px;
            min-width: 150px;
          }
          .summary-value {
            font-size: 24px;
            font-weight: bold;
            color: #16354d;
          }
          .summary-label {
            font-size: 14px;
            color: #6c757d;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .container {
              box-shadow: none;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="watermark">شاهين العقارية</div>
        <div class="container">
          <div class="header">
            <div class="header-left">
              <div class="header-stats">
                <div class="stat-item">
                  <span class="stat-label">إجمالي السجلات:</span>
                  <span class="stat-value">${totalCount}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">مقبول:</span>
                  <span class="stat-value">${
                    reports.filter(
                      (item) =>
                        item.status === "approved" || item.status === "مقبول"
                    ).length
                  }</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">قيد المراجعة:</span>
                  <span class="stat-value">${
                    reports.filter(
                      (item) =>
                        item.status === "pending" ||
                        item.status === "قيد المراجعة"
                    ).length
                  }</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">مرفوض:</span>
                  <span class="stat-value">${
                    reports.filter(
                      (item) =>
                        item.status === "rejected" || item.status === "مرفوض"
                    ).length
                  }</span>
                </div>
              </div>
            </div>
            
           <div class="header-center">
                       <img src="images/logo2.png" alt="شاهين العقارية" class="logo" onerror="this.style.display='none'">
                       <div class="report-title">
                         <h1>${reportTitle} - ${periodTitle}</h1>
                         <div class="subtitle">تقرير تفصيلي للعمليات والإحصائيات</div>
                       </div>
                     </div>
            
            <div class="header-right">
              <div class="header-stats">
                <div class="stat-item">
                  <span class="stat-label">التاريخ:</span>
                  <span class="stat-value">${new Date().toLocaleDateString(
                    "ar-SA"
                  )}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">من:</span>
                  <span class="stat-value">${dateRange.from}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">إلى:</span>
                  <span class="stat-value">${dateRange.to}</span>
                </div>
              </div>
            </div>
          </div>
          
        
    `;

      // إضافة الجدول
      htmlContent += `<table>`;

      // رأس الجدول
      htmlContent += `<thead><tr>`;
      htmlContent += `<th>#</th>`;
      tableHeaders[filters.type].forEach((header) => {
        htmlContent += `<th>${header}</th>`;
      });
      htmlContent += `</tr></thead>`;

      // جسم الجدول
      htmlContent += `<tbody>`;
      reports.forEach((item, index) => {
        htmlContent += `<tr>`;
        htmlContent += `<td>${index + 1}</td>`;

        if (filters.type === "users") {
          htmlContent += `
          <td>${item.full_name || "غير محدد"}</td>
          <td>${item.email || "غير متوفر"}</td>
          <td><span class="status-badge status-${getStatusBadgeClass(
            item.status
          )}">${getStatusText(item.status)}</span></td>
          <td>${item.user_type || "غير محدد"}</td>
          <td>${item.created_at || "غير محدد"}</td>
        `;
        } else if (filters.type === "properties") {
          htmlContent += `
          <td>${item.title || "غير محدد"}</td>
          <td>${item.region || "غير محدد"}</td>
          <td>${item.city || "غير محدد"}</td>
          <td><span class="status-badge status-${getStatusBadgeClass(
            item.status
          )}">${getStatusText(item.status)}</span></td>
          <td>${item.owner || "غير محدد"}</td>
          <td>${item.created_at || "غير محدد"}</td>
        `;
        } else if (filters.type === "auctions") {
          htmlContent += `
          <td>${item.title || "غير محدد"}</td>
          <td><span class="status-badge status-${getStatusBadgeClass(
            item.status
          )}">${getStatusText(item.status)}</span></td>
          <td>${item.auction_date || "غير محدد"}</td>
          <td>${item.company || "غير محدد"}</td>
          <td>${item.owner || "غير محدد"}</td>
          <td>${item.created_at || "غير محدد"}</td>
        `;
        } else if (filters.type === "interests") {
          htmlContent += `
          <td>${item.user || "غير محدد"}</td>
          <td>${item.email || "غير متوفر"}</td>
          <td>${item.property || "غير محدد"}</td>
          <td><span class="status-badge status-${getStatusBadgeClass(
            item.status
          )}">${getStatusText(item.status)}</span></td>
          <td>${item.created_at || "غير محدد"}</td>
        `;
        }

        htmlContent += `</tr>`;
      });
      htmlContent += `</tbody></table>`;

      // التذييل
      htmlContent += `
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} شاهين - منصة العقارات السعودية الأولى. جميع الحقوق محفوظة</p>
            <div class="signature">تم إصدار هذا التقرير آلياً من منصة شاهين</div>
          </div>
        </div>
      </body>
      </html>
    `;

      // إنشاء نافذة طباعة بدون عناوين
      const printWindow = window.open(
        "",
        "_blank",
        "width=1000,height=700,toolbar=no,location=no,directories=no,status=no,menubar=no"
      );

      // كتابة المحتوى مع إخفاء العناوين
      printWindow.document.write(`
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 1.6cm; }
            }
          </style>
        </head>
        <body onload="window.print();">
          ${htmlContent}
        </body>
      </html>
    `);

      printWindow.document.close();

      // إغلاق النافذة بعد الطباعة
      printWindow.onafterprint = function () {
        printWindow.close();
      };
    } catch (error) {
      console.error("خطأ في تصدير PDF:", error);
      alert("حدث خطأ أثناء تصدير PDF: " + error.message);
    }
  };

  // =========================================================================
  // 6. UI COMPONENTS - مكونات الواجهة
  // =========================================================================
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
      case "مقبول":
        return "bg-green-100 text-green-800";
      case "pending":
      case "قيد المراجعة":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
      case "مرفوض":
        return "bg-red-100 text-red-800";
      case "reviewed":
      case "تمت المراجعة":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
      case "ملغي":
        return "bg-gray-100 text-gray-800";
      case "مفتوح":
        return "bg-teal-100 text-teal-800";
      case "مغلق":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "مقبول";
      case "pending":
        return "قيد المراجعة";
      case "rejected":
        return "مرفوض";
      case "reviewed":
        return "تمت المراجعة";
      case "cancelled":
        return "ملغي";
      case "مفتوح":
        return "مفتوح";
      case "مغلق":
        return "مغلق";
      case "قيد المراجعة":
        return "قيد المراجعة";
      default:
        return status;
    }
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل البيانات...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 bg-red-50 rounded-lg">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
            onClick={fetchReports}
          >
            إعادة المحاولة
          </button>
        </div>
      );
    }

    if (reports.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
          <FiFileText className="text-6xl text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg mb-4">لا توجد بيانات للعرض</p>
          {hasActiveFilters && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
              onClick={clearFilters}
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                {tableHeaders[filters.type].map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  {filters.type === "users" && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.full_name || "غير محدد"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.email || "غير متوفر"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                            item.status
                          )}`}
                        >
                          {getStatusText(item.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.user_type || "غير محدد"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.created_at || "غير محدد"}
                      </td>
                    </>
                  )}
                  {filters.type === "properties" && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.title || "غير محدد"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.region || "غير محدد"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.city || "غير محدد"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                            item.status
                          )}`}
                        >
                          {getStatusText(item.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.owner || "غير محدد"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.created_at || "غير محدد"}
                      </td>
                    </>
                  )}
                  {filters.type === "auctions" && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.title || "غير محدد"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                            item.status
                          )}`}
                        >
                          {getStatusText(item.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.auction_date || "غير محدد"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.company || "غير محدد"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.owner || "غير محدد"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.created_at || "غير محدد"}
                      </td>
                    </>
                  )}
                  {filters.type === "interests" && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.user || "غير محدد"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.email || "غير متوفر"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.property || "غير محدد"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                            item.status
                          )}`}
                        >
                          {getStatusText(item.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.created_at || "غير محدد"}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg">
          <p className="text-sm text-gray-700">
            إجمالي النتائج: <span className="font-semibold">{totalCount}</span>
          </p>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* ========================================================================= */}
      {/* HEADER SECTION - قسم الرأس */}
      {/* ========================================================================= */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FiFile className="text-3xl text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">نظام التقارير</h1>
        </div>
        <p className="text-gray-600 text-lg">
          اختر نوع التقرير والفترة لعرض البيانات
        </p>
      </div>

      {/* ========================================================================= */}
      {/* FILTERS SECTION - قسم الفلاتر */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        {/* Filter Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FiFilter className="text-xl text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">
              أدوات البحث والتصفية:
            </span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
            >
              <FiSlash />
              مسح الفلاتر
            </button>
          )}
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث هنا..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 font-medium"
            >
              بحث
            </button>
          </div>
        </form>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              نوع التقرير
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              الفترة
            </label>
            <select
              value={filters.period}
              onChange={(e) => handleFilterChange("period", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >
              {periodTypes.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              الحالة
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >
              {statusOptions[filters.type]?.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {filters.type === "properties" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                المنطقة
              </label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange("region", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              >
                {regions.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Date Range */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-blue-800 text-sm">
            الفترة من: <strong>{dateRange.from}</strong> إلى:{" "}
            <strong>{dateRange.to}</strong>
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REPORTS CONTENT - محتوى التقارير */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Reports Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {reportTypes.find((t) => t.value === filters.type)?.label ||
              "تقرير"}{" "}
            -{periodTypes.find((p) => p.value === filters.period)?.label || ""}
          </h2>

          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={exportToExcel}
              disabled={loading || reports.length === 0}
            >
              <FiDownload />
              تصدير Excel
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={exportToPdf}
              disabled={loading || reports.length === 0}
            >
              <FiFileText />
              تصدير PDF
            </button>
          </div>
        </div>

        {/* Reports Table */}
        {renderTable()}
      </div>
    </div>
  );
};

export default ReportsPage;
