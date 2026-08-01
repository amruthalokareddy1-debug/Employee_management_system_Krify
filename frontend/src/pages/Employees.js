import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Trash2, Mail, Briefcase, Eye, 
  XCircle, Save, UserPlus, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Employees = () => {
  const { allUsers, user, updateEmployee, deleteEmployee, addStaff } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);

  const currentUser = user || {};
  const isCeo = currentUser.employee_profile?.role === 'ceo';
  const isHr = currentUser.employee_profile?.role === 'hr';

  // Filter based on search
  const employees = (allUsers || []).filter(emp => {
    const fullName = `${emp.first_name} ${emp.last_name || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleEditSave = async () => {
    if (!selectedEmployee) return;
    // Extract first_name and profile data
    const updateData = {
      first_name: editForm.first_name,
      employee_profile: {
        department: editForm.department,
        current_salary: editForm.current_salary,
        role: editForm.role
      }
    };
    const result = await updateEmployee(selectedEmployee.id, updateData);
    if (result.success) {
      setIsEditing(false);
      setSelectedEmployee(null);
      alert('Staff record updated successfully');
    } else {
      alert('Failed to update: ' + JSON.stringify(result.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      const result = await deleteEmployee(id);
      if (result.success) {
        setSelectedEmployee(null);
        alert('Staff member removed.');
      }
    }
  };

  const renderProfileModal = (emp) => {
    if (!emp) return null;
    const profile = emp.employee_profile || {};
    
    return (
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}
        onClick={() => { setSelectedEmployee(null); setIsEditing(false); }}
      >
        <motion.div 
          className="glass-panel p-10 w-full"
          initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }}
          style={{ maxWidth: '800px', margin: '20px' }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold' }}>
                {emp.first_name ? emp.first_name[0] : '?'}
              </div>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{emp.first_name}</h2>
                <p style={{ color: 'var(--text-dim)' }}>{profile.role?.toUpperCase()} • {profile.department}</p>
              </div>
            </div>
            <button onClick={() => { setSelectedEmployee(null); setIsEditing(false); }} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><XCircle size={32} /></button>
          </div>

          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div>
                  <label className="text-dim text-xs mb-1 block">Full Name</label>
                  <input type="text" className="premium-input w-full" value={editForm.first_name || ''} onChange={e => setEditForm({...editForm, first_name: e.target.value})} />
                </div>
                <div>
                  <label className="text-dim text-xs mb-1 block">Department</label>
                  <input type="text" className="premium-input w-full" value={editForm.department || ''} onChange={e => setEditForm({...editForm, department: e.target.value})} />
                </div>
                <div>
                  <label className="text-dim text-xs mb-1 block">Salary ($)</label>
                  <input type="number" className="premium-input w-full" value={editForm.current_salary || 0} onChange={e => setEditForm({...editForm, current_salary: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="text-dim text-xs mb-1 block">Role</label>
                  <select className="premium-input w-full" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                    <option value="employee">Employee</option>
                    <option value="hr">HR Manager</option>
                    {isCeo && <option value="ceo">CEO</option>}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={handleEditSave} className="premium-btn flex-1"><Save size={18} /> Update Staff Info</button>
                <button onClick={() => setIsEditing(false)} className="premium-btn flex-1" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-panel p-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-dim text-xs mb-2">Salary Details</p>
                  <h2 className="font-bold text-success" style={{ fontSize: '1.5rem' }}>${Number(profile.current_salary).toLocaleString()}</h2>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Per Annum</p>
                </div>
                <div className="glass-panel p-6" style={{ background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                  <p className="text-dim text-xs mb-2">Contact Email</p>
                  <p className="font-bold" style={{ wordBreak: 'break-all', fontSize: '0.95rem' }}>{emp.email}</p>
                </div>
                <div className="glass-panel p-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-dim text-xs mb-2">Department</p>
                  <p className="font-bold text-secondary" style={{ fontSize: '1.2rem' }}>{profile.department}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => {
                    setIsEditing(true);
                    setEditForm({
                      first_name: emp.first_name,
                      department: profile.department,
                      current_salary: profile.current_salary,
                      role: profile.role
                    });
                  }} 
                  className="premium-btn flex-1"
                >
                  Edit Employee Details
                </button>
                {(isCeo || isHr) && (
                  <button onClick={() => handleDelete(emp.id)} className="premium-btn flex-1" style={{ background: 'rgba(251, 113, 133, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
                    Terminate Staff
                  </button>
                )}
              </div>

              {(isCeo || isHr) && (
                <button 
                  onClick={() => {
                    // Store employee ID to view dashboard
                    localStorage.setItem('view_employee_id', emp.id);
                    navigate('/dashboard');
                  }}
                  className="premium-btn" 
                  style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', marginTop: '0.5rem' }}
                >
                  View Full Performance Dashboard
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Organization <span className="gradient-text">Directory</span></h1>
          <p style={{ color: 'var(--text-dim)' }}>Manage your team members and their information.</p>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '2rem' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} size={18} />
          <input 
            type="text" 
            className="premium-input w-full" 
            style={{ paddingLeft: '40px' }} 
            placeholder="Search employees..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-dim)', fontSize: '0.8rem', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '12px' }}>STAFF MEMBER</th>
                <th style={{ padding: '12px' }}>DEPARTMENT</th>
                <th style={{ padding: '12px' }}>ROLE</th>
                <th style={{ padding: '12px' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '35px', height: '35px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {emp.first_name[0]}
                      </div>
                      <div style={{ maxWidth: '150px' }}>
                        <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{emp.first_name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={emp.email}>{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>{emp.employee_profile?.department}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {emp.employee_profile?.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => setSelectedEmployee(emp)} className="premium-btn" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                      <Eye size={14} /> View / Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {employees.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
              No employees found matching your search.
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedEmployee && renderProfileModal(selectedEmployee)}
      </AnimatePresence>
    </motion.div>
  );
};

export default Employees;
