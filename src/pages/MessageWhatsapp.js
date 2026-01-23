import React, { useState } from "react";
import { Send, CheckCircle, AlertCircle, X, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function BroadcastMessageAdmin() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const API_BASE_URL = "https://core-api-x41.shaheenplus.sa"; // استبدل برابط API الخاص بك

  const clearAlerts = () => {
    setSuccessMessage("");
    setErrors({});
    setGeneralError("");
  };

  const validateClientSide = () => {
    if (!message.trim()) {
      setErrors({ message: ["حقل الرسالة مطلوب."] });
      return false;
    }
    if (message.trim().length < 5) {
      setErrors({ message: ["يجب أن تحتوي الرسالة على 5 أحرف على الأقل."] });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (!validateClientSide()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/whatsapp/send-to-all`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: message.trim() }),
        },
      );

      const data = await response.json();

      // ✅ نجاح كامل من الباك اند
      if (response.ok && data.status === "completed") {
        setSuccessMessage(
          `تم الإرسال بنجاح ✅
عدد الناجحين: ${data.sent_successfully}
عدد الفاشلين: ${data.failed}`,
        );
        setMessage("");
      }

      // ❌ أخطاء تحقق (Validation)
      else if (response.status === 422) {
        setErrors(data.errors || {});
      }

      // ❌ غير مصرح
      else if (response.status === 401) {
        setGeneralError(
          data.message || "غير مصرح. يرجى تسجيل الدخول مرة أخرى.",
        );
      }

      // ❌ ليس أدمن
      else if (response.status === 403) {
        setGeneralError(data.message || "ليس لديك صلاحية لتنفيذ هذا الإجراء.");
      }

      // ❌ أي خطأ آخر
      else {
        setGeneralError(data.message || "حدث خطأ غير متوقع.");
      }
    } catch (error) {
      setGeneralError(
        "خطأ في الشبكة. يرجى التحقق من اتصالك والمحاولة مرة أخرى.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const characterCount = message.length;
  const isValid = message.trim().length >= 5;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-2xl mx-auto">
        {/* الترويسة */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Radio className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              رسالة البث
            </h1>
          </div>
          <p className="text-gray-600 mr-12">
            إرسال رسالة لجميع المستخدمين المسجلين فوراً
          </p>
        </div>

        {/* تنبيه النجاح */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mb-6"
            >
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-800">نجاح!</h3>
                    <p className="text-green-700 text-sm mt-1">
                      {successMessage}
                    </p>
                  </div>
                  <button
                    onClick={() => setSuccessMessage("")}
                    className="text-green-500 hover:text-green-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* تنبيه الخطأ العام */}
        <AnimatePresence>
          {generalError && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mb-6"
            >
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800">خطأ</h3>
                    <p className="text-red-700 text-sm mt-1">{generalError}</p>
                  </div>
                  <button
                    onClick={() => setGeneralError("")}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* البطاقة الرئيسية */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden"
        >
          {/* رأس البطاقة */}
          <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-gray-800">
              كتابة الرسالة
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              سيتم إرسال هذه الرسالة لجميع المستخدمين في النظام
            </p>
          </div>

          {/* محتوى البطاقة */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* حقل النص */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  محتوى الرسالة
                </label>
                <div className="relative">
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message) setErrors({});
                    }}
                    placeholder="أدخل رسالة البث هنا..."
                    rows={5}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 resize-none focus:outline-none focus:ring-0 ${
                      errors.message
                        ? "border-red-300 bg-red-50 focus:border-red-400"
                        : "border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white"
                    }`}
                    disabled={isLoading}
                  />
                </div>

                {/* عداد الأحرف وتلميح التحقق */}
                <div className="flex justify-between items-center mt-2">
                  <div>
                    {errors.message && (
                      <motion.p
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm text-red-600 flex items-center gap-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.message[0]}
                      </motion.p>
                    )}
                    {!errors.message &&
                      message.length > 0 &&
                      message.length < 5 && (
                        <p className="text-sm text-amber-600">
                          تحتاج {5 - message.length} حرف
                          {5 - message.length !== 1 ? " إضافي" : " إضافي"}
                        </p>
                      )}
                  </div>
                  <span
                    className={`text-sm ${characterCount < 5 ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {characterCount} حرف
                  </span>
                </div>
              </div>

              {/* زر الإرسال */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || !message.trim()}
                  style={{
                    backgroundColor:
                      isLoading || !message.trim() ? "#9fc2f7" : "#3a83f2",
                  }}
                  className={`w-full py-3.5 px-6 rounded-xl text-white font-semibold 
                    flex items-center justify-center gap-2 transition-all duration-200
                    ${
                      isLoading || !message.trim()
                        ? "cursor-not-allowed"
                        : "hover:shadow-lg hover:shadow-blue-200 active:scale-98"
                    }`}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>جارٍ الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>إرسال البث</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* تذييل البطاقة */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
            <div className="flex items-start gap-2 text-sm text-gray-500">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                يتم إرسال رسائل البث فوراً ولا يمكن استرجاعها. يرجى مراجعة
                رسالتك قبل الإرسال.
              </p>
            </div>
          </div>
        </motion.div>

        {/* معلومات التذييل */}
        <div className="mt-6 text-center text-sm text-gray-400">
          نظام البث الإداري الإصدار 1.0
        </div>
      </div>
    </div>
  );
}

export default BroadcastMessageAdmin;
