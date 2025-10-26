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
      { value: 'pending', label: 'قيد الانتظار' },
      { value: 'approved', label: 'مقبول' },
      { value: 'rejected', label: 'مرفوض' },
    ],
    users: [
      { value: 'all', label: 'الكل' },
      { value: 'active', label: 'نشط' },
      { value: 'inactive', label: 'غير نشط' },
    ],
    auctions: [
      { value: 'all', label: 'الكل' },
      { value: 'upcoming', label: 'قادم' },
      { value: 'ongoing', label: 'جاري' },
      { value: 'completed', label: 'مكتمل' },
    ],
    interests: [
      { value: 'all', label: 'الكل' },
      { value: 'pending', label: 'قيد الانتظار' },
      { value: 'approved', label: 'مقبول' },
      { value: 'rejected', label: 'مرفوض' },
    ],
  };

  const regions = [
    { value: '', label: 'كل المناطق' },
    { value: 'الرياض', label: 'الرياض' },
    { value: 'مكة المكرمة', label: 'مكة المكرمة' },
    { value: 'المدينة المنورة', label: 'المدينة المنورة' },
    { value: 'القصيم', label: 'القصيم' },
    { value: 'الشرقية', label: 'الشرقية' },
  ];

  const tableHeaders = {
    users: ['الاسم الكامل', 'البريد الإلكتروني', 'الحالة', 'نوع المستخدم', 'تاريخ التسجيل'],
    properties: ['العنوان', 'المنطقة', 'المدينة', 'الحالة', 'المالك', 'السعر/متر', 'تاريخ الإضافة'],
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
          headers.forEach((header, index) => {
            if (header === 'الاسم الكامل') row[header] = item.full_name || 'غير محدد';
            else if (header === 'البريد الإلكتروني') row[header] = item.email || 'غير متوفر';
            else if (header === 'الحالة') row[header] = item.status === 'active' ? 'نشط' : 'غير نشط';
            else if (header === 'نوع المستخدم') row[header] = item.user_type || 'غير محدد';
            else if (header === 'تاريخ التسجيل') row[header] = item.created_at || 'غير محدد';
          });
        } else if (filters.type === 'properties') {
          headers.forEach((header, index) => {
            if (header === 'العنوان') row[header] = item.title || 'غير محدد';
            else if (header === 'المنطقة') row[header] = item.region || 'غير محدد';
            else if (header === 'المدينة') row[header] = item.city || 'غير محدد';
            else if (header === 'الحالة') row[header] = item.status === 'approved' ? 'مقبول' : 
                             item.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار';
            else if (header === 'المالك') row[header] = item.owner || 'غير محدد';
            else if (header === 'السعر/متر') row[header] = item.price_per_meter || 'غير محدد';
            else if (header === 'تاريخ الإضافة') row[header] = item.created_at || 'غير محدد';
          });
        } else if (filters.type === 'auctions') {
          headers.forEach((header, index) => {
            if (header === 'العنوان') row[header] = item.title || 'غير محدد';
            else if (header === 'الحالة') row[header] = item.status === 'upcoming' ? 'قادم' : 
                             item.status === 'ongoing' ? 'جاري' : 
                             item.status === 'completed' ? 'مكتمل' : item.status;
            else if (header === 'تاريخ المزاد') row[header] = item.auction_date || 'غير محدد';
            else if (header === 'الشركة') row[header] = item.company || 'غير محدد';
            else if (header === 'المالك') row[header] = item.owner || 'غير محدد';
            else if (header === 'تاريخ الإنشاء') row[header] = item.created_at || 'غير محدد';
          });
        } else if (filters.type === 'interests') {
          headers.forEach((header, index) => {
            if (header === 'المستخدم') row[header] = item.user || 'غير محدد';
            else if (header === 'البريد الإلكتروني') row[header] = item.email || 'غير متوفر';
            else if (header === 'العقار') row[header] = item.property || 'غير محدد';
            else if (header === 'الحالة') row[header] = item.status === 'approved' ? 'مقبول' : 
                             item.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار';
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
              font-family: 'Arial', sans-serif;
              margin: 20px;
              direction: rtl;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #16354d;
              padding-bottom: 10px;
            }
            .header h1 {
              color: #16354d;
              margin: 0;
              font-size: 24px;
            }
            .header .subtitle {
              color: #666;
              font-size: 14px;
              margin-top: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #16354d;
              color: white;
              padding: 12px 8px;
              text-align: right;
              font-weight: bold;
              border: 1px solid #ddd;
            }
            td {
              padding: 10px 8px;
              border: 1px solid #ddd;
              text-align: right;
            }
            tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            .status-badge {
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-approved { background-color: #d4edda; color: #155724; }
            .status-rejected { background-color: #f8d7da; color: #721c24; }
            .status-pending { background-color: #fff3cd; color: #856404; }
            .status-active { background-color: #d4edda; color: #155724; }
            .status-inactive { background-color: #f8d7da; color: #721c24; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportTitle} - ${periodTitle}</h1>
            <div class="subtitle">
              الفترة من: ${dateRange.from} إلى: ${dateRange.to}
            </div>
            <div class="subtitle">
              إجمالي النتائج: ${totalCount}
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
            <td><span class="status-badge status-${item.status}">${item.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
            <td>${item.user_type || 'غير محدد'}</td>
            <td>${item.created_at || 'غير محدد'}</td>
          `;
        } else if (filters.type === 'properties') {
          const statusClass = item.status === 'approved' ? 'approved' : 
                            item.status === 'rejected' ? 'rejected' : 'pending';
          htmlContent += `
            <td>${item.title || 'غير محدد'}</td>
            <td>${item.region || 'غير محدد'}</td>
            <td>${item.city || 'غير محدد'}</td>
            <td><span class="status-badge status-${statusClass}">${item.status === 'approved' ? 'مقبول' : item.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}</span></td>
            <td>${item.owner || 'غير محدد'}</td>
            <td>${item.price_per_meter || 'غير محدد'}</td>
            <td>${item.created_at || 'غير محدد'}</td>
          `;
        } else if (filters.type === 'auctions') {
          htmlContent += `
            <td>${item.title || 'غير محدد'}</td>
            <td>${item.status === 'upcoming' ? 'قادم' : item.status === 'ongoing' ? 'جاري' : item.status === 'completed' ? 'مكتمل' : item.status}</td>
            <td>${item.auction_date || 'غير محدد'}</td>
            <td>${item.company || 'غير محدد'}</td>
            <td>${item.owner || 'غير محدد'}</td>
            <td>${item.created_at || 'غير محدد'}</td>
          `;
        } else if (filters.type === 'interests') {
          const statusClass = item.status === 'approved' ? 'approved' : 
                            item.status === 'rejected' ? 'rejected' : 'pending';
          htmlContent += `
            <td>${item.user || 'غير محدد'}</td>
            <td>${item.email || 'غير متوفر'}</td>
            <td>${item.property || 'غير محدد'}</td>
            <td><span class="status-badge status-${statusClass}">${item.status === 'approved' ? 'مقبول' : item.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}</span></td>
            <td>${item.created_at || 'غير محدد'}</td>
          `;
        }
        
        htmlContent += `</tr>`;
      });
      htmlContent += `</tbody></table>`;
      
      // التذييل
      htmlContent += `
          <div class="footer">
            تم إنشاء التقرير في: ${new Date().toLocaleString('ar-SA')}
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
        // يمكن للمستخدم اختيار الحفظ كPDF من خيارات الطباعة
      }, 500);
      
    } catch (error) {
      console.error('خطأ في تصدير PDF:', error);
      alert('حدث خطأ أثناء تصدير PDF: ' + error.message);
    }
  };

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
          {/* <button className="btn btn-primary" onClick={fetchReports}>
            إعادة المحاولة
          </button> */}
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
                        <span className={`status-badge ${item.status}`}>
                          {item.status === 'active' ? 'نشط' : 'غير نشط'}
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
                        <span className={`status-badge ${item.status}`}>
                          {item.status === 'approved' ? 'مقبول' : 
                           item.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
                        </span>
                      </td>
                      <td>{item.owner || 'غير محدد'}</td>
                      <td>{item.price_per_meter || 'غير محدد'}</td>
                      <td>{item.created_at || 'غير محدد'}</td>
                    </>
                  )}
                  {filters.type === 'auctions' && (
                    <>
                      <td>{item.title || 'غير محدد'}</td>
                      <td>
                        <span className={`status-badge ${item.status}`}>
                          {item.status === 'upcoming' ? 'قادم' : 
                           item.status === 'ongoing' ? 'جاري' : 
                           item.status === 'completed' ? 'مكتمل' : item.status}
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
                        <span className={`status-badge ${item.status}`}>
                          {item.status === 'approved' ? 'مقبول' : 
                           item.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
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