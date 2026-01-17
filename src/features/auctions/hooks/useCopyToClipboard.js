import { useState } from "react";

const useCopyToClipboard = () => {
  const [copyStatus, setCopyStatus] = useState({});

  const copyToClipboard = async (text, fieldName) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text.toString());
      setCopyStatus((prev) => ({ ...prev, [fieldName]: true }));

      setTimeout(() => {
        setCopyStatus((prev) => ({ ...prev, [fieldName]: false }));
      }, 2000);
    } catch (err) {
      console.error("فشل في نسخ النص: ", err);
      
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopyStatus((prev) => ({ ...prev, [fieldName]: true }));

      setTimeout(() => {
        setCopyStatus((prev) => ({ ...prev, [fieldName]: false }));
      }, 2000);
    }
  };

  return {
    copyStatus,
    copyToClipboard,
  };
};

export default useCopyToClipboard;