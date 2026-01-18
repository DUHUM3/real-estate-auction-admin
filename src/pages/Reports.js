import React from "react";
import { FiFile } from "react-icons/fi";
import { useReports } from "../features/reports/hooks/useReports";
import { useReportFilters } from "../features/reports/hooks/useReportFilters";
import ReportFilters from "../features/reports/components/ReportsFilters";
import ReportTable from "../features/reports/components/ReportsTable";
import ExportButtons from "../features/reports/components/ExportButtons";
import { reportTypes, periodTypes } from "../features/reports/constants/reportTypes";

/**
 * Main Reports Page Component
 * Manages the overall layout and orchestrates sub-components
 */
const ReportsPage = () => {
  const {
    filters,
    availableCities,
    handleFilterChange,
    clearFilters,
    hasActiveFilters,
  } = useReportFilters();

  const {
    reports,
    loading,
    error,
    totalCount,
    dateRange,
    refetchReports,
  } = useReports(filters);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ReportFilters
        filters={filters}
        availableCities={availableCities}
        handleFilterChange={handleFilterChange}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        onSearch={refetchReports}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {reportTypes.find((t) => t.value === filters.type)?.label ||
              "تقرير"}{" "}
            -{periodTypes.find((p) => p.value === filters.period)?.label || ""}
          </h2>

          <ExportButtons
            reports={reports}
            filters={filters}
            loading={loading}
            totalCount={totalCount}
            dateRange={dateRange}
          />
        </div>

        <ReportTable
          reports={reports}
          filters={filters}
          loading={loading}
          error={error}
          totalCount={totalCount}
          dateRange={dateRange}
          onRetry={refetchReports}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </div>
  );
};

export default ReportsPage;