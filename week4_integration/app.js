// ============================================================================
// WEEK 4 FRONTEND LOGIC
// Handles Admin Dashboard, Student Portal, and Data Management
// ============================================================================

const API_BASE_URL = 'http://localhost:3001/api';

// DOM Elements
const adminTableBody = document.getElementById('admin-table-body');
const activeStudentSelect = document.getElementById('active-student-select');
const studentHistoryBody = document.getElementById('student-history-body');
const joinActivityForm = document.getElementById('join-activity-form');
const joinActivitySelect = document.getElementById('join-activity-select');
const studentContent = document.getElementById('student-content');

// ============================================================================
// 1. INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Load data for all sections
    fetchAdminRecords();
    fetchStudentsForDropdowns();
    fetchActivitiesForDropdowns();
    fetchFacultyForDropdowns();
    fetchStudentsTable(); // Week 3 functionality

    // Listener: Student Portal "Login"
    activeStudentSelect.addEventListener('change', (e) => {
        const nim = e.target.value;
        if (nim) {
            studentContent.classList.remove('hidden');
            fetchStudentHistory(nim);
        } else {
            studentContent.classList.add('hidden');
        }
    });

    // Listener: Join Activity Form
    joinActivityForm.addEventListener('submit', handleJoinSubmit);
    
    // Listener: Week 3 Student Form
    document.getElementById('student-form').addEventListener('submit', handleStudentSubmit);
});

// ============================================================================
// 2. ADMIN DASHBOARD LOGIC
// ============================================================================

async function fetchAdminRecords() {
    try {
        const response = await fetch(`${API_BASE_URL}/records`);
        const records = await response.json();
        adminTableBody.innerHTML = '';

        if (records.length === 0) {
            adminTableBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-gray-500">No records found.</td></tr>';
            return;
        }

        records.forEach(record => {
            // Color code status
            let statusColor = 'text-yellow-600';
            if (record.Status === 'Approved') statusColor = 'text-green-600 font-bold';
            if (record.Status === 'Rejected') statusColor = 'text-red-600 font-bold';

            // Only show buttons if Pending
            let actions = '';
            if (record.Status === 'Pending') {
                actions = `
                    <button onclick="updateStatus(${record.Record_ID}, 'Approved')" class="text-green-600 hover:text-green-900 mr-2">Approve</button>
                    <button onclick="updateStatus(${record.Record_ID}, 'Rejected')" class="text-red-600 hover:text-red-900">Reject</button>
                `;
            } else {
                actions = `<span class="text-gray-400 text-xs">Completed</span>`;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 text-sm text-gray-500">${record.Submission_Date}</td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">${record.Student_Name}</td>
                <td class="px-6 py-4 text-sm text-gray-700">${record.Activity_Name}</td>
                <td class="px-6 py-4 text-sm text-gray-700">${record.Role}</td>
                <td class="px-6 py-4 text-sm ${statusColor}">${record.Status}</td>
                <td class="px-6 py-4 text-right text-sm font-medium">${actions}</td>
            `;
            adminTableBody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
    }
}

async function updateStatus(recordId, newStatus) {
    // For demo, we assume Faculty ID 1 is the admin approving it
    const approverId = 1; 

    try {
        const response = await fetch(`${API_BASE_URL}/records/${recordId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, approver_id: approverId })
        });
        const result = await response.json();
        
        if (result.success) {
            fetchAdminRecords(); // Refresh Admin Table
            // If a student is selected in portal, refresh their history too
            if (activeStudentSelect.value) fetchStudentHistory(activeStudentSelect.value);
            alert(`Record ${newStatus}!`);
        }
    } catch (error) {
        alert("Error updating status.");
    }
}

// ============================================================================
// 3. STUDENT PORTAL LOGIC
// ============================================================================

