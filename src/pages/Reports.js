import React, { useState, useEffect } from 'react';
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
  FiSlash
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import '../styles/Reports.css';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'users',
    period: 'daily',
    status: 'all',
    search: '',
    region: '',
  });
  const [totalCount, setTotalCount] = useState(0);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const reportTypes = [
    { value: 'users', label: 'المستخدمين', icon: <FiUsers /> },
    { value: 'properties', label: 'العقارات', icon: <FiHome /> },
    { value: 'auctions', label: 'المزادات', icon: <FiCalendar /> },
    { value: 'interests', label: 'طلبات الاهتمام', icon: <FiHeart /> },
  ];

  const periodTypes = [
    { value: 'daily', label: 'يومي' },
    { value: 'weekly', label: 'أسبوعي' },
    { value: 'monthly', label: 'شهري' },
  ];

  const statusOptions = {
    properties: [
      { value: 'all', label: 'الكل' },
      { value: 'approved', label: 'مقبول' },
      { value: 'pending', label: 'قيد المراجعة' },
      { value: 'rejected', label: 'مرفوض' },
    ],
    users: [
      { value: 'all', label: 'الكل' },
      { value: 'approved', label: 'مقبول' },
      { value: 'pending', label: 'قيد المراجعة' },
      { value: 'rejected', label: 'مرفوض' },
    ],
    auctions: [
      { value: 'all', label: 'الكل' },
      { value: 'مفتوح', label: 'مفتوح' },
      { value: 'مغلق', label: 'مغلق' },
      { value: 'قيد المراجعة', label: 'قيد المراجعة' },
      { value: 'مرفوض', label: 'مرفوض' },
    ],
    interests: [
      { value: 'all', label: 'الكل' },
      { value: 'pending', label: 'قيد المراجعة' },
      { value: 'reviewed', label: 'تمت المراجعة' },
      { value: 'cancelled', label: 'ملغي' },
    ],
  };

  const regions = [
    { value: '', label: 'كل المناطق' },
    { value: 'عدن', label: 'عدن' },
    { value: 'صنعاء', label: 'صنعاء' },
    { value: 'تعز', label: 'تعز' },
    { value: 'حضرموت', label: 'حضرموت' },
    { value: 'الحديدة', label: 'الحديدة' },
    { value: 'إب', label: 'إب' },
    { value: 'ذمار', label: 'ذمار' },
    { value: 'المكلا', label: 'المكلا' },
    { value: 'سيئون', label: 'سيئون' },
    { value: 'شبوة', label: 'شبوة' },
    { value: 'حجة', label: 'حجة' },
    { value: 'المهرة', label: 'المهرة' },
    { value: 'الضالع', label: 'الضالع' },
    { value: 'لحج', label: 'لحج' },
    { value: 'أبين', label: 'أبين' },
    { value: 'عمران', label: 'عمران' },
    { value: 'البيضاء', label: 'البيضاء' },
    { value: 'صعدة', label: 'صعدة' },
    { value: 'الجوف', label: 'الجوف' },
    { value: 'المحويت', label: 'المحويت' },
    { value: 'ريمة', label: 'ريمة' },
    { value: 'أرخبيل سقطرى', label: 'أرخبيل سقطرى' },
  ];

  const tableHeaders = {
    users: ['الاسم الكامل', 'البريد الإلكتروني', 'الحالة', 'نوع المستخدم', 'تاريخ التسجيل'],
    properties: ['العنوان', 'المنطقة', 'المدينة', 'الحالة', 'المالك', 'تاريخ الإضافة'],
    auctions: ['العنوان', 'الحالة', 'تاريخ المزاد', 'الشركة', 'المالك', 'تاريخ الإنشاء'],
    interests: ['المستخدم', 'البريد الإلكتروني', 'العقار', 'الحالة', 'تاريخ الاهتمام'],
  };

  useEffect(() => {
    fetchReports();
  }, [filters.type, filters.period]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `https://shahin-tqay.onrender.com/api/admin/reports?period=${filters.period}&type=${filters.type}`;
      
      if (filters.status && filters.status !== 'all') {
        url += `&status=${filters.status}`;
      }
      
      if (filters.search) {
        url += `&search=${encodeURIComponent(filters.search)}`;
      }
      
      if (filters.type === 'properties' && filters.region) {
        url += `&region=${encodeURIComponent(filters.region)}`;
      }
      
      const token = localStorage.getItem('access_token');
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setReports(result.data || []);
        setTotalCount(result.count || 0);
        setDateRange({
          from: result.range?.from ? new Date(result.range.from).toLocaleDateString('ar-SA') : '',
          to: result.range?.to ? new Date(result.range.to).toLocaleDateString('ar-SA') : ''
        });
      } else {
        throw new Error(result.message || 'حدث خطأ غير معروف');
      }
    } catch (err) {
      setError(err.message);
      setReports([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const clearFilters = () => {
    setFilters({
      type: 'users',
      period: 'daily',
      status: 'all',
      search: '',
      region: '',
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
      case 'مقبول':
        return 'approved';
      case 'pending':
      case 'قيد المراجعة':
        return 'pending';
      case 'rejected':
      case 'مرفوض':
        return 'rejected';
      case 'reviewed':
      case 'تمت المراجعة':
        return 'reviewed';
      case 'cancelled':
      case 'ملغي':
        return 'cancelled';
      case 'مفتوح':
        return 'open';
      case 'مغلق':
        return 'closed';
      default:
        return 'unknown';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'مقبول';
      case 'pending':
        return 'قيد المراجعة';
      case 'rejected':
        return 'مرفوض';
      case 'reviewed':
        return 'تمت المراجعة';
      case 'cancelled':
        return 'ملغي';
      case 'مفتوح':
        return 'مفتوح';
      case 'مغلق':
        return 'مغلق';
      case 'قيد المراجعة':
        return 'قيد المراجعة';
      default:
        return status;
    }
  };

  const exportToExcel = () => {
    try {
      if (reports.length === 0) {
        alert('لا توجد بيانات للتصدير');
        return;
      }

      const reportTitle = reportTypes.find(t => t.value === filters.type)?.label || 'تقرير';
      const periodTitle = periodTypes.find(p => p.value === filters.period)?.label || '';
      const fileName = `${reportTitle}_${periodTitle}_${new Date().toLocaleDateString('ar-SA')}.xlsx`;
      
      const headers = tableHeaders[filters.type];
      
      // تحضير البيانات للتقرير
      const dataForExport = reports.map(item => {
        const row = {};
        
        if (filters.type === 'users') {
          headers.forEach((header) => {
            if (header === 'الاسم الكامل') row[header] = item.full_name || 'غير محدد';
            else if (header === 'البريد الإلكتروني') row[header] = item.email || 'غير متوفر';
            else if (header === 'الحالة') row[header] = getStatusText(item.status);
            else if (header === 'نوع المستخدم') row[header] = item.user_type || 'غير محدد';
            else if (header === 'تاريخ التسجيل') row[header] = item.created_at || 'غير محدد';
          });
        } else if (filters.type === 'properties') {
          headers.forEach((header) => {
            if (header === 'العنوان') row[header] = item.title || 'غير محدد';
            else if (header === 'المنطقة') row[header] = item.region || 'غير محدد';
            else if (header === 'المدينة') row[header] = item.city || 'غير محدد';
            else if (header === 'الحالة') row[header] = getStatusText(item.status);
            else if (header === 'المالك') row[header] = item.owner || 'غير محدد';
            else if (header === 'تاريخ الإضافة') row[header] = item.created_at || 'غير محدد';
          });
        } else if (filters.type === 'auctions') {
          headers.forEach((header) => {
            if (header === 'العنوان') row[header] = item.title || 'غير محدد';
            else if (header === 'الحالة') row[header] = getStatusText(item.status);
            else if (header === 'تاريخ المزاد') row[header] = item.auction_date || 'غير محدد';
            else if (header === 'الشركة') row[header] = item.company || 'غير محدد';
            else if (header === 'المالك') row[header] = item.owner || 'غير محدد';
            else if (header === 'تاريخ الإنشاء') row[header] = item.created_at || 'غير محدد';
          });
        } else if (filters.type === 'interests') {
          headers.forEach((header) => {
            if (header === 'المستخدم') row[header] = item.user || 'غير محدد';
            else if (header === 'البريد الإلكتروني') row[header] = item.email || 'غير متوفر';
            else if (header === 'العقار') row[header] = item.property || 'غير محدد';
            else if (header === 'الحالة') row[header] = getStatusText(item.status);
            else if (header === 'تاريخ الاهتمام') row[header] = item.created_at || 'غير محدد';
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
      console.error('خطأ في تصدير Excel:', error);
      alert('حدث خطأ أثناء تصدير الملف: ' + error.message);
    }
  };

const exportToPdf = () => {
  try {
    if (reports.length === 0) {
      alert('لا توجد بيانات للتصدير');
      return;
    }

    const reportTitle = reportTypes.find(t => t.value === filters.type)?.label || 'تقرير';
    const periodTitle = periodTypes.find(p => p.value === filters.period)?.label || '';
    const fileName = `${reportTitle}_${periodTitle}_${new Date().toLocaleDateString('ar-SA')}.pdf`;

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
            padding: 0;
            direction: rtl;
            background-color: #f8f9fa;
            color: #333;
          }
          .container {
            max-width: 1000px;
            margin: 0 auto;
            background-color: #fff;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #16354d 0%, #1e5b8d 100%);
            color: white;
            padding: 25px;
            text-align: center;
            position: relative;
          }
          .brand {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 20px;
          }
          .brand-logo {
            font-size: 35px;
            font-weight: bold;
            letter-spacing: 1px;
            color: #fff;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            position: relative;
          }
          .brand-logo::before {
            content: '';
            position: absolute;
            width: 40px;
            height: 5px;
            background-color: #ffc107;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
          }
          .brand-tagline {
            font-size: 14px;
            opacity: 0.9;
            margin-top: 15px;
          }
          .header h1 {
            margin: 0 0 10px;
            font-size: 28px;
            font-weight: bold;
          }
          .header .subtitle {
            color: rgba(255,255,255,0.9);
            font-size: 16px;
            margin: 5px 0;
          }
          .content {
            padding: 30px;
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
            box-shadow: 0 0 10px rgba(0,0,0,0.05);
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
          tr:hover {
            background-color: #f1f5f8;
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
          }
          .signature {
            margin-top: 10px;
            font-weight: bold;
            color: #16354d;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            opacity: 0.03;
            font-size: 120px;
            font-weight: bold;
            color: #000;
            white-space: nowrap;
            pointer-events: none;
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
        </style>
      </head>
      <body>
        <div class="watermark">شاهين العقارية</div>
        <div class="container">
          <div class="header">
            <div class="brand">
              <div class="brand-logo">شاهين</div>
            </div>
            <div class="brand-tagline">منصة العقارات السعودية الأولى</div>
            <h1>${reportTitle} - ${periodTitle}</h1>
            <div class="subtitle">
              تقرير تفصيلي للعمليات والإحصائيات
            </div>
          </div>
          
          <div class="content">
            <div class="report-info">
              <div class="report-info-item">
                <span class="report-info-label">الفترة من:</span>
                <span>${dateRange.from}</span>
              </div>
              <div class="report-info-item">
                <span class="report-info-label">الفترة إلى:</span>
                <span>${dateRange.to}</span>
              </div>
              <div class="report-info-item">
                <span class="report-info-label">إجمالي النتائج:</span>
                <span>${totalCount}</span>
              </div>
              <div class="report-info-item">
                <span class="report-info-label">تاريخ إنشاء التقرير:</span>
                <span>${new Date().toLocaleString('ar-SA')}</span>
              </div>
            </div>

            <div class="report-summary">
              <div class="summary-title">ملخص التقرير</div>
              <div class="summary-data">
                <div class="summary-item">
                  <div class="summary-value">${totalCount}</div>
                  <div class="summary-label">إجمالي السجلات</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${reports.filter(item => item.status === 'approved' || item.status === 'مقبول').length}</div>
                  <div class="summary-label">مقبول</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${reports.filter(item => item.status === 'pending' || item.status === 'قيد المراجعة').length}</div>
                  <div class="summary-label">قيد المراجعة</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${reports.filter(item => item.status === 'rejected' || item.status === 'مرفوض').length}</div>
                  <div class="summary-label">مرفوض</div>
                </div>
              </div>
            </div>
    `;

    // إضافة الجدول
    htmlContent += `<table>`;
    
    // رأس الجدول
    htmlContent += `<thead><tr>`;
    htmlContent += `<th>#</th>`;
    tableHeaders[filters.type].forEach(header => {
      htmlContent += `<th>${header}</th>`;
    });
    htmlContent += `</tr></thead>`;
    
    // جسم الجدول
    htmlContent += `<tbody>`;
    reports.forEach((item, index) => {
      htmlContent += `<tr>`;
      htmlContent += `<td>${index + 1}</td>`;
      
      if (filters.type === 'users') {
        htmlContent += `
          <td>${item.full_name || 'غير محدد'}</td>
          <td>${item.email || 'غير متوفر'}</td>
          <td><span class="status-badge status-${getStatusBadgeClass(item.status)}">${getStatusText(item.status)}</span></td>
          <td>${item.user_type || 'غير محدد'}</td>
          <td>${item.created_at || 'غير محدد'}</td>
        `;
      } else if (filters.type === 'properties') {
        htmlContent += `
          <td>${item.title || 'غير محدد'}</td>
          <td>${item.region || 'غير محدد'}</td>
          <td>${item.city || 'غير محدد'}</td>
          <td><span class="status-badge status-${getStatusBadgeClass(item.status)}">${getStatusText(item.status)}</span></td>
          <td>${item.owner || 'غير محدد'}</td>
          <td>${item.created_at || 'غير محدد'}</td>
        `;
      } else if (filters.type === 'auctions') {
        htmlContent += `
          <td>${item.title || 'غير محدد'}</td>
          <td><span class="status-badge status-${getStatusBadgeClass(item.status)}">${getStatusText(item.status)}</span></td>
          <td>${item.auction_date || 'غير محدد'}</td>
          <td>${item.company || 'غير محدد'}</td>
          <td>${item.owner || 'غير محدد'}</td>
          <td>${item.created_at || 'غير محدد'}</td>
        `;
      } else if (filters.type === 'interests') {
        htmlContent += `
          <td>${item.user || 'غير محدد'}</td>
          <td>${item.email || 'غير متوفر'}</td>
          <td>${item.property || 'غير محدد'}</td>
          <td><span class="status-badge status-${getStatusBadgeClass(item.status)}">${getStatusText(item.status)}</span></td>
          <td>${item.created_at || 'غير محدد'}</td>
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

    // فتح نافذة جديدة للطباعة/الحفظ كPDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // الانتظار حتى يتم تحميل المحتوى ثم الطباعة
    setTimeout(() => {
      printWindow.print();
    }, 500);
    
  } catch (error) {
    console.error('خطأ في تصدير PDF:', error);
    alert('حدث خطأ أثناء تصدير PDF: ' + error.message);
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const hasActiveFilters = filters.status !== 'all' || filters.search || filters.region;

  const renderTable = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-state">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchReports}>
            إعادة المحاولة
          </button>
        </div>
      );
    }

    if (reports.length === 0) {
      return (
        <div className="empty-state">
          <FiFileText className="empty-icon" />
          <p>لا توجد بيانات للعرض</p>
          {hasActiveFilters && (
            <button className="btn btn-primary" onClick={clearFilters}>
              مسح الفلاتر
            </button>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                {tableHeaders[filters.type].map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{index + 1}</td>
                  {filters.type === 'users' && (
                    <>
                      <td>{item.full_name || 'غير محدد'}</td>
                      <td>{item.email || 'غير متوفر'}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </td>
                      <td>{item.user_type || 'غير محدد'}</td>
                      <td>{item.created_at || 'غير محدد'}</td>
                    </>
                  )}
                  {filters.type === 'properties' && (
                    <>
                      <td>{item.title || 'غير محدد'}</td>
                      <td>{item.region || 'غير محدد'}</td>
                      <td>{item.city || 'غير محدد'}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </td>
                      <td>{item.owner || 'غير محدد'}</td>
                      <td>{item.created_at || 'غير محدد'}</td>
                    </>
                  )}
                  {filters.type === 'auctions' && (
                    <>
                      <td>{item.title || 'غير محدد'}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </td>
                      <td>{item.auction_date || 'غير محدد'}</td>
                      <td>{item.company || 'غير محدد'}</td>
                      <td>{item.owner || 'غير محدد'}</td>
                      <td>{item.created_at || 'غير محدد'}</td>
                    </>
                  )}
                  {filters.type === 'interests' && (
                    <>
                      <td>{item.user || 'غير محدد'}</td>
                      <td>{item.email || 'غير متوفر'}</td>
                      <td>{item.property || 'غير محدد'}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </td>
                      <td>{item.created_at || 'غير محدد'}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-info">
          <p>إجمالي النتائج: {totalCount}</p>
        </div>
      </>
    );
  };

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="content-header">
        <h1>
          <FiFile className="header-icon" />
          نظام التقارير
        </h1>
        <p>اختر نوع التقرير والفترة لعرض البيانات</p>
      </div>

      {/* Filters Section */}
      <div className="filter-section">
        <div className="filter-header">
          <FiFilter className="filter-icon" />
          <span>أدوات البحث والتصفية:</span>
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <FiSlash />
              مسح الفلاتر
            </button>
          )}
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="ابحث هنا..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              بحث
            </button>
          </div>
        </form>

        <div className="filter-controls">
          <div className="filter-group">
            <label>نوع التقرير</label>
            <select 
              value={filters.type} 
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="filter-select"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>الفترة</label>
            <select 
              value={filters.period} 
              onChange={(e) => handleFilterChange('period', e.target.value)}
              className="filter-select"
            >
              {periodTypes.map(period => (
                <option key={period.value} value={period.value}>{period.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>الحالة</label>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              {statusOptions[filters.type]?.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          {filters.type === 'properties' && (
            <div className="filter-group">
              <label>المنطقة</label>
              <select 
                value={filters.region} 
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="filter-select"
              >
                {regions.map(region => (
                  <option key={region.value} value={region.value}>{region.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="date-range">
          <p>الفترة من: <strong>{dateRange.from}</strong> إلى: <strong>{dateRange.to}</strong></p>
        </div>
      </div>

      {/* Reports Content */}
      <div className="reports-content">
        <div className="reports-header">
          <h2>
            {reportTypes.find(t => t.value === filters.type)?.label || 'تقرير'} - 
            {periodTypes.find(p => p.value === filters.period)?.label || ''}
          </h2>
          
          <div className="export-options">
            <button 
              className="btn btn-secondary"
              onClick={exportToExcel}
              disabled={loading || reports.length === 0}
            >
              <FiDownload />
              تصدير Excel
            </button>
            <button 
              className="btn btn-danger"
              onClick={exportToPdf}
              disabled={loading || reports.length === 0}
            >
              <FiFileText />
              تصدير PDF
            </button>
          </div>
        </div>

        {renderTable()}
      </div>
    </div>
  );
};

export default ReportsPage;