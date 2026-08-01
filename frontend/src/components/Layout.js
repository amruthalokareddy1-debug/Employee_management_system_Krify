import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Calendar, LogOut, Settings, Clock } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, active }) => {
  const navigate = useNavigate();
  return (
    <div 
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-2 transition-all ${active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
      style={active ? { backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' } : {}}
      onClick={() => navigate(path)}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </div>
  );
};

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.employee_profile?.role || 'employee';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="mb-8 px-2">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>EMS Portal</h1>
          <p className="text-xs text-muted mt-1 uppercase tracking-wider">{role} Dashboard</p>
        </div>

        <div className="flex-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/dashboard" active={location.pathname === '/dashboard'} />
          {(role === 'hr' || role === 'ceo') && (
            <SidebarItem icon={Users} label="Employees" path="/employees" active={location.pathname === '/employees'} />
          )}
          <SidebarItem icon={Clock} label="Attendance" path="/attendance" active={location.pathname === '/attendance'} />
          <SidebarItem icon={Calendar} label="Leaves" path="/leaves" active={location.pathname === '/leaves'} />
        </div>

        <div className="mt-auto border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 p-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 uppercase">
              {user?.username?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-semibold text-sm">{user?.first_name || user?.username}</p>
              <p className="text-xs text-muted capitalize">{role}</p>
            </div>
          </div>
          <div 
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-red-500 hover:bg-red-50 transition-all"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </div>
        </div>
      </div>

      <div className="main-content">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

export default Layout;
