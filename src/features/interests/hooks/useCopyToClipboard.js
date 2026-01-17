// Hook for copying text to clipboard with visual feedback
import { useState } from "react";
import { COPY_TIMEOUT } from "../constants/interestsConstants";

export const useCopyToClipboard = () => {
  const [copyStatus, setCopyStatus] = useState({});

  const copyToClipboard = async (text, fieldName) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text.toString());

      setCopyStatus((prev) => ({
        ...prev,
        [fieldName]: true,
      }));

      setTimeout(() => {
        setCopyStatus((prev) => ({
          ...prev,
          [fieldName]: false,
        }));
      }, COPY_TIMEOUT);
    } catch (err) {
      console.error("فشل في نسخ النص: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopyStatus((prev) => ({
        ...prev,
        [fieldName]: true,
      }));

      setTimeout(() => {
        setCopyStatus((prev) => ({
          ...prev,
          [fieldName]: false,
        }));
      }, COPY_TIMEOUT);
    }
  };

  return { copyStatus, copyToClipboard };
};