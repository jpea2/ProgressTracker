class GoalManager {
    constructor() {
        this.goals = JSON.parse(localStorage.getItem('goals')) || [];
        this.initEventListeners();
        this.renderGoals();
    }

    initEventListeners() {
        // Modal controls
        const modalContainer = document.getElementById('modalContainer');
        const openModalBtn = document.getElementById('openModalBtn');
        const closeModalBtn = document.getElementById('closeModalBtn');

        openModalBtn.addEventListener('click', () => {
            modalContainer.style.display = 'flex';
        });

        closeModalBtn.addEventListener('click', () => {
            modalContainer.style.display = 'none';
        });

        // Close modal when clicking outside
        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                modalContainer.style.display = 'none';
            }
        });

        // Form submission
        document.getElementById('goalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createGoal({
                title: document.getElementById('title').value,
                target: parseFloat(document.getElementById('target').value),
                increments: document.getElementById('increments').value
                    .split(',')
                    .map(x => parseFloat(x.trim())),
                current: 0,
                createdAt: new Date().toISOString()
            });
            e.target.reset();
            modalContainer.style.display = 'none';
        });
    }

    createGoal(goal) {
        this.goals.push(goal);
        this.saveGoals();
        this.renderGoals();
    }

    updateProgress(goalIndex, amount) {
        const newValue = this.goals[goalIndex].current + amount;
        this.goals[goalIndex].current = Math.max(
            0,
            Math.min(newValue, this.goals[goalIndex].target)
        );
        this.saveGoals();
        this.renderGoals();
    }

    removeGoal(index) {
        this.goals.splice(index, 1);
        this.saveGoals();
        this.renderGoals();
    }

    saveGoals() {
        localStorage.setItem('goals', JSON.stringify(this.goals));
    }

    renderGoals() {
        const container = document.getElementById('goalsContainer');
        container.innerHTML = '';

        this.goals.forEach((goal, index) => {
            const progress = (goal.current / goal.target) * 100;
            const card = document.createElement('div');
            card.className = 'goal-card';
            card.innerHTML = `
                <div class="goal-header">
                    <h3>${goal.title}</h3>
                    <button class="remove-btn" data-index="${index}">&times;</button>
                </div>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-text">
                        ${goal.current.toFixed(1)}/${goal.target} (${progress.toFixed(1)}%)
                    </div>
                </div>
                <div class="button-group">
                    ${goal.increments.map(value => 
                        `<button class="increment-btn" 
                                data-index="${index}" 
                                data-value="${value}">
                            +${value}
                        </button>`
                    ).join('')}
                </div>
            `;

            card.querySelectorAll('.increment-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = e.target.dataset.index;
                    const value = parseFloat(e.target.dataset.value);
                    this.updateProgress(index, value);
                });
            });

            card.querySelector('.remove-btn').addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                this.removeGoal(index);
            });

            container.appendChild(card);
        });
    }
}

// Initialize the app
new GoalManager();
