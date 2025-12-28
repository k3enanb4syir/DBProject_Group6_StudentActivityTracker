import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
import Login from './Login';
import ActivityDashboard from './ActivityDashboard';
import RecordsDashboard from './RecordsDashboard';
import SubmitRecord from './SubmitRecord';
import AdminDashboard from './AdminDashboard'; // Import the Admin Dashboard

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route 1: The Login Page (Default) */}
        <Route path="/" element={<Login />} />

        {/* Route 2: Student Dashboards */}
        <Route path="/dashboard" element={<ActivityDashboard />} />
        <Route path="/records" element={<RecordsDashboard />} />
        <Route path="/submit" element={<SubmitRecord />} />
        
        {/* Route 3: Admin Dashboard (For Faculty) */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Fallback: Redirect unknown URLs to Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;