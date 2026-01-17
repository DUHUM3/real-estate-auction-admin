/**
 * Land details information display
 * Enterprise-grade Admin UI – Improved UI/UX & Structure
 * Focus: Visual hierarchy, scannability, reusability, RTL-first design
 */

import React from "react";
import {
  FiHome,
  FiUser,
  FiMapPin,
  FiLayers,
  FiCalendar,
  FiDollarSign,
  FiX,
  FiCopy,
  FiEye,
} from "react-icons/fi";
import {
  getLandTypeBadge,
  getPurposeBadge,
  getStatusBadge,
  formatDate,
} from "../constants/landConstants";

/* -------------------------------------------------------------------------- */
/*                               UI Components                                */
/* -------------------------------------------------------------------------- */

const SectionHeader = ({ icon: Icon, title, action }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center text-gray-700">
      {Icon && <Icon className="ml-2 text-gray-400" />}
      <h3 className="font-semibold text-sm">{title}</h3>
    </div>
    {action}
  </div>
);

const InfoCard = ({ label, value, icon: Icon, action, highlight, className = "" }) => (
  <div
    className={`rounded-xl border bg-white p-4 transition
      ${
        highlight
          ? "border-red-200 bg-red-50"
          : "border-gray-200 hover:shadow-sm"
      } ${className}`}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center text-xs text-gray-500 mb-1">
          {Icon && <Icon className="ml-1 text-gray-400" />}
          <span>{label}</span>
        </div>
        <div
          className={`text-sm font-medium leading-relaxed ${
            highlight ? "text-red-700" : "text-gray-800"
          }`}
        >
          {value}
        </div>
      </div>
      {action}
    </div>
  </div>
);

const CopyButton = ({ active, onClick, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`shrink-0 p-2 rounded-lg transition
      ${
        active
          ? "bg-green-100 text-green-600"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
  >
    <FiCopy className="text-sm" />
  </button>
);

/* -------------------------------------------------------------------------- */
/*                              Main Component                                 */
/* -------------------------------------------------------------------------- */

const LandDetailsInfo = ({ land, copyStatus, onCopy, onShowOwner }) => {
  return (
    <div className="space-y-8">

      {/* ===================== Primary Overview ===================== */}
      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <SectionHeader title="معلومات الإعلان الأساسية" icon={FiHome} />

        {/* التعديل الوحيد هنا */}
        <div className="flex gap-4">
          <InfoCard
            label="الحالة"
            value={getStatusBadge(land.status)}
            className="shrink-0"
          />
          <InfoCard
            label="العنوان"
            value={land.title}
            className="flex-1"
          />
        </div>
      </section>

      {/* ===================== Owner & Location ===================== */}
      <section>
        <SectionHeader title="المالك والموقع" icon={FiMapPin} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            label="المالك"
            value={land.user?.full_name}
            icon={FiUser}
            action={
              <div className="flex gap-2">
                <button
                  onClick={() => onShowOwner(land.user)}
                  title="عرض تفاصيل المالك"
                  className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                >
                  <FiEye className="text-sm" />
                </button>
                <CopyButton
                  active={copyStatus["owner_info"]}
                  onClick={() =>
                    onCopy(
                      `${land.user?.full_name} - ${land.user?.email} - ${land.user?.phone}`,
                      "owner_info"
                    )
                  }
                  title="نسخ بيانات المالك"
                />
              </div>
            }
          />

          <InfoCard
            label="الموقع"
            value={`${land.region} - ${land.city}`}
          />
        </div>
      </section>

      {/* ===================== Classification ===================== */}
      <section>
        <SectionHeader title="التصنيف والخصائص" icon={FiLayers} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard label="نوع الأرض" value={getLandTypeBadge(land.land_type)} />
          <InfoCard label="الغرض" value={getPurposeBadge(land.purpose)} />
          <InfoCard label="المساحة الكلية" value={`${land.total_area} م²`} />
        </div>
      </section>

      {/* ===================== Financial ===================== */}
      {(land.price_per_sqm || land.estimated_investment_value) && (
        <section>
          <SectionHeader title="البيانات المالية" icon={FiDollarSign} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {land.price_per_sqm && (
              <InfoCard
                label="سعر المتر"
                value={`${land.price_per_sqm} ريال / م²`}
              />
            )}

            {land.estimated_investment_value && (
              <InfoCard
                label="القيمة الاستثمارية"
                value={`${land.estimated_investment_value} ريال`}
                action={
                  <CopyButton
                    active={copyStatus["investment_value"]}
                    onClick={() =>
                      onCopy(
                        `${land.estimated_investment_value} ريال`,
                        "investment_value"
                      )
                    }
                    title="نسخ القيمة الاستثمارية"
                  />
                }
              />
            )}
          </div>
        </section>
      )}

      {/* ===================== Legal ===================== */}
      <section>
        <SectionHeader title="البيانات النظامية" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            label="رقم الإعلان"
            value={land.announcement_number}
            action={
              <CopyButton
                active={copyStatus["announcement_number"]}
                onClick={() =>
                  onCopy(land.announcement_number, "announcement_number")
                }
                title="نسخ رقم الإعلان"
              />
            }
          />

          <InfoCard
            label="رقم الصك"
            value={land.deed_number}
            action={
              <CopyButton
                active={copyStatus["deed_number"]}
                onClick={() => onCopy(land.deed_number, "deed_number")}
                title="نسخ رقم الصك"
              />
            }
          />

          {land.agency_number && (
            <InfoCard
              label="رقم الوكالة"
              value={land.agency_number}
              action={
                <CopyButton
                  active={copyStatus["agency_number"]}
                  onClick={() =>
                    onCopy(land.agency_number, "agency_number")
                  }
                  title="نسخ رقم الوكالة"
                />
              }
            />
          )}
        </div>
      </section>

      {/* ===================== Rejection ===================== */}
      {land.status === "مرفوض" && land.rejection_reason && (
        <section>
          <SectionHeader title="سبب الرفض" icon={FiX} />

          <InfoCard
            label="ملاحظات الإدارة"
            value={land.rejection_reason}
            highlight
            action={
              <CopyButton
                active={copyStatus["rejection_reason"]}
                onClick={() =>
                  onCopy(land.rejection_reason, "rejection_reason")
                }
                title="نسخ سبب الرفض"
              />
            }
          />
        </section>
      )}

      {/* ===================== Meta ===================== */}
      <section>
        <SectionHeader title="معلومات إضافية" icon={FiCalendar} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard label="الإحداثيات" value={land.geo_location_text} />
          <InfoCard
            label="تاريخ الإضافة"
            value={formatDate(land.created_at)}
          />
        </div>
      </section>

      {/* ===================== Description ===================== */}
      <section>
        <SectionHeader title="وصف الأرض" />

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-700 leading-loose">
            {land.description}
          </p>
        </div>
      </section>

      {/* ===================== Dimensions ===================== */}
      <section>
        <SectionHeader title="أبعاد الأرض" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["الشمال", land.length_north],
            ["الجنوب", land.length_south],
            ["الشرق", land.length_east],
            ["الغرب", land.length_west],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-gray-200 bg-white p-4 text-center"
            >
              <div className="text-xs text-gray-500 mb-1">{label}</div>
              <div className="font-semibold text-gray-800">{value} م</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandDetailsInfo;
