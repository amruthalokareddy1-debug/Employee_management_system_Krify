import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ShieldCheck, ArrowRight, Loader2, User, Briefcase, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('hr');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const { sendSignupOTP, verifySignupOTP, loading } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get('auth/check-roles/');
        const roles = res.data.available_roles;
        setAvailableRoles(roles);
        
        // Literal requirement: "once ceo signsup then remove whole signup page"
        if (!roles.includes('ceo')) {
          alert('CEO has already registered. Signup portal is now closed.');
          navigate('/login');
          return;
        }

        // Set default role to first available if 'hr' is taken
        if (!roles.includes('hr')) {
          setRole('ceo');
        }
      } catch (err) {
        console.error('Failed to fetch roles');
      }
    };
    fetchRoles();
  }, [navigate]);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    const result = await sendSignupOTP(email, role);
    if (result.success) {
      setOtpSent(true);
    } else {
      setError(result.message);
    }
  };

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    setError('');
    const result = await verifySignupOTP({ name, email, role, otp });
    if (result.success) {
      alert('Signup successful! Please login.');
      navigate('/login', { state: { email } });
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
      padding: '2rem 1rem'
    }}>
      <motion.div 
        className="glass-panel p-10" 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
          width: '90%', 
          maxWidth: '450px',
          padding: '40px',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
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
            background: 'linear-gradient(135deg, #10b981, #3b82f6)', 
            borderRadius: '18px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.5)' 
          }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'white', marginBottom: '4px' }}>Admin Signup</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem' }}>HR & CEO Registration</p>
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

        <form onSubmit={otpSent ? handleVerifyAndSignup : handleRequestOTP} style={{ width: '100%' }}>
          {!otpSent ? (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.4rem' }}>Work Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} size={18} />
                  <input 
                    type="email" 
                    className="premium-input" 
                    style={{ paddingLeft: '44px', width: '100%' }} 
                    placeholder="email@company.com" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.4rem' }}>Portal Role</label>
                <div style={{ position: 'relative' }}>
                  <Briefcase style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} size={18} />
                  <select 
                    className="premium-input" 
                    style={{ paddingLeft: '44px', width: '100%', appearance: 'none' }}
                    value={role}
                    onChange={e => setRole(e.target.value)}
                  >
                    {availableRoles.includes('hr') && <option value="hr">HR Manager</option>}
                    {availableRoles.includes('ceo') && <option value="ceo">CEO</option>}
                  </select>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="premium-btn" 
                disabled={loading}
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    Send Verification OTP <ArrowRight size={18} />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.4rem' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} size={18} />
                  <input 
                    type="text" 
                    className="premium-input" 
                    style={{ paddingLeft: '44px', width: '100%' }} 
                    placeholder="Enter your full name" 
                    required 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.4rem' }}>Enter OTP</label>
                <div style={{ position: 'relative' }}>
                  <Key style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} size={18} />
                  <input 
                    type="text" 
                    className="premium-input" 
                    style={{ paddingLeft: '44px', width: '100%' }} 
                    placeholder="6-digit OTP" 
                    required 
                    value={otp} 
                    onChange={e => setOtp(e.target.value)} 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="premium-btn" 
                disabled={loading}
                style={{ width: '100%', marginBottom: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    Complete Signup <ShieldCheck size={18} />
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => setOtpSent(false)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Back to details
              </button>
            </>
          )}

          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.8rem', textAlign: 'center', marginTop: '1rem' }}>
            Already registered? <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '600' }}>Sign In</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;
