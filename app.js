// Sherlock Yes/No - Game Engine (Gemini LLM Powered)
import { STORIES } from './stories.js';
import { askGemini, checkSolutionWithGemini } from './gemini.js';

// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
    currentScreen: 'splash',
    currentStory: null,
    questionCount: 0,
    hintCount: 0,
    hintsUsed: 0,
    chatHistory: [],           // UI display history
    conversationHistory: [],   // Gemini API conversation history
    solvedStories: new Set(JSON.parse(localStorage.getItem('sherlock-solved') || '[]')),
    scenarioCollapsed: false,
    filterDifficulty: 'all',
    isProcessing: false        // Prevent double sends while API is working
};

// ============================================
// DOM REFERENCES
// ============================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const DOM = {
    splashScreen: $('#splash-screen'),
    storySelectScreen: $('#story-select-screen'),
    gameScreen: $('#game-screen'),
    resultScreen: $('#result-screen'),

    btnNewGame: $('#btn-new-game'),
    btnHowToPlay: $('#btn-how-to-play'),

    howToPlayModal: $('#how-to-play-modal'),
    modalClose: $('#modal-close'),
    modalGotIt: $('#modal-got-it'),

    btnBackSplash: $('#btn-back-splash'),
    storyGrid: $('#story-grid'),

    btnBackSelect: $('#btn-back-select'),
    scenarioCard: $('#scenario-card'),
    scenarioTitle: $('#scenario-title'),
    scenarioText: $('#scenario-text'),
    btnToggleScenario: $('#btn-toggle-scenario'),
    chatMessages: $('#chat-messages'),
    chatArea: $('#chat-area'),
    questionInput: $('#question-input'),
    btnSend: $('#btn-send'),
    btnHint: $('#btn-hint'),
    btnSolve: $('#btn-solve'),
    questionCountEl: $('#question-count'),
    hintCountEl: $('#hint-count'),

    solveModal: $('#solve-modal'),
    solveModalClose: $('#solve-modal-close'),
    solveInput: $('#solve-input'),
    btnCheckSolution: $('#btn-check-solution'),
    btnCancelSolve: $('#btn-cancel-solve'),

    resultIcon: $('#result-icon'),
    resultTitle: $('#result-title'),
    resultQuestions: $('#result-questions'),
    resultHints: $('#result-hints'),
    resultDifficulty: $('#result-difficulty'),
    resultSolution: $('#result-solution'),
    btnNewPuzzle: $('#btn-new-puzzle'),
    btnMainMenu: $('#btn-main-menu'),

    particles: $('#particles')
};

// ============================================
// INITIALIZATION
// ============================================
function init() {
    createParticles();
    bindEvents();
}

function createParticles() {
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (6 + Math.random() * 6) + 's';
        particle.style.width = particle.style.height = (1 + Math.random() * 2) + 'px';
        DOM.particles.appendChild(particle);
    }
}

function bindEvents() {
    DOM.btnNewGame.addEventListener('click', () => switchScreen('story-select'));
    DOM.btnHowToPlay.addEventListener('click', () => toggleModal(DOM.howToPlayModal, true));

    DOM.modalClose.addEventListener('click', () => toggleModal(DOM.howToPlayModal, false));
    DOM.modalGotIt.addEventListener('click', () => toggleModal(DOM.howToPlayModal, false));
    DOM.howToPlayModal.addEventListener('click', (e) => {
        if (e.target === DOM.howToPlayModal) toggleModal(DOM.howToPlayModal, false);
    });

    DOM.btnBackSplash.addEventListener('click', () => switchScreen('splash'));
    $$('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.filterDifficulty = btn.dataset.difficulty;
            renderStoryGrid();
        });
    });

    DOM.btnBackSelect.addEventListener('click', () => switchScreen('story-select'));
    DOM.btnToggleScenario.addEventListener('click', toggleScenario);
    DOM.btnSend.addEventListener('click', handleSendQuestion);
    DOM.questionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendQuestion();
        }
    });
    DOM.btnHint.addEventListener('click', handleHintRequest);
    DOM.btnSolve.addEventListener('click', () => toggleModal(DOM.solveModal, true));

    DOM.solveModalClose.addEventListener('click', () => toggleModal(DOM.solveModal, false));
    DOM.btnCancelSolve.addEventListener('click', () => toggleModal(DOM.solveModal, false));
    DOM.btnCheckSolution.addEventListener('click', handleCheckSolution);
    DOM.solveModal.addEventListener('click', (e) => {
        if (e.target === DOM.solveModal) toggleModal(DOM.solveModal, false);
    });

    DOM.btnNewPuzzle.addEventListener('click', () => switchScreen('story-select'));
    DOM.btnMainMenu.addEventListener('click', () => switchScreen('splash'));
}

