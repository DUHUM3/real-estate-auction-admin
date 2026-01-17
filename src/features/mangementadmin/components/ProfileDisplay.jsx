import React, { memo } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Edit3 } from "lucide-react";

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

export default ProfileDisplay;