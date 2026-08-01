import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Users, Zap, DollarSign, Calendar } from 'lucide-react';
import { AttendanceAreaChart, PerformancePieChart } from '../components/Charts';
import { useAuth } from '../context/AuthContext';

const Analytics = () => {
  const { allUsers } = useAuth();
  const [viewMode, setViewMode] = React.useState('budget');

  // Generate Daily Budget History for the last 30 days based on salary history
  const budgetHistory = useMemo(() => {
    const history = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      let dailyTotal = 0;
      allUsers.forEach(emp => {
        const hist = emp.salary_history || [];
        const validRecords = hist.filter(h => new Date(h.date) <= date);
        if (validRecords.length > 0) {
          validRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
          dailyTotal += Number(validRecords[0].amount);
        } else {
          // Use current salary as baseline
          dailyTotal += Number(emp.employee_profile?.current_salary || 0);
        }
      });

      history.push({ 
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        hours: dailyTotal // Using 'hours' key to match Charts.js AttendanceAreaChart dataKey
      });
    }
    return history;
  }, [allUsers]);

  const deptData = useMemo(() => {
    const depts = {};
    allUsers.forEach(emp => {
      const d = emp.employee_profile?.department || 'Other';
      if (!depts[d]) depts[d] = { name: d, count: 0, salary: 0 };
      depts[d].count += 1;
      depts[d].salary += Number(emp.employee_profile?.current_salary || 0);
    });
    return Object.values(depts);
  }, [allUsers]);

  const totalBudget = deptData.reduce((acc, curr) => acc + curr.salary, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800' }}>ALTIS <span className="gradient-text">{viewMode === 'budget' ? 'Budget' : 'Analytics'}</span></h2>
          <p style={{ color: 'var(--text-dim)' }}>{viewMode === 'budget' ? 'Daily expenditure and payroll tracking.' : 'Performance metrics and growth analytics.'}</p>
        </div>
        <button className="premium-btn" onClick={() => setViewMode(viewMode === 'budget' ? 'analytics' : 'budget')}>
          {viewMode === 'budget' ? <BarChart3 size={18} /> : <DollarSign size={18} />} Switch View
        </button>
      </div>

      {viewMode === 'budget' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel p-8">
            <h3 style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={20} color="var(--secondary)" /> Daily Budget Trend (Last 30 Days)
            </h3>
            <div style={{ height: '350px' }}>
              <AttendanceAreaChart data={budgetHistory} />
            </div>
            <p style={{ marginTop: '1rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
              * Values shown represent total daily payroll commitment across all departments.
            </p>
          </div>

          <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <div className="glass-panel p-8">
              <h3 style={{ marginBottom: '2rem' }}>Departmental Breakdown</h3>
              <div className="table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--text-dim)', fontSize: '0.8rem', borderBottom: '1px solid var(--glass-border)' }}>
                      <th style={{ padding: '12px' }}>Department</th>
                      <th style={{ padding: '12px' }}>Staff</th>
                      <th style={{ padding: '12px' }}>Budget</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deptData.map((dept, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{dept.name}</td>
                        <td style={{ padding: '12px' }}>{dept.count} Members</td>
                        <td style={{ padding: '12px', color: 'var(--success)' }}>${Number(dept.salary).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="glass-panel p-8">
              <h3 style={{ marginBottom: '2rem' }}>Budget Distribution</h3>
              <div style={{ height: '250px' }}>
                <PerformancePieChart data={deptData.map(d => ({ name: d.name, value: d.salary }))} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="responsive-grid">
          <div className="glass-panel p-8">
            <h3 style={{ marginBottom: '2rem' }}>Workforce Distribution</h3>
            <div style={{ height: '350px' }}>
              <PerformancePieChart data={deptData.map(d => ({ name: d.name, value: d.count }))} />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Analytics;
