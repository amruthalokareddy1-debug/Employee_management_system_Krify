import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Clock, Play, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AttendanceCard = () => {
  const { user, checkIn, checkOut } = useAuth();
  const [time, setTime] = useState(new Date());
  const [photoCaptured, setPhotoCaptured] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const attendanceToday = user?.attendance_records?.find(r => r.date === today);
  const isCheckedIn = !!(attendanceToday && attendanceToday.check_in_time && !attendanceToday.check_out_time);
  const isFullyCheckedOut = !!(attendanceToday && attendanceToday.check_out_time);

  const handleAction = async () => {
    if (!isCheckedIn && !isFullyCheckedOut) {
      setPhotoCaptured(true);
      setTimeout(async () => {
        await checkIn();
        setPhotoCaptured(false);
      }, 1000);
    } else if (isCheckedIn) {
      await checkOut();
    }
  };

  return (
    <div className="glass-panel p-6" style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Work Status</h3>
        <span style={{ 
          padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem',
          background: isCheckedIn ? 'rgba(52, 211, 153, 0.1)' : 'rgba(251, 113, 133, 0.1)',
          color: isCheckedIn ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${isCheckedIn ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 113, 133, 0.2)'}`
        }}>
          {isCheckedIn ? 'Status: Active' : isFullyCheckedOut ? 'Status: Completed' : 'Status: Offline'}
        </span>
      </div>

      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '2px', color: 'white' }}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: '500' }}>
          {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div style={{ 
        background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '1rem', 
        marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center',
        border: '1px solid var(--glass-border)'
      }}>
        <div style={{ 
          width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
        }}>
          {photoCaptured ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ width: '100%', height: '100%', borderRadius: '12px', background: 'var(--primary)', opacity: 0.3 }} 
            />
          ) : (
            <Camera size={24} style={{ color: 'var(--text-dim)' }} />
          )}
        </div>
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'white' }}>Session Details</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            {isCheckedIn ? `Checked in at ${attendanceToday.check_in_time}` : 'Waiting for check-in...'}
          </p>
        </div>
      </div>

      {!isFullyCheckedOut && (
        <button 
          onClick={handleAction}
          className="premium-btn"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          {isCheckedIn ? (
            <><Square size={18} /> End Workday</>
          ) : (
            <><Play size={18} /> {photoCaptured ? 'Verifying...' : 'Begin Workday'}</>
          )}
        </button>
      )}

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={14} /> Registered Office
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={14} /> Logged: {attendanceToday ? (isCheckedIn ? 'Running' : 'Done') : 'None'}
        </div>
      </div>
    </div>
  );
};

export default AttendanceCard;
