import React, { useEffect } from 'react';
import { Spin } from 'antd';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    async function doLogout() {
      try {
        await fetch('/api/logout', { method: 'POST' });
      } catch (e) {
        // ignore network errors for logout
      }
      // Clear local session
      localStorage.removeItem('user');
      // Redirect to login page
      navigate('/login', { replace: true });
    }
    doLogout();
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin />
    </div>
  );
};

export default Logout;
