import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('auth/profile/');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to fetch profile', error);
      logout();
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      const [usersRes, leavesRes, userRes] = await Promise.all([
        api.get('users/'),
        api.get('leaves/'),
        api.get('auth/profile/')
      ]);
      setAllUsers(usersRes.data);
      setLeaveRequests(leavesRes.data);
      setUser(userRes.data);
      
      if (userRes.data.notifications) {
        setNotifications(userRes.data.notifications.map(n => n.message));
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Background check for session validity (Single Login enforcement)
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        // We just need to make ANY authenticated request
        api.get('auth/profile/').catch((err) => {
          // If 401, the interceptor in api.js will clear storage and redirect
          if (err.response && err.response.status === 401) {
            setUser(null);
          }
        });
      }, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (user && allUsers.length === 0) {
      fetchAllData();
    }
  }, [user, fetchAllData, allUsers.length]);

  const login = async (name, email, role) => {
    setLoading(true);
    try {
      const response = await api.post('auth/login-direct/', { name, email, role });
      const { access, refresh, user: userData } = response.data;
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.error || 'Login failed';
      return { success: false, message };
    }
  };

  const sendSignupOTP = async (email, role) => {
    try {
      const res = await api.post('auth/send-signup-otp/', { email, role });
      alert(`SIGNUP OTP: ${res.data.otp}`); // As requested: verification in alert
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to send OTP' };
    }
  };

  const verifySignupOTP = async (data) => {
    try {
      await api.post('auth/signup-verify/', data);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Verification failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
  };

  const applyLeave = async (data) => {
    try {
      await api.post('leaves/', data);
      fetchAllData();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data || 'Failed to apply' };
    }
  };

  const updateLeaveStatus = async (id, status) => {
    try {
      await api.post(`leaves/${id}/update_status/`, { status });
      fetchAllData();
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  const checkIn = async () => {
    try {
      await api.post('attendance/check_in/');
      fetchProfile(); // Refresh user data to get updated attendance
    } catch (error) {
      console.error('Check-in failed');
    }
  };

  const checkOut = async () => {
    try {
      await api.post('attendance/check_out/');
      fetchProfile();
    } catch (error) {
      console.error('Check-out failed');
    }
  };

  const updateSalary = async (userId, amount) => {
    try {
      await api.post('salaries/', { user: userId, amount });
      fetchAllData();
    } catch (error) {
      console.error('Failed to update salary');
    }
  };

  const addStaff = async (data) => {
    try {
      // Backend EmployeeViewSet create handles User and Profile
      await api.post('users/', data);
      fetchAllData();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data || 'Failed to add staff' };
    }
  };

  const updateEmployee = async (id, data) => {
    try {
      await api.patch(`users/${id}/`, data);
      fetchAllData();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data || 'Update failed' };
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await api.delete(`users/${id}/`);
      fetchAllData();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data };
    }
  };

  const giveAppreciation = async (userId, title, description) => {
    try {
      await api.post('appreciations/', { user: userId, title, description });
      fetchAllData();
    } catch (error) {
      console.error('Failed to give appreciation');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, login, logout, applyLeave, updateLeaveStatus, 
      checkIn, checkOut, updateSalary, giveAppreciation, addStaff,
      updateEmployee, deleteEmployee,
      sendSignupOTP, verifySignupOTP,
      allUsers, leaveRequests, notifications
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
