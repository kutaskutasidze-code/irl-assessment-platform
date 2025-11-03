/**
 * IRL Assessment Engine
 * Handles scoring, calculations, and pentagon visualization
 */

class AssessmentEngine {
  constructor() {
    this.categories = null;
    this.questions = null;
    this.currentAssessment = {
      categoryId: null,
      answers: {},
      scores: {
        business: 0,
        technology: 0,
        customer: 0,
        operations: 0,
        financial: 0
      },
      totalScore: 0,
      irlLevel: 0
    };
  }

  async loadCategories() {
    try {
      const response = await fetch('../data/categories.json');
      const data = await response.json();
      this.categories = data.categories;
      return this.categories;
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  }

  async loadQuestions() {
    try {
      // Load industry-specific questions based on selected category
      const categoryId = this.currentAssessment.categoryId;
      
      if (!categoryId) {
        throw new Error('No category selected. Please select a category first.');
      }

      const response = await fetch(`../data/questions-${categoryId}.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to load questions for ${categoryId}`);
      }
      
      const data = await response.json();
      this.questions = data.industryQuestions;
      
      console.log(`Loaded ${this.questions.length} industry-specific questions for ${categoryId}`);
      return this.questions;
    } catch (error) {
      console.error('Error loading questions:', error);
      throw error;
    }
  }

  getCategoryById(categoryId) {
    return this.categories ? this.categories.find(c => c.id === categoryId) : null;
  }

  startAssessment(categoryId) {
    this.currentAssessment = {
      categoryId: categoryId,
      category: this.getCategoryById(categoryId),
      answers: {},
      scores: {
        business: 0,
        technology: 0,
        customer: 0,
        operations: 0,
        financial: 0
      },
      totalScore: 0,
      irlLevel: 0,
      startedAt: new Date().toISOString()
    };
  }

  saveAnswer(questionId, answerValue) {
    this.currentAssessment.answers[questionId] = answerValue;
  }

  calculateScores() {
    const dimensionScores = {
      business: { total: 0, count: 0 },
      technology: { total: 0, count: 0 },
      customer: { total: 0, count: 0 },
      operations: { total: 0, count: 0 },
      financial: { total: 0, count: 0 }
    };

    // Calculate scores for each dimension
    this.questions.forEach(question => {
      const answer = this.currentAssessment.answers[question.id];
      if (answer !== undefined) {
        const dimension = question.dimension;
        dimensionScores[dimension].total += answer;
        dimensionScores[dimension].count += 1;
      }
    });

    // Calculate average scores (0-100 scale)
    Object.keys(dimensionScores).forEach(dimension => {
      const { total, count } = dimensionScores[dimension];
      this.currentAssessment.scores[dimension] = count > 0 
        ? Math.round((total / count) * 20) // Convert 0-5 to 0-100
        : 0;
    });

    // Apply category-specific weights
    const weights = this.currentAssessment.category.dimensionWeights;
    let weightedTotal = 0;
    Object.keys(this.currentAssessment.scores).forEach(dimension => {
      weightedTotal += this.currentAssessment.scores[dimension] * weights[dimension];
    });

    this.currentAssessment.totalScore = Math.round(weightedTotal);
    this.currentAssessment.irlLevel = this.calculateIRLLevel(weightedTotal);
    this.currentAssessment.completedAt = new Date().toISOString();

    return this.currentAssessment;
  }

  calculateIRLLevel(score) {
    // Map 0-100 score to IRL 1-9
    if (score >= 90) return 9;
    if (score >= 80) return 8;
    if (score >= 70) return 7;
    if (score >= 60) return 6;
    if (score >= 50) return 5;
    if (score >= 40) return 4;
    if (score >= 30) return 3;
    if (score >= 20) return 2;
    return 1;
  }

  getIRLLevelInfo(level) {
    const info = {
      1: {
        title: "Hypothesis Stage",
        description: "You're at the beginning of your innovation journey with an untested idea.",
        color: "#ef4444"
      },
      2: {
        title: "Basic Research Stage",
        description: "Your concept is taking shape through initial research and exploration.",
        color: "#f97316"
      },
      3: {
        title: "Applied Research Stage",
        description: "You're developing and testing solution concepts with early validation.",
        color: "#f59e0b"
      },
      4: {
        title: "Proof of Concept Stage",
        description: "Technical feasibility has been demonstrated with a working prototype.",
        color: "#eab308"
      },
      5: {
        title: "Solution Validation Stage",
        description: "Your solution has been validated with early adopters and initial traction.",
        color: "#84cc16"
      },
      6: {
        title: "Market Validation Stage",
        description: "Market demand is confirmed with consistent customer acquisition.",
        color: "#22c55e"
      },
      7: {
        title: "Solution Complete Stage",
        description: "Your solution is complete, scalable, and ready for growth.",
        color: "#10b981"
      },
      8: {
        title: "Initial Adoption Stage",
        description: "You have strong customer adoption and proven business model.",
        color: "#14b8a6"
      },
      9: {
        title: "Market Ready Stage",
        description: "Your innovation has proven market success and sustainable growth.",
        color: "#06b6d4"
      }
    };

    return info[level] || info[1];
  }

  createPentagonChart(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const scores = this.currentAssessment.scores;

    const chartData = {
      labels: [
        'Business Model',
        'Technology',
        'Customer & Market',
        'Operations',
        'Financial'
      ],
      datasets: [{
        label: 'Your Scores',
        data: [
          scores.business,
          scores.technology,
          scores.customer,
          scores.operations,
          scores.financial
        ],
        backgroundColor: 'rgba(26, 26, 26, 0.2)',
        borderColor: '#1a1a1a',
        borderWidth: 2,
        pointBackgroundColor: '#1a1a1a',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#1a1a1a',
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    };

    const config = {
      type: 'radar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            angleLines: {
              display: true,
              color: '#e9ecef'
            },
            grid: {
              color: '#e9ecef'
            },
            pointLabels: {
              font: {
                size: 14,
                weight: '600'
              },
              color: '#1a1a1a'
            },
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: {
              stepSize: 20,
              backdropColor: 'transparent',
              color: '#666',
              font: {
                size: 11
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1a1a1a',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return context.parsed.r + '/100';
              }
            }
          }
        }
      }
    };

    return new Chart(ctx, config);
  }

  getAssessmentSummary() {
    return {
      category: this.currentAssessment.category,
      scores: this.currentAssessment.scores,
      totalScore: this.currentAssessment.totalScore,
      irlLevel: this.currentAssessment.irlLevel,
      irlInfo: this.getIRLLevelInfo(this.currentAssessment.irlLevel),
      completedAt: this.currentAssessment.completedAt
    };
  }

  saveAssessmentToStorage() {
    const assessment = {
      ...this.currentAssessment,
      userId: null, // TODO: Integrate with auth system
      userEmail: null // TODO: Integrate with auth system
    };

    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem('assessments') || '[]');
    saved.push(assessment);
    localStorage.setItem('assessments', JSON.stringify(saved));

    // Also save to mockDB if available
    if (typeof mockDB !== 'undefined') {
      mockDB.assessments.push({
        id: mockDB.assessments.length + 1,
        userId: null, // TODO: Integrate with auth system
        categoryId: assessment.categoryId,
        level: assessment.irlLevel,
        scores: assessment.scores,
        answers: assessment.answers,
        date: assessment.completedAt
      });
    }

    return assessment;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AssessmentEngine;
}
