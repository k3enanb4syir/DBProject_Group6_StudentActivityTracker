// ============================================================================
// WEEK 4 FRONTEND LOGIC (Professional Edition)
// ============================================================================

const API_BASE_URL = 'http://localhost:3001/api';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial Data Load
    fetchAdminRecords();
    fetchStudentsForDropdowns();
    fetchActivitiesForDropdowns();
    fetchFacultyForDropdowns();
    fetchStudentsTable();

    // Event Listeners
    document.getElementById('active-student-select').addEventListener('change', handleStudentLogin);
    document.getElementById('join-activity-form').addEventListener('submit', handleJoinSubmit);
    document.getElementById('student-form').addEventListener('submit', handleStudentSubmit);
    
    // Init Icons
    lucide.createIcons();
});

// --- UI NAVIGATION ---
function switchTab(tabName) {
    // 1. Hide all views
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    
    // 2. Reset Nav Styles
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-primary-50', 'text-primary-700');
        el.classList.add('text-gray-600');
    });

    // 3. Show selected view & Highlight Nav
    document.getElementById(`view-${tabName}`).classList.remove('hidden');
    
    const activeNav = document.getElementById(`nav-${tabName}`);
    activeNav.classList.remove('text-gray-600');
    activeNav.classList.add('bg-primary-50', 'text-primary-700');

    // 4. Update Header Title
    const titles = {
        'admin': 'Admin Dashboard',
        'student': 'Student Portal',
        'manage': 'Manage Database'
    };
    document.getElementById('page-title').textContent = titles[tabName];
}

// --- ADMIN DASHBOARD ---
async function fetchAdminRecords() {
    toggleLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/records`);
        const records = await response.json();
        
        const tbody = document.getElementById('admin-table-body');
        tbody.innerHTML = '';
        
        // Update Stats
        let pendingCount = 0;
        let approvedCount = 0;

        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500 text-sm">No records found.</td></tr>';
        } else {
            records.forEach(record => {
                if(record.Status === 'Pending') pendingCount++;
                if(record.Status === 'Approved') approvedCount++;

                const tr = document.createElement('tr');
                tr.className = "hover:bg-gray-50 transition-colors";
                
                // Status Badge Logic
                let badgeClass = 'status-pending';
                if(record.Status === 'Approved') badgeClass = 'status-approved';
                if(record.Status === 'Rejected') badgeClass = 'status-rejected';

                // Action Buttons Logic
                let actions = `<span class="text-gray-400 text-xs italic">No actions</span>`;
                if (record.Status === 'Pending') {
                    actions = `
                        <button onclick="updateStatus(${record.Record_ID}, 'Approved')" class="btn-action-approve">Approve</button>
                        <button onclick="updateStatus(${record.Record_ID}, 'Rejected')" class="btn-action-reject">Reject</button>
                    `;
                }

                tr.innerHTML = `
                    <td class="px-6 py-4 font-mono text-xs text-gray-500">${record.Submission_Date}</td>
                    <td class="px-6 py-4 font-medium text-gray-900">${record.Student_Name}</td>
                    <td class="px-6 py-4">
                        <div class="text-gray-900 font-medium">${record.Activity_Name}</div>
                        <div class="text-xs text-gray-500">${record.Role}</div>
                    </td>
                    <td class="px-6 py-4"><span class="status-badge ${badgeClass}">${record.Status}</span></td>
                    <td class="px-6 py-4 text-right">${actions}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Update Dashboard Cards
        document.getElementById('stat-pending').textContent = pendingCount;
        document.getElementById('stat-approved').textContent = approvedCount;

    } catch (error) {
        showToast('Error loading records', 'error');
    } finally {
        toggleLoading(false);
    }
}

