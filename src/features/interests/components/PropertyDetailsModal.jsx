import React from "react";
import { FiMap, FiCopy } from "react-icons/fi";
import { IMAGE_BASE_URL } from "../constants/interestsConstants";

const InfoCard = ({ label, value, copyKey, copyToClipboard, copyStatus, children }) => {
  if (!value && !children) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col space-y-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center justify-between">
        <span className="text-gray-800 truncate">{value}</span>
        {copyKey && value && (
          <button
            onClick={() => copyToClipboard(value, copyKey)}
            title={`نسخ ${label}`}
            className={`p-1 rounded transition ${
              copyStatus[copyKey] ? "bg-green-100 text-green-600" : "text-gray-400 hover:bg-gray-100"
            }`}
          >
            <FiCopy size={16} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
    <div className="flex items-center px-6 py-4 border-b border-gray-200">
      <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
    </div>
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);

const PropertyDetailsModal = ({ propertyModal, closePropertyModal, copyToClipboard, copyStatus }) => {
  if (!propertyModal.show) return null;

  const property = propertyModal.property;

  const renderPropertyDetails = () => {
    if (!property) return null;

    return (
      <div className="space-y-6">
        {/* المعلومات الأساسية */}
        <Section title="المعلومات الأساسية">
          <InfoCard
            label="عنوان العقار"
            value={property.title || "غير متوفر"}
            copyKey="property_title"
            copyToClipboard={copyToClipboard}
            copyStatus={copyStatus}
          />
          <InfoCard
            label="رقم الإعلان"
            value={property.announcement_number || "غير متوفر"}
            copyKey="announcement_number"
            copyToClipboard={copyToClipboard}
            copyStatus={copyStatus}
          />
          <InfoCard
            label="نوع الأرض"
            value={property.land_type || "غير محدد"}
            children={
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
            }
          />
          <InfoCard
            label="الغرض"
            value={property.purpose || "غير محدد"}
            children={
              <div
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  property.purpose === "بيع" ? "bg-red-100 text-red-800" : "bg-indigo-100 text-indigo-800"
                }`}
              >
                {property.purpose || "غير محدد"}
              </div>
            }
          />
        </Section>

        {/* الموقع والمساحة */}
        <Section title="الموقع والمساحة">
          <InfoCard
            label="المنطقة"
            value={property.region || "غير متوفر"}
            copyKey="property_region"
            copyToClipboard={copyToClipboard}
            copyStatus={copyStatus}
          />
          <InfoCard
            label="المدينة"
            value={property.city || "غير متوفر"}
            copyKey="property_city"
            copyToClipboard={copyToClipboard}
            copyStatus={copyStatus}
          />
          <InfoCard
            label="المساحة الكلية"
            value={property.total_area ? `${property.total_area} م²` : "غير محدد"}
            copyKey="property_area"
            copyToClipboard={copyToClipboard}
            copyStatus={copyStatus}
          />
          <InfoCard
            label="الإحداثيات"
            value={property.geo_location_text || "غير متوفر"}
            copyKey="geo_location"
            copyToClipboard={copyToClipboard}
            copyStatus={copyStatus}
          />
        </Section>

        {/* المعلومات المالية */}
        {(property.price_per_sqm || property.estimated_investment_value) && (
          <Section title="المعلومات المالية">
            {property.price_per_sqm && (
              <InfoCard
                label="سعر المتر"
                value={`${property.price_per_sqm} ريال/م²`}
                copyKey="price_per_sqm"
                copyToClipboard={copyToClipboard}
                copyStatus={copyStatus}
              />
            )}
            {property.estimated_investment_value && (
              <InfoCard
                label="القيمة الاستثمارية"
                value={`${property.estimated_investment_value} ريال`}
                copyKey="investment_value"
                copyToClipboard={copyToClipboard}
                copyStatus={copyStatus}
              />
            )}
          </Section>
        )}

        {/* المعلومات القانونية */}
        <Section title="المعلومات القانونية">
          <InfoCard
            label="رقم الصك"
            value={property.deed_number || "غير متوفر"}
            copyKey="deed_number"
            copyToClipboard={copyToClipboard}
            copyStatus={copyStatus}
          />
          {property.agency_number && (
            <InfoCard
              label="رقم الوكالة"
              value={property.agency_number}
              copyKey="agency_number"
              copyToClipboard={copyToClipboard}
              copyStatus={copyStatus}
            />
          )}
        </Section>

        {/* الوصف */}
        {property.description && (
          <Section title="الوصف">
            <InfoCard
              value={property.description}
              copyKey="property_description"
              copyToClipboard={copyToClipboard}
              copyStatus={copyStatus}
            />
          </Section>
        )}

        {/* معلومات المالك */}
        {property.user && (
          <Section title="معلومات المالك">
            <InfoCard
              label="اسم المالك"
              value={property.user.full_name || "غير متوفر"}
              copyKey="owner_name"
              copyToClipboard={copyToClipboard}
              copyStatus={copyStatus}
            />
            <InfoCard
              label="البريد الإلكتروني"
              value={property.user.email || "غير متوفر"}
              copyKey="owner_email"
              copyToClipboard={copyToClipboard}
              copyStatus={copyStatus}
            />
            <InfoCard
              label="رقم الهاتف"
              value={property.user.phone || "غير متوفر"}
              copyKey="owner_phone"
              copyToClipboard={copyToClipboard}
              copyStatus={copyStatus}
            />
          </Section>
        )}

        {/* صور العقار */}
        {property.images && property.images.length > 0 && (
          <Section title={`صور العقار (${property.images.length})`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {property.images.map((image, index) => (
                <div
                  key={image.id}
                  className="border border-gray-200 rounded-xl overflow-hidden relative"
                >
                  <img
                    src={`${IMAGE_BASE_URL}${image.image_path}`}
                    alt={`صورة ${index + 1}`}
                    className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() =>
                      window.open(`${IMAGE_BASE_URL}${image.image_path}`, "_blank")
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
          </Section>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FiMap className="text-gray-500" />
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
              <div className="flex space-x-2 space-x-reverse">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
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