async function fetchStudentHistory(nim) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${nim}/records`);
        const history = await response.json();
        studentHistoryBody.innerHTML = '';

        if (history.length === 0) {
            studentHistoryBody.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-gray-500">No activity history yet.</td></tr>';
            return;
        }

        history.forEach(item => {
            let badge = `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">${item.Status}</span>`;
            if (item.Status === 'Approved') badge = `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>`;
            if (item.Status === 'Rejected') badge = `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-4 py-2 text-sm text-gray-900">${item.Activity_Name}</td>
                <td class="px-4 py-2 text-sm text-gray-500">${item.Role}</td>
                <td class="px-4 py-2">${badge}</td>
            `;
            studentHistoryBody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
    }
}

async function handleJoinSubmit(e) {
    e.preventDefault();
    const nim = activeStudentSelect.value;
    if (!nim) return alert("Please select a student first.");

    const data = {
        nim: parseInt(nim),
        activity_id: parseInt(joinActivitySelect.value),
        role: document.getElementById('join-role').value,
        hours: parseInt(document.getElementById('join-hours').value),
        date: document.getElementById('join-date').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/records`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            alert("Submitted for approval!");
            joinActivityForm.reset();
            fetchStudentHistory(nim); // Refresh History Table
            fetchAdminRecords(); // Refresh Admin Table (so we see it there too)
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error(error);
    }
}

// ============================================================================
// 4. HELPER: POPULATE DROPDOWNS
// ============================================================================

async function fetchStudentsForDropdowns() {
    const res = await fetch(`${API_BASE_URL}/students`);
    const students = await res.json();
    
    // 1. Populate "Act as Student" dropdown
    activeStudentSelect.innerHTML = '<option value="">-- Select a Student --</option>';
    students.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.NIM;
        opt.textContent = `${s.Full_Name} (${s.NIM})`;
        activeStudentSelect.appendChild(opt);
    });
}

async function fetchActivitiesForDropdowns() {
    const res = await fetch(`${API_BASE_URL}/activities`);
    const activities = await res.json();
    joinActivitySelect.innerHTML = '';
    activities.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.Activity_ID;
        opt.textContent = a.Activity_Name;
        joinActivitySelect.appendChild(opt);
    });
}

async function fetchFacultyForDropdowns() {
    const res = await fetch(`${API_BASE_URL}/faculty`);
    const faculty = await res.json();
    const select = document.getElementById('student-dpa');
    select.innerHTML = '<option value="">No Advisor</option>';
    faculty.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.Faculty_ID;
        opt.textContent = f.Faculty_Name;
        select.appendChild(opt);
    });
}

// ============================================================================
// 5. WEEK 3 LOGIC (Manage Students)
// ============================================================================
// Kept simple here to ensure backward compatibility

async function fetchStudentsTable() {
    const res = await fetch(`${API_BASE_URL}/students`);
    const students = await res.json();
    const tbody = document.getElementById('students-table-body');
    tbody.innerHTML = '';
    students.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-3 text-sm text-gray-900">${s.NIM}</td>
            <td class="px-6 py-3 text-sm text-gray-500">${s.Full_Name}</td>
            <td class="px-6 py-3 text-right text-sm"><button onclick="deleteStudent(${s.NIM})" class="text-red-600">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });
}

async function handleStudentSubmit(e) {
    e.preventDefault();
    const data = {
        nim: document.getElementById('student-nim').value,
        full_name: document.getElementById('student-name').value,
        email: document.getElementById('student-email').value,
        major: document.getElementById('student-major').value,
        dpa_faculty_id: document.getElementById('student-dpa').value
    };
    await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    fetchStudentsTable(); // Refresh list
    fetchStudentsForDropdowns(); // Refresh login dropdown
    alert("Student Added");
}

async function deleteStudent(nim) {
    if(confirm("Delete student?")) {
        await fetch(`${API_BASE_URL}/students/${nim}`, { method: 'DELETE' });
        fetchStudentsTable();
    }
}

function closeModal() {
    document.getElementById('message-modal').classList.add('hidden');
}
