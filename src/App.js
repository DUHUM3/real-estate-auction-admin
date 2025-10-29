import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PendingUsers from './pages/users/PendingUsers';
import AllUsers from './pages/users/AllUsers';
import AllLands from './pages/Lands/AllLands';
import PendingLands from './pages/Lands/PendingLands'; // تم تصحيح اسم المكون PendindLands إلى PendingLands
import AllAuctions from './pages/Auctions/AllAuctions';
import PendingAuctions from './pages/Auctions/PendingAuctions';
import ClientsManagement from './pages/ClientsManagement';
import Lands from './pages/Lands';
import LandRequests from './pages/landRequests/landRequests';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Inventory from './pages/Interests/AllInterests';
import LoginPage from './pages/Login';
import AuthController from './utils/authController';
import './App.css';
import { DataProvider } from './contexts/DataContext';

// مكون للتحقق من المصادقة - إضافة المكونات المفقودة
const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children, isAuthenticated }) => {
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 دقائق
    },
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // التحقق من حالة المصادقة عند تحميل التطبيق
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = AuthController.isAuthenticated();
      setIsLoggedIn(authenticated);
      setLoading(false);
    };

    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userData');
    // مسح كاش React Query
    queryClient.clear();
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
    <QueryClientProvider client={queryClient}>
      <DataProvider> {/* إضافة DataProvider إذا كان مطلوباً */}
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
                          <PendingLands /> {/* تم التصحيح هنا */}
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
                      <Route path="/land-requests" element={
                        <ProtectedRoute isAuthenticated={isLoggedIn}>
                          <LandRequests />
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
      </DataProvider> {/* إغلاق DataProvider */}
    </QueryClientProvider>
  );
}

export default App;