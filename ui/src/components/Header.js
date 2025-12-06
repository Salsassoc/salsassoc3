import React from 'react';
import { Button } from 'antd';

const Header = ({ onLogout }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 16px' }}>
    <Button type="primary" onClick={onLogout}>
      Logout
    </Button>
  </div>
);

export default Header;