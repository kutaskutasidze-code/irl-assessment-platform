// This file contains the new features to be added to index.html

// Replace the displayActionPlans function with this enhanced version
function displayActionPlans(plans) {
    const content = document.getElementById('actionPlansContent');
    
    if (plans.length === 0) {
        content.innerHTML = '<p style="color: #666;">No action plans assigned yet.</p>';
        return;
    }
    
    content.innerHTML = plans.map(plan => `
        <div style="padding: 1.5rem; background: #f8f9fa; border-radius: 12px; margin-bottom: 1rem;">
            <h3 style="margin-bottom: 0.5rem;">${plan.title}</h3>
            <p style="color: #666; margin-bottom: 1rem;">${plan.description}</p>
            <div style="margin-bottom: 1rem;">
                <strong>Progress: ${getCompletionPercentage(plan)}%</strong>
                <div style="background: #e9ecef; height: 8px; border-radius: 4px; margin-top: 0.5rem; overflow: hidden;">
                    <div style="background: #1a1a1a; height: 100%; width: ${getCompletionPercentage(plan)}%; transition: width 0.3s ease;"></div>
                </div>
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Checklist:</strong>
                <div style="margin-top: 0.5rem;">
                    ${plan.checklist.map((item, idx) => `
                        <div style="padding: 0.75rem; background: white; border-radius: 6px; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.75rem;">
                            <input 
                                type="checkbox" 
                                id="check-${plan.id}-${idx}"
                                ${item.completed ? 'checked' : ''} 
                                onchange="toggleChecklistItem(${plan.id}, ${idx})"
                                style="width: 20px; height: 20px; cursor: pointer;">
                            <label 
                                for="check-${plan.id}-${idx}"
                                style="flex: 1; cursor: pointer; ${item.completed ? 'text-decoration: line-through; color: #999;' : ''}"
                            >${item.text}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
            <small style="color: #999;">Created: ${new Date(plan.date).toLocaleDateString()}</small>
        </div>
    `).join('');
}

// Add these new helper functions
function getCompletionPercentage(plan) {
    if (!plan.checklist || plan.checklist.length === 0) return 0;
    const completed = plan.checklist.filter(item => item.completed).length;
    return Math.round((completed / plan.checklist.length) * 100);
}

function toggleChecklistItem(planId, itemIndex) {
    const plan = mockDB.actionPlans.find(p => p.id === planId);
    if (!plan) return;
    
    plan.checklist[itemIndex].completed = !plan.checklist[itemIndex].completed;
    
    const userActionPlans = mockDB.actionPlans.filter(a => a.startupId === currentUser.id);
    displayActionPlans(userActionPlans);
    
    if (plan.checklist[itemIndex].completed) {
        showToast('✓ Task marked as complete!');
    } else {
        showToast('Task unmarked');
    }
}

function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: #1a1a1a;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Replace the viewStartup function with this full implementation
function viewStartup(startupId) {
    const startup = mockDB.users.find(u => u.id === startupId);
    const assessment = mockDB.assessments.find(a => a.userId === startupId);
    
    if (!startup) {
        alert('Startup not found');
        return;
    }
    
    hideAllDashboards();
    
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div id="startupDetailView">
            <button class="btn btn-secondary" onclick="location.reload()">← Back to Dashboard</button>
            
            <h1 class="section-title" style="margin-top: 2rem;">${startup.startupName || startup.name}</h1>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">IRL Level</div>
                    <div class="stat-value">${assessment ? assessment.level : '-'}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Contact</div>
                    <div class="stat-value" style="font-size: 1rem;">${startup.email}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Assessment Status</div>
                    <div class="stat-value" style="font-size: 1rem;">${assessment ? 'Completed' : 'Not Started'}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Action Plans</div>
                    <div class="stat-value">${mockDB.actionPlans.filter(a => a.startupId === startupId).length}</div>
                </div>
            </div>
            
            ${assessment ? `
                <div class="card">
                    <h2 class="card-title">Assessment Results & Answers</h2>
                    <div style="margin-bottom: 2rem;">
                        <div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 12px;">
                            <div style="font-size: 3rem; font-weight: 700; color: #1a1a1a;">IRL ${assessment.level}</div>
                            <h3 style="margin-top: 1rem;">${getIRLTitle(assessment.level)}</h3>
                        </div>
                    </div>
                    
                    <h3 style="margin-bottom: 1rem;">Assessment Answers</h3>
                    <div id="assessmentAnswers">
                        ${assessmentData.questions.map((q, index) => `
                            <div style="padding: 1.5rem; background: #f8f9fa; border-radius: 8px; margin-bottom: 1rem;">
                                <div style="font-weight: 600; margin-bottom: 0.5rem;">Q${index + 1}: ${q.text}</div>
                                <div style="color: #666; margin-bottom: 0.5rem; font-size: 0.875rem;">Dimension: ${q.dimension}</div>
                                <div style="padding: 0.75rem; background: white; border-radius: 6px; border-left: 4px solid #1a1a1a;">
                                    <strong>Answer:</strong> ${q.options[assessment.answers[index]]}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : '<div class="card"><p>No assessment completed yet.</p></div>'}
            
            <div class="card">
                <h2 class="card-title">Action Plans</h2>
                <button class="btn btn-primary" onclick="showCreateActionPlan(${startupId})">Create New Action Plan</button>
                <div id="actionPlansList" style="margin-top: 2rem;">
                    ${renderActionPlansForOrg(startupId)}
                </div>
            </div>
        </div>
    `;
}

function renderActionPlansForOrg(startupId) {
    const plans = mockDB.actionPlans.filter(a => a.startupId === startupId);
    
    if (plans.length === 0) {
        return '<p style="color: #666;">No action plans created yet.</p>';
    }
    
    return plans.map(plan => `
        <div style="padding: 1.5rem; background: #f8f9fa; border-radius: 12px; margin-bottom: 1rem;">
            <h3 style="margin-bottom: 0.5rem;">${plan.title}</h3>
            <p style="color: #666; margin-bottom: 1rem;">${plan.description}</p>
            <div style="margin-bottom: 1rem;">
                <strong>Checklist Items:</strong>
                <div style="margin-top: 0.5rem;">
                    ${plan.checklist.map((item, idx) => `
                        <div style="padding: 0.75rem; background: white; border-radius: 6px; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.75rem;">
                            <input type="checkbox" ${item.completed ? 'checked' : ''} disabled style="width: 18px; height: 18px;">
                            <span style="${item.completed ? 'text-decoration: line-through; color: #999;' : ''}">${item.text}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <small style="color: #999;">Created: ${new Date(plan.date).toLocaleDateString()}</small>
        </div>
    `).join('');
}

function showCreateActionPlan(startupId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <h2>Create Action Plan</h2>
            <p style="color: #666; margin-bottom: 2rem;">Define actionable steps for the startup</p>
            
            <form id="actionPlanForm" onsubmit="handleCreateActionPlan(event, ${startupId})">
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Plan Title</label>
                    <input type="text" id="planTitle" placeholder="e.g., Q1 Growth Strategy" required style="width: 100%; padding: 0.875rem; background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem;">
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Description</label>
                    <textarea id="planDescription" rows="3" placeholder="Describe the objectives..." required style="width: 100%; padding: 0.875rem; background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; font-family: inherit; font-size: 1rem;"></textarea>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Checklist Items</label>
                    <div id="checklistItems">
                        <input type="text" class="checklist-input" placeholder="First action item..." style="width: 100%; padding: 0.875rem; background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; margin-bottom: 0.5rem;">
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="addChecklistItem()">+ Add Item</button>
                </div>
                
                <div style="display: flex; gap: 1rem;">
                    <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn btn-primary" style="flex: 1;">Create Action Plan</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

function addChecklistItem() {
    const container = document.getElementById('checklistItems');
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'checklist-input';
    input.placeholder = 'Next action item...';
    input.style.cssText = 'width: 100%; padding: 0.875rem; background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; margin-bottom: 0.5rem;';
    container.appendChild(input);
}

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
        id: mockDB.actionPlans.length + 1,
        startupId: startupId,
        organizationId: currentUser.id,
        title: title,
        description: description,
        checklist: checklist,
        date: new Date().toISOString()
    };
    
    mockDB.actionPlans.push(actionPlan);
    
    document.querySelector('.modal').remove();
    viewStartup(startupId);
}

// Add CSS animations
const styleElement = document.createElement('style');
styleElement.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        align-items: center;
        justify-content: center;
    }
    
    .modal-content {
        background: white;
        border-radius: 16px;
        padding: 2.5rem;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
`;
document.head.appendChild(styleElement);
