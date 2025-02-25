import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import PatientPortal from './components/patient/PatientPortal';
import DoctorPortal from './components/doctor/DoctorPortal';
import HomePage from './components/home/HomePage';
import Navigation from './components/common/Navigation';

const { Header, Content } = Layout;

function App() {
  return (
    <Router>
      <Layout className="layout" style={{ minHeight: '100vh' }}>
        <Header>
          <Navigation />
        </Header>
        <Content style={{ padding: '24px', background: '#fff' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/patient" element={<PatientPortal />} />
            <Route path="/doctor" element={<DoctorPortal />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;