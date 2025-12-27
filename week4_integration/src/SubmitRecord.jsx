import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaTag, FaClipboardList, FaFileUpload } from 'react-icons/fa';
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
    hours: '',  // Maps to Hours_Submitted
    file: null // NEW: File upload state
  });

  // 1. Fetch Activities for the Dropdown
  useEffect(() => {
    fetch('http://localhost:3000/api/activities')
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.error("Error loading activities:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const user = JSON.parse(localStorage.getItem('currentUser'));

    // Create a FormData object to handle file uploads
    const data = new FormData();
    data.append('nim', user.NIM);
    data.append('activity_id', formData.activity_id);
    data.append('role', formData.role);
    data.append('date', formData.date);
    data.append('hours', formData.hours);
    
    // Only append the file if one was selected
    if (formData.file) {
      data.append('file', formData.file);
    }

    try {
      // NOTE: Do not set Content-Type header manually when sending FormData
      // The browser sets it automatically to multipart/form-data with the correct boundary
      const response = await fetch('http://localhost:3000/api/records', {
        method: 'POST',
        body: data, 
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

            {/* File Upload Input */}
            <div className="input-block">
              <label><FaFileUpload style={{marginRight: '8px'}}/> Proof of Participation (PDF)</label>
              <input 
                type="file" 
                name="file" 
                accept=".pdf"
                onChange={handleChange} 
                // required // Optional: make it required if necessary
                style={{padding: '10px'}}
              />
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
