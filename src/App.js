import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/Login";
import Reports from "./pages/Reports";
import ClientsManagement from "./pages/ClientsManagement";

import AllUsers from "./pages/users/AllUsers";
import AllLands from "./pages/Lands/AllLands";
import AllAuctions from "./pages/Auctions/AllAuctions";
import Inventory from "./pages/Interests/AllInterests";
import AuctionsRequests from "./pages/AuctionsRequest/AuctionsRequest";
import LandRequests from "./pages/landRequests/landRequests";
import AuthController from "./utils/authController";
import PrivacyPolicy from "./pages/PrivacyPolicy1"; // ✅ ← هذا هو الاستدعاء الصحيح
import Contact from "./pages/Contact";

import "./App.css";
import { DataProvider } from "./contexts/DataContext";

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
      staleTime: 1000 * 60 * 5,
    },
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = AuthController.isAuthenticated();
      setIsLoggedIn(authenticated);
      setLoading(false);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("userData");
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
      <DataProvider>
        <Router>
          <div className="app">
            {isLoggedIn ? (
              <>
                <Sidebar onLogout={handleLogout} />
                <div className="main-content">
                  <div className="content">
                    <Routes>
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute isAuthenticated={isLoggedIn}>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/all-users"
                        element={
                          <ProtectedRoute isAuthenticated={isLoggedIn}>
                            <AllUsers />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/all-lands"
                        element={
                          <ProtectedRoute isAuthenticated={isLoggedIn}>
                            <AllLands />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/all-auctions"
                        element={
                          <ProtectedRoute isAuthenticated={isLoggedIn}>
                            <AllAuctions />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/clients-management"
                        element={
                          <ProtectedRoute isAuthenticated={isLoggedIn}>
                            <ClientsManagement />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/land-requests"
                        element={
                          <ProtectedRoute isAuthenticated={isLoggedIn}>
                            <LandRequests />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/auctions-requests"
                        element={
                          <ProtectedRoute isAuthenticated={isLoggedIn}>
                            <AuctionsRequests />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/reports"
                        element={
                          <ProtectedRoute isAuthenticated={isLoggedIn}>
                            <Reports />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/inventory"
                        element={
                          <ProtectedRoute isAuthenticated={isLoggedIn}>
                            <Inventory />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/Contact"
                        element={
                          <ProtectedRoute isAuthenticated={isLoggedIn}>
                            <Contact />
                          </ProtectedRoute>
                        }
                      />

                      {/* ✅ صفحة سياسة الخصوصية */}
                      <Route
                        path="/privacy-policy"
                        element={
                          <ProtectedRoute isAuthenticated={isLoggedIn}>
                            <PrivacyPolicy/>
                          </ProtectedRoute>
                        }
                      />

                      <Route path="/" element={<Navigate to="/dashboard" />} />
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </div>
                </div>
              </>
            ) : (
              <Routes>
                <Route
                  path="/login"
                  element={
                    <PublicRoute isAuthenticated={isLoggedIn}>
                      <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
                    </PublicRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            )}
          </div>
        </Router>
      </DataProvider>
    </QueryClientProvider>
  );
}

export default App;
