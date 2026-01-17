/**
 * Custom hook for copy-to-clipboard functionality
 * Manages copy status and provides copyToClipboard function
 */

import { useState } from "react";
import { copyText } from "../constants/landConstants";

export const useCopyToClipboard = () => {
  const [copyStatus, setCopyStatus] = useState({});

  const copyToClipboard = (text, fieldName) => {
    copyText(text, setCopyStatus, fieldName);
  };

  return { copyStatus, copyToClipboard };
};