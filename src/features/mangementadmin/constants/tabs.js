import { Users, Shield, User, Lock } from "lucide-react";

export const ADMIN_PANEL_TABS = [
  { id: "admins", label: "عرض المدراء الحاليين", icon: Users },
  { id: "register", label: "تسجيل مدير", icon: Shield },
  { id: "profile", label: "البروفايل", icon: User },
  { id: "password", label: "تغيير كلمة المرور", icon: Lock },
];