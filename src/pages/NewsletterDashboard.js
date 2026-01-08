import React, { useState } from "react";
import { Send, Mail, FileText, Eye, EyeOff, CheckCircle, XCircle, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const NewsletterDashboard = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // دالة لاستخراج التوكن من التخزين المحلي
  const getAuthToken = () => {
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('access_token') ||
                  sessionStorage.getItem('token');
    
    if (!token) {
      console.error('Token not found. Please login first.');
      return null;
    }
    
    return token;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error("يجب تسجيل الدخول أولاً. التوكن غير موجود.");
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      const data = {
        title: title,
        content: content
      };

      console.log('Sending data to API:', {
        url: 'https://core-api-x41.shaheenplus.sa/api/admin/newsletter/send',
        data: data,
        headers: headers
      });

      const response = await axios.post(
        'https://core-api-x41.shaheenplus.sa/api/admin/newsletter/send',
        data,
        { headers: headers }
      );

      console.log('API Response:', response.data);
      
      setSuccessMsg(response.data?.message || "تم إرسال الرسالة الإخبارية بنجاح إلى جميع المشتركين!");
      
      setTitle("");
      setContent("");
      setCharCount(0);
      
      setTimeout(() => setSuccessMsg(""), 5000);
      
    } catch (err) {
      console.error('API Error:', err);
      
      let errorMessage = "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.";
      
      if (err.response) {
        console.error('Response Error:', err.response);
        
        if (err.response.status === 401) {
          errorMessage = "التوكن غير صالح أو منتهي الصلاحية. يرجى تسجيل الدخول مرة أخرى.";
        } else if (err.response.status === 403) {
          errorMessage = "ليس لديك صلاحية لإرسال الرسائل الإخبارية.";
        } else if (err.response.status === 422) {
          errorMessage = "بيانات غير صحيحة: " + 
            (err.response.data?.errors ? 
              Object.values(err.response.data.errors).flat().join(', ') : 
              err.response.data?.message);
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        console.error('Request Error:', err.request);
        errorMessage = "لا يمكن الوصول إلى الخادم. يرجى التحقق من اتصال الإنترنت.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setErrorMsg(errorMessage);
      setTimeout(() => setErrorMsg(""), 5000);
      
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setCharCount(newContent.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            إرسال رسائل إخبارية
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            أرسل رسائل إخبارية مهنية إلى جميع المشتركين في قائمتك البريدية
          </p>
        </motion.div>

        {/* Alert Messages */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-r-4 border-green-500 rounded-lg p-4 shadow-md"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-800 font-medium text-sm md:text-base">{successMsg}</p>
              </div>
            </motion.div>
          )}
          
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-r-4 border-red-500 rounded-lg p-4 shadow-md"
            >
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800 font-medium text-sm md:text-base">{errorMsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Form - Centered */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    إنشاء رسالة جديدة
                  </h2>
                  <p className="text-blue-100 text-sm">
                    اكتب رسالتك الإخبارية وأرسلها للمشتركين
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSend} className="p-6 md:p-8 space-y-6">
            {/* Title Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  عنوان الرسالة *
                </label>
                <span className="text-xs text-gray-500">
                  {title.length} حرف
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-right focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all duration-200 hover:border-gray-300 text-gray-800"
                placeholder="أدخل عنواناً جذاباً للرسالة..."
                dir="rtl"
              />
            </div>

            {/* Content Textarea */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                  <Mail className="w-4 h-4 text-blue-600" />
                  محتوى الرسالة *
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">
                    {charCount} حرف
                  </span>
                  <span className="text-xs text-gray-500">
                    {content.trim() ? content.trim().split(/\s+/).length : 0} كلمة
                  </span>
                </div>
              </div>
              <div className="relative">
                <textarea
                  value={content}
                  onChange={handleContentChange}
                  required
                  rows={12}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-right focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all duration-200 hover:border-gray-300 resize-none text-gray-800"
                  placeholder="اكتب محتوى رسالتك هنا... يدعم HTML للتنسيق المتقدم"
                  dir="rtl"
                />
                <div className="absolute bottom-3 left-3 text-xs text-gray-400">
                  يدعم HTML
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                يمكنك استخدام تنسيق HTML لعرض قوائم، روابط، وتنسيقات نصية
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading || !title || !content}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      <span>إرسال الرسالة للمشتركين</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTitle("");
                    setContent("");
                    setCharCount(0);
                    setErrorMsg("");
                  }}
                  className="sm:w-auto bg-gray-100 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  مسح الكل
                </button>
              </div>
            </div>

            {/* Mobile Preview Button */}
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              disabled={!content}
              className="sm:hidden w-full bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200"
            >
              {showPreview ? (
                <>
                  <EyeOff className="w-5 h-5" />
                  إخفاء المعاينة
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" />
                  معاينة الرسالة ({content.trim() ? content.trim().split(/\s+/).length : 0} كلمة)
                </>
              )}
            </button>
          </form>
        </motion.div>
        {/* Tips Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
        >
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            نصائح للرسائل الإخبارية الفعالة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">عنوان جذاب</h4>
                <p className="text-sm text-gray-600">اختر عنواناً واضحاً يجذب القارئ</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">محتوى مختصر</h4>
                <p className="text-sm text-gray-600">اجعل المحتوى مركزاً وواضحاً</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">تنسيق HTML</h4>
                <p className="text-sm text-gray-600">استخدم العناوين والقوائم لتحسين القراءة</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">روابط واضحة</h4>
                <p className="text-sm text-gray-600">أضف روابط مباشرة للتحويلات</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NewsletterDashboard;