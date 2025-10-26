import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PendingUsers from './pages/users/PendingUsers';
import AllUsers from './pages/users/AllUsers';
import AllLands from './pages/Lands/AllLands';
import PendindLands from './pages/Lands/PendingLands';
import AllAuctions from './pages/Auctions/AllAuctions';
import PendingAuctions from './pages/Auctions/PendingAuctions';
import ClientsManagement from './pages/ClientsManagement';
import Lands from './pages/Lands';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Inventory from './pages/Interests/AllInterests';
import LoginPage from './pages/Login';
import AuthController from './utils/authController';
import './App.css';
import { DataProvider } from './contexts/DataContext';

// مكون للتحقق من المصادقة
const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// مكون للصفحات العامة (مثل تسجيل الدخول)
const PublicRoute = ({ children, isAuthenticated }) => {
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // التحقق من حالة المصادقة عند تحميل التطبيق
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = AuthController.isAuthenticated();
      console.log('فحص المصادقة:', authenticated);
      setIsLoggedIn(authenticated);
      setLoading(false);
    };

    checkAuth();

    // الاستماع لتغييرات في localStorage
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // دالة تسجيل الخروج المركزية
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner-large"></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

    return (
    <DataProvider>
      <Router>
        <div className="app">
          {isLoggedIn ? (
            <>
              <Sidebar onLogout={handleLogout} />
              <div className="main-content">
                <div className="content">
                  <Routes>
                    <Route path="/dashboard" element={
                      <ProtectedRoute isAuthenticated={isLoggedIn}>
                        <Dashboard />
                      </ProtectedRoute>
                  } />
                  <Route path="/pending-users" element={ 
                    <ProtectedRoute isAuthenticated={isLoggedIn}>
                      <PendingUsers />
                    </ProtectedRoute>
                  } />
                  <Route path="/all-users" element={
                    <ProtectedRoute isAuthenticated={isLoggedIn}>
                      <AllUsers />
                    </ProtectedRoute>
                  } />
                  <Route path="/all-lands" element={
                    <ProtectedRoute isAuthenticated={isLoggedIn}>
                      <AllLands />
                    </ProtectedRoute>
                  } />
                  <Route path="/pending-lands" element={
                    <ProtectedRoute isAuthenticated={isLoggedIn}>
                      <PendindLands />
                    </ProtectedRoute>
                  } />
                  <Route path="/all-auctions" element={
                    <ProtectedRoute isAuthenticated={isLoggedIn}>
                      <AllAuctions />
                    </ProtectedRoute>
                  } />
                  <Route path="/pending-auctions" element={
                    <ProtectedRoute isAuthenticated={isLoggedIn}>
                      <PendingAuctions />
                    </ProtectedRoute>
                  } />
                  <Route path="/clients-management" element={
                    <ProtectedRoute isAuthenticated={isLoggedIn}>
                      <ClientsManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/lands" element={
                    <ProtectedRoute isAuthenticated={isLoggedIn}>
                      <Lands />
                    </ProtectedRoute>
                  } />
                  <Route path="/customers" element={
                    <ProtectedRoute isAuthenticated={isLoggedIn}>
                      <Customers />
                    </ProtectedRoute>
                  } />
                  <Route path="/orders" element={
                    <ProtectedRoute isAuthenticated={isLoggedIn}>
                      <Orders />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute isAuthenticated={isLoggedIn}>
                      <Reports />
                    </ProtectedRoute>
                  } />
                  <Route path="/inventory" element={
                    <ProtectedRoute isAuthenticated={isLoggedIn}>
                      <Inventory />
                    </ProtectedRoute>
                  } />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </div>
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={
              <PublicRoute isAuthenticated={isLoggedIn}>
                <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
              </PublicRoute>
            } />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
        </DataProvider>

  );
}

export default App;