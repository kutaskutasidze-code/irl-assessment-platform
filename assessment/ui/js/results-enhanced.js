// Phase 2: Enhanced Results JavaScript

class ResultsEnhancer {
    constructor() {
        this.irlLevels = {
            1: { title: "Idea Stage", description: "Initial concept identified" },
            2: { title: "Concept Stage", description: "Basic concept defined" },
            3: { title: "Development Stage", description: "Developing and testing solution" },
            4: { title: "Validation Stage", description: "Technical feasibility demonstrated" },
            5: { title: "Proof Stage", description: "Validated with early adopters" },
            6: { title: "Market Stage", description: "Market demand confirmed" },
            7: { title: "Demonstration Stage", description: "Complete and ready for launch" },
            8: { title: "Qualified Stage", description: "Initial customers using successfully" },
            9: { title: "Proven Stage", description: "Proven market success" }
        };
    }

    renderDimensionCards(scores) {
        const dimensions = [
            { key: 'business', name: 'Business Model & Strategy', icon: '💼' },
            { key: 'technology', name: 'Technology & Product', icon: '💻' },
            { key: 'customer', name: 'Customer & Market', icon: '👥' },
            { key: 'operations', name: 'Operations & Execution', icon: '⚙️' },
            { key: 'financial', name: 'Financial & Funding', icon: '💰' }
        ];

        return `
            <div class="dimension-cards">
                ${dimensions.map(dim => {
                    const score = scores[dim.key];
                    const level = this.getScoreLevel(score);
                    const insights = this.getDimensionInsights(dim.key, score);
                    
                    return `
                        <div class="dimension-card">
                            <div class="dimension-card-header">
                                <div class="dimension-card-title">
                                    <span class="dimension-icon">${dim.icon}</span>
                                    <span>${dim.name}</span>
                                </div>
                                <span class="score-badge ${level.class}">${score}/100</span>
                            </div>
                            <div class="dimension-progress-bar">
                                <div class="dimension-progress-fill ${level.class}" 
                                     data-width="${score}%" 
                                     style="width: 0%"></div>
                            </div>
                            <div class="dimension-insights">
                                ${insights.map(insight => `
                                    <div class="insight-item ${insight.type}">
                                        <span class="insight-icon">${insight.icon}</span>
                                        <span>${insight.text}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderIRLBadge(level, title, description) {
        return `
            <div class="irl-badge-container">
                <div class="irl-badge-wrapper">
                    <div class="irl-badge">
                        <div class="badge-number">${level}</div>
                        <div class="badge-label">IRL LEVEL</div>
                    </div>
                    <div>
                        <div class="badge-title">${title}</div>
                        <div class="badge-subtitle">${description}</div>
                    </div>
                </div>
                <div class="irl-progress">
                    <div class="progress-steps">
                        ${Array.from({length: 9}, (_, i) => {
                            const stepLevel = i + 1;
                            let stepClass = '';
                            if (stepLevel < level) stepClass = 'completed';
                            else if (stepLevel === level) stepClass = 'current';
                            return `<div class="progress-step ${stepClass}"></div>`;
                        }).join('')}
                    </div>
                    <div class="progress-labels">
                        <span class="progress-label">1</span>
                        <span class="progress-label">5</span>
                        <span class="progress-label">9</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderCertificate(userName, level, title, score, date) {
        return `
            <div class="certificate-section">
                <h2>Your Achievement Certificate</h2>
                <p style="color: #666; margin-bottom: 2rem;">Share your Investment Readiness Level achievement</p>
                
                <div class="certificate-preview" id="certificatePreview">
                    <div class="certificate-title">Certificate of Achievement</div>
                    <div class="certificate-body">
                        This certifies that<br>
                        <strong style="font-size: 1.5rem;">${userName}</strong><br>
                        has completed the Investment Readiness Level Assessment<br>
                        and achieved
                    </div>
                    <div class="certificate-highlight">
                        IRL Level ${level}: ${title}
                    </div>
                    <div class="certificate-body">
                        Overall Score: ${score}/100
                    </div>
                    <div class="certificate-signature">
                        <div style="font-weight: 600;">IRL Assessment Platform</div>
                        <div style="font-size: 0.875rem; color: #666;">${date}</div>
                    </div>
                </div>
                
                <div class="download-actions">
                    <button onclick="resultsEnhancer.downloadCertificate()" class="btn btn-primary">
                        Download Certificate
                    </button>
                    <button onclick="resultsEnhancer.shareCertificate()" class="btn btn-secondary">
                        Share Results
                    </button>
                </div>
            </div>
        `;
    }

    getScoreLevel(score) {
        if (score >= 80) return { class: 'excellent', text: 'Excellent' };
        if (score >= 60) return { class: 'good', text: 'Good' };
        if (score >= 40) return { class: 'fair', text: 'Fair' };
        return { class: 'needs-improvement', text: 'Needs Improvement' };
    }

    getDimensionInsights(dimension, score) {
        const insights = [];
        
        // Generate insights based on score
        if (score >= 70) {
            insights.push({
                type: 'strength',
                icon: '✅',
                text: 'Strong performance in this dimension'
            });
        }
        
        if (score >= 80) {
            insights.push({
                type: 'strength',
                icon: '⭐',
                text: 'Excellent - ready for next stage'
            });
        } else if (score < 50) {
            insights.push({
                type: 'weakness',
                icon: '⚠️',
                text: 'Requires immediate attention'
            });
        } else if (score < 70) {
            insights.push({
                type: 'weakness',
                icon: '📈',
                text: 'Room for improvement'
            });
        }
        
        // Dimension-specific insights
        const dimensionInsights = {
            'business': {
                high: 'Clear value proposition and market fit',
                low: 'Business model needs validation'
            },
            'technology': {
                high: 'Strong technical foundation',
                low: 'Technology development needed'
            },
            'customer': {
                high: 'Good customer understanding',
                low: 'More customer validation required'
            },
            'operations': {
                high: 'Efficient execution capabilities',
                low: 'Operational processes need structure'
            },
            'financial': {
                high: 'Solid financial planning',
                low: 'Financial strategy needs work'
            }
        };
        
        if (score >= 70 && dimensionInsights[dimension]) {
            insights.push({
                type: 'strength',
                icon: '💡',
                text: dimensionInsights[dimension].high
            });
        } else if (score < 60 && dimensionInsights[dimension]) {
            insights.push({
                type: 'weakness',
                icon: '🎯',
                text: dimensionInsights[dimension].low
            });
        }
        
        return insights;
    }

    animateDimensionBars() {
        setTimeout(() => {
            document.querySelectorAll('.dimension-progress-fill').forEach(bar => {
                const width = bar.getAttribute('data-width');
                bar.style.width = width;
            });
        }, 300);
    }

    downloadCertificate() {
        // Convert certificate to image using html2canvas
        const certificate = document.getElementById('certificatePreview');
        
        // For now, show a message. Full implementation would use html2canvas library
        alert('Certificate download feature coming soon! For now, you can screenshot this certificate.');
        
        // Future implementation:
        // html2canvas(certificate).then(canvas => {
        //     const link = document.createElement('a');
        //     link.download = 'irl-certificate.png';
        //     link.href = canvas.toDataURL();
        //     link.click();
        // });
    }

    shareCertificate() {
        const currentUrl = window.location.href;
        const shareText = `I just completed the IRL Assessment and achieved Level ${this.currentLevel}!`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My IRL Assessment Results',
                text: shareText,
                url: currentUrl
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${shareText} ${currentUrl}`);
            alert('Share link copied to clipboard!');
        }
    }
}

// Create global instance
const resultsEnhancer = new ResultsEnhancer();
