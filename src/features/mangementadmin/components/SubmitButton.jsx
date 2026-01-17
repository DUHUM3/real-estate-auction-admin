import React, { memo } from "react";
import { motion } from "framer-motion";

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

export default SubmitButton;