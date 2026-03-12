/**
 * 6Q Lean Agile AI - Application Logic
 * Handles the wizard state, local storage persistence, and DOM updates.
 */

// --- Data: The 6 Questions Configuration ---
const QUESTIONS = [
    {
        id: 'q1',
        stepTitle: 'Define Problem',
        question: 'What is the problem?',
        contextTip: 'Define the goal and customer impact clearly, using Lean Six Sigma\'s "Voice of the Customer" to scope waste or defects.',
        placeholder: 'e.g. Customer checkout drop-off has increased by 15%, causing revenue loss...',
    },
    {
        id: 'q2',
        stepTitle: 'Measure Data',
        question: 'What data proves it?',
        contextTip: 'Measure baseline performance with key metrics, avoiding assumptions for Agile\'s empirical foundation.',
        placeholder: 'e.g. Analytics show a 15% increase in bounce rate on the payment page over the last 3 sprints...',
    },
    {
        id: 'q3',
        stepTitle: 'Analyze Causes',
        question: 'What causes it?',
        contextTip: 'Analyze root causes via tools like Fishbone or 5 Whys, prioritizing high-impact factors with Six Sigma stats.',
        placeholder: 'e.g. Load time is 5 seconds on mobile. Root cause: Uncompressed API payloads...',
    },
    {
        id: 'q4',
        stepTitle: 'Identify Solutions',
        question: 'What solutions work?',
        contextTip: 'Test options iteratively (Agile sprints) against criteria like cost and speed, using a Pugh Matrix for objective scoring.',
        placeholder: 'e.g. Option A: Optimize API. Option B: Add caching. Tested A in Sprint 1, improved speed by 2s...',
    },
    {
        id: 'q5',
        stepTitle: 'Validate Risks',
        question: 'What risks remain?',
        contextTip: 'Validate improvements with pilots, checking for variation reduction and Agile feedback loops.',
        placeholder: 'e.g. Risk: Dependency on third-party payment gateway may still cause intermittent timeouts...',
    },
    {
        id: 'q6',
        stepTitle: 'Sustain & Control',
        question: 'How do we sustain it?',
        contextTip: 'Iterate based on retrospectives, embedding controls for ongoing Lean efficiency and Agile flexibility.',
        placeholder: 'e.g. Added automated performance tests to CI/CD pipeline and alerts for >3s load time...',
    },
];

// --- Wizard Class ---
class AppWizard {
    constructor() {
        this.state = {
            currentStep: 0, // 0 = Landing, 1-6 = Questions, 7 = Summary
            answers: {},
        };

        // DOM Elements
        this.appContent = document.getElementById('app-content');
        this.resetBtn = document.getElementById('reset-btn');

        this.init();
    }

    init() {
        this.loadState();
        this.render();
        this.attachGlobalListeners();
    }