async function updateStatus(id, status) {
    try {
        const res = await fetch(`${API_BASE_URL}/records/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status, approver_id: 1 })
        });
        const result = await res.json();
        if(result.success) {
            showToast(`Record ${status}`, status === 'Approved' ? 'success' : 'error');
            fetchAdminRecords();
            // Refresh student view if open
            const activeStudent = document.getElementById('active-student-select').value;
            if(activeStudent) fetchStudentHistory(activeStudent);
        }
    } catch (e) { showToast('Network Error', 'error'); }
}

// --- STUDENT PORTAL ---
async function handleStudentLogin(e) {
    const nim = e.target.value;
    const content = document.getElementById('student-content');
    
    if (nim) {
        content.classList.remove('hidden');
        fetchStudentHistory(nim);
    } else {
        content.classList.add('hidden');
    }
}

async function fetchStudentHistory(nim) {
    const list = document.getElementById('student-history-body');
    const res = await fetch(`${API_BASE_URL}/students/${nim}/records`);
    const history = await res.json();
    
    list.innerHTML = '';
    if (history.length === 0) {
        list.innerHTML = '<li class="text-center text-gray-500 text-sm py-4">No activity history yet.</li>';
        return;
    }

    history.forEach(item => {
        let badgeColor = 'bg-gray-100 text-gray-800';
        let icon = 'clock';
        if(item.Status === 'Approved') { badgeColor = 'bg-green-50 text-green-700'; icon = 'check-circle'; }
        if(item.Status === 'Rejected') { badgeColor = 'bg-red-50 text-red-700'; icon = 'x-circle'; }

        const li = document.createElement('li');
        li.className = "flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100";
        li.innerHTML = `
            <div class="flex items-center">
                <div class="p-2 rounded-full ${badgeColor} mr-3">
                    <i data-lucide="${icon}" class="w-4 h-4"></i>
                </div>
                <div>
                    <h4 class="text-sm font-medium text-gray-900">${item.Activity_Name}</h4>
                    <p class="text-xs text-gray-500">${item.Role} • ${item.Hours_Submitted} Hrs</p>
                </div>
            </div>
            <span class="text-xs font-semibold ${item.Status === 'Pending' ? 'text-yellow-600' : (item.Status === 'Approved' ? 'text-green-600' : 'text-red-600')}">${item.Status}</span>
        `;
        list.appendChild(li);
    });
    lucide.createIcons();
}

async function handleJoinSubmit(e) {
    e.preventDefault();
    const nim = document.getElementById('active-student-select').value;
    
    const data = {
        nim: parseInt(nim),
        activity_id: parseInt(document.getElementById('join-activity-select').value),
        role: document.getElementById('join-role').value,
        hours: parseInt(document.getElementById('join-hours').value),
        date: document.getElementById('join-date').value
    };

    const res = await fetch(`${API_BASE_URL}/records`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    
    if(res.ok) {
        showToast('Application Submitted!');
        document.getElementById('join-activity-form').reset();
        fetchStudentHistory(nim);
        fetchAdminRecords();
    }
}

// --- UTILITIES ---
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toast-message');
    const icon = document.getElementById('toast-icon');

    msg.textContent = message;
    
    // Reset styles
    toast.classList.remove('translate-y-20', 'opacity-0');
    
    if(type === 'error') {
        icon.setAttribute('data-lucide', 'alert-circle');
        icon.classList.remove('text-green-400');
        icon.classList.add('text-red-400');
    } else {
        icon.setAttribute('data-lucide', 'check-circle');
        icon.classList.add('text-green-400');
        icon.classList.remove('text-red-400');
    }
    lucide.createIcons();

    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

function toggleLoading(show) {
    const el = document.getElementById('loading-indicator');
    if(show) el.classList.remove('hidden');
    else el.classList.add('hidden');
}

// --- DROPDOWN HELPERS (Same logic as before, less repetition) ---
async function fetchStudentsForDropdowns() {
    const res = await fetch(`${API_BASE_URL}/students`);
    const data = await res.json();
    const select = document.getElementById('active-student-select');
    // keep first option
    select.innerHTML = select.firstElementChild.outerHTML;
    data.forEach(s => select.innerHTML += `<option value="${s.NIM}">${s.Full_Name}</option>`);
}

async function fetchActivitiesForDropdowns() {
    const res = await fetch(`${API_BASE_URL}/activities`);
    const data = await res.json();
    const select = document.getElementById('join-activity-select');
    select.innerHTML = '';
    data.forEach(a => select.innerHTML += `<option value="${a.Activity_ID}">${a.Activity_Name}</option>`);
}

async function fetchFacultyForDropdowns() {
    const res = await fetch(`${API_BASE_URL}/faculty`);
    const data = await res.json();
    const select = document.getElementById('student-dpa');
    select.innerHTML = '<option value="">No Advisor</option>';
    data.forEach(f => select.innerHTML += `<option value="${f.Faculty_ID}">${f.Faculty_Name}</option>`);
}

async function fetchStudentsTable() {
    const res = await fetch(`${API_BASE_URL}/students`);
    const data = await res.json();
    const tbody = document.getElementById('students-table-body');
    tbody.innerHTML = '';
    data.forEach(s => {
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">${s.NIM}</td>
                <td class="px-6 py-4 font-medium text-gray-900">${s.Full_Name}</td>
                <td class="px-6 py-4 text-gray-500">${s.Email}</td>
                <td class="px-6 py-4 text-right">
                    <button onclick="deleteStudent(${s.NIM})" class="text-red-600 hover:text-red-800 text-xs font-semibold uppercase">Delete</button>
                </td>
            </tr>
        `;
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
    showToast('Student Added');
    document.getElementById('student-form').reset();
    fetchStudentsTable();
}

async function deleteStudent(nim) {
    if(confirm('Delete this student?')) {
        await fetch(`${API_BASE_URL}/students/${nim}`, { method: 'DELETE' });
        showToast('Student Deleted', 'error');
        fetchStudentsTable();
    }
}
