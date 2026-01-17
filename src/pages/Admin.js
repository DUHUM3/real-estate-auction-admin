import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, CheckCircle, AlertCircle } from "lucide-react";

// Hooks
import { useMessage } from "../features/mangementadmin/hooks/useMessage";
import { usePasswordStrength } from "../features/mangementadmin/hooks/usePasswordStrength";
import { useAdminPanel } from "../features/mangementadmin/hooks/useAdminPanel";

// Components
import RegisterAdmin from "../features/mangementadmin/components/RegisterAdmin";
import AdminsList from "../features/mangementadmin/components/AdminsList";
import ProfileDisplay from "../features/mangementadmin/components/ProfileDisplay";
import EditProfile from "../features/mangementadmin/components/EditProfile";
import ChangePassword from "../features/mangementadmin/components/ChangePassword";

// Constants
import { ADMIN_PANEL_TABS } from "../features/mangementadmin/constants/tabs";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("admins");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const { message, showMessage } = useMessage();
  const {
    passwordStrength,
    updatePasswordStrength,
    getPasswordStrengthColor,
    getPasswordStrengthText,
  } = usePasswordStrength();

  const {
    formData,
    profileData,
    editProfileData,
    passwordData,
    admins,
    loading,
    isEditingProfile,
    setIsEditingProfile,
    fetchAdmins,
    handleDeleteAdmin,
    handleRegisterSubmit,
    handleProfileUpdate,
    handlePasswordChangeSubmit,
    handleRegisterChange,
    handleProfileChange,
    handlePasswordChange,
    setEditProfileData,
  } = useAdminPanel(activeTab, showMessage);

  // Enhanced handlers with password strength
  const handleRegisterChangeWithStrength = (e) => {
    handleRegisterChange(e);
    if (e.target.name === "password") {
      updatePasswordStrength(e.target.value);
    }
  };

  const handlePasswordChangeWithStrength = (e) => {
    handlePasswordChange(e);
    if (e.target.name === "new_password") {
      updatePasswordStrength(e.target.value);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "admins":
        return (
          <AdminsList
            admins={admins}
            loading={loading}
            onRefresh={fetchAdmins}
            onDeleteAdmin={handleDeleteAdmin}
          />
        );

      case "register":
        return (
          <RegisterAdmin
            formData={formData}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            loading={loading}
            onFormChange={handleRegisterChangeWithStrength}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onToggleConfirmPassword={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            onSubmit={handleRegisterSubmit}
          />
        );

      case "profile":
        if (loading) {
          return (
            <div className="text-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full mx-auto mb-4"
              />
              <p className="text-gray-600">جاري تحميل البيانات...</p>
            </div>
          );
        }

        if (!isEditingProfile) {
          return (
            <ProfileDisplay
              data={profileData}
              onEdit={() => setIsEditingProfile(true)}
            />
          );
        }

        return (
          <EditProfile
            editProfileData={editProfileData}
            loading={loading}
            onProfileChange={handleProfileChange}
            onUpdate={handleProfileUpdate}
            onCancel={() => {
              setIsEditingProfile(false);
              setEditProfileData(profileData);
            }}
          />
        );

      case "password":
        return (
          <ChangePassword
            passwordData={passwordData}
            showCurrentPassword={showCurrentPassword}
            showNewPassword={showNewPassword}
            showConfirmNewPassword={showConfirmNewPassword}
            passwordStrength={passwordStrength}
            loading={loading}
            onPasswordChange={handlePasswordChangeWithStrength}
            onToggleCurrentPassword={() =>
              setShowCurrentPassword(!showCurrentPassword)
            }
            onToggleNewPassword={() => setShowNewPassword(!showNewPassword)}
            onToggleConfirmNewPassword={() =>
              setShowConfirmNewPassword(!showConfirmNewPassword)
            }
            onSubmit={handlePasswordChangeSubmit}
            getPasswordStrengthColor={getPasswordStrengthColor}
            getPasswordStrengthText={getPasswordStrengthText}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        <div className="relative bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="text-center py-8 border-b border-gray-200">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <Settings className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              لوحة تحكم المدير
            </h1>
            <p className="text-gray-600">إدارة متقدمة ومتكاملة</p>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Tabs */}
            <div className="lg:w-1/4 p-6 border-b lg:border-b-0 lg:border-l border-gray-200">
              <div className="space-y-2">
                {ADMIN_PANEL_TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 text-right ${
                        activeTab === tab.id
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="lg:w-3/4 p-8">
              {/* Messages */}
              <AnimatePresence>
                {message.text && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                      message.type === "success"
                        ? "bg-green-100 border border-green-300 text-green-700"
                        : "bg-red-100 border border-red-300 text-red-700"
                    }`}
                  >
                    {message.type === "success" ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPanel;