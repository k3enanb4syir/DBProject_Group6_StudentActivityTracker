// This file (app.js) contains all the frontend logic
// for index.html. It makes REAL API calls to the
// backend server (server.js).

// --- 1. CONFIGURATION ---
const API_BASE_URL = 'http://localhost:3001/api';

// --- 2. DOM ELEMENT SELECTORS ---
const studentForm = document.getElementById('student-form');
const studentsTableBody = document.getElementById('students-table-body');
const facultyTableBody = document.getElementById('faculty-table-body');
const activityTableBody = document.getElementById('activity-table-body');

// Form inputs
const editingNimInput = document.getElementById('editing-nim');
const studentNimInput = document.getElementById('student-nim');
const studentNameInput = document.getElementById('student-name');
const studentEmailInput = document.getElementById('student-email');
const studentMajorInput = document.getElementById('student-major');
const studentDpaSelect = document.getElementById('student-dpa');
const clearFormBtn = document.getElementById('clear-form-btn');

// Modal elements
const modal = document.getElementById('message-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalCloseBtn = document.getElementById('modal-close-btn');

// Status elements
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessageDiv = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// --- 3. HELPER FUNCTIONS (Modal) ---
function showMessage(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.querySelector('.modal-content').classList.remove('scale-95');
}

function hideMessage() {
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.querySelector('.modal-content').classList.add('scale-95');
}
modalCloseBtn.addEventListener('click', hideMessage);

function resetStudentForm() {
    studentForm.reset();
    editingNimInput.value = ''; // Clear hidden ID
    studentNimInput.disabled = false;
}
clearFormBtn.addEventListener('click', resetStudentForm);

// --- 4. API CALL FUNCTIONS (READ) ---

// Fetches all students and renders them
async function fetchAndRenderStudents() {
    try {
        loadingSpinner.classList.remove('hidden');
        errorMessageDiv.classList.add('hidden');
        
        const response = await fetch(`${API_BASE_URL}/students`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const students = await response.json();
        
        studentsTableBody.innerHTML = ''; // Clear table
        if (students.length === 0) {
            studentsTableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No students found. Add one!</td></tr>';
            return;
        }

        students.forEach(student => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${student.NIM}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${student.Full_Name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${student.Email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${student.Major}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button data-nim="${student.NIM}" class="edit-btn text-blue-600 hover:text-blue-900">Edit</button>
                    <button data-nim="${student.NIM}" class="delete-btn text-red-600 hover:text-red-900">Delete</button>
                </td>
            `;
            studentsTableBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Failed to fetch students:', error);
        errorText.textContent = `Could not fetch students. Is the server running on port ${API_BASE_URL.split(':')[2]}?`;
        errorMessageDiv.classList.remove('hidden');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

// Fetches faculty to populate the dropdown
async function fetchFaculty() {
    try {
        const response = await fetch(`${API_BASE_URL}/faculty`);
        if (!response.ok) throw new Error('Failed to fetch faculty');
        const faculty = await response.json();
        
        studentDpaSelect.innerHTML = '<option value="">(None)</option>'; // Reset
        facultyTableBody.innerHTML = ''; // Reset
        
        faculty.forEach(f => {
            // Add to dropdown
            const option = document.createElement('option');
            option.value = f.Faculty_ID;
            option.textContent = `${f.Faculty_Name} (ID: ${f.Faculty_ID})`;
            studentDpaSelect.appendChild(option);
            
            // Add to read-only table
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 text-sm font-medium text-gray-900">${f.Faculty_ID}</td>
                <td class="px-6 py-4 text-sm text-gray-700">${f.Faculty_Name}</td>
                <td class="px-6 py-4 text-sm text-gray-700">${f.Email}</td>
            `;
            facultyTableBody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
    }
}

// Fetches activities for the read-only table
async function fetchActivities() {
    try {
        const response = await fetch(`${API_BASE_URL}/activities`);
        if (!response.ok) throw new Error('Failed to fetch activities');
        const activities = await response.json();
        
        activityTableBody.innerHTML = ''; // Reset
        activities.forEach(a => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 text-sm font-medium text-gray-900">${a.Activity_ID}</td>
                <td class="px-6 py-4 text-sm text-gray-700">${a.Activity_Name}</td>
                <td class="px-6 py-4 text-sm text-gray-700">${a.Activity_Type}</td>
            `;
            activityTableBody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
    }
}

// --- 5. API CALL FUNCTIONS (WRITE) ---

// Handles CREATE and UPDATE
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const editingNim = editingNimInput.value;
    
    const studentData = {
        nim: parseInt(studentNimInput.value),
        full_name: studentNameInput.value,
        email: studentEmailInput.value,
        major: studentMajorInput.value,
        dpa_faculty_id: studentDpaSelect.value ? parseInt(studentDpaSelect.value) : null
    };

    let url = `${API_BASE_URL}/students`;
    let method = 'POST';

    if (editingNim) {
        // This is an UPDATE
        url = `${API_BASE_URL}/students/${editingNim}`;
        method = 'PUT';
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'An error occurred.');
        }

        showMessage('Success!', result.message);
        resetStudentForm();
        fetchAndRenderStudents(); // Refresh the table
        
    } catch (error) {
        console.error('Form submit error:', error);
        showMessage('Error!', error.message);
    }
}

// Handles loading data for UPDATE
async function handleEditClick(nim) {
    // We already have the student data in the table, but
    // for a real app, you might fetch the single student
    // to ensure the data is fresh.
    try {
        const response = await fetch(`${API_BASE_URL}/students/${nim}`);
        if (!response.ok) throw new Error('Failed to fetch student details');
        const student = await response.json();
        
        editingNimInput.value = student.NIM;
        studentNimInput.value = student.NIM;
        studentNameInput.value = student.Full_Name;
        studentEmailInput.value = student.Email;
        studentMajorInput.value = student.Major;
        studentDpaSelect.value = student.DPA_Faculty_ID || '';
        
        studentNimInput.disabled = true; // Don't allow changing NIM while editing
        window.scrollTo(0, 0); // Scroll to top
        
    } catch (error) {
        console.error('Edit error:', error);
        showMessage('Error', error.message);
    }
}

// Handles DELETE
async function handleDeleteClick(nim) {
    if (!confirm(`Are you sure you want to delete student ${nim}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/students/${nim}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'An error occurred.');
        }
        
        showMessage('Success!', result.message);
        fetchAndRenderStudents(); // Refresh the table

    } catch (error) {
        console.error('Delete error:', error);
        showMessage('Error!', error.message);
    }
}

// --- 6. EVENT LISTENERS ---

// Run this when the page first loads
document.addEventListener('DOMContentLoaded', () => {
    // Load all data
    fetchAndRenderStudents();
    fetchFaculty();
    fetchActivities();

    // Listen for form submission
    studentForm.addEventListener('submit', handleFormSubmit);

    // Listen for clicks on the table (for Edit/Delete)
    studentsTableBody.addEventListener('click', (e) => {
        const target = e.target;
        const nim = target.dataset.nim;
        
        if (target.classList.contains('edit-btn')) {
            handleEditClick(nim);
        }
        
        if (target.classList.contains('delete-btn')) {
            handleDeleteClick(nim);
        }
    });
});
