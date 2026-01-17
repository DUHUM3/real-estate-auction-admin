import React, { useState } from 'react';
import { FiImage } from 'react-icons/fi';

const AddClientModal = ({ show, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    logo: null
  });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة فقط');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الملف يجب أن يكون أقل من 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        logo: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('يرجى إدخال اسم العميل');
      return;
    }

    await onSubmit(formData);
    setFormData({ name: '', website: '', logo: null });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">إضافة عميل جديد</h3>
          <button 
            className="text-gray-500 hover:text-gray-700 text-2xl"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">اسم العميل *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="أدخل اسم العميل"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">الموقع الإلكتروني</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">شعار العميل</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="logo-upload"
              />
              <label htmlFor="logo-upload" className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                <FiImage className="ml-2 text-gray-400" />
                <span className="text-gray-600">
                  {formData.logo ? formData.logo.name : 'اختر ملف الشعار'}
                </span>
              </label>
            </div>
            {formData.logo && (
              <div className="mt-3">
                <img 
                  src={URL.createObjectURL(formData.logo)} 
                  alt="معاينة الشعار"
                  className="max-w-[100px] max-h-[60px] rounded border border-gray-300"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button 
              type="button"
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              onClick={onClose}
              disabled={isLoading}
            >
              إلغاء
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'جاري الإضافة...' : 'إضافة العميل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientModal;