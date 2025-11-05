// Startup Connections UI
class StartupConnections {
    constructor() {
        this.container = null;
    }

    async init() {
        this.container = document.getElementById('startupConnectionsContainer');
        if (!this.container) return;
        
        await this.loadConnections();
    }

    async loadConnections() {
        try {
            const [organizations, myConnections] = await Promise.all([
                apiService.searchOrganizations(''),
                apiService.getMyConnections()
            ]);

            this.render(organizations, myConnections);
        } catch (error) {
            console.error('Error loading connections:', error);
            this.container.innerHTML = '<p style="color: #e74c3c;">Error loading connections</p>';
        }
    }

    render(organizations, connections) {
        const connectedOrgIds = new Set(
            connections
                .filter(c => c.status === 'accepted')
                .map(c => c.organization_id)
        );

        const pendingInvites = connections.filter(
            c => c.status === 'pending' && c.invited_by === 'organization'
        );

        const pendingRequests = connections.filter(
            c => c.status === 'pending' && c.invited_by === 'startup'
        );

        const availableOrgs = organizations.filter(
            org => !connectedOrgIds.has(org.id) && 
                   !pendingRequests.some(r => r.organization_id === org.id)
        );

        let html = `
            <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
                <!-- Pending Invitations -->
                <div style="flex: 1; min-width: 300px;">
                    <h3 style="margin-bottom: 1rem; color: #2c3e50;">Pending Invitations (${pendingInvites.length})</h3>
                    ${pendingInvites.length === 0 ? 
                        '<p style="color: #7f8c8d;">No pending invitations</p>' :
                        pendingInvites.map(invite => this.renderInvitation(invite)).join('')
                    }
                </div>

                <!-- My Requests -->
                <div style="flex: 1; min-width: 300px;">
                    <h3 style="margin-bottom: 1rem; color: #2c3e50;">My Join Requests (${pendingRequests.length})</h3>
                    ${pendingRequests.length === 0 ?
                        '<p style="color: #7f8c8d;">No pending requests</p>' :
                        pendingRequests.map(req => this.renderMyRequest(req)).join('')
                    }
                </div>

                <!-- Available Organizations -->
                <div style="flex: 1; min-width: 300px;">
                    <h3 style="margin-bottom: 1rem; color: #2c3e50;">Available Organizations</h3>
                    <input type="text" id="orgSearch" placeholder="Search organizations..." 
                           style="width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 2px solid #e9ecef; border-radius: 8px;">
                    <div id="orgSearchResults">
                        ${availableOrgs.map(org => this.renderAvailableOrg(org)).join('')}
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.attachEventListeners();
    }

    renderInvitation(invite) {
        return `
            <div style="padding: 1rem; background: #fff3cd; border-radius: 8px; margin-bottom: 0.5rem; border-left: 4px solid #ffc107;">
                <strong>${invite.organization_name || 'Organization'}</strong>
                <p style="margin: 0.5rem 0; color: #666; font-size: 0.9rem;">
                    Invited you to join
                </p>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="startupConnections.handleInvitation(${invite.id}, 'accepted')" 
                            style="padding: 0.5rem 1rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Accept
                    </button>
                    <button onclick="startupConnections.handleInvitation(${invite.id}, 'rejected')" 
                            style="padding: 0.5rem 1rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Decline
                    </button>
                </div>
            </div>
        `;
    }

    renderMyRequest(request) {
        return `
            <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px; margin-bottom: 0.5rem;">
                <strong>${request.organization_name || 'Organization'}</strong>
                <p style="margin: 0.5rem 0; color: #666; font-size: 0.9rem;">
                    Waiting for approval
                </p>
            </div>
        `;
    }

    renderAvailableOrg(org) {
        return `
            <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${org.organization_name}</strong>
                    <p style="margin: 0.25rem 0 0 0; color: #666; font-size: 0.9rem;">
                        ${org.email}
                    </p>
                </div>
                <button onclick="startupConnections.sendJoinRequest(${org.id})" 
                        style="padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Request to Join
                </button>
            </div>
        `;
    }

    attachEventListeners() {
        const searchInput = document.getElementById('orgSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    }

    async handleSearch(query) {
        try {
            const organizations = await apiService.searchOrganizations(query);
            const myConnections = await apiService.getMyConnections();
            
            const connectedOrgIds = new Set(myConnections.map(c => c.organization_id));
            const availableOrgs = organizations.filter(org => !connectedOrgIds.has(org.id));

            const resultsContainer = document.getElementById('orgSearchResults');
            if (resultsContainer) {
                resultsContainer.innerHTML = availableOrgs.map(org => this.renderAvailableOrg(org)).join('');
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    async sendJoinRequest(orgId) {
        try {
            await apiService.sendConnectionRequest(orgId, 'startup');
            alert('Join request sent!');
            await this.loadConnections();
        } catch (error) {
            console.error('Error sending request:', error);
            alert('Failed to send request');
        }
    }

    async handleInvitation(connectionId, action) {
        try {
            await apiService.respondToConnection(connectionId, action);
            alert(`Invitation ${action}!`);
            await this.loadConnections();
        } catch (error) {
            console.error('Error handling invitation:', error);
            alert('Failed to process invitation');
        }
    }
}

// Global instance
const startupConnections = new StartupConnections();
