import * as XLSX from "xlsx";
import { tableHeaders } from "../constants/statusOptions";
import { getStatusText } from "../constants/statusOptions";

/**
 * Export reports data to Excel file
 */
export const exportToExcel = (reports, filters, reportTypes, periodTypes) => {
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

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportTitle);
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error("خطأ في تصدير Excel:", error);
    alert("حدث خطأ أثناء تصدير الملف: " + error.message);
  }
};