// Patch for assessment-engine.js to save to API
// Replace the saveAssessment function around line 300

async saveAssessment() {
    const apiService = new APIService();
    
    const assessment = {
        category: this.currentAssessment.categoryId || 'General',
        answers: this.currentAssessment.answers,
        // Backend will calculate scores and IRL level
    };

    try {
        // Save to API
        const response = await apiService.createAssessment(assessment);
        
        // Also save to localStorage for offline access
        const saved = JSON.parse(localStorage.getItem('assessments') || '[]');
        saved.push({
            ...this.currentAssessment,
            id: response.id,
            created_at: response.created_at
        });
        localStorage.setItem('assessments', JSON.stringify(saved));
        
        return response;
    } catch (error) {
        console.error('Failed to save assessment:', error);
        // Fallback to localStorage only
        const saved = JSON.parse(localStorage.getItem('assessments') || '[]');
        saved.push(this.currentAssessment);
        localStorage.setItem('assessments', JSON.stringify(saved));
        
        throw error;
    }
}
