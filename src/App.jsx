import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import Test from './components/Test';
import Reports from './components/Reports';
import Analytics from './components/Analytics';
import Login from './components/Login';
import './App.css'

function Logout() {
  React.useEffect(() => {
    // Optionally clear any auth state here
    window.location.href = '/';
  }, []);
  return null;
}

function Layout() {
  const location = useLocation();
  const hideSidebar = location.pathname === '/login' || location.pathname === '/' || location.pathname === '/logout';
  return (
    <div className="flex min-h-screen bg-gray-50">
      {!hideSidebar && <Sidebar />}
      <main className="flex-1">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/tests" element={<Test />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
