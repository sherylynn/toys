import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import QueryPage from './components/QueryPage';
import UserManagement from './components/UserManagement';
import QueryHistory from './components/QueryHistory';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Layout, Menu } from 'antd';
import './App.css';

const { Header, Content, Footer, Sider } = Layout;

function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogin = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const [selectedMenuKey, setSelectedMenuKey] = useState('1');

  const handleMenuClick = (e: any) => {
    setSelectedMenuKey(e.key);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} selectedKeys={[selectedMenuKey]} onClick={handleMenuClick}>
            <Menu.Item key="1">Query Builder</Menu.Item>
            <Menu.Item key="2">User Management</Menu.Item>
            <Menu.Item key="3">Query History</Menu.Item>
            <Menu.Item key="4" onClick={handleLogout} style={{ marginLeft: 'auto' }}>Logout</Menu.Item>
          </Menu>
        </Header>
        <Layout>
          <Content style={{ padding: '0 50px' }}>
            {selectedMenuKey === '1' && <QueryPage />}
            {selectedMenuKey === '2' && <UserManagement />}
            {selectedMenuKey === '3' && <QueryHistory />}
          </Content>
        </Layout>
        <Footer style={{ textAlign: 'center' }}>Gemini-CLI ©2024</Footer>
      </Layout>
    </DndProvider>
  );
}

export default App;