// ============================================
// SCREEN MANAGEMENT
// ============================================
function switchScreen(screenName) {
    $$('.screen').forEach(s => s.classList.remove('active'));

    let targetScreen;
    switch (screenName) {
        case 'splash':
            targetScreen = DOM.splashScreen;
            break;
        case 'story-select':
            targetScreen = DOM.storySelectScreen;
            renderStoryGrid();
            break;
        case 'game':
            targetScreen = DOM.gameScreen;
            break;
        case 'result':
            targetScreen = DOM.resultScreen;
            break;
    }

    if (targetScreen) {
        targetScreen.classList.add('active');
        state.currentScreen = screenName;
    }
}

function toggleModal(modal, show) {
    modal.classList.toggle('active', show);
}

// ============================================
// STORY GRID
// ============================================
function renderStoryGrid() {
    const stories = state.filterDifficulty === 'all'
        ? STORIES
        : STORIES.filter(s => s.difficulty === parseInt(state.filterDifficulty));

    DOM.storyGrid.innerHTML = stories.map(story => {
        const isSolved = state.solvedStories.has(story.id);
        const difficultyStars = '⭐'.repeat(story.difficulty);
        const difficultyLabels = ['', 'Kolay', 'Orta', 'Zor'];

        return `
            <div class="story-card" data-story-id="${story.id}">
                ${isSolved ? '<span class="story-card-solved">✓ Çözüldü</span>' : ''}
                <div class="story-card-difficulty">${difficultyStars} ${difficultyLabels[story.difficulty]}</div>
                <h3 class="story-card-title">${story.title}</h3>
                <p class="story-card-preview">${story.scenario}</p>
            </div>
        `;
    }).join('');

    $$('.story-card').forEach(card => {
        card.addEventListener('click', () => startGame(card.dataset.storyId));
    });
}

// ============================================
// GAME START
// ============================================
function startGame(storyId) {
    const story = STORIES.find(s => s.id === storyId);
    if (!story) return;

    state.currentStory = story;
    state.questionCount = 0;
    state.hintCount = 0;
    state.hintsUsed = 0;
    state.chatHistory = [];
    state.conversationHistory = [];
    state.scenarioCollapsed = false;
    state.isProcessing = false;

    DOM.scenarioTitle.textContent = story.title;
    DOM.scenarioText.textContent = story.scenario;
    DOM.scenarioCard.classList.remove('collapsed');
    DOM.btnToggleScenario.textContent = 'Senaryoyu Gizle ▲';

    DOM.chatMessages.innerHTML = '';
    updateStats();
    updateHintButton();

    DOM.questionInput.value = '';
    DOM.solveInput.value = '';

    addChatBubble('system', '🔍 Senaryo hazır! Yapay zeka hikaye anlatıcın olarak burada. Evet/Hayır soruları sorarak gizemi çöz!');

    switchScreen('game');
    setTimeout(() => DOM.questionInput.focus(), 500);
}

// ============================================
// SCENARIO TOGGLE
// ============================================
function toggleScenario() {
    state.scenarioCollapsed = !state.scenarioCollapsed;
    DOM.scenarioCard.classList.toggle('collapsed', state.scenarioCollapsed);
    DOM.btnToggleScenario.textContent = state.scenarioCollapsed
        ? 'Senaryoyu Göster ▼'
        : 'Senaryoyu Gizle ▲';
}

