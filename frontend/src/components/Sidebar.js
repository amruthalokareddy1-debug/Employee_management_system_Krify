import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  FileText, 
  BarChart3, 
  LogOut,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: ['employee', 'hr', 'ceo'] },
    { name: 'Directory', icon: <Users size={20} />, path: '/employees', roles: ['hr', 'ceo'] },
    { name: 'Attendance', icon: <CalendarCheck size={20} />, path: '/attendance', roles: ['employee', 'hr', 'ceo'] },
    { name: 'Leaves', icon: <FileText size={20} />, path: '/leaves', roles: ['employee', 'hr', 'ceo'] },
    { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics', roles: ['hr', 'ceo'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.employee_profile?.role));

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={onClose}
      />
      <aside className={`glass-panel sidebar-container ${isOpen ? 'open' : ''}`} style={{
        display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem',
        borderRadius: '0 32px 32px 0'
      }}>
        <div style={{ marginBottom: '3rem', paddingLeft: '0.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} color="white" />
          </div>
          <span className="gradient-text" style={{ fontSize: '1.4rem', fontWeight: '900' }}>ALTIS</span>

        </div>

        <nav style={{ flex: 1 }}>
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => { if (window.innerWidth <= 1024 && onClose) onClose(); }}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span style={{ fontWeight: '600' }}>{item.name}</span>
              <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.3 }} />
            </NavLink>
          ))}
        </nav>

        <div className="glass-panel p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto' }}>
          <div style={{ marginBottom: '1.2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Logged in as</p>
            <p style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white' }}>{user?.first_name ? user.first_name : (user?.username || 'Admin User')}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold' }}>{user?.employee_profile?.role?.toUpperCase()}</p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="premium-btn"
            style={{
              width: '100%', padding: '12px', background: 'rgba(251, 113, 133, 0.1)', color: 'var(--danger)',
              fontSize: '0.85rem', boxShadow: 'none', border: '1px solid rgba(251, 113, 133, 0.2)'
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
