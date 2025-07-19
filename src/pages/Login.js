import React from 'react';
import { Button, Card, Form, Input } from 'antd';

import i18n from '../utils/i18n.js';
import Password from 'antd/lib/input/Password.js';

const Login = ({ onLogin }) => {

  function onFinish(values){
    const user = {username: values.username};
    onLogin(user);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card title={i18n.t("pages.login.login")} style={{ width: 300 }}>
        <Form
          name="login"
          layout="vertical"
          initialValues={{ username: 'admin', password: 'password', remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            label={i18n.t("pages.login.username")}
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={i18n.t("pages.login.password")}
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {i18n.t("pages.login.login")}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;