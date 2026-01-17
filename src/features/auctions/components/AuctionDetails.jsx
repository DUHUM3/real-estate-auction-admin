import React from "react";
import {
  FiCopy,
  FiCalendar,
  FiMapPin,
  FiEye,
  FiUser,
  FiImage,
  FiVideo,
  FiMaximize2,
  FiEdit,
  FiX,
} from "react-icons/fi";
import { formatDate, formatDateTime } from "../utils/formatters";
import useCopyToClipboard from "../hooks/useCopyToClipboard";

/* -------------------------------------------------------------------------- */
/*                               UI Components                                */
/* -------------------------------------------------------------------------- */

const SectionHeader = ({ title, icon: Icon, action }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center text-gray-700">
      {Icon && <Icon className="ml-2 text-gray-400" size={16} />}
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
    {action}
  </div>
);

const InfoCard = ({ label, value, action, highlight }) => (
  <div
    className={`rounded-xl border bg-white p-4 transition ${
      highlight
        ? "border-red-200 bg-red-50"
        : "border-gray-200 hover:shadow-sm"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-xs text-gray-500 mb-1">{label}</div>
        <div
          className={`text-sm font-medium ${
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
    className={`p-2 rounded-lg transition ${
      active
        ? "bg-green-100 text-green-600"
        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
    }`}
  >
    <FiCopy size={14} />
  </button>
);

/* -------------------------------------------------------------------------- */
/*                              Main Component                                 */
/* -------------------------------------------------------------------------- */

const AuctionDetails = ({ auction, openOwnerModal, openMediaModal }) => {
  const { copyStatus, copyToClipboard } = useCopyToClipboard();

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <SectionHeader
          title="معلومات المزاد الأساسية"
          icon={FiCalendar}
        />

        {/* العنوان */}
        <div className="mb-4">
          <InfoCard
            label="عنوان المزاد"
            value={auction.title}
          />
        </div>

        {/* الحالة + تاريخ المزاد */}
        <div className="space-y-4">
          <InfoCard
            label="الحالة"
            value={
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                {auction.status}
              </span>
            }
          />

          <InfoCard
            label="تاريخ المزاد"
            value={formatDate(auction.auction_date)}
          />
        </div>
      </section>

      {/* ===================== Location ===================== */}
      <section>
        <SectionHeader title="معلومات الموقع" icon={FiMapPin} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard label="المنطقة" value={auction.region} />
          <InfoCard label="المدينة" value={auction.city} />
          <InfoCard label="العنوان التفصيلي" value={auction.address} />
        </div>
      </section>

      {/* ===================== Company ===================== */}
      <section>
        <SectionHeader title="الشركة المنظمة" icon={FiUser} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            label="اسم الشركة"
            value={auction.company?.auction_name || "غير محدد"}
            action={
              auction.company && (
                <div className="flex gap-2">
                  <button
                    onClick={() => openOwnerModal(auction.company)}
                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                    title="عرض تفاصيل الشركة"
                  >
                    <FiEye size={14} />
                  </button>
                  {auction.company?.auction_name && (
                    <CopyButton
                      active={copyStatus["company_info"]}
                      onClick={() =>
                        copyToClipboard(
                          auction.company.auction_name,
                          "company_info"
                        )
                      }
                      title="نسخ اسم الشركة"
                    />
                  )}
                </div>
              )
            }
          />

          <InfoCard
            label="اسم المسؤول"
            value={auction.company?.user?.full_name}
          />
          <InfoCard
            label="البريد الإلكتروني"
            value={auction.company?.user?.email}
          />
          <InfoCard
            label="الهاتف"
            value={auction.company?.user?.phone}
          />
        </div>
      </section>

      {/* ===================== Description ===================== */}
      {auction.description && (
        <section>
          <SectionHeader title="الوصف" icon={FiEdit} />
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {auction.description}
            </p>
          </div>
        </section>
      )}

      {/* ===================== Rejection ===================== */}
      {auction.rejection_reason && (
        <section>
          <SectionHeader title="سبب الرفض" icon={FiX} />
          <InfoCard
            label="ملاحظات الإدارة"
            value={auction.rejection_reason}
            highlight
            action={
              <CopyButton
                active={copyStatus["rejection_reason"]}
                onClick={() =>
                  copyToClipboard(
                    auction.rejection_reason,
                    "rejection_reason"
                  )
                }
                title="نسخ سبب الرفض"
              />
            }
          />
        </section>
      )}

      {/* ===================== Images ===================== */}
      {auction.images?.length > 0 && (
        <section>
          <SectionHeader
            title={`صور المزاد (${auction.images.length})`}
            icon={FiImage}
            action={
              <button
                onClick={() =>
                  openMediaModal(
                    "image",
                    auction.images.map((img) => ({
                      url: `https://core-api-x41.shaheenplus.sa/storage/${img.image_path}`,
                      id: img.id,
                    })),
                    0
                  )
                }
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <FiMaximize2 size={14} />
                عرض الكل
              </button>
            }
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {auction.images.map((img, index) => (
              <div
                key={img.id}
                onClick={() =>
                  openMediaModal(
                    "image",
                    auction.images.map((img) => ({
                      url: `https://core-api-x41.shaheenplus.sa/storage/${img.image_path}`,
                      id: img.id,
                    })),
                    index
                  )
                }
                className="cursor-pointer overflow-hidden rounded-xl border border-gray-200 hover:shadow-md transition"
              >
                <img
                  src={`https://core-api-x41.shaheenplus.sa/storage/${img.image_path}`}
                  alt=""
                  className="h-32 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===================== Videos ===================== */}
      {auction.videos?.length > 0 && (
        <section>
          <SectionHeader title={`فيديوهات المزاد (${auction.videos.length})`} icon={FiVideo} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {auction.videos.map((video) => (
              <div
                key={video.id}
                className="rounded-xl border border-gray-200 bg-black overflow-hidden"
              >
                <video
                  controls
                  className="w-full h-48 object-contain"
                  src={`https://core-api-x41.shaheenplus.sa/storage/${video.video_path}`}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===================== System ===================== */}
      <section>
        <SectionHeader title="معلومات النظام" icon={FiCalendar} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            label="تاريخ الإنشاء"
            value={formatDateTime(auction.created_at)}
          />
          <InfoCard
            label="آخر تحديث"
            value={formatDateTime(auction.updated_at)}
          />
        </div>
      </section>
    </div>
  );
};

export default AuctionDetails;
