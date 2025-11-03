// New enhanced displayResults function
function displayResults() {
    const summary = assessmentEngine.getAssessmentSummary();
    const container = document.getElementById('resultsContent');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userName = currentUser.name || 'Participant';
    const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Store current level for sharing
    resultsEnhancer.currentLevel = summary.irlLevel;

    container.innerHTML = `
        <div class="results-header">
            <div class="confetti">🎉</div>
            <h1>Assessment Complete!</h1>
            <p>Here are your Investment Readiness Level results</p>
        </div>

        ${resultsEnhancer.renderIRLBadge(
            summary.irlLevel, 
            summary.irlInfo.title, 
            summary.irlInfo.description
        )}

        <div class="chart-section">
            <h2>Your Pentagon Assessment</h2>
            <p>This radar chart visualizes your strengths across the five key dimensions of startup readiness.</p>
            <div class="chart-container">
                <canvas id="pentagonChart"></canvas>
            </div>
        </div>

        <div class="dimension-scores">
            <h2>Dimension Breakdown</h2>
            ${resultsEnhancer.renderDimensionCards(summary.scores)}
        </div>

        ${resultsEnhancer.renderCertificate(
            userName,
            summary.irlLevel,
            summary.irlInfo.title,
            summary.totalScore,
            currentDate
        )}

        <div class="actions">
            <a href="../../index.html" class="btn btn-primary">Back to Dashboard</a>
            <a href="category-selection.html" class="btn btn-secondary">Take Another Assessment</a>
        </div>
    `;

    // Create pentagon chart with animation
    setTimeout(() => {
        chartInstance = assessmentEngine.createPentagonChart('pentagonChart');
    }, 100);

    // Animate dimension bars
    resultsEnhancer.animateDimensionBars();
}
