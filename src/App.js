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
import PrivacyPolicy from "./pages/PrivacyPolicy1";
import Admin from "./pages/Admin";
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

  // استبدل جزء التحميل في App.js بـ:
if (loading) {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600">جاري التحميل...</p>
    </div>
  );
}

  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <Router>
          <div className="app">
            {isLoggedIn ? (
              <div className="flex min-h-screen"> {/* ✅ التصحيح هنا */}
                <Sidebar onLogout={handleLogout} />
                <div className="flex-1 flex flex-col lg:mr-72"> {/* ✅ التصحيح هنا */}
                  <div className="content flex-1 p-6"> {/* ✅ التصحيح هنا */}
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
                      <Route
                        path="/privacy-policy"
                        element={
                          <ProtectedRoute isAuthenticated={isLoggedIn}>
                            <PrivacyPolicy/>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute isAuthenticated={isLoggedIn}>
                            <Admin/>
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/" element={<Navigate to="/dashboard" />} />
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </div>
                </div>
              </div>
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