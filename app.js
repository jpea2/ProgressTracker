class GoalManager {
    constructor() {
        this.goals = JSON.parse(localStorage.getItem('goals')) || [];
        this.goalToDelete = null;
        this.draggedGoal = null;
        this.initEventListeners();
        this.renderGoals();
    }

    handleDragEnd(card) {
        card.classList.remove('dragging');
        this.draggedGoal = null;
        document.querySelectorAll('.goal-card').forEach(card => {
            card.classList.remove('drag-over');
        });
    }

    handleDragOver(card, index) {
        if (this.draggedGoal !== null && this.draggedGoal !== index.toString()) {
            card.classList.add('drag-over');
        }
    }

    handleDrop(toIndex) {
        const fromIndex = parseInt(this.draggedGoal);
        if (fromIndex !== toIndex) {
            const [movedGoal] = this.goals.splice(fromIndex, 1);
            this.goals.splice(toIndex, 0, movedGoal);
            this.saveGoals();
            this.renderGoals();
        }
    }

    initEventListeners() {
        // Add Goal Modal controls
        const modalContainer = document.getElementById('modalContainer');
        const openModalBtn = document.getElementById('openModalBtn');
        const closeModalBtn = document.getElementById('closeModalBtn');

        openModalBtn.addEventListener('click', () => {
            modalContainer.style.display = 'flex';
        });

        closeModalBtn.addEventListener('click', () => {
            modalContainer.style.display = 'none';
        });

        // Close add goal modal when clicking outside
        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                modalContainer.style.display = 'none';
            }
        });

        // Delete Confirmation Modal controls
        const deleteModal = document.getElementById('deleteConfirmModal');
        const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

        closeDeleteModalBtn.addEventListener('click', () => {
            deleteModal.style.display = 'none';
        });

        cancelDeleteBtn.addEventListener('click', () => {
            deleteModal.style.display = 'none';
        });

        confirmDeleteBtn.addEventListener('click', () => {
            if (this.goalToDelete !== null) {
                this.removeGoal(this.goalToDelete);
                this.goalToDelete = null;
                deleteModal.style.display = 'none';
            }
        });

        // Close delete modal when clicking outside
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                deleteModal.style.display = 'none';
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
                    <div class="incrementndrag-icon">
                        <div class="increment-buttons">
                            ${goal.increments.map(value => 
                                `<button class="increment-btn" 
                                        data-index="${index}" 
                                        data-value="${value}">
                                    +${value}
                                </button>`
                            ).join('')}
                        </div>
                        <img src="draganddropicon.png" alt="Drag and Drop" class="drag-icon" data-index="${index}">
                    </div>      
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
                this.goalToDelete = index;
                document.getElementById('deleteConfirmModal').style.display = 'flex';
            });

            // Add drag and drop event listeners for both desktop and mobile
            const dragIcon = card.querySelector('.drag-icon');
            dragIcon.setAttribute('draggable', 'true');
            
            // Desktop drag and drop
            dragIcon.addEventListener('dragstart', (e) => {
                this.draggedGoal = dragIcon.dataset.index;
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', dragIcon.dataset.index);
            });

            dragIcon.addEventListener('dragend', () => {
                this.handleDragEnd(card);
            });

            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.handleDragOver(card, index);
            });

            card.addEventListener('dragleave', () => {
                card.classList.remove('drag-over');
            });

            card.addEventListener('drop', (e) => {
                e.preventDefault();
                this.handleDrop(index);
            });

            // Mobile touch events
            let touchStartY = 0;
            let initialIndex = 0;

            dragIcon.addEventListener('touchstart', (e) => {
                e.preventDefault();
                touchStartY = e.touches[0].clientY;
                this.draggedGoal = dragIcon.dataset.index;
                initialIndex = parseInt(dragIcon.dataset.index);
                card.classList.add('dragging');
            }, { passive: false });

            dragIcon.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
                const targetCard = elements.find(el => el.classList.contains('goal-card'));
                
                if (targetCard) {
                    const targetIndex = Array.from(container.children).indexOf(targetCard);
                    this.handleDragOver(targetCard, targetIndex);
                }
            }, { passive: false });

            dragIcon.addEventListener('touchend', (e) => {
                e.preventDefault();
                const touch = e.changedTouches[0];
                const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
                const targetCard = elements.find(el => el.classList.contains('goal-card'));
                
                if (targetCard) {
                    const targetIndex = Array.from(container.children).indexOf(targetCard);
                    this.handleDrop(targetIndex);
                }
                
                this.handleDragEnd(card);
            }, { passive: false });

            container.appendChild(card);
        });
    }
}

// Initialize the app
new GoalManager();


async function forceUpdate() {
    try {
        // Show loading state
        const button = event.target.closest('button');
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="spinning">↻</i> Updating...';
        button.disabled = true;

        // Unregister service worker
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
            }
        }

        // Clear caches
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        }

        // Show success message
        button.innerHTML = '✓ Updated!';
        button.classList.add('success');

        // Reload the page after a short delay
        setTimeout(() => {
            window.location.reload(true);
        }, 1000);

    } catch (error) {
        console.error('Force update failed:', error);
        alert('Update failed. Please try again.');
        
        // Reset button state
        button.innerHTML = originalContent;
        button.disabled = false;
    }
}