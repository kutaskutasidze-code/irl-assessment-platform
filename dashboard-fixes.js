// Dashboard Fixes for Assessment Results and Action Plans
// This file contains fixes to sync localStorage with mockDB

// Override loadStartupData to load from localStorage
function loadStartupData() {
    // Load from localStorage (where assessment engine saves)
    const savedAssessments = JSON.parse(localStorage.getItem('assessments') || '[]');
    const savedActionPlans = JSON.parse(localStorage.getItem('actionPlans') || '[]');
    
    // Sync with mockDB
    savedAssessments.forEach(assessment => {
        if (!mockDB.assessments.find(a => 
            (a.categoryId === assessment.categoryId && 
             a.completedAt === assessment.completedAt) ||
            a.id === assessment.id
        )) {
            mockDB.assessments.push(assessment);
        }
    });
    
    savedActionPlans.forEach(plan => {
        if (!mockDB.actionPlans.find(p => p.id === plan.id)) {
            mockDB.actionPlans.push(plan);
        }
    });
    
    // Filter for current user
    const userAssessments = savedAssessments.filter(a => {
        return a.userId === currentUser.id || 
               a.userEmail === currentUser.email ||
               (!a.userId && !a.userEmail);
    });
    
    const userActionPlans = savedActionPlans.filter(a => 
        a.startupId === currentUser.id
    );
    
    if (userAssessments.length > 0) {
        const latest = userAssessments[userAssessments.length - 1];
        document.getElementById('irlLevel').textContent = latest.irlLevel || latest.level || '-';
        document.getElementById('assessmentStatus').textContent = 'Completed';
        const dateValue = latest.completedAt || latest.date;
        document.getElementById('lastUpdated').textContent = dateValue ? new Date(dateValue).toLocaleDateString() : '-';
        
        // Show results
        document.getElementById('resultsSection').classList.remove('hidden');
        displayResults(latest);
    }
    
    document.getElementById('actionPlanCount').textContent = userActionPlans.length;
    
    if (userActionPlans.length > 0) {
        document.getElementById('actionPlansSection').classList.remove('hidden');
        displayActionPlans(userActionPlans);
    }
}

// Override loadOrganizationData to load from localStorage
function loadOrganizationData() {
    // Load from localStorage
    const savedAssessments = JSON.parse(localStorage.getItem('assessments') || '[]');
    const savedActionPlans = JSON.parse(localStorage.getItem('actionPlans') || '[]');
    
    // Sync with mockDB
    savedAssessments.forEach(assessment => {
        if (!mockDB.assessments.find(a => 
            (a.categoryId === assessment.categoryId && 
             a.completedAt === assessment.completedAt) ||
            a.id === assessment.id
        )) {
            mockDB.assessments.push(assessment);
        }
    });
    
    savedActionPlans.forEach(plan => {
        if (!mockDB.actionPlans.find(p => p.id === plan.id)) {
            mockDB.actionPlans.push(plan);
        }
    });
    
    const startups = mockDB.users.filter(u => u.type === 'startup' && u.organizationId === currentUser.id);
    const assessments = mockDB.assessments.filter(a => 
        a.organizationId === currentUser.id || startups.some(s => s.id === a.userId || s.id === a.startupId)
    );
    
    document.getElementById('totalStartups').textContent = startups.length;
    document.getElementById('completedAssessments').textContent = assessments.length;
    document.getElementById('actionPlansCreated').textContent = mockDB.actionPlans.filter(p => 
        p.organizationId === currentUser.id
    ).length;
    
    // Calculate average IRL
    if (assessments.length > 0) {
        const avgIRL = assessments.reduce((sum, a) => sum + (a.irlLevel || a.level || 0), 0) / assessments.length;
        document.getElementById('avgIRL').textContent = avgIRL.toFixed(1);
    }
    
    // Populate startups table
    const tableBody = document.getElementById('startupsTable');
    tableBody.innerHTML = '';
    
    startups.forEach(startup => {
        const assessment = assessments.find(a => a.userId === startup.id || a.startupId === startup.id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${startup.startupName}</td>
            <td>${startup.email}</td>
            <td>${assessment ? (assessment.irlLevel || assessment.level) : '-'}</td>
            <td>
                <span class="badge ${assessment ? 'badge-success' : 'badge-warning'}">
                    ${assessment ? 'Completed' : 'Pending'}
                </span>
            </td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="viewStartup(${startup.id})">View</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Override handleCreateActionPlan to save to localStorage
function handleCreateActionPlan(event, startupId) {
    event.preventDefault();
    
    const title = document.getElementById('planTitle').value;
    const description = document.getElementById('planDescription').value;
    const checklistInputs = document.querySelectorAll('.checklist-input');
    
    const checklist = Array.from(checklistInputs)
        .map(input => input.value.trim())
        .filter(text => text.length > 0)
        .map(text => ({ text, completed: false }));
    
    if (checklist.length === 0) {
        alert('Please add at least one checklist item');
        return;
    }
    
    const actionPlan = {
        id: Date.now(), // Use timestamp for unique ID
        startupId: startupId,
        organizationId: currentUser.id,
        title: title,
        description: description,
        checklist: checklist,
        date: new Date().toISOString()
    };
    
    // Save to mockDB
    mockDB.actionPlans.push(actionPlan);
    
    // Save to localStorage
    const savedActionPlans = JSON.parse(localStorage.getItem('actionPlans') || '[]');
    savedActionPlans.push(actionPlan);
    localStorage.setItem('actionPlans', JSON.stringify(savedActionPlans));
    
    document.querySelector('.modal').remove();
    viewStartup(startupId);
}

// Override toggleChecklistItem to save to localStorage
function toggleChecklistItem(planId, itemIndex) {
    // Update in mockDB
    const plan = mockDB.actionPlans.find(p => p.id === planId);
    if (!plan) return;
    
    plan.checklist[itemIndex].completed = !plan.checklist[itemIndex].completed;
    
    // Update in localStorage
    const savedActionPlans = JSON.parse(localStorage.getItem('actionPlans') || '[]');
    const savedPlan = savedActionPlans.find(p => p.id === planId);
    if (savedPlan) {
        savedPlan.checklist[itemIndex].completed = plan.checklist[itemIndex].completed;
        localStorage.setItem('actionPlans', JSON.stringify(savedActionPlans));
    }
    
    const userActionPlans = mockDB.actionPlans.filter(a => a.startupId === currentUser.id);
    displayActionPlans(userActionPlans);
    
    if (plan.checklist[itemIndex].completed) {
        showToast('✓ Task marked as complete!');
    } else {
        showToast('Task unmarked');
    }
}

console.log('✅ Dashboard fixes loaded - localStorage sync enabled');