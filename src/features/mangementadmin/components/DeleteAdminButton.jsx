import React, { memo, useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

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

export default DeleteAdminButton;