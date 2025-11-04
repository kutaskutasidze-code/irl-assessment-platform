// Load assessment results from API
async function loadAssessmentFromAPI() {
    const apiService = new APIService();
    
    try {
        // Get all assessments
        const assessments = await apiService.getAssessments();
        
        if (assessments && assessments.length > 0) {
            // Get latest assessment
            const latest = assessments[0];
            
            // Parse JSON fields
            const result = {
                irlLevel: latest.irl_level,
                scores: typeof latest.scores === 'string' ? JSON.parse(latest.scores) : latest.scores,
                answers: typeof latest.answers === 'string' ? JSON.parse(latest.answers) : latest.answers,
                recommendations: typeof latest.recommendations === 'string' ? JSON.parse(latest.recommendations) : latest.recommendations,
                completedAt: latest.created_at,
                categoryId: latest.category
            };
            
            return result;
        }
        
        // Fallback to localStorage
        const saved = JSON.parse(localStorage.getItem('assessments') || '[]');
        return saved.length > 0 ? saved[saved.length - 1] : null;
        
    } catch (error) {
        console.error('Failed to load from API, using localStorage:', error);
        const saved = JSON.parse(localStorage.getItem('assessments') || '[]');
        return saved.length > 0 ? saved[saved.length - 1] : null;
    }
}

// Replace the existing load function
window.loadAssessmentFromAPI = loadAssessmentFromAPI;
