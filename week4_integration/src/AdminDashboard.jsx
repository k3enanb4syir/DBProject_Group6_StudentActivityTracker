import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaCheck, FaTimes, FaSignOutAlt, FaSync } from 'react-icons/fa'; 
import './Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Check Auth & Role
    const storedUser = localStorage.getItem('currentUser');
    const role = localStorage.getItem('userRole');

    if (storedUser && role === 'faculty') {
      setAdmin(JSON.parse(storedUser));
      fetchPendingRequests();
    } else {
      navigate('/'); // Kick out if not faculty
    }
  }, [navigate]);

  const fetchPendingRequests = () => {
    setLoading(true);
    setError(null);
    
    // UPDATED: Use 127.0.0.1 to avoid localhost resolution issues
    fetch('http://127.0.0.1:3000/api/admin/pending')
      .then(res => {
        if (!res.ok) {
            throw new Error(`Server Status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Pending requests received:", data); 
        setRequests(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching requests:", err);
        // UPDATED: Show the ACTUAL error message to help debug
        setError(`Connection Error: ${err.message}`);
        setLoading(false);
      });
  };

  const handleReview = async (recordId, status) => {
    try {
      // UPDATED: Use 127.0.0.1
      const response = await fetch('http://127.0.0.1:3000/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          record_id: recordId,
          status: status,
          faculty_id: admin.Faculty_ID
        })
      });

      if (response.ok) {
        fetchPendingRequests();
      } else {
        alert("Failed to update status. Please try again.");
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!admin) return null;

  return (
    <div className="dashboard-container">
      
      {/* Admin Profile Card */}
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-icon" style={{ background: 'linear-gradient(135deg, #e0eafc, #cfdef3)' }}>
            <FaUserTie style={{ color: '#4a90e2' }} />
          </div>
          <div className="profile-info">
            <h2>Faculty Administrator</h2>
            <h1 style={{textTransform: 'uppercase'}}>{admin.Faculty_Name}</h1>
            <p>{admin.Email}</p>
          </div>
          <button className="logout-button" onClick={handleLogout} title="Sign Out">
            <FaSignOutAlt />
          </button>
        </div>
        
        <div className="profile-stats">
          <div className="stat-item">
            <h3>Role</h3>
            <span>Approver</span>
          </div>
          <div className="stat-item">
            <h3>Department</h3>
            <span>Academic Affairs</span>
          </div>
          <div className="stat-item">
            <h3>Pending</h3>
            <span>{requests.length} Requests</span>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="content-section">
        <div className="activity-list" style={{ borderRadius: '13px' }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h3 className="section-title" style={{margin: 0}}>Pending Student Requests</h3>
            <button onClick={fetchPendingRequests} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#666'}}>
                <FaSync className={loading ? 'fa-spin' : ''} /> Refresh
            </button>
          </div>

          {/* ERROR STATE */}
          {error && (
            <div style={{padding: '20px', background: '#ffebee', color: '#c62828', borderRadius: '8px', textAlign: 'center'}}>
                {error}
            </div>
          )}

          {/* LOADING STATE */}
          {loading && !error && (
            <p style={{textAlign: 'center', color: '#666'}}>Loading requests...</p>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && requests.length === 0 && (
            <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
              <p>No pending requests found.</p>
              <small>Try submitting a request as a student first.</small>
            </div>
          )}

          {/* DATA LIST */}
          {!loading && !error && requests.map((req) => (
              <div key={req.Record_ID} className="activity-card" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '15px'}}>
                
                <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                        <h3 style={{margin: '0 0 5px 0', fontSize: '18px', color: '#222'}}>{req.Activity_Name}</h3>
                        <span style={{fontSize: '14px', color: '#666', fontWeight: '500'}}>Student: {req.Student_Name}</span>
                    </div>
                    <span style={{
                        backgroundColor: '#fff3cd', color: '#856404', 
                        padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold'
                    }}>
                        {req.Activity_Type}
                    </span>
                </div>

                <div className="activity-details" style={{width: '100%', borderTop: '1px solid #f0f0f0', paddingTop: '15px'}}>
                  <div className="detail-item">
                    <span>Role</span>
                    <span>{req.Role}</span>
                  </div>
                  <div className="detail-item">
                    <span>Date</span>
                    <span>{req.Date_Of_Activity}</span>
                  </div>
                  <div className="detail-item">
                    <span>Hours</span>
                    <span>{req.Hours_Submitted} hrs</span>
                  </div>
                </div>

                <div style={{width: '100%', display: 'flex', gap: '10px', marginTop: '5px'}}>
                    <button 
                        onClick={() => handleReview(req.Record_ID, 'Approved')}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                            backgroundColor: '#d4edda', color: '#155724', fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        <FaCheck /> Approve
                    </button>
                    <button 
                         onClick={() => handleReview(req.Record_ID, 'Rejected')}
                         style={{
                            flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                            backgroundColor: '#f8d7da', color: '#721c24', fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        <FaTimes /> Decline
                    </button>
                </div>

              </div>
          ))}

        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;