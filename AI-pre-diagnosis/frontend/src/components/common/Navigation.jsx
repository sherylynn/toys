import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'antd';

const Navigation = () => {
  const location = useLocation();

  const items = [
    {
      key: '/',
      label: <Link to="/">首页</Link>
    },
    {
      key: '/patient',
      label: <Link to="/patient">患者端</Link>
    },
    {
      key: '/doctor',
      label: <Link to="/doctor">医生端</Link>
    }
  ];

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      selectedKeys={[location.pathname]}
      items={items}
      style={{
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    />
  );
};

export default Navigation;