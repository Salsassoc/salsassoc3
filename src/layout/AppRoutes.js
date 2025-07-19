import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from '../pages/Login.js';
import Home from '../pages/Home.js';

const AppRoutes = () => {

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
    };

    return (
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/home"
          element={isAuthenticated ? <Home onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/home' : '/login'} />} />
      </Routes>
    );
}

export default AppRoutes;
