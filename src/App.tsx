import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ManageStaff from './pages/ManageStaff';
import Ordering from './pages/Ordering';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import Report from './pages/Report';
import Expenses from './pages/Expenses';
import StaffDashboard from './pages/StaffDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const authStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (isAuthenticated === null) {
    return <div className="h-screen w-screen bg-[#f3f7ff] flex items-center justify-center font-bold">Loading...</div>;
  }

  return (
    <div className="App overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/add-staff" element={<ManageStaff />} />
          <Route path="/staffdashboard" element={<StaffDashboard />} />
          <Route path="/ordering" element={<Ordering />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/report" element={<Report />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />

          <Route 
            path="/login" 
            element={
              !isAuthenticated ? (
                <motion.div
                  key="login-page"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Login onLogin={handleLogin} />
                </motion.div>
              ) : (
                <Navigate replace to="/dashboard" />
              )
            } 
          />

          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <motion.div
                  key="dashboard-page"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Dashboard />
                </motion.div>
              ) : (
                <Navigate replace to="/login" />
              )
            } 
          />

          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;