    // --- State Management ---
    loadState() {
        const saved = localStorage.getItem('6q_state');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
            } catch (e) {
                console.error('Failed to load state', e);
                this.resetState();
            }
        }
    }

    saveState() {
        localStorage.setItem('6q_state', JSON.stringify(this.state));
    }

    resetState() {
        this.state = {
            currentStep: 0,
            answers: {},
        };
        this.saveState();
        this.render();
    }

    updateAnswer(qId, value) {
        this.state.answers[qId] = value;
        this.saveState();
    }

    goToStep(stepIndex) {
        this.state.currentStep = stepIndex;
        this.saveState();
        this.render();
    }

    // --- Rendering ---
    render() {
        // Clear current content
        this.appContent.innerHTML = '';

        // Route based on step
        if (this.state.currentStep === 0) {
            this.renderLanding();
        } else if (this.state.currentStep >= 1 && this.state.currentStep <= 6) {
            this.renderQuestionStep(this.state.currentStep);
        } else if (this.state.currentStep === 7) {
            this.renderSummary();
        }

        // Re-initialize icons for newly added elements
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    renderLanding() {
        const section = document.createElement('section');
        section.className = 'landing-view card fade-in';
        section.innerHTML = `
        <h2 class="hero-title">Clarify. Decide. Execute.</h2>
        <p class="hero-subtitle">
            An intelligent decision-support assistant combining 
            <strong>Lean Six Sigma</strong> discipline with 
            <strong>Agile</strong> adaptability.
        </p>
        <button id="start-btn" class="btn-primary">
            <span>Start New Session</span>
            <i data-lucide="arrow-right"></i>
        </button>
    `;
        this.appContent.appendChild(section);

        document.getElementById('start-btn').addEventListener('click', () => {
            this.goToStep(1);
        });
    }

    renderQuestionStep(stepIndex) {
        const qData = QUESTIONS[stepIndex - 1];
        const currentAnswer = this.state.answers[qData.id] || '';
        const progressPercent = ((stepIndex - 1) / 6) * 100;

        const section = document.createElement('section');
        section.className = 'wizard-view fade-in';

        section.innerHTML = `
        <div class="progress-status">
            <div class="step-indicator">Step ${stepIndex} of 6</div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${progressPercent}%"></div>
            </div>
        </div>

        <div class="card">
            <div class="step-header">
                <div class="step-subtitle">${qData.stepTitle}</div>
                <h2 class="step-title">${qData.question}</h2>
            </div>

            <div class="ai-tip-box">
                <div class="ai-tip-title">
                    <i data-lucide="sparkles" size="16"></i>
                    <span>AI Guidance</span>
                </div>
                <div class="ai-tip-text">${qData.contextTip}</div>
            </div>

            <div class="input-area">
                <textarea 
                    id="current-input" 
                    class="step-input" 
                    placeholder="${qData.placeholder}"
                    autofocus
                >${currentAnswer}</textarea>
            </div>

            <div class="controls">
                <button id="back-btn" class="btn-secondary">
                    <i data-lucide="arrow-left" size="16"></i>
                    Back
                </button>
                <button id="next-btn" class="btn-primary">
                    ${stepIndex === 6 ? 'Finish & Review' : 'Next Step'}
                    <i data-lucide="${stepIndex === 6 ? 'check' : 'arrow-right'}" size="16"></i>
                </button>
            </div>
        </div>
    `;

        this.appContent.appendChild(section);

        // Event Listeners
        const ta = document.getElementById('current-input');
        ta.addEventListener('input', (e) => {
            this.updateAnswer(qData.id, e.target.value);
        });

        document.getElementById('back-btn').addEventListener('click', () => {
            if (stepIndex === 1) {
                this.goToStep(0);
            } else {
                this.goToStep(stepIndex - 1);
            }
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            if (stepIndex === 6) {
                this.goToStep(7);
            } else {
                this.goToStep(stepIndex + 1);
            }
        });
    }

    renderSummary() {
        const section = document.createElement('section');
        section.className = 'summary-view fade-in';

        let gridHtml = '';
        QUESTIONS.forEach((q, idx) => {
            const answer = this.state.answers[q.id] || '(No answer provided)';
            gridHtml += `
            <div class="summary-item card">
                <span class="summary-label">${idx + 1}. ${q.stepTitle}</span>
                <div class="summary-value">${answer}</div>
            </div>
        `;
        });

        section.innerHTML = `
        <div class="card" style="margin-bottom: var(--space-lg); text-align: center;">
            <h2 class="step-title">Decision Summary</h2>
            <p class="hero-subtitle" style="margin-bottom: 0;">Here is your structured plan.</p>
        </div>

        <div class="summary-grid">
            ${gridHtml}
        </div>

        <div class="controls" style="justify-content: center; gap: var(--space-md);">
            <button id="edit-btn" class="btn-secondary">
                <i data-lucide="edit-2"></i> Edit Answers
            </button>
            <button id="print-btn" class="btn-primary">
                <i data-lucide="printer"></i>
                Print / Save PDF
            </button>
        </div>
    `;

        this.appContent.appendChild(section);

        document.getElementById('edit-btn').addEventListener('click', () => {
            this.goToStep(1);
        });

        document.getElementById('print-btn').addEventListener('click', () => {
            window.print();
        });
    }

    attachGlobalListeners() {
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => {
                if (confirm('Start over? This will clear your current answers.')) {
                    this.resetState();
                }
            });
        }
    }
}

// Start App when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AppWizard();
});
