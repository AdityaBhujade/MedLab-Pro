import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalTests: 0,
    reportsGenerated: 0,
    testsToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    let patients = [];
    let tests = [];
    let testsToday = 0;
    try {
      const res = await fetch('http://localhost:5000/api/patients');
      if (res.ok) {
        patients = await res.json();
      }
    } catch (e) {}
    try {
      const res = await fetch('http://localhost:5000/api/tests');
      if (res.ok) {
        tests = await res.json();
      }
    } catch (e) {}
    // Count tests today
    const today = new Date();
    testsToday = tests.filter(t => {
      if (!t.timestamp) return false;
      const d = new Date(t.timestamp);
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).length;
    // Reports generated from localStorage
    let reportsGenerated = 0;
    try {
      reportsGenerated = parseInt(localStorage.getItem('reportsGenerated') || '0', 10);
    } catch (e) {}
    setStats({
      totalPatients: patients.length,
      totalTests: tests.length || 0,
      reportsGenerated,
      testsToday,
    });
    setLoading(false);
  };

  const statCards = [
    { title: 'Total Patients', value: stats.totalPatients, description: 'Registered patients' },
    { title: 'Total Tests', value: stats.totalTests, description: 'Tests conducted' },
    { title: 'Reports Generated', value: stats.reportsGenerated, description: 'Patient reports' },
    { title: 'Tests Today', value: stats.testsToday, description: "Today's activity" },
  ];

  const quickActions = [
    { title: 'Add Patient', description: 'Register new patient', icon: '👤', path: '/patients' },
    { title: 'New Test', description: 'Add test results', icon: '🔬', path: '/tests' },
    { title: 'Generate Report', description: 'Create patient report', icon: '📄', path: '/reports' },
    { title: 'View Analytics', description: 'Patient statistics', icon: '📈', path: '/analytics' },
  ];

  return (
    <div className="p-8 ml-64">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome to MedLab Pro - Laboratory Management System</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{loading ? '...' : stat.value}</p>
            <p className="text-gray-600 text-sm mt-1">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <p className="text-gray-600 mb-4">Common tasks and shortcuts</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(action.path)}>
              <div className="text-2xl mb-3">{action.icon}</div>
              <h3 className="font-semibold text-gray-800">{action.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{action.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <p className="text-gray-600 mb-4">Latest system activities</p>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="flex items-center text-gray-600">
              <span className="mr-2">🔄</span>
              <p>System initialized</p>
            </div>
            <div className="flex items-center text-gray-600">
              <span className="mr-2">✅</span>
              <p>Ready for patient management</p>
            </div>
            <div className="flex items-center text-gray-600">
              <span className="mr-2">📊</span>
              <p>Dashboard loaded</p>
            </div>
            <div className="flex items-center text-gray-600">
              <span className="mr-2">🔧</span>
              <p>All modules available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
