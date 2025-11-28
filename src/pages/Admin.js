import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
  Settings,
  Trash2,
  Edit3,
  Users,
} from "lucide-react";

// ============ المكونات المنفصلة ============

// مكون حقل الإدخال
const InputField = memo(
  ({
    label,
    name,
    type,
    value,
    placeholder,
    icon: Icon,
    showPassword,
    onTogglePassword,
    onChange,
    onFocus,
    onBlur,
    ...props
  }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mb-4"
    >
      <label className="block text-gray-700 text-sm font-medium mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="relative flex items-center">
          <Icon className="absolute right-4 w-5 h-5 text-gray-500" />
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            className="w-full bg-white text-gray-800 placeholder-gray-500 px-12 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 transition-colors text-right"
            placeholder={placeholder}
            {...props}
          />
          {onTogglePassword && (
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute left-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
);

// مكون زر الإرسال
const SubmitButton = memo(({ loading, children, icon: Icon, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="pt-4"
  >
    <button
      type="submit"
      disabled={loading}
      className={`w-full relative overflow-hidden rounded-lg py-3 px-6 font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
        loading
          ? "bg-blue-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
      }`}
      {...props}
    >
      {loading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
          />
          جاري المعالجة...
        </>
      ) : (
        <>
          {children}
          {Icon && <Icon className="w-5 h-5" />}
        </>
      )}
    </button>
  </motion.div>
));

// مكون عرض البروفايل
const ProfileDisplay = memo(({ data, onEdit }) => (
  <div className="space-y-6">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-right mb-8"
    >
      <div className="w-20 h-20 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
        <User className="w-10 h-10 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        معلومات البروفايل
      </h3>
      <p className="text-gray-600">عرض وإدارة بياناتك الشخصية</p>
    </motion.div>

    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white border border-gray-200 rounded-lg p-6"
      >
        <div className="flex items-center gap-4 mb-3">
          <User className="w-5 h-5 text-blue-500" />
          <span className="text-gray-600 text-sm">الاسم الكامل</span>
        </div>
        <p className="text-gray-800 text-lg font-medium">
          {data.full_name || "غير محدد"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-gray-200 rounded-lg p-6"
      >
        <div className="flex items-center gap-4 mb-3">
          <Mail className="w-5 h-5 text-blue-500" />
          <span className="text-gray-600 text-sm">البريد الإلكتروني</span>
        </div>
        <p className="text-gray-800 text-lg font-medium">
          {data.email || "غير محدد"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-gray-200 rounded-lg p-6"
      >
        <div className="flex items-center gap-4 mb-3">
          <Phone className="w-5 h-5 text-blue-500" />
          <span className="text-gray-600 text-sm">رقم الهاتف</span>
        </div>
        <p className="text-gray-800 text-lg font-medium">
          {data.phone || "غير محدد"}
        </p>
      </motion.div>
    </div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="pt-6"
    >
      <button
        onClick={onEdit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
      >
        <Edit3 className="w-5 h-5" />
        تعديل البروفايل
      </button>
    </motion.div>
  </div>
));

// مكون تسجيل المدير
const RegisterAdmin = memo(
  ({
    formData,
    showPassword,
    showConfirmPassword,
    loading,
    onFormChange,
    onTogglePassword,
    onToggleConfirmPassword,
    onSubmit,
  }) => {
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <InputField
          label="الاسم الكامل"
          name="full_name"
          type="text"
          value={formData.full_name}
          placeholder="أدخل الاسم الكامل"
          icon={User}
          onChange={onFormChange}
          required
        />

        <InputField
          label="البريد الإلكتروني"
          name="email"
          type="email"
          value={formData.email}
          placeholder="أدخل البريد الإلكتروني"
          icon={Mail}
          onChange={onFormChange}
          required
        />

        <InputField
          label="رقم الهاتف"
          name="phone"
          type="text"
          value={formData.phone}
          placeholder="أدخل رقم الهاتف"
          icon={Phone}
          onChange={onFormChange}
        />

        <InputField
          label="كلمة المرور"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          placeholder="أدخل كلمة المرور"
          icon={Lock}
          showPassword={showPassword}
          onTogglePassword={onTogglePassword}
          onChange={onFormChange}
          required
        />

        <InputField
          label="تأكيد كلمة المرور"
          name="password_confirmation"
          type={showConfirmPassword ? "text" : "password"}
          value={formData.password_confirmation}
          placeholder="أعد إدخال كلمة المرور"
          icon={Lock}
          showPassword={showConfirmPassword}
          onTogglePassword={onToggleConfirmPassword}
          onChange={onFormChange}
          required
        />

        <SubmitButton loading={loading} icon={Zap}>
          تسجيل المدير
        </SubmitButton>
      </form>
    );
  }
);

// مكون زر حذف المدير
const DeleteAdminButton = memo(({ admin, onDelete, loading }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    onDelete(admin.id);
    setShowConfirm(false);
  };

  return (
    <div className="relative">
      {!showConfirm ? (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 text-sm"
        >
          <Trash2 className="w-4 h-4" />
          حذف
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-2 bg-red-50 p-2 rounded-lg border border-red-200"
        >
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
            تأكيد
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium transition-all duration-200"
          >
            إلغاء
          </button>
        </motion.div>
      )}
    </div>
  );
});

// مكون عرض المدراء
const AdminsList = memo(({ admins, loading, onRefresh, onDeleteAdmin }) => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-right mb-8"
      >
        <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <Users className="w-10 h-10 text-blue-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          المدراء الحاليين
        </h3>
        <p className="text-gray-600">قائمة بجميع المدراء المسجلين في النظام</p>
      </motion.div>

      {loading ? (
        <div className="text-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      ) : admins.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">لا توجد مدراء مسجلين حالياً</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {admins.map((admin, index) => (
            <motion.div
              key={admin.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {admin.full_name || admin.name}
                    </h4>
                    <div className="flex flex-col sm:flex-row-reverse sm:items-center gap-2 mt-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{admin.email}</span>
                      </div>
                      {admin.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">{admin.phone}</span>
                        </div>
                      )}
                    </div>
                    {admin.created_at && (
                      <div className="text-xs text-gray-500 mt-2">
                        تاريخ التسجيل:{" "}
                        {new Date(admin.created_at).toLocaleDateString("ar-SA")}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 mr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-gray-600">نشط</span>
                  </div>
                  <DeleteAdminButton
                    admin={admin}
                    onDelete={onDeleteAdmin}
                    loading={loading}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center pt-6"
      >
        <button
          onClick={onRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
        >
          <Users className="w-5 h-5" />
          تحديث القائمة
        </button>
      </motion.div>
    </div>
  );
});

// مكون تغيير كلمة المرور
const ChangePassword = memo(
  ({
    passwordData,
    showCurrentPassword,
    showNewPassword,
    showConfirmNewPassword,
    passwordStrength,
    loading,
    onPasswordChange,
    onToggleCurrentPassword,
    onToggleNewPassword,
    onToggleConfirmNewPassword,
    onSubmit,
    getPasswordStrengthColor,
    getPasswordStrengthText,
  }) => {
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <InputField
          label="كلمة المرور الحالية"
          name="current_password"
          type={showCurrentPassword ? "text" : "password"}
          value={passwordData.current_password}
          placeholder="كلمة المرور الحالية"
          icon={Lock}
          showPassword={showCurrentPassword}
          onTogglePassword={onToggleCurrentPassword}
          onChange={onPasswordChange}
          required
        />

        <InputField
          label="كلمة المرور الجديدة"
          name="new_password"
          type={showNewPassword ? "text" : "password"}
          value={passwordData.new_password}
          placeholder="كلمة المرور الجديدة"
          icon={Lock}
          showPassword={showNewPassword}
          onTogglePassword={onToggleNewPassword}
          onChange={onPasswordChange}
          required
        />

        {passwordData.new_password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">قوة كلمة المرور</span>
              <span className="text-xs text-gray-600">
                {getPasswordStrengthText(passwordStrength)}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getPasswordStrengthColor(
                  passwordStrength
                )}`}
                initial={{ width: 0 }}
                animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}

        <InputField
          label="تأكيد كلمة المرور الجديدة"
          name="new_password_confirmation"
          type={showConfirmNewPassword ? "text" : "password"}
          value={passwordData.new_password_confirmation}
          placeholder="تأكيد كلمة المرور الجديدة"
          icon={Lock}
          showPassword={showConfirmNewPassword}
          onTogglePassword={onToggleConfirmNewPassword}
          onChange={onPasswordChange}
          required
        />

        <SubmitButton loading={loading} icon={Lock}>
          تغيير كلمة المرور
        </SubmitButton>
      </form>
    );
  }
);

// مكون تعديل البروفايل
const EditProfile = memo(
  ({ editProfileData, loading, onProfileChange, onUpdate, onCancel }) => {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-right mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <Edit3 className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            تعديل البروفايل
          </h3>
          <p className="text-gray-600">قم بتحديث بياناتك الشخصية</p>
        </motion.div>

        <form onSubmit={onUpdate} className="space-y-4">
          <InputField
            label="الاسم الكامل"
            name="full_name"
            type="text"
            value={editProfileData.full_name}
            placeholder="الاسم الكامل"
            icon={User}
            onChange={onProfileChange}
            required
          />

          <InputField
            label="البريد الإلكتروني"
            name="email"
            type="email"
            value={editProfileData.email}
            placeholder="البريد الإلكتروني"
            icon={Mail}
            onChange={onProfileChange}
            required
          />

          <InputField
            label="رقم الهاتف"
            name="phone"
            type="text"
            value={editProfileData.phone}
            placeholder="رقم الهاتف"
            icon={Phone}
            onChange={onProfileChange}
          />

          <div className="flex gap-4 pt-4">
            <SubmitButton loading={loading} icon={Edit3}>
              تحديث البيانات
            </SubmitButton>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              type="button"
              onClick={onCancel}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              إلغاء
            </motion.button>
          </div>
        </form>
      </div>
    );
  }
);

// ============ المكون الرئيسي ============

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("admins");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  const [editProfileData, setEditProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // جلب بيانات البروفايل عند تحميل التاب
  useEffect(() => {
    if (activeTab === "profile") {
      fetchProfile();
    } else if (activeTab === "admins") {
      fetchAdmins();
    }
  }, [activeTab]);

  const checkPasswordStrength = useCallback((password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }, []);

  const handleRegisterChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === "password") {
        setPasswordStrength(checkPasswordStrength(value));
      }
    },
    [checkPasswordStrength]
  );

  const handleProfileChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditProfileData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePasswordChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setPasswordData((prev) => ({ ...prev, [name]: value }));
      if (name === "new_password") {
        setPasswordStrength(checkPasswordStrength(value));
      }
    },
    [checkPasswordStrength]
  );

  // جلب قائمة المدراء
  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        "https://core-api-x41.shaheenplus.sa/api/admin/all-admins",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "حدث خطأ في جلب البيانات");
      }

      setAdmins(data.data || data || []);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  // جلب بيانات البروفايل
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        "https://core-api-x41.shaheenplus.sa/api/admin/profile",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "حدث خطأ في جلب البيانات");
      }

      const profile = {
        full_name: data.data.full_name || "",
        email: data.data.email || "",
        phone: data.data.phone || "",
      };

      setProfileData(profile);
      setEditProfileData(profile);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  // حذف مدير
  const handleDeleteAdmin = useCallback(
    async (adminId) => {
      setLoading(true);
      setMessage({ type: "", text: "" });

      try {
        const token = localStorage.getItem("admin_token");
        const response = await fetch(
          "https://core-api-x41.shaheenplus.sa/api/admin/delete-account",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              admin_id: adminId,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "حدث خطأ أثناء حذف المدير");
        }

        setMessage({ type: "success", text: "تم حذف المدير بنجاح! ✅" });

        // تحديث القائمة بعد الحذف
        fetchAdmins();
      } catch (error) {
        setMessage({ type: "error", text: error.message });
      } finally {
        setLoading(false);
        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 3000);
      }
    },
    [fetchAdmins]
  );

  // تسجيل مدير جديد
  const handleRegisterSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setMessage({ type: "", text: "" });
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);

      if (formData.password !== formData.password_confirmation) {
        setMessage({ type: "error", text: "كلمات المرور غير متطابقة" });
        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 3000);

        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          "https://core-api-x41.shaheenplus.sa/api/admin/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              // ✅ إضافة الـ Authorization
              Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
            },
            body: JSON.stringify({
              full_name: formData.full_name,
              email: formData.email,
              phone: formData.phone,
              password: formData.password,
              password_confirmation: formData.password_confirmation,
              role: "ADMIN", // أو "SUPERADMIN" حسب ما تريد إنشاءه
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (data.errors) {
            const firstErrorKey = Object.keys(data.errors)[0];
            const firstErrorMessage = data.errors[firstErrorKey][0];
            throw new Error(firstErrorMessage);
          }
          throw new Error(data.message || "حدث خطأ أثناء التسجيل");
        }

        setMessage({ type: "success", text: "تم تسجيل المدير بنجاح! 🎉" });
        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 3000);

        setFormData({
          full_name: "",
          email: "",
          phone: "",
          password: "",
          password_confirmation: "",
        });
        setPasswordStrength(0);

        // تحديث قائمة المدراء بعد التسجيل
        fetchAdmins();
      } catch (error) {
        setMessage({ type: "error", text: error.message });
      } finally {
        setLoading(false);
      }
    },
    [formData, fetchAdmins]
  );

  // تحديث البروفايل
  const handleProfileUpdate = useCallback(
    async (e) => {
      e.preventDefault();
      setMessage({ type: "", text: "" });
      setLoading(true);

      try {
        const token = localStorage.getItem("admin_token");

        // استخراج فقط الحقول التي تغيّرت
        const updatedFields = {};
        Object.keys(editProfileData).forEach((key) => {
          if (
            editProfileData[key] !== profileData[key] &&
            editProfileData[key] !== ""
          ) {
            updatedFields[key] = editProfileData[key];
          }
        });

        // لو لم يتغير أي شيء
        if (Object.keys(updatedFields).length === 0) {
          setMessage({ type: "error", text: "لم يتم تعديل أي بيانات." });
          setTimeout(() => {
            setMessage({ type: "", text: "" });
          }, 3000);

          setLoading(false);
          return;
        }

        const response = await fetch(
          "https://core-api-x41.shaheenplus.sa/api/admin/profile",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedFields),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (data.errors) {
            const firstErrorKey = Object.keys(data.errors)[0];
            const firstErrorMessage = data.errors[firstErrorKey][0];
            throw new Error(firstErrorMessage);
          }
          throw new Error(data.message || "حدث خطأ أثناء التحديث");
        }

        setMessage({ type: "success", text: "تم تحديث البيانات بنجاح! ✨" });
        // اجعل الرسالة تختفي بعد 3 ثواني
        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 3000);

        // تحديث البيانات الحالية فقط بالحقول التي تغيّرت
        setProfileData((prev) => ({ ...prev, ...updatedFields }));

        setIsEditingProfile(false);
      } catch (error) {
        setMessage({ type: "error", text: error.message });
        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 3000);
      } finally {
        setLoading(false);
      }
    },
    [editProfileData, profileData]
  );

  // تغيير كلمة المرور
  const handlePasswordChangeSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setMessage({ type: "", text: "" });
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);

      if (
        passwordData.new_password !== passwordData.new_password_confirmation
      ) {
        setMessage({ type: "error", text: "كلمات المرور الجديدة غير متطابقة" });
        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 3000);
        return;
      }

      setLoading(true);

      try {
        const token = localStorage.getItem("admin_token");
        const response = await fetch(
          "https://core-api-x41.shaheenplus.sa/api/admin/change-password",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(passwordData),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (data.errors) {
            const firstErrorKey = Object.keys(data.errors)[0];
            const firstErrorMessage = data.errors[firstErrorKey][0];
            throw new Error(firstErrorMessage);
          }
          throw new Error(data.message || "حدث خطأ أثناء تغيير كلمة المرور");
        }

        setMessage({ type: "success", text: "تم تغيير كلمة المرور بنجاح! 🔐" });
        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 3000);
        setPasswordData({
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
        });
        setPasswordStrength(0);
      } catch (error) {
        setMessage({ type: "error", text: error.message });
        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 3000);
      } finally {
        setLoading(false);
      }
    },
    [passwordData]
  );

  const getPasswordStrengthColor = useCallback((strength) => {
    switch (strength) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-blue-500";
      case 5:
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  }, []);

  const getPasswordStrengthText = useCallback((strength) => {
    switch (strength) {
      case 0:
      case 1:
        return "ضعيف جداً";
      case 2:
        return "ضعيف";
      case 3:
        return "متوسط";
      case 4:
        return "قوي";
      case 5:
        return "قوي جداً";
      default:
        return "";
    }
  }, []);

  const tabs = [
    { id: "admins", label: "عرض المدراء الحاليين", icon: Users },
    { id: "register", label: "تسجيل مدير", icon: Shield },
    { id: "profile", label: "البروفايل", icon: User },
    { id: "password", label: "تغيير كلمة المرور", icon: Lock },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "admins":
        return (
          <AdminsList
            admins={admins}
            loading={loading}
            onRefresh={fetchAdmins}
            onDeleteAdmin={handleDeleteAdmin}
          />
        );

      case "register":
        return (
          <RegisterAdmin
            formData={formData}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            loading={loading}
            onFormChange={handleRegisterChange}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onToggleConfirmPassword={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            onSubmit={handleRegisterSubmit}
          />
        );

      case "profile":
        if (loading) {
          return (
            <div className="text-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full mx-auto mb-4"
              />
              <p className="text-gray-600">جاري تحميل البيانات...</p>
            </div>
          );
        }

        if (!isEditingProfile) {
          return (
            <ProfileDisplay
              data={profileData}
              onEdit={() => setIsEditingProfile(true)}
            />
          );
        }

        return (
          <EditProfile
            editProfileData={editProfileData}
            loading={loading}
            onProfileChange={handleProfileChange}
            onUpdate={handleProfileUpdate}
            onCancel={() => {
              setIsEditingProfile(false);
              setEditProfileData(profileData);
            }}
          />
        );

      case "password":
        return (
          <ChangePassword
            passwordData={passwordData}
            showCurrentPassword={showCurrentPassword}
            showNewPassword={showNewPassword}
            showConfirmNewPassword={showConfirmNewPassword}
            passwordStrength={passwordStrength}
            loading={loading}
            onPasswordChange={handlePasswordChange}
            onToggleCurrentPassword={() =>
              setShowCurrentPassword(!showCurrentPassword)
            }
            onToggleNewPassword={() => setShowNewPassword(!showNewPassword)}
            onToggleConfirmNewPassword={() =>
              setShowConfirmNewPassword(!showConfirmNewPassword)
            }
            onSubmit={handlePasswordChangeSubmit}
            getPasswordStrengthColor={getPasswordStrengthColor}
            getPasswordStrengthText={getPasswordStrengthText}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* اللوحة الرئيسية */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        {/* بطاقة اللوحة */}
        <div className="relative bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* العنوان */}
          <div className="text-center py-8 border-b border-gray-200">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <Settings className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              لوحة تحكم المدير
            </h1>
            <p className="text-gray-600">إدارة متقدمة ومتكاملة</p>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* قائمة التبويبات */}
            <div className="lg:w-1/4 p-6 border-b lg:border-b-0 lg:border-l border-gray-200">
              <div className="space-y-2">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 text-right ${
                        activeTab === tab.id
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* محتوى التبويب */}
            <div className="lg:w-3/4 p-8">
              {/* رسائل التنبيه */}
              <AnimatePresence>
                {message.text && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                      message.type === "success"
                        ? "bg-green-100 border border-green-300 text-green-700"
                        : "bg-red-100 border border-red-300 text-red-700"
                    }`}
                  >
                    {message.type === "success" ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* محتوى التبويب */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPanel;