// ============================================
// QUESTION HANDLING (GEMINI LLM)
// ============================================
async function handleSendQuestion() {
    const question = DOM.questionInput.value.trim();
    if (!question || state.isProcessing) return;

    state.isProcessing = true;
    setInputDisabled(true);

    // Add user bubble
    addChatBubble('user', question);
    DOM.questionInput.value = '';

    // Show typing indicator
    showTypingIndicator();

    try {
        // Call Gemini API with conversation history
        const answer = await askGemini(
            state.currentStory,
            state.conversationHistory,
            question
        );

        removeTypingIndicator();

        // If API failed, display an error message
        if (answer.error) {
            console.error('Gemini API failed:', answer.error);
            addAIChatBubble({
                type: 'error',
                text: 'Bağlantıda bir sorun oluştu. Lütfen tekrar dene!'
            });
        } else {
            // Only count valid yes/no questions (not warnings or errors)
            if (answer.type !== 'warning') {
                state.questionCount++;
                updateStats();
            }

            // Add to conversation history for context
            state.conversationHistory.push({ role: 'user', text: question });
            state.conversationHistory.push({
                role: 'model',
                text: answer.rawResponse || `${answer.type.toUpperCase()}\n${answer.text}`
            });

            // Show answer
            addAIChatBubble(answer);
        }
    } catch (err) {
        removeTypingIndicator();
        addAIChatBubble({
            type: 'error',
            text: 'Beklenmeyen bir hata oluştu. Lütfen tekrar dene!'
        });
        console.error('Question handling error:', err);
    }

    state.isProcessing = false;
    setInputDisabled(false);
    DOM.questionInput.focus();
}

function setInputDisabled(disabled) {
    DOM.questionInput.disabled = disabled;
    DOM.btnSend.disabled = disabled;
    DOM.btnHint.disabled = disabled || (state.currentStory && state.hintsUsed >= state.currentStory.hints.length);
    DOM.btnSolve.disabled = disabled;

    if (disabled) {
        DOM.questionInput.placeholder = 'Yapay zeka düşünüyor...';
    } else {
        DOM.questionInput.placeholder = 'Evet/Hayır sorusu sor...';
    }
}

// ============================================
// HINT SYSTEM (LLM-powered)
// ============================================
async function handleHintRequest() {
    if (!state.currentStory || state.isProcessing) return;
    if (state.hintsUsed >= state.currentStory.hints.length) return;

    state.isProcessing = true;
    setInputDisabled(true);

    const hint = state.currentStory.hints[state.hintsUsed];
    state.hintsUsed++;
    state.hintCount++;
    updateStats();
    updateHintButton();

    // Also ask Gemini for a contextual hint based on conversation so far
    showTypingIndicator();

    try {
        const hintQuestion = `Oyuncuya bir ipucu ver. Çözümü söyleme ama doğru yöne yönlendir. Şimdiye kadar sorduğu sorulara göre neyi kaçırıyor olabilir? Kısa ve öz cevap ver. (Bu bir ipucu isteği, normal soru değil.)`;

        const aiHint = await askGemini(
            state.currentStory,
            state.conversationHistory,
            hintQuestion
        );

        removeTypingIndicator();

        // Use AI-generated hint text, or fallback to predefined hint
        const hintText = (aiHint.error || !aiHint.text)
            ? hint
            : aiHint.text;

        addAIChatBubble({
            type: 'hint',
            text: `💡 İpucu ${state.hintsUsed}: ${hintText}`
        });

        // Add to conversation history
        state.conversationHistory.push({ role: 'user', text: hintQuestion });
        state.conversationHistory.push({ role: 'model', text: hintText });

    } catch {
        removeTypingIndicator();
        addAIChatBubble({
            type: 'hint',
            text: `💡 İpucu ${state.hintsUsed}: ${hint}`
        });
    }

    state.isProcessing = false;
    setInputDisabled(false);
}

function updateHintButton() {
    if (!state.currentStory) return;
    const remaining = state.currentStory.hints.length - state.hintsUsed;
    DOM.btnHint.disabled = remaining <= 0;
    DOM.btnHint.innerHTML = remaining > 0
        ? `<span>💡</span> İpucu İste (${remaining})`
        : `<span>💡</span> İpucu Kalmadı`;
}

