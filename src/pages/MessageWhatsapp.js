import React, { useState, useRef } from "react";
import {
  Send,
  CheckCircle,
  AlertCircle,
  X,
  Radio,
  Paperclip,
  FileText,
  Image,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function BroadcastMessageAdmin() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const fileInputRef = useRef(null);

  // Allowed file types with MIME types
  const allowedTypes = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "image/webp": [".webp"],
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
  };

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const getAuthToken = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("token");

    if (!token) {
      console.error("Token not found. Please login first.");
      return null;
    }

    return token;
  };

  const API_BASE_URL = "https://core-api-x41.shaheenplus.sa";

  const clearAlerts = () => {
    setSuccessMessage("");
    setErrors({});
    setGeneralError("");
  };

  const validateClientSide = () => {
    const newErrors = {};

    // Check if at least one of message or file is provided
    if (!message.trim() && !selectedFile) {
      newErrors.general = ["يجب إدخال رسالة أو اختيار ملف."];
      setErrors(newErrors);
      return false;
    }

    // Validate message if provided alone (without file)
    if (message.trim() && !selectedFile && message.trim().length < 5) {
      newErrors.message = ["يجب أن تحتوي الرسالة على 5 أحرف على الأقل."];
      setErrors(newErrors);
      return false;
    }

    // Validate message if provided with file
    if (selectedFile && message.trim() && message.trim().length < 5) {
      newErrors.message = [
        "يجب أن تحتوي الرسالة على 5 أحرف على الأقل إذا تم إدخالها.",
      ];
      setErrors(newErrors);
      return false;
    }

    // Validate caption if file is selected and caption is provided
    if (selectedFile && caption.trim() && caption.trim().length < 5) {
      newErrors.caption = ["يجب أن يحتوي الوصف على 5 أحرف على الأقل."];
      setErrors(newErrors);
      return false;
    }

    // Validate file if selected
    if (selectedFile) {
      if (!Object.keys(allowedTypes).includes(selectedFile.type)) {
        newErrors.file = [
          "نوع الملف غير مدعوم. الأنواع المسموحة: صور (JPEG, PNG, GIF, WEBP) و مستندات (PDF, DOC, DOCX)",
        ];
        setErrors(newErrors);
        return false;
      }

      if (selectedFile.size > maxFileSize) {
        newErrors.file = ["حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت."];
        setErrors(newErrors);
        return false;
      }
    }

    return true;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    clearAlerts();

    // Validate file type
    if (!Object.keys(allowedTypes).includes(file.type)) {
      setErrors({
        file: [
          "نوع الملف غير مدعوم. الأنواع المسموحة: صور (JPEG, PNG, GIF, WEBP) و مستندات (PDF, DOC, DOCX)",
        ],
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setErrors({ file: ["حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت."] });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setCaption("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Return the full data URL (includes mime type prefix)
        resolve(reader.result);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (!validateClientSide()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("يجب تسجيل الدخول أولاً. التوكن غير موجود.");
      }

      let response;
      let data;

      if (selectedFile) {
        // File upload mode - use POST
        setIsUploadingFile(true);

        // Convert file to base64
        const formData = new FormData();
        formData.append("file", selectedFile);

        if (caption.trim()) {
          formData.append("caption", caption.trim());
        }

        if (message.trim()) {
          formData.append("message", message.trim());
        }

        // Determine caption: use caption if provided, otherwise use message
        const fileCaption = caption.trim() || message.trim() || "";

        // Prepare request body
        const requestBody = {
          body: base64File,
          filename: selectedFile.name,
        };

        if (fileCaption) {
          requestBody.caption = fileCaption;
        }

        // Send POST request for file
        response = await fetch(
          `${API_BASE_URL}/api/admin/whatsapp/send-file-to-all`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            body: formData,
          },
        );
      } else {
        // Text message mode - use GET
        const queryMessage = encodeURIComponent(message.trim());
        const url = `${API_BASE_URL}/api/admin/whatsapp/send-to-all?message=${queryMessage}`;

        response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      }

      data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || "تم الإرسال بنجاح ✅");
        setMessage("");
        setCaption("");
        removeFile();
      } else if (response.status === 422) {
        setErrors(data.errors || {});
      } else if (response.status === 401) {
        setGeneralError(data.message || "التوكن غير صالح أو منتهي الصلاحية.");
      } else if (response.status === 403) {
        setGeneralError(data.message || "ليس لديك صلاحية لإرسال رسائل واتساب.");
      } else {
        setGeneralError(data.message || "حدث خطأ أثناء الإرسال.");
      }
    } catch (err) {
      console.error("WhatsApp API Error:", err);
      setGeneralError(err.message || "لا يمكن الوصول إلى الخادم.");
    } finally {
      setIsLoading(false);
      setIsUploadingFile(false);
    }
  };

  const characterCount = message.length;
  const captionCount = caption.length;

  // Determine if form is valid for submission
  const isFormValid = () => {
    if (selectedFile) {
      // With file: valid if file exists (message is optional)
      // But if message is provided, it must be >= 5 chars
      if (message.trim() && message.trim().length < 5) return false;
      // If caption is provided, it must be >= 5 chars
      if (caption.trim() && caption.trim().length < 5) return false;
      return true;
    } else {
      // Without file: message must be >= 5 chars
      return message.trim().length >= 5;
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return null;
    if (selectedFile.type.startsWith("image/")) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-orange-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileTypeLabel = (type) => {
    if (type.startsWith("image/")) return "صورة";
    if (type === "application/pdf") return "PDF";
    if (type.includes("word")) return "Word";
    return "ملف";
  };

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
            إرسال رسالة أو ملف لجميع المستخدمين المسجلين فوراً
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
          {(generalError || errors.general) && (
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
                    <p className="text-red-700 text-sm mt-1">
                      {generalError || errors.general?.[0]}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setGeneralError("");
                      setErrors({});
                    }}
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
              سيتم إرسال هذه الرسالة أو الملف لجميع المستخدمين في النظام
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
                  محتوى الرسالة{" "}
                  {selectedFile && (
                    <span className="text-gray-400">
                      (اختياري عند إرفاق ملف)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message) {
                        const newErrors = { ...errors };
                        delete newErrors.message;
                        setErrors(newErrors);
                      }
                    }}
                    placeholder={
                      selectedFile
                        ? "أدخل رسالة إضافية (اختياري)..."
                        : "أدخل رسالة البث هنا..."
                    }
                    rows={4}
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
                      !selectedFile &&
                      message.length > 0 &&
                      message.length < 5 && (
                        <p className="text-sm text-amber-600">
                          تحتاج {5 - message.length} حرف إضافي
                        </p>
                      )}
                  </div>
                  <span
                    className={`text-sm ${characterCount < 5 && !selectedFile ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {characterCount} حرف
                  </span>
                </div>
              </div>

              {/* قسم رفع الملف */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  إرفاق ملف أو صورة
                </label>

                {/* زر اختيار الملف */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                  className="hidden"
                  disabled={isLoading}
                />

                {!selectedFile ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="w-full py-4 px-6 border-2 border-dashed border-slate-300 rounded-xl 
                      hover:border-blue-400 hover:bg-blue-50 transition-all duration-200
                      flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-600
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Paperclip className="w-6 h-6" />
                    <span className="text-sm font-medium">
                      اضغط لاختيار ملف
                    </span>
                    <span className="text-xs text-gray-400">
                      صور (JPEG, PNG, GIF, WEBP) أو مستندات (PDF, DOC, DOCX) -
                      حتى 10MB
                    </span>
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-50 rounded-xl p-4 border border-slate-200"
                  >
                    <div className="flex items-start gap-3">
                      {/* معاينة الصورة أو أيقونة الملف */}
                      <div className="flex-shrink-0">
                        {filePreview ? (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                            {getFileIcon()}
                          </div>
                        )}
                      </div>

                      {/* معلومات الملف */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {selectedFile.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {formatFileSize(selectedFile.size)}
                          </span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                            {getFileTypeLabel(selectedFile.type)}
                          </span>
                        </div>
                      </div>

                      {/* زر الحذف */}
                      <button
                        type="button"
                        onClick={removeFile}
                        disabled={isLoading}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* حقل الوصف للملف */}
                    <div className="mt-4">
                      <label
                        htmlFor="caption"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        وصف الملف{" "}
                        <span className="text-gray-400">
                          (اختياري - سيستخدم الرسالة أعلاه إذا تُرك فارغاً)
                        </span>
                      </label>
                      <textarea
                        id="caption"
                        value={caption}
                        onChange={(e) => {
                          setCaption(e.target.value);
                          if (errors.caption) {
                            const newErrors = { ...errors };
                            delete newErrors.caption;
                            setErrors(newErrors);
                          }
                        }}
                        placeholder="أدخل وصفاً للملف..."
                        rows={2}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 resize-none focus:outline-none focus:ring-0 ${
                          errors.caption
                            ? "border-red-300 bg-red-50 focus:border-red-400"
                            : "border-slate-200 bg-white focus:border-blue-400"
                        }`}
                        disabled={isLoading}
                      />
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          {errors.caption && (
                            <motion.p
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-sm text-red-600 flex items-center gap-1"
                            >
                              <AlertCircle className="w-4 h-4" />
                              {errors.caption[0]}
                            </motion.p>
                          )}
                          {!errors.caption &&
                            caption.length > 0 &&
                            caption.length < 5 && (
                              <p className="text-sm text-amber-600">
                                تحتاج {5 - caption.length} حرف إضافي
                              </p>
                            )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {captionCount} حرف
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* خطأ الملف */}
                {errors.file && (
                  <motion.p
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-red-600 flex items-center gap-1 mt-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.file[0]}
                  </motion.p>
                )}
              </div>

              {/* Method indicator */}
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-slate-50 px-3 py-2 rounded-lg">
                <span
                  className={`px-2 py-0.5 rounded font-mono ${selectedFile ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                >
                  {selectedFile ? "POST" : "GET"}
                </span>
                <span>
                  {selectedFile
                    ? "سيتم رفع الملف كـ Base64 عبر POST"
                    : "سيتم إرسال الرسالة النصية عبر GET"}
                </span>
              </div>

              {/* زر الإرسال */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid()}
                  style={{
                    backgroundColor:
                      isLoading || !isFormValid() ? "#9fc2f7" : "#3a83f2",
                  }}
                  className={`w-full py-3.5 px-6 rounded-xl text-white font-semibold 
                    flex items-center justify-center gap-2 transition-all duration-200
                    ${
                      isLoading || !isFormValid()
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
                      <span>
                        {isUploadingFile
                          ? "جارٍ رفع الملف وإرساله..."
                          : "جارٍ الإرسال..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>{selectedFile ? "إرسال الملف" : "إرسال البث"}</span>
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
                رسالتك أو ملفك قبل الإرسال.
              </p>
            </div>
          </div>
        </motion.div>

        {/* معلومات التذييل */}
        <div className="mt-6 text-center text-sm text-gray-400">
          نظام البث الإداري الإصدار 2.0
        </div>
      </div>
    </div>
  );
}

export default BroadcastMessageAdmin;
