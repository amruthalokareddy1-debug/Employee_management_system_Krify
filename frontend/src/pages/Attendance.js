import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Download } from 'lucide-react';
import AttendanceCard from '../components/AttendanceCard';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
  const { user } = useAuth();
  const logs = user?.attendance_records || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Daily Attendance</h2>
          <p style={{ color: 'var(--text-dim)' }}>Manage your check-ins and check-outs.</p>
        </div>
        <AttendanceCard />
      </div>

      <div className="glass-panel p-8">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h3 style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={22} color="var(--primary)" /> Attendance Log
          </h3>
          <button className="premium-btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Download size={16} /> Export CSV
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {logs.length > 0 ? logs.map((log, index) => (
            <div key={index} style={{ 
              padding: '1.5rem', borderRadius: '20px', background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--glass-border)', display: 'flex', flexWrap: 'wrap',
              justifyContent: 'space-between', gap: '1rem',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(192, 132, 252, 0.1)', color: 'var(--primary)' }}>
                  <Calendar size={20} />
                </div>
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{log.date}</span>
              </div>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '600' }}>CHECK IN</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{log.check_in_time || '---'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '600' }}>CHECK OUT</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{log.check_out_time || '---'}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800',
                  background: log.check_out_time ? 'rgba(52, 211, 153, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                  color: log.check_out_time ? 'var(--success)' : 'var(--warning)',
                  border: `1px solid ${log.check_out_time ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 191, 36, 0.2)'}`
                }}>
                  {log.check_out_time ? 'Completed' : 'Active'}
                </span>
              </div>
            </div>
          )) : (
            <p style={{ color: 'var(--text-dim)', textAlign: 'center' }}>No attendance records found.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Attendance;
