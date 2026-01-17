import React, { memo } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

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

export default InputField;