// ============================================
// SOLUTION CHECK (GEMINI LLM)
// ============================================
async function handleCheckSolution() {
    const userSolution = DOM.solveInput.value.trim();
    if (!userSolution || state.isProcessing) return;

    state.isProcessing = true;
    toggleModal(DOM.solveModal, false);

    addChatBubble('user', `🎯 Tahminim: ${userSolution}`);
    showTypingIndicator();

    try {
        const result = await checkSolutionWithGemini(state.currentStory, userSolution);
        removeTypingIndicator();

        if (result.result === 'correct') {
            state.solvedStories.add(state.currentStory.id);
            localStorage.setItem('sherlock-solved', JSON.stringify([...state.solvedStories]));

            addChatBubble('system', `🎉 ${result.text || 'Tebrikler! Doğru çözüme ulaştın!'}`);
            setTimeout(() => showResult(true), 1200);

        } else if (result.result === 'close') {
            addAIChatBubble({
                type: 'hint',
                text: result.text || 'Yaklaştın ama tam olarak değil. Biraz daha düşün! 🤔'
            });

        } else if (result.result === 'error') {
            console.error('Solution API failed:', result.text);
            addAIChatBubble({
                type: 'error',
                text: 'Çözüm kontrolünde bir hata oluştu. Lütfen tekrar dene!'
            });
        } else {
            addAIChatBubble({
                type: 'no',
                text: result.text || 'Bu doğru çözüm değil. Soru sormaya devam et! 🔍'
            });
        }
    } catch (err) {
        removeTypingIndicator();
        addAIChatBubble({ type: 'error', text: 'Çözüm kontrolünde beklenmeyen bir hata oluştu.' });
        console.error('Solution check error:', err);
    }

    state.isProcessing = false;
    DOM.solveInput.value = '';
}

// ============================================
// CHAT UI
// ============================================
function addChatBubble(type, text) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${type}`;
    bubble.textContent = text;
    DOM.chatMessages.appendChild(bubble);
    scrollChatToBottom();
    state.chatHistory.push({ type, text });
}

function addAIChatBubble(answer) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ai ${answer.type}`;

    const labelMap = {
        'yes': 'Evet',
        'no': 'Hayır',
        'irrelevant': 'Alakasız',
        'hint': 'İpucu',
        'warning': 'Uyarı',
        'error': 'Hata'
    };

    bubble.innerHTML = `
        <span class="chat-answer-label ${answer.type}">${labelMap[answer.type] || '—'}</span>
        <div>${answer.text}</div>
    `;

    DOM.chatMessages.appendChild(bubble);
    scrollChatToBottom();
    state.chatHistory.push({ type: 'ai', answerType: answer.type, text: answer.text });
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    DOM.chatMessages.appendChild(indicator);
    scrollChatToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

function scrollChatToBottom() {
    requestAnimationFrame(() => {
        DOM.chatArea.scrollTop = DOM.chatArea.scrollHeight;
    });
}

// ============================================
// STATS
// ============================================
function updateStats() {
    DOM.questionCountEl.textContent = state.questionCount;
    DOM.hintCountEl.textContent = state.hintsUsed;
}

// ============================================
// RESULT SCREEN
// ============================================
function showResult(solved) {
    DOM.resultIcon.textContent = solved ? '🏆' : '📋';
    DOM.resultTitle.textContent = solved ? 'Tebrikler, Dedektif!' : 'Çözüm Açıklandı';
    DOM.resultQuestions.textContent = state.questionCount;
    DOM.resultHints.textContent = state.hintsUsed;
    DOM.resultDifficulty.textContent = '⭐'.repeat(state.currentStory.difficulty);
    DOM.resultSolution.textContent = state.currentStory.solution;

    switchScreen('result');
    if (solved) createConfetti();
}

// ============================================
// CONFETTI EFFECT
// ============================================
function createConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#d4a853', '#e8c878', '#c0392b', '#27ae60', '#3498db', '#e74c3c', '#f39c12'];

    for (let i = 0; i < 80; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 1.5 + 's';
        piece.style.animationDuration = (2 + Math.random() * 2) + 's';
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;
        if (Math.random() > 0.5) piece.style.borderRadius = '50%';
        container.appendChild(piece);
    }

    setTimeout(() => container.remove(), 5000);
}

// ============================================
// GIVE UP BUTTON
// ============================================
function addGiveUpButton() {
    if (document.querySelector('.btn-give-up')) return;

    const btn = document.createElement('button');
    btn.className = 'btn btn-give-up';
    btn.innerHTML = '<span>🏳️</span> Pes Et — Çözümü Gör';
    btn.addEventListener('click', () => {
        if (confirm('Emin misin? Çözümü görmek istiyorsan \'Tamam\' de.')) {
            addChatBubble('system', '🏳️ Pes ettin. Çözüm gösteriliyor...');
            setTimeout(() => showResult(false), 800);
        }
    });

    document.querySelector('.action-buttons').appendChild(btn);
}


// ============================================
// BOOT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    init();

    // Monitor for give up button
    const observer = new MutationObserver(() => {
        if (state.questionCount >= 5) addGiveUpButton();
    });
    observer.observe(DOM.chatMessages, { childList: true });
});
