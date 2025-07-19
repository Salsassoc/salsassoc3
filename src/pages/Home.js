import React from 'react';
import ProLayout from '@ant-design/pro-layout';
import { Button } from 'antd';

const Home = ({ onLogout }) => {
  const menuItems = [
    { path: '/home', name: 'Home', key: 'home' },
    { path: '/settings', name: 'Settings', key: 'settings' },
  ];

  return (
    <ProLayout
      title="Salsassoc"
      menu={{ items: menuItems }}
      rightContentRender={() => (
        <Button type="primary" onClick={onLogout}>
          Logout
        </Button>
      )}
    >
      <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
        <h1>Welcome to Salsassoc!</h1>
        <p>This is your home page.</p>
      </div>
    </ProLayout>
  );
};

export default Home;