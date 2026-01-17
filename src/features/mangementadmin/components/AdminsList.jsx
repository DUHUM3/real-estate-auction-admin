import React, { memo } from "react";
import { motion } from "framer-motion";
import { Users, User, Mail, Phone } from "lucide-react";
import DeleteAdminButton from "./DeleteAdminButton";

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

export default AdminsList;