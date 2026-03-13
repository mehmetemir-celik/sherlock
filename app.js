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
    isProcessing: false,        // Prevent double sends while API is working
    turnstileToken: null,       // Session-level verification token
    turnstileWidgetId: null,
    isVerified: false,          // Is user verified for the session?
    lastQuestionTime: 0,        // Timestamp of last question for cooldown
    isMusicPlaying: true        // Global music state
};

// ============================================
// GAME CONFIG
// ============================================
const GAME_CONFIG = {
    MAX_QUESTIONS: 20,
    COOLDOWN_MS: 3000,
    TURNSTILE_SITEKEY: "0x4AAAAAACqPaEhb_TQ7Phaj" // Test key (always passes)
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
    splashButtons: $('.splash-buttons'),
    turnstileWrapper: $('#turnstile-wrapper'),

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



    btnMusicToggle: $('#btn-global-music'),
    bgMusic: $('#bg-music'),

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
    btnMainMenu: $('#btn-main-menu')
};

// ============================================
// INITIALIZATION
// ============================================
function init() {
    bindEvents();
    initTurnstile();
    
    // Set background music volume lower
    if (DOM.bgMusic) {
        DOM.bgMusic.volume = 0.2;
    }

    // Ensure music UI matches initial state
    updateMusicUI();
}

function initTurnstile() {
    if (window.turnstile) {
        state.turnstileWidgetId = window.turnstile.render('#turnstile-container', {
            sitekey: GAME_CONFIG.TURNSTILE_SITEKEY,
            theme: 'dark',
            callback: function (token) {
                state.turnstileToken = token;
                state.isVerified = true;
                handleVerificationSuccess();
            },
            'error-callback': function () {
                console.error("Turnstile failed to load or verify.");
            }
        });
    } else {
        setTimeout(initTurnstile, 1000); // Retry if script not loaded yet
    }
}

function handleVerificationSuccess() {
    const wrapper = DOM.turnstileWrapper;
    const splashButtons = DOM.splashButtons;

    if (wrapper) wrapper.style.display = 'none';
    if (splashButtons) {
        splashButtons.style.display = 'flex';
        splashButtons.style.opacity = '0';
        setTimeout(() => {
            splashButtons.style.transition = 'opacity 0.5s ease';
            splashButtons.style.opacity = '1';
        }, 10);
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
    DOM.solveInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleCheckSolution();
        }
    });
    // Solve modal backdrop click closing disabled per user request
    // DOM.solveModal.addEventListener('click', (e) => {
    //     if (e.target === DOM.solveModal) toggleModal(DOM.solveModal, false);
    // });

    DOM.btnNewPuzzle.addEventListener('click', () => switchScreen('story-select'));
    DOM.btnMainMenu.addEventListener('click', () => switchScreen('splash'));

    // Music Toggle
    DOM.btnMusicToggle.addEventListener('click', toggleMusic);

    // Play music on FIRST interaction anywhere on the page (browser requirement)
    const playOnInteraction = () => {
        if (state.isMusicPlaying && DOM.bgMusic.paused) {
            DOM.bgMusic.play().then(() => {
                console.log("Music started successfully on interaction");
            }).catch(e => console.log("Playback failed:", e));
        }
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('keydown', playOnInteraction);
        document.removeEventListener('touchstart', playOnInteraction);
    };

    document.addEventListener('click', playOnInteraction);
    document.addEventListener('keydown', playOnInteraction);
    document.addEventListener('touchstart', playOnInteraction);
}

function toggleMusic() {
    state.isMusicPlaying = !state.isMusicPlaying;
    updateMusicUI();
    
    if (state.isMusicPlaying) {
        DOM.bgMusic.play().catch(e => console.log("Play failed:", e));
    } else {
        DOM.bgMusic.pause();
    }
}

