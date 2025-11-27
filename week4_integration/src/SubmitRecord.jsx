import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaTag, FaClipboardList } from 'react-icons/fa';
import './SubmitRecord.css';

const SubmitRecord = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State matches Database Schema
  const [formData, setFormData] = useState({
    activity_id: '',
    role: '',
    date: '',  // Maps to Date_Of_Activity
    hours: ''  // Maps to Hours_Submitted
  });

  // 1. Fetch Activities for the Dropdown
  useEffect(() => {
    fetch('http://localhost:3000/api/activities')
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.error("Error loading activities:", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const user = JSON.parse(localStorage.getItem('currentUser'));

    try {
      const response = await fetch('http://localhost:3000/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nim: user.NIM,
          activity_id: formData.activity_id,
          role: formData.role,
          date: formData.date,
          hours: formData.hours
        })
      });

      if (response.ok) {
        navigate('/records');
      } else {
        alert("Failed to submit. Please check your inputs.");
      }
    } catch (err) {
      console.error(err);
      alert("Server connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="submission-page">
      <div className="submission-card">
        
        <div className="form-header">
          <h2>New Submission</h2>
          <span>Activity Log</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            
            {/* Activity Selection */}
            <div className="input-block">
              <label><FaClipboardList style={{marginRight: '8px'}}/> Activity</label>
              <select 
                name="activity_id" 
                value={formData.activity_id} 
                onChange={handleChange} 
                required
              >
                <option value="">Select an Activity...</option>
                {activities.map(act => (
                  <option key={act.Activity_ID} value={act.Activity_ID}>
                    {act.Activity_Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Input */}
            <div className="input-block">
              <label><FaTag style={{marginRight: '8px'}}/> Role / Position</label>
              <input 
                type="text" 
                name="role" 
                placeholder="e.g. Member, Team Leader"
                value={formData.role} 
                onChange={handleChange} 
                required
              />
            </div>

            {/* Date and Hours Row */}
            <div className="form-row">
              <div className="input-block">
                <label><FaCalendarAlt style={{marginRight: '8px'}}/> Date</label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  required
                />
              </div>

              <div className="input-block">
                <label><FaClock style={{marginRight: '8px'}}/> Hours</label>
                <input 
                  type="number" 
                  name="hours" 
                  placeholder="0"
                  min="1"
                  value={formData.hours} 
                  onChange={handleChange} 
                  required
                />
              </div>
            </div>

          </div>

          <div className="button-group">
            <button type="button" className="btn-ghost" onClick={() => navigate('/records')}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Submit Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitRecord;