import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, CheckCircle2, XCircle, Clock, Calendar, Send, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Leaves = () => {
  const { user, applyLeave, leaveRequests, updateLeaveStatus, allUsers } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const isCeo = user?.employee_profile?.role === 'ceo';
  const isHr = user?.employee_profile?.role === 'hr';
  const [formData, setFormData] = useState({ start_date: '', end_date: '', reason: '', leave_type: 'personal' });

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return { bg: 'rgba(52, 211, 153, 0.1)', border: 'rgba(52, 211, 153, 0.2)', color: 'var(--success)' };
      case 'rejected': return { bg: 'rgba(251, 113, 133, 0.1)', border: 'rgba(251, 113, 133, 0.2)', color: 'var(--danger)' };
      default: return { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.2)', color: 'var(--warning)' };
    }
  };

  const myRequests = leaveRequests.filter(r => r.user === user.id);
  const employeeRequests = (isCeo || isHr) ? leaveRequests.filter(r => r.user !== user.id) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await applyLeave({
      user: user.id,
      start_date: formData.start_date,
      end_date: formData.end_date,
      reason: formData.reason,
      leave_type: formData.leave_type,
      status: 'pending'
    });
    if (res.success) {
      setIsApplying(false);
      alert('Leave request submitted successfully! It has been sent to CEO for approval.');
    } else {
      alert('Failed to submit: ' + JSON.stringify(res.message));
    }
  };

  const renderRequestItem = (req, showControls = false) => {
    const style = getStatusStyle(req.status);
    const applicant = allUsers.find(u => u.id === req.user);
    
    return (
      <div key={req.id} style={{ 
        padding: '1.5rem', borderRadius: '20px', background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--glass-border)', display: 'flex', flexWrap: 'wrap',
        justifyContent: 'space-between', gap: '1.5rem',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(34, 211, 238, 0.1)', color: 'var(--secondary)' }}>
            <FileText size={24} />
          </div>
          <div>
            <h4 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.3rem' }}>
              { applicant ? `${applicant.first_name} ${applicant.last_name || ''}` : 'Leave Request' }
              { req.user === user.id && <span style={{ marginLeft: '10px', fontSize: '0.7rem', background: 'var(--primary)', padding: '2px 8px', borderRadius: '10px', color: 'white' }}>YOU</span> }
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: 'bold', textTransform: 'capitalize' }}>{req.leave_type || 'Personal'}</span> • {req.start_date} to {req.end_date}
            </p>
            {req.reason && <p style={{ fontSize: '0.8rem', marginTop: '6px', color: 'rgba(255,255,255,0.4)' }}>Reason: {req.reason}</p>}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {showControls && req.status.toLowerCase() === 'pending' && (
            <div style={{ display: 'flex', gap: '5px' }}>
              <button onClick={() => updateLeaveStatus(req.id, 'approved')} className="premium-btn" style={{ padding: '6px 12px', fontSize: '0.7rem', background: 'var(--success)' }}>Approve</button>
              <button onClick={() => updateLeaveStatus(req.id, 'rejected')} className="premium-btn" style={{ padding: '6px 12px', fontSize: '0.7rem', background: 'var(--danger)' }}>Reject</button>
            </div>
          )}
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            padding: '8px 16px', borderRadius: '12px',
            background: style.bg, border: `1px solid ${style.border}`, color: style.color, fontWeight: '700', fontSize: '0.9rem' 
          }}>
            {req.status.toLowerCase() === 'approved' ? <CheckCircle2 size={16} /> : req.status.toLowerCase() === 'rejected' ? <XCircle size={16} /> : <Clock size={16} />}
            {req.status.toUpperCase()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Leave Management</h2>
          <p style={{ color: 'var(--text-dim)' }}>Plan your time off and track approval status.</p>
        </div>
        {(user?.employee_profile?.role === 'employee' || user?.employee_profile?.role === 'hr') && (
          <button className="premium-btn" onClick={() => setIsApplying(true)}>
            <Plus size={20} /> Request Leave
          </button>
        )}
      </div>

      <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="glass-panel p-6" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Annual Balance</p>
          <h3 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--secondary)' }}>
            {user?.employee_profile?.leaves_balance ?? 24} Days
          </h3>
        </div>
        <div className="glass-panel p-6" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>My Requests</p>
          <h3 style={{ fontSize: '2.2rem', fontWeight: '800' }}>{myRequests.length}</h3>
        </div>
        { (isCeo || isHr) && (
          <div className="glass-panel p-6" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Pending Employee Requests</p>
            <h3 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--warning)' }}>
              {employeeRequests.filter(r => r.status.toLowerCase() === 'pending').length}
            </h3>
          </div>
        )}
      </div>

      {/* Section 1: My History */}
      <div className="glass-panel p-8">
        <h3 style={{ marginBottom: '2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={22} color="var(--primary)" /> My Leave History
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {myRequests.length > 0 ? myRequests.map(req => renderRequestItem(req, false)) : <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>You haven't requested any leaves yet.</p>}
        </div>
      </div>

      {/* Section 2: Employee Requests (For HR/CEO) */}
      {(isCeo || isHr) && (
        <div className="glass-panel p-8">
          <h3 style={{ marginBottom: '2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={22} color="var(--secondary)" /> Manage Employee Leaves
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {employeeRequests.length > 0 ? employeeRequests.map(req => renderRequestItem(req, true)) : <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>No pending employee requests.</p>}
          </div>
        </div>
      )}


      <AnimatePresence>
        {isApplying && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setIsApplying(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-panel p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Request New Leave</h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Start Date</label>
                    <input type="date" className="premium-input w-full" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>End Date</label>
                    <input type="date" className="premium-input w-full" required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Leave Type</label>
                  <select className="premium-input w-full" value={formData.leave_type} onChange={e => setFormData({...formData, leave_type: e.target.value})}>
                    <option value="sick">Sick Leave</option>
                    <option value="vacation">Vacation</option>
                    <option value="personal">Personal Leave</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Reason <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <textarea className="premium-input w-full" rows={3} placeholder="Mandatory: Why are you taking leave?" required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} style={{ resize: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setIsApplying(false)} className="premium-btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', boxShadow: 'none' }}>Cancel</button>
                  <button type="submit" className="premium-btn" style={{ flex: 2 }}><Send size={18} /> Submit Request</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Leaves;