function updateMusicUI() {
    const iconOn = DOM.btnMusicToggle.querySelector('.icon-music-on');
    const iconOff = DOM.btnMusicToggle.querySelector('.icon-music-off');

    if (state.isMusicPlaying) {
        if (iconOn) iconOn.style.display = 'block';
        if (iconOff) iconOff.style.display = 'none';
        DOM.btnMusicToggle.classList.add('active');
    } else {
        if (iconOn) iconOn.style.display = 'none';
        if (iconOff) iconOff.style.display = 'block';
        DOM.btnMusicToggle.classList.remove('active');
    }
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
        const difficultyStars = '🧥'.repeat(story.difficulty);
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
    state.lastQuestionTime = 0;

    // Turnstile reset removed from here, verification is now session-wide

    DOM.scenarioTitle.textContent = story.title;
    DOM.scenarioText.textContent = story.scenario;
    DOM.scenarioCard.classList.remove('collapsed');
    DOM.btnToggleScenario.textContent = 'Senaryoyu Gizle ▲';

    DOM.chatMessages.innerHTML = '';
    updateStats();
    updateHintButton();

    DOM.questionInput.value = '';
    DOM.solveInput.value = '';

    addChatBubble('system', 'Senaryo hazır! Evet/Hayır soruları sorarak gizemi çöz!');

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

    // --- Limits and Security Checks ---
    const now = Date.now();
    if (now - state.lastQuestionTime < GAME_CONFIG.COOLDOWN_MS) {
        addChatBubble('user', question);
        addAIChatBubble({ type: 'warning', text: 'Çok hızlı soruyorsun! Lütfen birkaç saniye bekle.' });
        DOM.questionInput.value = '';
        return;
    }

    if (state.questionCount >= GAME_CONFIG.MAX_QUESTIONS) {
        addAIChatBubble({ type: 'error', text: `Maksimum ${GAME_CONFIG.MAX_QUESTIONS} soru sınırına ulaştın! Artık çözümü tahmin edebilir ya da pes edebilirsin.` });
        DOM.questionInput.value = '';
        return;
    }

    if (!state.isVerified) {
        addAIChatBubble({ type: 'warning', text: 'Güvenlik doğrulaması tamamlanmadı. Lütfen sayfayı yenileyin.' });
        return;
    }
    // ----------------------------------

    state.isProcessing = true;
    setInputDisabled(true);

    // Add user bubble
    addChatBubble('user', question);
    DOM.questionInput.value = '';

    // Show typing indicator
    showTypingIndicator();

    try {
        // Call Gemini API with conversation history and security token
        const answer = await askGemini(
            state.currentStory,
            state.conversationHistory,
            question,
            state.turnstileToken
        );

        state.lastQuestionTime = Date.now();

        removeTypingIndicator();

        // If API failed, display an error message
        if (answer.error) {
            console.error('Gemini API failed:', answer.error);
            // answer object usually has answer.text returned from server if it failed on purpose
            addAIChatBubble({
                type: 'error',
                text: answer.text || 'Bağlantıda bir sorun oluştu. Lütfen tekrar dene!'
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

    if (!state.isVerified) {
        addAIChatBubble({ type: 'warning', text: 'Güvenlik doğrulaması tamamlanmadı.' });
        return;
    }

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
            hintQuestion,
            state.turnstileToken
        );

        removeTypingIndicator();

        // Use AI-generated hint text, or fallback to predefined hint
        const hintText = (aiHint.error || !aiHint.text)
            ? hint
            : aiHint.text;

        addAIChatBubble({
            type: 'hint',
            text: `${hintText}`
        });

        // Add to conversation history
        state.conversationHistory.push({ role: 'user', text: hintQuestion });
        state.conversationHistory.push({ role: 'model', text: hintText });

    } catch {
        removeTypingIndicator();
        addAIChatBubble({
            type: 'hint',
            text: `💡 ${hint}`
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
        ? `İpucu İste`
        : `İpucu Kalmadı`;
}

// ============================================
// SOLUTION CHECK (GEMINI LLM)
// ============================================
async function handleCheckSolution() {
    const userSolution = DOM.solveInput.value.trim();
    if (!userSolution || state.isProcessing) return;

    if (!state.isVerified) {
        toggleModal(DOM.solveModal, false);
        addAIChatBubble({ type: 'warning', text: 'Güvenlik doğrulaması tamamlanmadı.' });
        return;
    }

    state.isProcessing = true;
    toggleModal(DOM.solveModal, false);

    addChatBubble('user', `Tahminim: ${userSolution}`);
    showTypingIndicator();

    try {
        const result = await checkSolutionWithGemini(state.currentStory, userSolution, state.turnstileToken);

        removeTypingIndicator();

        if (result.result === 'correct') {
            state.solvedStories.add(state.currentStory.id);
            localStorage.setItem('sherlock-solved', JSON.stringify([...state.solvedStories]));

            addChatBubble('system', ` ${result.text || 'Tebrikler! Doğru çözüme ulaştın!'}`);
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
    // Question count UI removed
}

// ============================================
// RESULT SCREEN
// ============================================
function showResult(solved) {
    DOM.resultIcon.textContent = '';
    DOM.resultTitle.textContent = solved ? 'Tebrikler, Dedektif!' : 'Çözüm Açıklandı';
    DOM.resultQuestions.textContent = state.questionCount;
    DOM.resultHints.textContent = state.hintsUsed > 0 ? 'Evet' : 'Hayır';
    DOM.resultDifficulty.textContent = '🧥'.repeat(state.currentStory.difficulty);
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
