import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaTimes } from 'react-icons/fa'; 
import './Dashboard.css';

const ActivityDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]); 
  
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/');
    }

    fetch('http://localhost:3000/api/activities')
      .then((res) => res.json())
      .then((data) => setActivities(data))
      .catch((err) => console.error("Error fetching activities:", err));
      
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const closeModal = () => setSelectedActivity(null);

  if (!user) return null;

  return (
    <div className="dashboard-container">
      
      {/* Profile Section */}
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-icon">
            <FaUser />
          </div>
          <div className="profile-info">
            <h2>Welcome,</h2>
            <h1 style={{textTransform: 'uppercase'}}>{user.Full_Name}</h1>
            <p>Undergraduate Student ({user.NIM})</p>
          </div>
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
          <p style={{marginBottom: '20px', fontSize: '13px', color: '#666'}}>
            Click on any card to view details.
          </p>
          
          {activities.length === 0 ? <p>Loading activities...</p> : 
            activities.map((activity) => (
            <div 
                key={activity.Activity_ID} 
                className="activity-card"
                onClick={() => setSelectedActivity(activity)}
                style={{cursor: 'pointer'}}
            >
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
                    <span>{activity.Description.substring(0, 30)}...</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* --- POPUP MODAL --- */}
      {selectedActivity && (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                
                <div className="modal-header">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span className="modal-tag" style={{ margin: 0, padding: '4px 10px', fontSize: '11px' }}>
                                {selectedActivity.Activity_Type}
                            </span>
                            <span style={{ fontSize: '12px', color: '#999', fontWeight: '600' }}>
                                ID: #{String(selectedActivity.Activity_ID).padStart(4, '0')}
                            </span>
                        </div>
                        <h2 style={{ marginTop: '0', fontSize: '24px' }}>{selectedActivity.Activity_Name}</h2>
                    </div>
                    <button className="modal-close-btn" onClick={closeModal}>
                        <FaTimes />
                    </button>
                </div>
                
                <div className="modal-body">
                    <p style={{marginTop: '0'}}>
                        <strong>Credits:</strong> {selectedActivity.Activity_Credits} Points
                    </p>
                    
                    <p>
                        <strong>Description:</strong><br/>
                        {selectedActivity.Description}
                    </p>
                    <div style={{marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
                        <p>
                            <strong>Advisor:</strong><br/>
                            {selectedActivity.Advisor_Name || 'Not Assigned'}
                        </p>
                        <p>
                            <strong>President:</strong><br/>
                            {selectedActivity.President_Name || 'Not Assigned'}
                        </p>
                    </div>
                </div>

                <div style={{marginTop: '25px', textAlign: 'right'}}>
                    <button 
                        className="add-button" 
                        style={{margin: 0, width: 'auto', padding: '12px 25px', fontSize: '14px'}} 
                        onClick={closeModal}
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
      )}

    </div>
  );
};

export default ActivityDashboard;
