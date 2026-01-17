import { useState, useCallback } from "react";

export const useMessage = () => {
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = useCallback((type, text, duration = 3000) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, duration);
  }, []);

  const clearMessage = useCallback(() => {
    setMessage({ type: "", text: "" });
  }, []);

  return { message, showMessage, clearMessage };
};