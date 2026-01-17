import React, { memo } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Edit3 } from "lucide-react";
import InputField from "./InputField";
import SubmitButton from "./SubmitButton";

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

export default EditProfile;