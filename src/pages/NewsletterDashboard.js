import React, { useState } from "react";
import axios from "axios";
import { Send, Mail, FileText, Eye, EyeOff, CheckCircle, XCircle, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NewsletterDashboard = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const response = await axios.post("https://core-api-x41.shaheenplus.sa/admin/newsletter/send", {
        title,
        content,
      });

      if (response.data.success) {
        setSuccessMsg(response.data.message || "تم إرسال الرسالة الإخبارية بنجاح!");
        setTitle("");
        setContent("");
        setCharCount(0);
      } else {
        setErrorMsg("حدث خطأ غير متوقع، يرجى المحاولة لاحقًا.");
      }

      setTimeout(() => setSuccessMsg(""), 5000);
      setTimeout(() => setErrorMsg(""), 5000);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى."
      );
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
      <div className="max-w-6xl mx-auto">

        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            لوحة إدارة الرسائل الإخبارية
          </h1>
          <p className="text-gray-600">أرسل رسائل احترافية لجميع المشتركين في قائمتك البريدية</p>
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
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <p className="text-green-800 font-medium">{successMsg}</p>
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
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <p className="text-red-800 font-medium">{errorMsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  إنشاء رسالة جديدة
                </h2>
              </div>

              <form onSubmit={handleSend} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    عنوان الرسالة
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-right focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 hover:border-gray-300"
                    placeholder="مثال: عروض حصرية لهذا الأسبوع"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                      <Mail className="w-4 h-4 text-blue-600" />
                      محتوى الرسالة
                    </label>
                    <span className="text-xs text-gray-500">{charCount} حرف</span>
                  </div>
                  <textarea
                    value={content}
                    onChange={handleContentChange}
                    required
                    rows={12}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-right focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 hover:border-gray-300 resize-none font-sans"
                    placeholder="أدخل محتوى الرسالة هنا... يمكنك استخدام HTML للتنسيق"
                    dir="rtl"
                  />
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    يدعم تنسيق HTML للتحكم الكامل في التصميم
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading || !title || !content}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2 group"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        إرسال الرسالة الآن
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    disabled={!content}
                    className="sm:w-auto bg-gray-100 text-gray-700 font-semibold py-3.5 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {showPreview ? (
                      <>
                        <EyeOff className="w-5 h-5" />
                        إخفاء المعاينة
                      </>
                    ) : (
                      <>
                        <Eye className="w-5 h-5" />
                        معاينة
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Preview Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  معاينة مباشرة
                </h2>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {showPreview && content ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-4"
                    >
                      {title && (
                        <div className="pb-4 border-b-2 border-gray-100">
                          <h3 className="text-lg font-bold text-gray-800 text-right" dir="rtl">
                            {title}
                          </h3>
                        </div>
                      )}
                      
                      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border-2 border-gray-100 max-h-96 overflow-y-auto">
                        <div
                          className="prose prose-sm max-w-none text-right prose-headings:text-right prose-p:text-right"
                          style={{ direction: "rtl" }}
                          dangerouslySetInnerHTML={{ __html: content }}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-12 text-center"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium mb-2">لا توجد معاينة</p>
                      <p className="text-sm text-gray-400 max-w-xs">
                        ابدأ بكتابة المحتوى واضغط على زر المعاينة لرؤية الرسالة
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterDashboard;
