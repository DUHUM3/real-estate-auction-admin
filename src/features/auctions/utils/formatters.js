export const formatDate = (dateString) => {
  if (!dateString) return "غير محدد";
  const date = new Date(dateString);
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "غير محدد";
  const date = new Date(dateString);
  return date.toLocaleString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTime = (timeString) => {
  if (!timeString) return "غير محدد";
  return timeString;
};

export const getStatusBadge = (status) => {
  const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";

  switch (status) {
    case "مفتوح":
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800 border border-green-200`}>
          مفتوح
        </span>
      );
    case "مرفوض":
      return (
        <span className={`${baseClasses} bg-red-100 text-red-800 border border-red-200`}>
          مرفوض
        </span>
      );
    case "مغلق":
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`}>
          مغلق
        </span>
      );
    case "قيد المراجعة":
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`}>
          قيد المراجعة
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`}>
          {status}
        </span>
      );
  }
};

export const getStatusText = (status) => {
  const statusMap = {
    "مفتوح": "مفتوح",
    "مرفوض": "مرفوض",
    "مغلق": "مغلق",
    "قيد المراجعة": "قيد المراجعة",
  };
  return statusMap[status] || status || "غير معروف";
};