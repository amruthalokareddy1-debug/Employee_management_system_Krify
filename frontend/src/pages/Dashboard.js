import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, AlertCircle, Award, 
  DollarSign, Eye, XCircle, UserPlus, Zap, PieChart as ChartIcon, Bell,
  Clock, Calendar as CalendarIcon
} from 'lucide-react';
import { AttendanceAreaChart } from '../components/Charts';
import AttendanceCard from '../components/AttendanceCard';

const StatCard = ({ title, value, icon, color, onClick }) => (
  <div 
    className="glass-panel p-6 stat-card" 
    style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: onClick ? 'pointer' : 'default' }}
    onClick={onClick}
  >
    <div style={{ 
      width: '50px', height: '50px', borderRadius: '12px', 
      background: `rgba(${color}, 0.1)`, display: 'flex', 
      alignItems: 'center', justifyContent: 'center', color: `rgb(${color})` 
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{title}</p>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, leaveRequests, allUsers, notifications, updateSalary, giveAppreciation, addStaff, updateEmployee } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({ first_name: '', email: '', role: 'employee', department: 'Engineering', current_salary: 50000 });
  
  // For viewing another employee's dashboard
  const [viewEmployeeId, setViewEmployeeId] = useState(localStorage.getItem('view_employee_id'));
  
  React.useEffect(() => {
    const handleStorageChange = () => {
      setViewEmployeeId(localStorage.getItem('view_employee_id'));
    };
    window.addEventListener('storage', handleStorageChange);
    // Also check every time component mounts
    const currentId = localStorage.getItem('view_employee_id');
    if (currentId !== viewEmployeeId) setViewEmployeeId(currentId);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [viewEmployeeId, allUsers]);

  const viewingEmployee = (viewEmployeeId && (allUsers || []).length > 0) ? (allUsers || []).find(u => u.id === parseInt(viewEmployeeId)) : null;

  if (!user) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  const isCeo = user.employee_profile?.role === 'ceo';
  const isHr = user.employee_profile?.role === 'hr';
  
  const handleAddStaff = async (e) => {
    e.preventDefault();
    const result = await addStaff(newStaffForm);
    if (result.success) {
      setShowAddStaff(false);
      setNewStaffForm({ first_name: '', email: '', role: 'employee', department: 'Engineering', current_salary: 50000 });
      alert('Staff member added successfully!');
    } else {
      alert('Error: ' + JSON.stringify(result.message));
    }
  };

  const renderAddStaffModal = () => (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001 }}>
      <motion.div className="glass-panel p-8 w-full max-w-lg" initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Add New Staff</h2>
          <button onClick={() => setShowAddStaff(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><XCircle size={24} /></button>
        </div>
        <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <input type="text" placeholder="Full Name" className="premium-input" required value={newStaffForm.first_name} onChange={e => setNewStaffForm({...newStaffForm, first_name: e.target.value})} />
          <input type="email" placeholder="Email Address" className="premium-input" required value={newStaffForm.email} onChange={e => setNewStaffForm({...newStaffForm, email: e.target.value})} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <select className="premium-input" value={newStaffForm.role} onChange={e => setNewStaffForm({...newStaffForm, role: e.target.value})}>
                <option value="employee">Employee</option>
                <option value="hr">HR Manager</option>
              </select>
              <select className="premium-input" value={newStaffForm.department} onChange={e => setNewStaffForm({...newStaffForm, department: e.target.value})}>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Human Resources">Human Resources</option>
              </select>
          </div>
          <input type="number" placeholder="Initial Salary ($)" className="premium-input" required value={newStaffForm.current_salary} onChange={e => setNewStaffForm({...newStaffForm, current_salary: parseInt(e.target.value)})} />
          <button type="submit" className="premium-btn" style={{ marginTop: '1rem' }}><UserPlus size={18} /> Register Employee</button>
        </form>
      </motion.div>
    </motion.div>
  );

  const renderProfileModal = (emp) => {
    if (!emp) return null;
    return (
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setSelectedEmployee(null)}>
        <motion.div className="glass-panel p-8 w-full max-w-2xl" initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>{emp.first_name[0]}</div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{emp.first_name} {emp.last_name}</h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{emp.employee_profile?.role} • {emp.employee_profile?.department}</p>
              </div>
            </div>
            <button onClick={() => setSelectedEmployee(null)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><XCircle size={28} /></button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
               <div className="glass-panel p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                 <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Current Salary</p>
                 <h3 style={{ color: 'var(--success)' }}>${Number(emp.employee_profile?.current_salary).toLocaleString()}</h3>
               </div>
               <div className="glass-panel p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                 <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Department</p>
                 <h3 style={{ color: 'var(--secondary)' }}>{emp.employee_profile?.department || 'N/A'}</h3>
               </div>
             </div>

             {(isCeo || isHr) && (
               <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                 <h4 style={{ marginBottom: '1rem' }}>Admin Actions</h4>
                 <div style={{ display: 'flex', gap: '10px' }}>
                   <button onClick={() => {
                     const amt = prompt('Enter new salary:');
                     if (amt) updateSalary(emp.id, amt);
                   }} className="premium-btn" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>Update Salary</button>
                   <button onClick={() => {
                     const title = prompt('Appreciation Title:');
                     if (title) giveAppreciation(emp.id, title, '');
                   }} className="premium-btn" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>Appreciate</button>
                 </div>
               </div>
             )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const renderEmployeeDashboard = (targetUser) => {
    const isViewingOther = targetUser.id !== user.id;
    const profile = targetUser.employee_profile || {};
    const salaryHist = targetUser.salary_history || [];
    const milestones = targetUser.milestones || [];
    const attendance = targetUser.attendance_records || [];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
        <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <StatCard title="My Attendance" value={`${attendance?.length || 0} Days`} icon={<CalendarIcon size={24} />} color="192, 132, 252" />
          <StatCard 
            title="Remaining Leaves" 
            value={`${profile.leaves_balance ?? 24} Days`} 
            icon={<Clock size={24} />} 
            color="34, 211, 238" 
            onClick={() => navigate('/leaves')} 
          />
          <StatCard title="Pending Status" value={leaveRequests.filter(r => r.user === targetUser.id && r.status === 'pending').length} icon={<AlertCircle size={24} />} color="251, 113, 133" />
        </div>

        {isViewingOther && (
          <div className="glass-panel p-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--primary)' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Viewing Performance Dashboard For:</p>
              <h3 style={{ fontWeight: '800' }}>{targetUser.first_name} {targetUser.last_name}</h3>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('view_employee_id');
                setViewEmployeeId(null);
              }}
              className="premium-btn" 
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              Exit View
            </button>
          </div>
        )}

        <div className="responsive-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {!isViewingOther && <AttendanceCard />}
            <div className="glass-panel p-6">
              <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Salary & Compensation Growth</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Current Annual Package</p>
                  <h2 style={{ color: 'var(--success)', fontWeight: '800' }}>${Number(profile.current_salary).toLocaleString()}</h2>
                </div>
                {(isCeo || isHr) && (
                  <button 
                    onClick={() => {
                      const newRole = prompt('Enter New Role (e.g., Senior Engineer):', profile.role);
                      if (newRole) updateEmployee(targetUser.id, { employee_profile: { role: newRole } });
                    }}
                    className="premium-btn" 
                    style={{ padding: '6px 12px', fontSize: '0.7rem', background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}
                  >
                    Promote Employee
                  </button>
                )}
              </div>
              <div style={{ height: '220px' }}>
                <AttendanceAreaChart 
                  data={salaryHist.length > 0 ? salaryHist.map((s, i) => ({ 
                    name: s.date, 
                    hours: Number(s.amount)/1000 
                  })) : []} 
                />
              </div>
            </div>

            <div className="glass-panel p-6">
              <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Work Efficiency (Attendance Trend)</h3>
              <div style={{ height: '220px' }}>
                <AttendanceAreaChart 
                  data={attendance.length > 0 ? attendance.slice(-6).map((a, i) => ({ 
                    name: a.date, 
                    hours: a.check_out_time ? 8.5 : 0 
                  })) : []} 
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {targetUser.notifications && targetUser.notifications.length > 0 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-4" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Bell color="var(--primary)" />
                <p style={{ fontWeight: '600' }}>{targetUser.notifications[targetUser.notifications.length - 1].message}</p>
              </motion.div>
            )}
            
            <div className="glass-panel p-6">
              <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Career Progression (Milestones)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {milestones && milestones.length > 0 ? milestones.map((m, i) => (
                  <div key={i} style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(34, 211, 238, 0.05)', border: '1px solid rgba(34, 211, 238, 0.1)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Zap color="var(--secondary)" size={20} />
                    <div>
                       <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{m.title}</p>
                       <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{m.type} • {m.date}</p>
                    </div>
                  </div>
                )) : (
                  <p style={{ color: 'var(--text-dim)' }}>No milestones recorded yet.</p>
                )}
              </div>
            </div>

            {(isCeo || isHr) && isViewingOther && (
              <div className="glass-panel p-6">
                <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Quick Admin Actions</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button onClick={() => {
                    const amt = prompt('Enter new salary:');
                    if (amt) updateSalary(targetUser.id, amt);
                  }} className="premium-btn flex-1" style={{ fontSize: '0.8rem' }}>Salary Hike</button>
                  <button onClick={() => {
                    const title = prompt('Appreciation Title:');
                    if (title) giveAppreciation(targetUser.id, title, '');
                  }} className="premium-btn flex-1" style={{ fontSize: '0.8rem' }}>Give Award</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Welcome, <span className="gradient-text">{user.first_name}</span></h1>
          <p style={{ color: 'var(--text-dim)' }}>{user.employee_profile?.role.toUpperCase()} Portal • {user.employee_profile?.department || 'General'}</p>
        </div>
        {(isCeo || isHr) && (
          <button className="premium-btn" onClick={() => setShowAddStaff(true)}><UserPlus size={18} /> Add Staff</button>
        )}
      </div>

      <AnimatePresence>
        {selectedEmployee && renderProfileModal(selectedEmployee)}
        {showAddStaff && renderAddStaffModal()}
      </AnimatePresence>

      <div className="responsive-grid">
        {(user.employee_profile?.role === 'employee' || viewingEmployee) ? renderEmployeeDashboard(viewingEmployee || user) : null}
        {(isHr || isCeo) && !viewingEmployee && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              <StatCard title="Total Staff" value={(allUsers || []).length} icon={<Users size={24} />} color="192, 132, 252" />
              <StatCard 
                title="Budget Overview" 
                value={`$${((allUsers || []).reduce((acc, curr) => acc + (Number(curr.employee_profile?.current_salary) || 0), 0) / 1000).toFixed(1)}k`} 
                icon={<DollarSign size={24} />} 
                color="34, 211, 238" 
                onClick={() => navigate('/analytics')} 
              />
              <StatCard title="Pending Leaves" value={(leaveRequests || []).filter(r => r.status === 'pending').length} icon={<AlertCircle size={24} />} color="251, 113, 133" />
            </div>
            <div className="glass-panel p-6">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: '700' }}>Staff Directory</h3>
                <button className="premium-btn" style={{ padding: '6px 12px', fontSize: '0.7rem' }} onClick={() => alert('Full Financial Report generated!')}>Generate Budget Report</button>
              </div>
              <div className="table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--text-dim)', fontSize: '0.8rem', borderBottom: '1px solid var(--glass-border)' }}>
                      <th style={{ padding: '12px' }}>Name</th>
                      <th style={{ padding: '12px' }}>Role</th>
                      <th style={{ padding: '12px' }}>Department</th>
                      <th style={{ padding: '12px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(allUsers || []).map((emp, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{emp.first_name}</td>
                        <td style={{ padding: '12px' }}>{emp.employee_profile?.role.toUpperCase()}</td>
                        <td style={{ padding: '12px' }}>{emp.employee_profile?.department || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>
                          <button onClick={() => setSelectedEmployee(emp)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}><Eye size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
