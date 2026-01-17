import { getStatusBadgeClass, getStatusText } from "../constants/statusOptions";
import { tableHeaders } from "../constants/statusOptions";

/**
 * Export reports data to PDF (using browser print)
 */
export const exportToPdf = (reports, filters, totalCount, dateRange, reportTypes, periodTypes) => {
  try {
    if (reports.length === 0) {
      alert("لا توجد بيانات للتصدير");
      return;
    }

    const reportTitle =
      reportTypes.find((t) => t.value === filters.type)?.label || "تقرير";
    const periodTitle =
      periodTypes.find((p) => p.value === filters.period)?.label || "";

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
          
          <div class="content">
            <table>
              <thead><tr>
                <th>#</th>
    `;

    tableHeaders[filters.type].forEach((header) => {
      htmlContent += `<th>${header}</th>`;
    });
    htmlContent += `</tr></thead><tbody>`;

    reports.forEach((item, index) => {
      htmlContent += `<tr><td>${index + 1}</td>`;

      if (filters.type === "users") {
        htmlContent += `
          <td>${item.full_name || "غير محدد"}</td>
          <td>${item.email || "غير متوفر"}</td>
          <td><span class="status-badge status-${getStatusBadgeClass(
            item.status
          ).split(" ")[0].replace("bg-", "").replace("-100", "")}">${getStatusText(
            item.status
          )}</span></td>
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
          ).split(" ")[0].replace("bg-", "").replace("-100", "")}">${getStatusText(
            item.status
          )}</span></td>
          <td>${item.owner || "غير محدد"}</td>
          <td>${item.created_at || "غير محدد"}</td>
        `;
      } else if (filters.type === "auctions") {
        htmlContent += `
          <td>${item.title || "غير محدد"}</td>
          <td><span class="status-badge status-${getStatusBadgeClass(
            item.status
          ).split(" ")[0].replace("bg-", "").replace("-100", "")}">${getStatusText(
            item.status
          )}</span></td>
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
          ).split(" ")[0].replace("bg-", "").replace("-100", "")}">${getStatusText(
            item.status
          )}</span></td>
          <td>${item.created_at || "غير محدد"}</td>
        `;
      }

      htmlContent += `</tr>`;
    });

    htmlContent += `
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} شاهين - منصة العقارات السعودية الأولى. جميع الحقوق محفوظة</p>
          <div class="signature">تم إصدار هذا التقرير آلياً من منصة شاهين</div>
        </div>
      </div>
      </body>
      </html>
    `;

    const printWindow = window.open(
      "",
      "_blank",
      "width=1000,height=700,toolbar=no,location=no,directories=no,status=no,menubar=no"
    );

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

    printWindow.onafterprint = function () {
      printWindow.close();
    };
  } catch (error) {
    console.error("خطأ في تصدير PDF:", error);
    alert("حدث خطأ أثناء تصدير PDF: " + error.message);
  }
};