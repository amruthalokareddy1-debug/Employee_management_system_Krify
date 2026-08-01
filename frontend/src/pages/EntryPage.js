import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Crown, Users, User, ArrowRight } from 'lucide-react';

const EntryPage = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'ceo',
      title: 'CEO Portal',
      description: 'Strategic oversight and executive decision-making hub.',
      icon: <Crown size={40} className="text-yellow-400" />,
      color: 'linear-gradient(135deg, #f59e0b, #d97706)',
      delay: 0.1
    },
    {
      id: 'hr',
      title: 'HR Portal',
      description: 'Manage talent, payroll, and organizational culture.',
      icon: <Users size={40} className="text-blue-400" />,
      color: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      delay: 0.2
    },
    {
      id: 'employee',
      title: 'Employee Portal',
      description: 'Access your workspace, attendance, and benefits.',
      icon: <User size={40} className="text-purple-400" />,
      color: 'linear-gradient(135deg, #a855f7, #9333ea)',
      delay: 0.3
    }
  ];

  const handleRoleSelect = (roleId) => {
    navigate('/login', { state: { role: roleId } });
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Mesh Gradients for background depth */}
      <div style={{
        position: 'absolute', top: '-15%', left: '-10%', width: '50%', height: '50%',
        background: 'rgba(192, 132, 252, 0.08)', borderRadius: '50%', filter: 'blur(120px)'
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-10%', width: '50%', height: '50%',
        background: 'rgba(34, 211, 238, 0.08)', borderRadius: '50%', filter: 'blur(120px)'
      }} />

      {/* Main Logo & Header Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ textAlign: 'center', marginBottom: '5rem', zIndex: 10 }}
      >
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
          {/* Stylized 'A' Logo representing Altis */}
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              d="M50 10L15 85H30L50 40L70 85H85L50 10Z"
              fill="url(#logo_grad)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <motion.path
              d="M35 65Q50 55 65 65"
              stroke="#e879f9"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            />
            <defs>
              <linearGradient id="logo_grad" x1="50" y1="10" x2="50" y2="85" gradientUnits="userSpaceOnUse">
                <stop stopColor="#c084fc" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '140px', height: '140px', borderRadius: '50%',
            border: '1px solid rgba(255, 255, 255, 0.05)', zIndex: -1
          }} />
        </div>

        <h1 style={{
          fontSize: '4.5rem', fontWeight: '900', color: 'white', letterSpacing: '-3px',
          marginBottom: '0.2rem', textTransform: 'uppercase'
        }}>
          ALTIS
        </h1>
        <div style={{ height: '4px', width: '60px', background: 'var(--primary)', margin: '0.5rem auto 1rem', borderRadius: '2px' }} />
        <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', fontWeight: '300', letterSpacing: '4px', textTransform: 'uppercase' }}>
          Employee Management System
        </p>
      </motion.div>

      {/* Role Selection Grid */}
      <div className="responsive-grid" style={{ maxWidth: '1200px', width: '100%', zIndex: 10 }}>
        {roles.map((role) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: role.delay }}
            whileHover={{
              scale: 0.96, // Shrink effect as requested
              y: -8,       // Float effect as requested
              transition: { duration: 0.2 }
            }}
            onClick={() => handleRoleSelect(role.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="glass-panel" style={{
              padding: '3rem 2rem',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              border: '1px solid var(--glass-border)',
              background: 'rgba(255, 255, 255, 0.01)',
              transition: 'background 0.3s ease',
              position: 'relative'
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '2rem', border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
              }}>
                {role.icon}
              </div>

              <h3 style={{ color: 'white', fontSize: '1.75rem', fontWeight: '800', marginBottom: '1rem' }}>
                {role.title}
              </h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
                {role.description}
              </p>

              <div className="premium-btn" style={{
                marginTop: 'auto', width: '100%', padding: '12px',
                background: role.color, fontSize: '0.9rem', letterSpacing: '1px'
              }}>
                ACCESS {role.id.toUpperCase()} GATEWAY
              </div>
            </div>
          </motion.div>
        ))}
      </div>


      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{ marginTop: '4rem', color: 'rgba(255, 255, 255, 0.2)', fontSize: '0.8rem' }}
      >
        © 2026 ALTIS COMPANY. All rights reserved. Secure Gateway v2.4
      </motion.div>
    </div>
  );
};

export default EntryPage;
