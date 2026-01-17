import React, { memo } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import InputField from "./InputField";
import SubmitButton from "./SubmitButton";

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

export default ChangePassword;