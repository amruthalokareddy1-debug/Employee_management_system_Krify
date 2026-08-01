import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ShieldCheck, ArrowRight, Loader2, User, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Login = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [name, setName] = useState('');
  const [role, setRole] = useState(location.state?.role || 'employee');
  const [availableRoles, setAvailableRoles] = useState([]);
  const { login, loading } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get('auth/check-roles/');
        setAvailableRoles(res.data.available_roles);
      } catch (err) {
        console.error('Failed to fetch available roles');
      }
    };
    fetchRoles();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(name, email, role);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
      padding: '2rem 1rem'
    }}>
      <motion.div 
        className="glass-panel p-10" 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ 
          width: '90%', 
          maxWidth: '450px',
          padding: '40px',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center'
        }}
      >
        <div className="text-center mb-6" style={{ width: '100%' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            margin: '0 auto 1rem', 
            background: 'linear-gradient(135deg, #c084fc, #22d3ee)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            boxShadow: '0 10px 20px -5px rgba(192, 132, 252, 0.3)' 
          }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'white', marginBottom: '4px' }}>
            ALTIS <span className="gradient-text">PORTAL</span>
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem' }}>
            Logging in as <span style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase' }}>{role}</span>
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            style={{ 
              color: '#fb7185', 
              background: 'rgba(251, 113, 133, 0.1)', 
              padding: '10px 14px', 
              borderRadius: '12px', 
              marginBottom: '1.2rem', 
              textAlign: 'center', 
              fontSize: '0.8rem', 
              border: '1px solid rgba(251, 113, 133, 0.2)',
              width: '100%'
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.4rem' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.3)' }} size={18} />
              <input 
                type="text" 
                className="premium-input" 
                style={{ paddingLeft: '44px', width: '100%' }} 
                placeholder="Enter your name" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.4rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.3)' }} size={18} />
              <input 
                type="email" 
                className="premium-input" 
                style={{ paddingLeft: '44px', width: '100%' }} 
                placeholder="name@altis.com" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="premium-btn" 
            disabled={loading}
            style={{ width: '100%', padding: '14px' }}
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                Access Dashboard <ArrowRight size={18} />
              </>
            )}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/" style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.8rem', textDecoration: 'none' }}>
              ← Back to Role Selection
            </Link>
          </div>

          
          {availableRoles.includes('ceo') && availableRoles.includes(role) && (
            <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.8rem', textAlign: 'center', marginTop: '1.2rem' }}>
              No account? <Link to="/signup" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Register here</Link>
            </p>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
