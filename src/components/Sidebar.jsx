import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: '📊' },
    { title: 'Patients', path: '/patients', icon: '👥' },
    { title: 'Tests', path: '/tests', icon: '🔬' },
    { title: 'Reports', path: '/reports', icon: '📄' },
    { title: 'Analytics', path: '/analytics', icon: '📈' },
  ];
  const navigate = useNavigate();

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">MedLab Pro</h1>
        <p className="text-sm text-gray-600 mt-1">Lab Management</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
          >
            <span className="mr-3">{item.icon}</span>
            {item.title}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-6">
        <button
          className="w-full flex items-center justify-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => navigate('/logout')}
        >
          <span className="mr-2">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
