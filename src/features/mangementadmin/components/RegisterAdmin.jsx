import React, { memo } from "react";
import { User, Mail, Phone, Lock, Zap } from "lucide-react";
import InputField from "./InputField";
import SubmitButton from "./SubmitButton";

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

export default RegisterAdmin;