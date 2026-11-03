class PomodoroApp {
    constructor() {
        this.initializeData();
        this.initializeElements();
        this.initializeAudio();
        this.initializeEventListeners();
        this.loadSettings();
        this.updateDisplay();
        this.renderTasks();
        this.updateTaskStats();
        this.updateAnalytics();
        this.checkAchievements(false); // Don't show badge on load
        this.requestNotificationPermission();
        this.setupOfflineSupport();
    }

    initializeData() {
        // Timer state
        this.timerInterval = null;
        this.isRunning = false;
        this.isPaused = false;
        this.currentSession = 'work';
        this.sessionCount = 0; // Number of work sessions completed in current cycle
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.totalTime = 25 * 60;
        this.isFocusMode = false;

        // Settings (loaded from localStorage or default)
        this.settings = JSON.parse(localStorage.getItem('focusflow_settings')) || {
            workDuration: 25,
            shortBreak: 5,
            longBreak: 15,
            longBreakInterval: 4,
            enableNotifications: true,
            enableSounds: true,
            backgroundSound: 'none',
            volume: 50,
            dailyGoal: 8,
            weeklyGoal: 40,
            theme: 'light'
        };

        // Data (loaded from localStorage or default)
        this.tasks = JSON.parse(localStorage.getItem('focusflow_tasks') || '[]');
        this.stats = JSON.parse(localStorage.getItem('focusflow_stats') || JSON.stringify({
            totalSessions: 0,
            totalFocusTime: 0, // in seconds
            currentStreak: 0,
            lastSessionDate: null,
            points: 0,
            achievements: {
                'first-session': false,
                'streak-master': false,
                'focused-learner': false,
                'power-user': false
            }
        }));

        // Motivational quotes
        this.quotes = [
            { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
            { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
            { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
            { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
            { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
            { text: "Time is what we want most, but what we use worst.", author: "William Penn" },
            { text: "Productivity is never an accident. It is always the result of a commitment to excellence.", author: "Paul J. Meyer" },
            { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
            { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
            { text: "The bad news is time flies. The good news is you're the pilot.", author: "Michael Altshuler" }
        ];
    }

    initializeElements() {
        // Timer elements
        this.timerDisplay = document.getElementById('timerDisplay');
        this.timerLabel = document.getElementById('timerLabel');
        this.timerProgress = document.getElementById('timerProgress');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.focusBtn = document.getElementById('focusBtn');

        // Settings elements
        this.workDurationInput = document.getElementById('workDuration');
        this.shortBreakInput = document.getElementById('shortBreak');
        this.longBreakInput = document.getElementById('longBreak');
        this.longBreakIntervalInput = document.getElementById('longBreakInterval');
        this.backgroundSoundSelect = document.getElementById('backgroundSound');
        this.volumeControl = document.getElementById('volumeControl');
        this.enableNotificationsCheckbox = document.getElementById('enableNotifications');
        this.enableSoundsCheckbox = document.getElementById('enableSounds');
        this.dailyGoalInput = document.getElementById('dailyGoal');
        this.weeklyGoalInput = document.getElementById('weeklyGoal');
        this.exportDataBtn = document.getElementById('exportDataBtn');
        this.clearDataBtn = document.getElementById('clearDataBtn');

        // Task elements
        this.taskInput = document.getElementById('taskInput');
        this.taskPriority = document.getElementById('taskPriority');
        this.taskCategory = document.getElementById('taskCategory');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskList = document.getElementById('taskList');
        this.totalTasksDisplay = document.getElementById('totalTasks');
        this.completedTasksDisplay = document.getElementById('completedTasks');
        this.completionRateDisplay = document.getElementById('completionRate');

        // Analytics elements
        this.totalSessionsDisplay = document.getElementById('totalSessions');
        this.totalFocusTimeDisplay = document.getElementById('totalFocusTime');
        this.currentStreakDisplay = document.getElementById('currentStreak');
        this.totalPointsDisplay = document.getElementById('totalPoints');
        this.achievementsList = document.getElementById('achievementsList');

        // Other elements
        this.navTabs = document.querySelectorAll('.nav-tab');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.themeToggle = document.getElementById('themeToggle');
        this.soundToggle = document.getElementById('soundToggle');
        this.focusMode = document.getElementById('focusMode');
        this.focusTimer = document.getElementById('focusTimer');
        this.focusLabel = document.getElementById('focusLabel');
        this.exitFocusBtn = document.getElementById('exitFocus');
        this.notificationElement = document.getElementById('notification');
        this.achievementBadge = document.getElementById('achievementBadge');
        this.achievementText = document.getElementById('achievementText');
        this.quoteContainer = document.getElementById('quoteContainer');
        this.quoteText = document.getElementById('quoteText');
        this.quoteAuthor = document.getElementById('quoteAuthor');

        // Audio elements
        this.notificationSound = new Audio('https://www.soundjay.com/buttons/beep-07.mp3'); // Placeholder sound
        this.backgroundAudio = new Audio();
        this.backgroundAudio.loop = true;
    }

    initializeAudio() {
        // Preload background sounds (or use a service like howler.js for better management)
        this.backgroundSounds = {
            'none': null,
            'rain': 'https://www.soundjay.com/nature/sounds/rain-01.mp3',
            'forest': 'https://www.soundjay.com/nature/sounds/forest-01.mp3',
            'cafe': 'https://www.soundjay.com/human/sounds/cafe-01.mp3',
            'ocean': 'https://www.soundjay.com/nature/sounds/ocean-waves-01.mp3'
        };
    }

    initializeEventListeners() {
        // Timer controls
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.pauseBtn.addEventListener('click', () => this.pauseTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.focusBtn.addEventListener('click', () => this.enterFocusMode());
        this.exitFocusBtn.addEventListener('click', () => this.exitFocusMode());

        // Settings inputs
        this.workDurationInput.addEventListener('change', () => this.updateSettings());
        this.shortBreakInput.addEventListener('change', () => this.updateSettings());
        this.longBreakInput.addEventListener('change', () => this.updateSettings());
        this.longBreakIntervalInput.addEventListener('change', () => this.updateSettings());
        this.backgroundSoundSelect.addEventListener('change', () => this.updateSettings());
        this.volumeControl.addEventListener('input', () => this.updateSettings()); // Use 'input' for real-time volume change
        this.enableNotificationsCheckbox.addEventListener('change', () => this.updateSettings());
        this.enableSoundsCheckbox.addEventListener('change', () => this.updateSettings());
        this.dailyGoalInput.addEventListener('change', () => this.updateSettings());
        this.weeklyGoalInput.addEventListener('change', () => this.updateSettings());
        this.exportDataBtn.addEventListener('click', () => this.exportData());
        this.clearDataBtn.addEventListener('click', () => this.clearAllData());

        // Task management
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        this.taskList.addEventListener('click', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                this.toggleTaskCompletion(e.target.dataset.id);
            } else if (e.target.classList.contains('delete-task-btn')) {
                this.deleteTask(e.target.dataset.id);
            }
        });

        // Theme and Sound toggles
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.soundToggle.addEventListener('click', () => this.toggleSound());

        // Navigation tabs
        this.navTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Handle visibility change for streak tracking
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.updateStreak(); // Re-check streak when app becomes visible
            }
        });
    }

    // --- Core Timer Logic ---

    initializeTimer() {
        this.setSession(this.currentSession);
    }

    setSession(sessionType) {
        this.currentSession = sessionType;
        let duration;
        let label;
        switch (sessionType) {
            case 'work':
                duration = this.settings.workDuration;
                label = 'Work Session';
                this.quoteContainer.style.display = 'none';
                break;
            case 'shortBreak':
                duration = this.settings.shortBreak;
                label = 'Short Break';
                this.displayRandomQuote();
                break;
            case 'longBreak':
                duration = this.settings.longBreak;
                label = 'Long Break';
                this.displayRandomQuote();
                break;
        }
        this.timeLeft = duration * 60;
        this.totalTime = duration * 60;
        this.timerLabel.textContent = label;
        this.focusLabel.textContent = label;
        this.updateTimerDisplay();
        this.updateProgressBar();
        document.title = `${this.formatTime(this.timeLeft)} - FocusFlow`;
    }

    startTimer() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.isPaused = false;
        this.startBtn.textContent = '▶️ Running...';
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.resetBtn.disabled = false;

        this.timerInterval = setInterval(() => this.tick(), 1000);
        this.playBackgroundSound();
        this.showNotification(`Session Started!`, `Time to ${this.currentSession === 'work' ? 'focus' : 'relax'}!`);
    }

    pauseTimer() {
        if (!this.isRunning) return;
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.isPaused = true;
        this.startBtn.textContent = '▶️ Resume';
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.backgroundAudio.pause();
        this.showNotification(`Session Paused`, `Your ${this.currentSession} session is paused.`);
    }

    resetTimer() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.isPaused = false;
        this.sessionCount = 0; // Reset session count on manual reset
        this.setSession('work');
        this.startBtn.textContent = '▶️ Start';
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.resetBtn.disabled = true;
        this.backgroundAudio.pause();
        this.quoteContainer.style.display = 'none';
        this.showNotification(`Timer Reset`, `The timer has been reset to a work session.`);
    }

    tick() {
        this.timeLeft--;
        this.updateTimerDisplay();
        this.updateProgressBar();
        document.title = `${this.formatTime(this.timeLeft)} - FocusFlow`;

        if (this.timeLeft <= 0) {
            this.endSession();
        }
    }

    endSession() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.backgroundAudio.pause();
        this.notificationSound.play();

        if (this.currentSession === 'work') {
            this.stats.totalSessions++;
            this.stats.totalFocusTime += this.settings.workDuration * 60;
            this.awardPoints(this.settings.workDuration); // Award points for work session
            this.sessionCount++;
            this.updateStreak();
            this.checkAchievements(true);
            this.showNotification(`Work Session Ended!`, `Time for a break!`);

            if (this.sessionCount % this.settings.longBreakInterval === 0) {
                this.setSession('longBreak');
            } else {
                this.setSession('shortBreak');
            }
        } else { // Break session ended
            this.showNotification(`Break Ended!`, `Time to get back to work!`);
            this.setSession('work');
        }

        this.saveStats();
        this.updateAnalytics();
        this.startBtn.textContent = '▶️ Start';
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.resetBtn.disabled = false;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    updateTimerDisplay() {
        const formattedTime = this.formatTime(this.timeLeft);
        this.timerDisplay.textContent = formattedTime;
        if (this.isFocusMode) {
            this.focusTimer.textContent = formattedTime;
        }
    }

    updateProgressBar() {
        const percentage = (this.timeLeft / this.totalTime) * 100;
        this.timerProgress.style.background = `conic-gradient(
            var(--primary-color) ${360 - (percentage * 3.6)}deg,
            var(--bg-tertiary) ${360 - (percentage * 3.6)}deg
        )`;
    }

    // --- Navigation & Display ---

    switchTab(tabId) {
        this.navTabs.forEach(tab => tab.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.remove('active'));

        document.querySelector(`.nav-tab[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    updateDisplay() {
        // Apply current settings to inputs
        this.workDurationInput.value = this.settings.workDuration;
        this.shortBreakInput.value = this.settings.shortBreak;
        this.longBreakInput.value = this.settings.longBreak;
        this.longBreakIntervalInput.value = this.settings.longBreakInterval;
        this.backgroundSoundSelect.value = this.settings.backgroundSound;
        this.volumeControl.value = this.settings.volume;
        this.enableNotificationsCheckbox.checked = this.settings.enableNotifications;
        this.enableSoundsCheckbox.checked = this.settings.enableSounds;
        this.dailyGoalInput.value = this.settings.dailyGoal;
        this.weeklyGoalInput.value = this.settings.weeklyGoal;

        // Apply theme
        document.body.dataset.theme = this.settings.theme;
        this.themeToggle.textContent = this.settings.theme === 'dark' ? '☀️' : '🌙';

        // Update sound toggle icon
        this.soundToggle.textContent = this.backgroundAudio.paused ? '🔇' : '🔊';

        // Update timer display based on current session
        this.setSession(this.currentSession);
    }

    // --- Settings Management ---

    updateSettings() {
        this.settings.workDuration = parseInt(this.workDurationInput.value);
        this.settings.shortBreak = parseInt(this.shortBreakInput.value);
        this.settings.longBreak = parseInt(this.longBreakInput.value);
        this.settings.longBreakInterval = parseInt(this.longBreakIntervalInput.value);
        this.settings.backgroundSound = this.backgroundSoundSelect.value;
        this.settings.volume = parseInt(this.volumeControl.value);
        this.settings.enableNotifications = this.enableNotificationsCheckbox.checked;
        this.settings.enableSounds = this.enableSoundsCheckbox.checked;
        this.settings.dailyGoal = parseInt(this.dailyGoalInput.value);
        this.settings.weeklyGoal = parseInt(this.weeklyGoalInput.value);

        this.saveSettings();
        this.resetTimer(); // Reset timer to apply new durations immediately
        this.playBackgroundSound(); // Apply new sound/volume immediately
    }

    saveSettings() {
        localStorage.setItem('focusflow_settings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('focusflow_settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
        this.updateDisplay();
    }

    // --- Task Management ---

    addTask() {
        const title = this.taskInput.value.trim();
        const priority = this.taskPriority.value;
        const category = this.taskCategory.value;

        if (title) {
            const newTask = {
                id: Date.now().toString(),
                title,
                priority,
                category,
                completed: false,
                createdAt: new Date().toISOString()
            };
            this.tasks.push(newTask);
            this.saveTasks();
            this.renderTasks();
            this.updateTaskStats();
            this.taskInput.value = ''; // Clear input
            this.showNotification('Task Added', `"${title}" has been added.`);
        }
    }

    renderTasks() {
        this.taskList.innerHTML = '';
        if (this.tasks.length === 0) {
            this.taskList.innerHTML = '<p class="text-secondary" style="text-align: center;">No tasks yet. Add one to get started!</p>';
            return;
        }

        this.tasks.sort((a, b) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        this.tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item', `priority-${task.priority}`);
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">${task.category} | Priority: ${task.priority}</div>
                </div>
                <div class="task-actions">
                    <button class="delete-task-btn" data-id="${task.id}" title="Delete Task">&#128465;&#65039;</button>
                </div>
            `;
            this.taskList.appendChild(taskItem);
        });
    }

    toggleTaskCompletion(id) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex > -1) {
            this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
            this.saveTasks();
            this.renderTasks();
            this.updateTaskStats();
            this.showNotification('Task Updated', `Task "${this.tasks[taskIndex].title}" ${this.tasks[taskIndex].completed ? 'completed' : 'reopened'}.`);
        }
    }

    deleteTask(id) {
        const taskTitle = this.tasks.find(task => task.id === id)?.title || 'Task';
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.renderTasks();
        this.updateTaskStats();
        this.showNotification('Task Deleted', `"${taskTitle}" has been removed.`);
    }

    saveTasks() {
        localStorage.setItem('focusflow_tasks', JSON.stringify(this.tasks));
    }

    updateTaskStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const rate = total > 0 ? ((completed / total) * 100).toFixed(0) : 0;

        this.totalTasksDisplay.textContent = total;
        this.completedTasksDisplay.textContent = completed;
        this.completionRateDisplay.textContent = `${rate}%`;
    }

    // --- Personalization ---

    toggleTheme() {
        this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
        document.body.dataset.theme = this.settings.theme;
        this.themeToggle.textContent = this.settings.theme === 'dark' ? '☀️' : '🌙';
        this.saveSettings();
    }

    playBackgroundSound() {
        if (this.backgroundAudio.src && this.backgroundAudio.src !== this.backgroundSounds[this.settings.backgroundSound]) {
            this.backgroundAudio.pause();
            this.backgroundAudio.src = '';
        }

        if (this.settings.backgroundSound !== 'none' && this.backgroundSounds[this.settings.backgroundSound]) {
            this.backgroundAudio.src = this.backgroundSounds[this.settings.backgroundSound];
            this.backgroundAudio.volume = this.settings.volume / 100;
            if (this.isRunning && !this.backgroundAudio.paused) {
                // If already playing and source changed, restart
                this.backgroundAudio.play().catch(e => console.error("Error playing background audio:", e));
            } else if (this.isRunning && this.backgroundAudio.paused) {
                // If timer is running but audio paused (e.g., after theme toggle), resume
                this.backgroundAudio.play().catch(e => console.error("Error playing background audio:", e));
            }
        } else {
            this.backgroundAudio.pause();
            this.backgroundAudio.src = '';
        }
        this.soundToggle.textContent = this.backgroundAudio.paused ? '🔇' : '🔊';
    }

    updateVolume() {
        this.backgroundAudio.volume = this.settings.volume / 100;
        this.saveSettings();
    }

    toggleSound() {
        if (this.backgroundAudio.paused) {
            this.playBackgroundSound(); // This will attempt to play if a sound is selected
            if (this.backgroundAudio.src) {
                this.backgroundAudio.play().catch(e => console.error("Error playing background audio:", e));
            }
            this.soundToggle.textContent = '🔊';
        } else {
            this.backgroundAudio.pause();
            this.soundToggle.textContent = '🔇';
        }
    }

    // --- Focus Mode ---

    enterFocusMode() {
        this.isFocusMode = true;
        this.focusMode.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling in focus mode
        this.updateTimerDisplay(); // Ensure focus timer shows current time
        if (this.isRunning) {
            this.playBackgroundSound();
        }
    }

    exitFocusMode() {
        this.isFocusMode = false;
        this.focusMode.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        if (this.isRunning) {
            this.playBackgroundSound();
        }
    }

    // --- Notifications ---

    requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notification');
            this.enableNotificationsCheckbox.disabled = true;
            this.enableNotificationsCheckbox.checked = false;
            this.settings.enableNotifications = false;
            this.saveSettings();
        } else if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showNotification('Notifications Enabled', 'You will receive session alerts.');
                } else {
                    this.enableNotificationsCheckbox.checked = false;
                    this.settings.enableNotifications = false;
                    this.saveSettings();
                }
            });
        }
    }

    showNotification(title, body) {
        if (this.settings.enableNotifications && Notification.permission === 'granted') {
            new Notification(title, { body, icon: 'https://www.flaticon.com/svg/v2/svg/186/186239.svg' }); // Placeholder icon
        }
        // Also show in-app notification
        this.displayAppNotification(body);

        if (this.settings.enableSounds) {
            this.notificationSound.play().catch(e => console.error("Error playing notification sound:", e));
        }
    }

    displayAppNotification(message) {
        this.notificationElement.textContent = message;
        this.notificationElement.classList.add('show');
        setTimeout(() => {
            this.notificationElement.classList.remove('show');
        }, 3000);
    }

    // --- Gamification & Analytics ---

    saveStats() {
        localStorage.setItem('focusflow_stats', JSON.stringify(this.stats));
    }

    updateAnalytics() {
        this.totalSessionsDisplay.textContent = this.stats.totalSessions;
        const hours = Math.floor(this.stats.totalFocusTime / 3600);
        const minutes = Math.floor((this.stats.totalFocusTime % 3600) / 60);
        this.totalFocusTimeDisplay.textContent = `${hours}h ${minutes}m`;
        this.currentStreakDisplay.textContent = this.stats.currentStreak;
        this.totalPointsDisplay.textContent = this.stats.points;

        // Update achievement statuses
        document.getElementById('achievement-first').textContent = this.stats.achievements['first-session'] ? '✅' : '❌';
        document.getElementById('achievement-streak').textContent = this.stats.achievements['streak-master'] ? '✅' : '❌';
        document.getElementById('achievement-sessions').textContent = this.stats.achievements['focused-learner'] ? '✅' : '❌';
        document.getElementById('achievement-power').textContent = this.stats.achievements['power-user'] ? '✅' : '❌';
    }

    awardPoints(minutes) {
        this.stats.points += minutes * 10; // 10 points per minute of focus
        this.saveStats();
        this.updateAnalytics();
    }

    updateStreak() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastSession = this.stats.lastSessionDate ? new Date(this.stats.lastSessionDate) : null;

        if (!lastSession) {
            this.stats.currentStreak = 1;
        } else {
            const diffTime = Math.abs(today.getTime() - lastSession.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Continued streak
                this.stats.currentStreak++;
            } else if (diffDays > 1) {
                // Streak broken
                this.stats.currentStreak = 1;
            }
            // If diffDays is 0, it's the same day, streak doesn't change
        }
        this.stats.lastSessionDate = today.toISOString();
        this.saveStats();
        this.updateAnalytics();
    }

    checkAchievements(showBadge = true) {
        const achievements = this.stats.achievements;
        let unlockedAchievement = null;

        if (!achievements['first-session'] && this.stats.totalSessions >= 1) {
            achievements['first-session'] = true;
            unlockedAchievement = 'First Session - Complete your first Pomodoro session';
        }
        if (!achievements['focused-learner'] && this.stats.totalSessions >= 10) {
            achievements['focused-learner'] = true;
            unlockedAchievement = 'Focused Learner - Complete 10 sessions';
        }
        if (!achievements['power-user'] && this.stats.totalSessions >= 25) {
            achievements['power-user'] = true;
            unlockedAchievement = 'Power User - Complete 25 sessions';
        }
        if (!achievements['streak-master'] && this.stats.currentStreak >= 5) {
            achievements['streak-master'] = true;
            unlockedAchievement = 'Streak Master - Maintain a 5-day streak';
        }

        if (unlockedAchievement) {
            this.saveStats();
            this.updateAnalytics();
            if (showBadge) {
                this.showAchievementBadge(unlockedAchievement);
            }
        }
    }

    showAchievementBadge(text) {
        this.achievementText.textContent = text;
        this.achievementBadge.classList.add('show');
        setTimeout(() => {
            this.achievementBadge.classList.remove('show');
        }, 4000);
    }

    // --- Motivational Quotes ---

    displayRandomQuote() {
        const randomIndex = Math.floor(Math.random() * this.quotes.length);
        const quote = this.quotes[randomIndex];
        this.quoteText.textContent = `"${quote.text}"`;
        this.quoteAuthor.textContent = `- ${quote.author}`;
        this.quoteContainer.style.display = 'block';
    }

    // --- Data Management ---

    exportData() {
        const data = {
            settings: this.settings,
            tasks: this.tasks,
            stats: this.stats
        };
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `focusflow_data_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showNotification('Data Exported', 'Your FocusFlow data has been downloaded.');
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
            localStorage.removeItem('focusflow_settings');
            localStorage.removeItem('focusflow_tasks');
            localStorage.removeItem('focusflow_stats');
            this.initializeData(); // Re-initialize to default state
            this.resetTimer();
            this.renderTasks();
            this.updateTaskStats();
            this.updateAnalytics();
            this.updateDisplay();
            this.showNotification('Data Cleared', 'All your FocusFlow data has been removed.');
        }
    }

    // --- Offline Support (Basic) ---
    setupOfflineSupport() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    })
                    .catch(err => {
                        console.log('ServiceWorker registration failed: ', err);
                    });
            });
        }
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroApp();
});

// Basic Service Worker for offline support (save this as service-worker.js in the root)
/*
const CACHE_NAME = 'focusflow-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    'https://www.soundjay.com/buttons/beep-07.mp3',
    'https://www.soundjay.com/nature/sounds/rain-01.mp3',
    'https://www.soundjay.com/nature/sounds/forest-01.mp3',
    'https://www.soundjay.com/human/sounds/cafe-01.mp3',
    'https://www.soundjay.com/nature/sounds/ocean-waves-01.mp3'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
*/