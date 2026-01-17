import React from "react";
import { FiDownload, FiFileText } from "react-icons/fi";
import { exportToExcel } from "../utils/exportToExcel";
import { exportToPdf } from "../utils/exportToPdf";
import { reportTypes, periodTypes } from "../constants/reportTypes";

/**
 * Export buttons component (Excel and PDF)
 */
const ExportButtons = ({ reports, filters, loading, totalCount, dateRange }) => {
  const handleExportExcel = () => {
    exportToExcel(reports, filters, reportTypes, periodTypes);
  };

  const handleExportPdf = () => {
    exportToPdf(reports, filters, totalCount, dateRange, reportTypes, periodTypes);
  };

  return (
    <div className="flex gap-3">
      <button
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleExportExcel}
        disabled={loading || reports.length === 0}
      >
        <FiDownload />
        تصدير Excel
      </button>
      <button
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleExportPdf}
        disabled={loading || reports.length === 0}
      >
        <FiFileText />
        تصدير PDF
      </button>
    </div>
  );
};

export default ExportButtons;