import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaPlus, FaSignOutAlt } from 'react-icons/fa'; // Import Logout Icon
import './Dashboard.css';

const RecordsDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    // 1. Get User from Storage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // 2. Fetch Records using the Student's NIM
      fetch(`http://localhost:3000/api/records?nim=${parsedUser.NIM}`)
        .then((res) => res.json())
        .then((data) => setRecords(data))
        .catch((err) => console.error("Error fetching records:", err));
        
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      
      {/* Profile Section (Reused) */}
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-icon">
            <FaUser />
          </div>
          <div className="profile-info">
            <h2>Welcome,</h2>
            <h1 style={{textTransform: 'uppercase'}}>{user.Full_Name}</h1>
            <p>Major Student ({user.NIM})</p>
          </div>
          {/* Logout Button */}
          <button className="logout-button" onClick={handleLogout} title="Sign Out">
            <FaSignOutAlt />
          </button>
        </div>
        <div className="profile-stats">
            {/* Using Placeholders for GPA as they aren't in DB yet */}
            <div className="stat-item"><h3>Major</h3><span>{user.Major}</span></div>
            <div className="stat-item"><h3>GPA</h3><span>3.85</span></div>
            <div className="stat-item"><h3>Status</h3><span>Active</span></div>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        {/* Tabs */}
        <div className="tabs">
          <Link to="/dashboard" className="tab">ACTIVITY</Link>
          <Link to="/records" className="tab active">RECORDS</Link>
        </div>

        <div className="activity-list">
          <h3 className="section-title">Records</h3>

          {/* Records List */}
          {records.length === 0 ? <p style={{color: '#888'}}>No records found.</p> : 
            records.map((record) => (
            <div key={record.Record_ID} className="activity-card">
              <div className="activity-left">
                <h3>{record.Activity_Name}</h3>
                <div className="activity-details">
                  <div className="detail-item">
                    <span>ID</span>
                    <span>{String(record.Record_ID).padStart(7, '0')}</span>
                  </div>
                  <div className="detail-item">
                    <span>Type</span>
                    <span>{record.Activity_Type}</span>
                  </div>
                  <div className="detail-item">
                    <span>Credits</span>
                    <span>{record.Activity_Credits} Credits</span>
                  </div>
                  <div className="detail-item">
                    <span>Status</span>
                    {/* Dynamic Styling for Status */}
                    <span style={{
                        color: record.Status === 'Approved' ? 'green' : 
                               record.Status === 'Rejected' ? 'red' : '#d68a00'
                    }}>
                        {record.Status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* The Big Plus Button */}
          <button className="add-button" onClick={() => navigate('/submit')}>
              <FaPlus />
          </button>

        </div>
      </div>
    </div>
  );
};

export default RecordsDashboard;