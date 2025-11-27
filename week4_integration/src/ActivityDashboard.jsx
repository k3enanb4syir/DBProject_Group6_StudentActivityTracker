import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt } from 'react-icons/fa'; // Import Logout Icon
import './Dashboard.css';

const ActivityDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]); 

  useEffect(() => {
    // 1. Check Auth
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/');
    }

    // 2. Fetch Activities from Backend
    fetch('http://localhost:3000/api/activities')
      .then((res) => res.json())
      .then((data) => setActivities(data))
      .catch((err) => console.error("Error fetching activities:", err));
      
  }, [navigate]);

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      
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
          <div className="stat-item">
            <h3>Major</h3>
            <span>{user.Major}</span>
          </div>
          <div className="stat-item">
            <h3>GPA</h3>
            <span>3.85</span>
          </div>
          <div className="stat-item">
            <h3>Status</h3>
            <span>Active</span>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="tabs">
          <Link to="/dashboard" className="tab active">ACTIVITY</Link>
          <Link to="/records" className="tab">RECORDS</Link>
        </div>

        <div className="activity-list">
          <h3 className="section-title">Activities Available</h3>
          
          {activities.length === 0 ? <p>Loading activities...</p> : 
            activities.map((activity) => (
            <div key={activity.Activity_ID} className="activity-card">
              <div className="activity-left">
                <h3>{activity.Activity_Name}</h3>
                <div className="activity-details">
                  <div className="detail-item">
                    <span>Type</span>
                    <span>{activity.Activity_Type}</span>
                  </div>
                  <div className="detail-item">
                    <span>Credits</span>
                    <span>{activity.Activity_Credits} Credits</span>
                  </div>
                  <div className="detail-item">
                    <span>Description</span>
                    <span>{activity.Description}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
};

export default ActivityDashboard;