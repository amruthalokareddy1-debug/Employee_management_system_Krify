import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

export const AttendanceAreaChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
      <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
      <Tooltip 
        contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
        itemStyle={{ color: 'var(--text-main)' }}
      />
      <Area type="monotone" dataKey="hours" stroke="var(--primary)" fillOpacity={1} fill="url(#colorPv)" />
    </AreaChart>
  </ResponsiveContainer>
);

export const DepartmentBarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
      <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
      <Tooltip 
        contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
      />
      <Bar dataKey="present" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      <Bar dataKey="absent" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const PerformancePieChart = ({ data }) => {
  const COLORS = ['#c084fc', '#22d3ee', '#34d399', '#fbbf24'];
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
