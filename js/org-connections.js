// Organization Connections UI
class OrgConnections {
    constructor() {
        this.container = null;
    }

    async init() {
        this.container = document.getElementById('orgConnectionsContainer');
        if (!this.container) return;
        
        await this.loadConnections();
    }

    async loadConnections() {
        try {
            const [startups, myConnections] = await Promise.all([
                apiService.searchStartups(''),
                apiService.getMyConnections()
            ]);

            this.render(startups, myConnections);
        } catch (error) {
            console.error('Error loading connections:', error);
            this.container.innerHTML = '<p style="color: #e74c3c;">Error loading connections</p>';
        }
    }

    render(startups, connections) {
        const connectedStartupIds = new Set(
            connections
                .filter(c => c.status === 'accepted')
                .map(c => c.startup_id)
        );

        const pendingRequests = connections.filter(
            c => c.status === 'pending' && c.invited_by === 'startup'
        );

        const pendingInvites = connections.filter(
            c => c.status === 'pending' && c.invited_by === 'organization'
        );

        const connectedStartups = connections.filter(c => c.status === 'accepted');

        const availableStartups = startups.filter(
            startup => !connectedStartupIds.has(startup.id) && 
                       !pendingInvites.some(i => i.startup_id === startup.id)
        );

        let html = `
            <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
                <!-- Connected Startups -->
                <div style="flex: 1; min-width: 300px;">
                    <h3 style="margin-bottom: 1rem; color: #2c3e50;">Connected Startups (${connectedStartups.length})</h3>
                    ${connectedStartups.length === 0 ? 
                        '<p style="color: #7f8c8d;">No connected startups</p>' :
                        connectedStartups.map(conn => this.renderConnectedStartup(conn)).join('')
                    }
                </div>

                <!-- Pending Join Requests -->
                <div style="flex: 1; min-width: 300px;">
                    <h3 style="margin-bottom: 1rem; color: #2c3e50;">Join Requests (${pendingRequests.length})</h3>
                    ${pendingRequests.length === 0 ?
                        '<p style="color: #7f8c8d;">No pending requests</p>' :
                        pendingRequests.map(req => this.renderJoinRequest(req)).join('')
                    }
                </div>

                <!-- Search & Invite Startups -->
                <div style="flex: 1; min-width: 300px;">
                    <h3 style="margin-bottom: 1rem; color: #2c3e50;">Search & Invite Startups</h3>
                    <input type="text" id="startupSearch" placeholder="Search startups..." 
                           style="width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 2px solid #e9ecef; border-radius: 8px;">
                    <div id="startupSearchResults">
                        ${availableStartups.slice(0, 10).map(startup => this.renderAvailableStartup(startup)).join('')}
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.attachEventListeners();
    }

    renderConnectedStartup(connection) {
        return `
            <div style="padding: 1rem; background: #d4edda; border-radius: 8px; margin-bottom: 0.5rem; border-left: 4px solid #28a745;">
                <strong>${connection.startup_name || 'Startup'}</strong>
                <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9rem;">
                    ${connection.startup_email || ''}
                </p>
            </div>
        `;
    }

    renderJoinRequest(request) {
        return `
            <div style="padding: 1rem; background: #fff3cd; border-radius: 8px; margin-bottom: 0.5rem; border-left: 4px solid #ffc107;">
                <strong>${request.startup_name || 'Startup'}</strong>
                <p style="margin: 0.5rem 0; color: #666; font-size: 0.9rem;">
                    ${request.startup_email || ''} wants to join
                </p>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="orgConnections.handleRequest(${request.id}, 'accepted')" 
                            style="padding: 0.5rem 1rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Approve
                    </button>
                    <button onclick="orgConnections.handleRequest(${request.id}, 'rejected')" 
                            style="padding: 0.5rem 1rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Reject
                    </button>
                </div>
            </div>
        `;
    }

    renderAvailableStartup(startup) {
        return `
            <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${startup.startup_name || startup.full_name}</strong>
                    <p style="margin: 0.25rem 0 0 0; color: #666; font-size: 0.9rem;">
                        ${startup.email}
                    </p>
                </div>
                <button onclick="orgConnections.sendInvite(${startup.id})" 
                        style="padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Invite
                </button>
            </div>
        `;
    }

    attachEventListeners() {
        const searchInput = document.getElementById('startupSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    }

    async handleSearch(query) {
        try {
            const startups = await apiService.searchStartups(query);
            const myConnections = await apiService.getMyConnections();
            
            const connectedStartupIds = new Set(myConnections.map(c => c.startup_id));
            const availableStartups = startups.filter(startup => !connectedStartupIds.has(startup.id));

            const resultsContainer = document.getElementById('startupSearchResults');
            if (resultsContainer) {
                resultsContainer.innerHTML = availableStartups.slice(0, 10).map(startup => this.renderAvailableStartup(startup)).join('');
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    async sendInvite(startupId) {
        try {
            await apiService.sendConnectionRequest(startupId, 'organization');
            alert('Invitation sent!');
            await this.loadConnections();
        } catch (error) {
            console.error('Error sending invite:', error);
            alert('Failed to send invitation');
        }
    }

    async handleRequest(connectionId, action) {
        try {
            await apiService.respondToConnection(connectionId, action);
            alert(`Request ${action}!`);
            await this.loadConnections();
        } catch (error) {
            console.error('Error handling request:', error);
            alert('Failed to process request');
        }
    }
}

// Global instance
const orgConnections = new OrgConnections();
