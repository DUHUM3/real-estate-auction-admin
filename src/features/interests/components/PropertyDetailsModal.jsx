// Modal for displaying property details
import React from "react";
import { FiMap, FiCopy } from "react-icons/fi";
import { IMAGE_BASE_URL } from "../constants/interestsConstants";

const PropertyDetailsModal = ({
  propertyModal,
  closePropertyModal,
  copyToClipboard,
  copyStatus,
}) => {
  if (!propertyModal.show) return null;

  const property = propertyModal.property;

  const renderPropertyDetails = () => {
    if (!property) return null;

    return (
      <div className="space-y-6">
        {/* المعلومات الأساسية */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            المعلومات الأساسية
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                عنوان العقار
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                <span className="text-gray-800">
                  {property.title || "غير متوفر"}
                </span>
                {property.title && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                      copyStatus["property_title"]
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(property.title, "property_title")
                    }
                    title="نسخ عنوان العقار"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الإعلان
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                <span className="text-gray-800">
                  {property.announcement_number || "غير متوفر"}
                </span>
                {property.announcement_number && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                      copyStatus["announcement_number"]
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        property.announcement_number,
                        "announcement_number"
                      )
                    }
                    title="نسخ رقم الإعلان"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نوع الأرض
              </label>
              <div
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  property.land_type === "سكني"
                    ? "bg-blue-100 text-blue-800"
                    : property.land_type === "تجاري"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {property.land_type || "غير محدد"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الغرض
              </label>
              <div
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  property.purpose === "بيع"
                    ? "bg-red-100 text-red-800"
                    : "bg-indigo-100 text-indigo-800"
                }`}
              >
                {property.purpose || "غير محدد"}
              </div>
            </div>
          </div>
        </div>

        {/* الموقع والمساحة */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            الموقع والمساحة
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المنطقة
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                <span className="text-gray-800">
                  {property.region || "غير متوفر"}
                </span>
                {property.region && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                      copyStatus["property_region"]
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(property.region, "property_region")
                    }
                    title="نسخ المنطقة"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المدينة
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                <span className="text-gray-800">
                  {property.city || "غير متوفر"}
                </span>
                {property.city && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                      copyStatus["property_city"]
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(property.city, "property_city")
                    }
                    title="نسخ المدينة"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المساحة الكلية
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                <span className="text-gray-800">{property.total_area} م²</span>
                <button
                  className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                    copyStatus["property_area"]
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                  onClick={() =>
                    copyToClipboard(
                      `${property.total_area} م²`,
                      "property_area"
                    )
                  }
                  title="نسخ المساحة الكلية"
                >
                  <FiCopy size={16} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الإحداثيات
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                <span className="text-gray-800">
                  {property.geo_location_text || "غير متوفر"}
                </span>
                {property.geo_location_text && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                      copyStatus["geo_location"]
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        property.geo_location_text,
                        "geo_location"
                      )
                    }
                    title="نسخ الإحداثيات"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* المعلومات المالية */}
        {(property.price_per_sqm || property.estimated_investment_value) && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              المعلومات المالية
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {property.price_per_sqm && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    سعر المتر
                  </label>
                  <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                    <span className="text-gray-800">
                      {property.price_per_sqm} ريال/م²
                    </span>
                    <button
                      className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                        copyStatus["price_per_sqm"]
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                      onClick={() =>
                        copyToClipboard(
                          `${property.price_per_sqm} ريال/م²`,
                          "price_per_sqm"
                        )
                      }
                      title="نسخ سعر المتر"
                    >
                      <FiCopy size={16} />
                    </button>
                  </div>
                </div>
              )}
              {property.estimated_investment_value && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    القيمة الاستثمارية
                  </label>
                  <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                    <span className="text-gray-800">
                      {property.estimated_investment_value} ريال
                    </span>
                    <button
                      className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                        copyStatus["investment_value"]
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                      onClick={() =>
                        copyToClipboard(
                          `${property.estimated_investment_value} ريال`,
                          "investment_value"
                        )
                      }
                      title="نسخ القيمة الاستثمارية"
                    >
                      <FiCopy size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* المعلومات القانونية */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            المعلومات القانونية
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الصك
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                <span className="text-gray-800">
                  {property.deed_number || "غير متوفر"}
                </span>
                {property.deed_number && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                      copyStatus["deed_number"]
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(property.deed_number, "deed_number")
                    }
                    title="نسخ رقم الصك"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
            {property.agency_number && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الوكالة
                </label>
                <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                  <span className="text-gray-800">
                    {property.agency_number}
                  </span>
                  <button
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                      copyStatus["agency_number"]
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(property.agency_number, "agency_number")
                    }
                    title="نسخ رقم الوكالة"
                  >
                    <FiCopy size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* الوصف */}
        {property.description && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              الوصف
            </h4>
            <div className="flex items-start justify-between bg-gray-50 rounded-md p-4">
              <p className="text-gray-800 flex-1">{property.description}</p>
              <button
                className={`p-1 rounded hover:bg-gray-200 transition-colors ml-2 ${
                  copyStatus["property_description"]
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
                onClick={() =>
                  copyToClipboard(property.description, "property_description")
                }
                title="نسخ الوصف"
              >
                <FiCopy size={16} />
              </button>
            </div>
          </div>
        )}

        {/* معلومات المالك */}
        {property.user && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              معلومات المالك
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المالك
                </label>
                <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                  <span className="text-gray-800">
                    {property.user.full_name || "غير متوفر"}
                  </span>
                  {property.user.full_name && (
                    <button
                      className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                        copyStatus["owner_name"]
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                      onClick={() =>
                        copyToClipboard(property.user.full_name, "owner_name")
                      }
                      title="نسخ اسم المالك"
                    >
                      <FiCopy size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني
                </label>
                <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                  <span className="text-gray-800">
                    {property.user.email || "غير متوفر"}
                  </span>
                  {property.user.email && (
                    <button
                      className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                        copyStatus["owner_email"]
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                      onClick={() =>
                        copyToClipboard(property.user.email, "owner_email")
                      }
                      title="نسخ البريد الإلكتروني"
                    >
                      <FiCopy size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الهاتف
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                <span className="text-gray-800">
                  {property.user.phone || "غير متوفر"}
                </span>
                {property.user.phone && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                      copyStatus["owner_phone"]
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(property.user.phone, "owner_phone")
                    }
                    title="نسخ رقم الهاتف"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* الصور */}
        {property.images && property.images.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              صور العقار ({property.images.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {property.images.map((image, index) => (
                <div
                  key={image.id}
                  className="border border-gray-200 rounded-lg overflow-hidden relative"
                >
                  <img
                    src={`${IMAGE_BASE_URL}${image.image_path}`}
                    alt={`صورة ${index + 1}`}
                    className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() =>
                      window.open(
                        `${IMAGE_BASE_URL}${image.image_path}`,
                        "_blank"
                      )
                    }
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/300x200?text=صورة+غير+متوفرة";
                    }}
                  />
                  <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    صورة {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FiMap className="ml-2" />
            تفاصيل العقار
          </h3>
          <button
            className="text-gray-400 hover:text-gray-600 text-2xl"
            onClick={closePropertyModal}
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {propertyModal.loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                <div
                  className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <p className="mt-4 text-gray-600">جاري تحميل تفاصيل العقار...</p>
            </div>
          ) : (
            renderPropertyDetails()
          )}
        </div>
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            onClick={closePropertyModal}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsModal;