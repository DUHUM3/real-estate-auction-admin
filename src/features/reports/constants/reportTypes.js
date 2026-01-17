import {
  FiUsers,
  FiHome,
  FiCalendar,
  FiHeart,
} from "react-icons/fi";

/**
 * Available report types configuration
 */
export const reportTypes = [
  { value: "users", label: "المستخدمين", icon: <FiUsers /> },
  { value: "properties", label: "الأراضي", icon: <FiHome /> },
  { value: "auctions", label: "المزادات", icon: <FiCalendar /> },
  { value: "interests", label: "طلبات الاهتمام", icon: <FiHeart /> },
];

export const periodTypes = [
  { value: "daily", label: "يومي" },
  { value: "weekly", label: "أسبوعي" },
  { value: "monthly", label: "شهري" },
];