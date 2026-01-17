import { useState, useCallback } from "react";

export const usePasswordStrength = () => {
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = useCallback((password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }, []);

  const updatePasswordStrength = useCallback(
    (password) => {
      setPasswordStrength(checkPasswordStrength(password));
    },
    [checkPasswordStrength]
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

  return {
    passwordStrength,
    updatePasswordStrength,
    getPasswordStrengthColor,
    getPasswordStrengthText,
  };
};