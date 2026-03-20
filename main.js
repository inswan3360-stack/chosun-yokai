import { calculateMBTI } from './components/mbti.js';
import { yokaiData } from './data/yokai-data.js';
import { setLocale } from './i18n.js';

// --- Global Game State & Constants (from original inline script) ---
window.gS = window.gS || {}; // Main game state object
window.STORAGE_KEY = 'chosun_yokai_save';
window.ENCY_KEY = 'chosun_yokai_ency';
window.TUTORIAL_KEY = 'chosun_yokai_tut';

// Audio related global variables
window.AC = null;
window.mst = null;
window.anl = null;
window.audioVol = 0.7;
window.audioOn = 1;
window.curSong = 0;
window.aPool = [];
window.schedTimer = null;
window.beatTimer = null;
window.seqPos = [0, 0, 0];
window.beatBase = 0;
window.songBPM = 160;

// Canvas contexts and related
let titleCtx, resultCtx, sceneCtx, archCtx, riddleCtx, yutCtx, ascendCtx, encyDetCtx;
let currentCharacterImage = new Image(); // For drawing character

// --- App State (from original main.js) ---
let questions; // Dynamically loaded questions
let currentQuestionIndex = 0;
let userAnswers = [];
let yokaiState = {}; // Holds the current Yokai's data

// --- DOM Elements (from original main.js) ---
const titleScreen = document.getElementById('titleScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const gameScreen = document.getElementById('gameScreen');
const ascendScreen = document.getElementById('ascendScreen');
const encyclopediaScreen = document.getElementById('encyclopediaScreen');
const tutorialPopup = document.getElementById('tutorialPopup');

// --- Helper function to switch screens ---
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    drawScreen(screenId); // Redraw content for the new screen
}

// --- Canvas Initialization ---
function initCanvas() {
    titleCtx = document.getElementById('titleCv').getContext('2d');
    resultCtx = document.getElementById('resultCv').getContext('2d');
    sceneCtx = document.getElementById('sceneCv').getContext('2d');
    archCtx = document.getElementById('archCv').getContext('2d');
    riddleCtx = document.getElementById('riddleCv').getContext('2d');
    yutCtx = document.getElementById('yutCv').getContext('2d');
    ascendCtx = document.getElementById('ascendCv').getContext('2d');
    encyDetCtx = document.getElementById('encyDetCv').getContext('2d');

    // Load a placeholder character image
    currentCharacterImage.src = 'assets/images/yokai_placeholder.png'; // Assuming a placeholder image exists
    currentCharacterImage.onload = () => {
        drawScreen(document.querySelector('.screen.active').id); // Redraw active screen once image is loaded
    };
}

// --- Drawing Function (Placeholder) ---
function drawCharacter(ctx, yokaiId) {
    if (!ctx || !currentCharacterImage.complete) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Draw placeholder image for now
    ctx.drawImage(currentCharacterImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
    // In a real game, you would draw specific yokai based on yokaiId and yokaiState
}

function drawScreen(screenId) {
    switch (screenId) {
        case 'titleScreen':
            // Example drawing on title screen canvas
            if (titleCtx) {
                titleCtx.clearRect(0, 0, titleCtx.canvas.width, titleCtx.canvas.height);
                titleCtx.fillStyle = 'darkgreen';
                titleCtx.fillRect(0, 0, titleCtx.canvas.width, titleCtx.canvas.height);
                titleCtx.fillStyle = 'white';
                titleCtx.font = '20px Arial';
                titleCtx.textAlign = 'center';
                titleCtx.fillText('Title Screen (Drawing Placeholder)', titleCtx.canvas.width / 2, titleCtx.canvas.height / 2);
            }
            break;
        case 'resultScreen':
            if (resultCtx && yokaiState.name) {
                drawCharacter(resultCtx, yokaiState.mbti);
            }
            break;
        case 'gameScreen':
            if (sceneCtx && yokaiState.name) {
                drawCharacter(sceneCtx, yokaiState.mbti);
            }
            break;
        // Add drawing logic for other screens as needed
    }
}

// --- Game Logic Functions (re-implemented from original inline script & main.js) ---

// DATA PERSISTENCE
window.saveGame = function() {
    // ... (rest of the saveGame function)
    if (!window.gS || !window.gS.yk) return;
    var saveData = { gS: window.gS, mgPlays: window.mgPlays, mgAdUsed: window.mgAdUsed, adCooldown: window.adCooldown, adWatchCount: window.adWatchCount, curSong: window.curSong };
    try { localStorage.setItem(window.STORAGE_KEY, JSON.stringify(saveData)); } catch (e) { console.error("Error saving game:", e); }
};
window.loadGameData = function() {
    // ... (rest of the loadGameData function)
    try {
        var d = localStorage.getItem(window.STORAGE_KEY);
        if (d) {
            const loadedData = JSON.parse(d);
            window.gS = loadedData.gS;
            window.mgPlays = loadedData.mgPlays;
            window.mgAdUsed = loadedData.mgAdUsed;
            window.adCooldown = loadedData.adCooldown;
            window.adWatchCount = loadedData.adWatchCount;
            window.curSong = loadedData.curSong;
            return true;
        }
    } catch (e) { console.error("Error loading game data:", e); }
    return null;
};
window.clearGameData = function() {
    // ... (rest of the clearGameData function)
    try { localStorage.removeItem(window.STORAGE_KEY); } catch (e) { console.error("Error clearing game data:", e); }
};
window.saveEncy = function(id) {
    // ... (rest of the saveEncy function)
    try {
        var ency = window.loadEncy();
        if (ency.indexOf(id) < 0) {
            ency.push(id);
            localStorage.setItem(window.ENCY_KEY, JSON.stringify(ency));
        }
    } catch (e) { console.error("Error saving encyclopedia entry:", e); }
};
window.loadEncy = function() {
    // ... (rest of the loadEncy function)
    try {
        var d = localStorage.getItem(window.ENCY_KEY);
        return d ? JSON.parse(d) : [];
    } catch (e) { console.error("Error loading encyclopedia:", e); return []; }
};

// AUDIO ENGINE
window.initAudio = function() {
    // ... (rest of the initAudio function)
    if (window.AC) { if (window.AC.state === 'suspended') window.AC.resume(); return; }
    window.AC = new (window.AudioContext || window.webkitAudioContext)();
    window.mst = window.AC.createGain(); window.mst.gain.value = window.audioVol;
    window.anl = window.AC.createAnalyser(); window.anl.fftSize = 256; window.anl.smoothingTimeConstant = 0.6;
    window.mst.connect(window.anl); window.anl.connect(window.AC.destination);
};

window.toggleMusic = function() {
    window.audioOn = 1 - window.audioOn;
    console.log('toggleMusic called, audioOn:', window.audioOn);
    // Implement actual music toggle logic here
};

window.playSong = function(id) {
    window.curSong = id;
    console.log('playSong called with id:', id);
    // Implement actual song playing logic here
};

window.setVol = function(val) {
    window.audioVol = val / 100;
    if (window.mst) {
        window.mst.gain.value = window.audioVol;
    }
    document.getElementById('volNum').textContent = val;
    console.log('setVol called with val:', val);
};

window.handleTitleClick = function() {
    console.log('handleTitleClick called - should navigate or start quiz');
    window.goQuiz();
};

window.goQuiz = function() {
    console.log('goQuiz called');
    switchScreen('quizScreen');
    currentQuestionIndex = 0;
    userAnswers = [];
    showQuestion(currentQuestionIndex);
};

window.startGame = function() {
    console.log('startGame called');
    switchScreen('gameScreen');
    // Additional game start logic if needed
};

window.retryQuiz = function() {
    console.log('retryQuiz called');
    currentQuestionIndex = 0;
    userAnswers = [];
    switchScreen('quizScreen');
    showQuestion(currentQuestionIndex);
};

window.openEncyclopedia = function() {
    console.log('openEncyclopedia called');
    switchScreen('encyclopediaScreen');
    // Populate encyclopedia if needed
};

window.goTitle = function() {
    console.log('goTitle called');
    switchScreen('titleScreen');
    // Reset any game state if needed when returning to title
};

window.shareKakao = function() { console.log('shareKakao called'); };
window.saveForInstagram = function() { console.log('saveForInstagram called'); };
window.shareWeb = function() { console.log('shareWeb called'); };
window.petTap = function() { console.log('petTap called'); };
window.switchTab = function(id) { console.log('switchTab called with id:', id); };
window.doAct = function(act) { console.log('doAct called with act:', act); };
window.watchAd = function() { console.log('watchAd called'); };
window.openMG = function(id) { console.log('openMG called with id:', id); };
window.archShoot = function() { console.log('archShoot called'); };
window.closeMG = function() { console.log('closeMG called'); };
window.buyItem = function(item, price) { console.log('buyItem called with item:', item, 'price:', price); };
window.shareKakaoAscend = function() { console.log('shareKakaoAscend called'); };
window.tutPrev = function() { console.log('tutPrev called'); };
window.tutNext = function() { console.log('tutNext called'); };


// --- App State Functions (from original main.js) ---

function showQuestion(index) {
  const question = questions[index];
  document.getElementById('qQuestion').innerHTML = question.question; // Update question text
  const qOpts = document.getElementById('qOpts');
  qOpts.innerHTML = ''; // Clear previous options

  const option1Btn = document.createElement('button');
  option1Btn.classList.add('quiz-opt');
  option1Btn.dataset.score = question.option1.score_type;
  option1Btn.textContent = question.option1.text;
  option1Btn.onclick = (e) => handleAnswer(e.target.dataset.score);
  qOpts.appendChild(option1Btn);

  const option2Btn = document.createElement('button');
  option2Btn.classList.add('quiz-opt');
  option2Btn.dataset.score = question.option2.score_type;
  option2Btn.textContent = question.option2.text;
  option2Btn.onclick = (e) => handleAnswer(e.target.dataset.score);
  qOpts.appendChild(option2Btn);
}

function showResult() {
  const mbti = calculateMBTI(userAnswers);
  const resultYokai = yokaiData[mbti];
  const lang = document.documentElement.lang;

  document.getElementById('ldResultHead').textContent = (lang === 'ko' ? "당신의 전생 요괴" : "Your Past Life Yokai");
  document.getElementById('rName').textContent = resultYokai.name[lang];
  document.getElementById('rDesc').textContent = resultYokai.description[lang];
  document.getElementById('rBadge').textContent = mbti; // Assuming rBadge shows MBTI type

  switchScreen('resultScreen');
  drawScreen('resultScreen');
}

function showTamagotchiScreen() {
    // This part still uses screen.innerHTML, consider refactoring with specific element updates
    // For now, let's just make sure it switches the screen and redraws if necessary
    switchScreen('gameScreen');
    drawScreen('gameScreen');
}

// --- Event Handlers (from original main.js) ---

function handleScreenClick(e) {
    // This function needs to be updated to target elements inside currently active screen
    // For quiz options, it's better to add event listeners directly to buttons in showQuestion
    // This function will be removed as onclicks are now directly calling global functions
}

function handleControlsClick(e) {
    // This function will be removed as onclicks are now directly calling global functions
}

function handleAnswer(score) {
  userAnswers.push(score);
  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    showQuestion(currentQuestionIndex);
  } else {
    showResult();
  }
}

function reincarnate() {
  const mbti = calculateMBTI(userAnswers);
  const yokai = yokaiData[mbti];
  const lang = document.documentElement.lang;

  yokaiState = {
    name: yokai.name[lang], 
    mbti: mbti, 
    description: yokai.description[lang],
    hunger: 100, 
    happiness: 100, 
    level: 1, 
    coin: 0,
    createdAt: new Date()
  };
  window.gS.yk = yokaiState; // Store current yokaiState in global gS
  window.saveGame(); // Save the new game state
  showTamagotchiScreen();
}

// #### Shop & Ad System ####
window.openShop = function() { document.getElementById('shop-modal').classList.remove('hidden'); };
window.closeShop = function() { document.getElementById('shop-modal').classList.add('hidden'); };

window.showAdPopup = function() {
    window.closeShop();
    document.getElementById('ad-popup').classList.remove('hidden');
    let timeLeft = 10;
    const timerEl = document.getElementById('ad-timer');
    const rewardBtn = document.getElementById('watch-ad-btn');
    timerEl.textContent = timeLeft;
    rewardBtn.disabled = true;

    const adInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(adInterval);
            timerEl.textContent = (document.documentElement.lang === 'ko' ? '광고 끝!' : 'Ad Finished!');
            rewardBtn.disabled = false;
        }
    }, 1000);
};

window.claimAdReward = function() {
    document.getElementById('ad-popup').classList.add('hidden');
    // Update yokaiState, assuming it's part of window.gS
    if (window.gS.yk) {
        window.gS.yk.hunger = Math.min(100, window.gS.yk.hunger + 50); // Restore 50 hunger
        window.saveGame();
        showTamagotchiScreen();
    }
};

// #### Minigame ####
window.startMinigame = function() { console.log('startMinigame called'); /* Minigame logic from previous step, unchanged */ };


// --- Initial Load ---
async function init() {
    // Event listeners are now mostly handled by direct onclick calls to global functions
    // and specific handlers for quiz options.
    // Removed general screen.addEventListener and controls.addEventListener.

    // Initialize canvas contexts
    initCanvas();

    const lang = document.documentElement.lang || 'ko';
    const response = await fetch(`data/questions_${lang}.json`);
    questions = await response.json();

    // Check for existing Yokai data in localStorage
    if (window.loadGameData()) { // Use window.loadGameData
        // If data loaded successfully, restore yokaiState from gS
        yokaiState = window.gS.yk; // Assuming yokaiState is part of gS
        showTamagotchiScreen();
    } else {
        switchScreen('titleScreen'); // Start at title screen if no saved game
    }
}

window.setLanguage = async (lang) => {
  await setLocale(lang);
  await init(); // Re-initialize after language change to load correct questions and re-render
  document.getElementById('ldResultHead').textContent = (lang === 'ko' ? "당신의 전생 요괴" : "Your Past Life Yokai");
  // Update other specific ID-based texts
  document.getElementById('ldGameDesc').textContent = (lang === 'ko' ? "🎮 이런 게임입니다" : "🎮 Game Overview");
  document.getElementById('ldC1T').textContent = (lang === 'ko' ? "🔮 MBTI 전생 검사" : "🔮 MBTI Reincarnation Test");
  document.getElementById('ldC1D').textContent = (lang === 'ko' ? "조선시대 황당한 상황 20문항! 당신의 전생 요괴를 찾아드립니다" : "20 absurd situations in the Joseon Dynasty! Find your past life Yokai.");
  document.getElementById('ldC2T').textContent = (lang === 'ko' ? "🐉 요괴 육성 RPG" : "🐉 Yokai Growth RPG");
  document.getElementById('ldC2D').textContent = (lang === 'ko' ? "16종 요괴를 7단계로 성장시켜 신수로 승천시키세요" : "Grow 16 types of Yokai through 7 stages to ascend them into divine beasts.");
  document.getElementById('ldC3T').textContent = (lang === 'ko' ? "⚔️ 조선 미니게임" : "⚔️ Joseon Mini-Games");
  document.getElementById('ldC3D').textContent = (lang === 'ko' ? "활쏘기·수수께끼·윷놀이로 엽전과 경험치를 획득하세요" : "Earn coins and experience through archery, riddles, and Yut Nori.");
  document.getElementById('ldC4T').textContent = (lang === 'ko' ? "📊 상세 성향 분석" : "📊 Detailed Analysis");
  document.getElementById('ldC4D').textContent = (lang === 'ko' ? "조선·현대 해석 + 강점·약점·궁합까지 완전 분석!" : "Complete analysis from Joseon and modern interpretations to strengths, weaknesses, and compatibility!");
  document.getElementById('ldBtnQuiz').textContent = (lang === 'ko' ? "⚔ 전생을 알아보러 가기" : "⚔ Find out your past life");
  document.getElementById('continueBtn').textContent = (lang === 'ko' ? "📜 이전 수련 이어하기" : "📜 Continue previous training");
  document.getElementById('ldBtnEncy').textContent = (lang === 'ko' ? "📖 영혼 도감 보기" : "📖 View Spirit Tome");
  
  // Game screen elements
  document.getElementById('gTitle').textContent = (lang === 'ko' ? "조선 요괴 전생기" : "Chosun Yokai Reincarnation");
  document.getElementById('ldHu').textContent = (lang === 'ko' ? "🍚 배고픔" : "🍚 Hunger");
  document.getElementById('ldHa').textContent = (lang === 'ko' ? "😊 행복" : "😊 Happiness");
  document.getElementById('ldHe').textContent = (lang === 'ko' ? "💊 건강" : "💊 Health");
  document.getElementById('ldMg').textContent = (lang === 'ko' ? "🔮 영력" : "🔮 Magic Power");
  document.getElementById('ldFm').textContent = (lang === 'ko' ? "💋 친밀" : "💋 Affection");
  document.getElementById('ldEd').textContent = (lang === 'ko' ? "📚 학식" : "📚 Knowledge");
  document.getElementById('ldTab0').textContent = (lang === 'ko' ? "🏠 돌보기" : "🏠 Care");
  document.getElementById('ldTab1').textContent = (lang === 'ko' ? "🎮 미니게임" : "🎮 Minigame");
  document.getElementById('ldTab2').textContent = (lang === 'ko' ? "🏪 상점" : "🏪 Shop");
  document.getElementById('ldTab3').textContent = (lang === 'ko' ? "📜 일지" : "📜 Log");
  document.getElementById('sleepLbl').textContent = (lang === 'ko' ? "재우기" : "Sleep");
  document.getElementById('ldEarn').textContent = (lang === 'ko' ? "엽전벌기" : "Earn Coins");
  document.getElementById('ldRitual').textContent = (lang === 'ko' ? "제례의식" : "Ritual");
  
  document.getElementById('adBtn').textContent = (lang === 'ko' ? "📺 광고 보고 엽전 50냥 + XP 20 받기!" : "📺 Watch Ad: Get 50 Coins + 20 XP!");
  
  document.getElementById('ldMgTitle').textContent = (lang === 'ko' ? "⚔️ 조선 미니게임" : "⚔️ Joseon Minigames");
  document.getElementById('ldMg0N').textContent = (lang === 'ko' ? "활쏘기" : "Archery");
  document.getElementById('ldMg0S').textContent = (lang === 'ko' ? "반응속도" : "Reaction Speed");
  document.getElementById('ldMg1N').textContent = (lang === 'ko' ? "수수께끼" : "Riddle");
  document.getElementById('ldMg1S').textContent = (lang === 'ko' ? "지식·추리" : "Knowledge/Reasoning");
  document.getElementById('ldMg2N').textContent = (lang === 'ko' ? "윷놀이" : "Yut Nori");
  document.getElementById('ldMg2S').textContent = (lang === 'ko' ? "운·전략" : "Luck/Strategy");
  document.getElementById('ldMgInfo').textContent = (lang === 'ko' ? "소진 시 광고로 1회 추가" : "Watch Ad for 1 more play");
  
  document.getElementById('archBtn').textContent = (lang === 'ko' ? "🏹 쏘다!" : "🏹 Shoot!");
  document.getElementById('archResult').textContent = (lang === 'ko' ? "조준하고 버튼을 누르세요!" : "Aim and press the button!");
  document.getElementById('riddleResult').textContent = (lang === 'ko' ? "" : ""); // Empty for riddles
  document.getElementById('yutBtn').textContent = (lang === 'ko' ? "🎲 윷 던지기!" : "🎲 Throw Yut!");
  document.getElementById('yutResult').textContent = (lang === 'ko' ? "윷을 던져보세요!" : "Throw the Yut sticks!");
  document.getElementById('ldShopTitle').textContent = (lang === 'ko' ? "🏪 저잣거리 상점" : "🏪 Marketplace Shop");
  
  document.getElementById('sp_food').nextElementSibling.textContent = (lang === 'ko' ? "고기" : "Meat");
  document.getElementById('sp_rice').nextElementSibling.textContent = (lang === 'ko' ? "쌀" : "Rice");
  document.getElementById('sp_herb').nextElementSibling.textContent = (lang === 'ko' ? "한약" : "Herbal Medicine");
  document.getElementById('sp_toy').nextElementSibling.textContent = (lang === 'ko' ? "팽이" : "Spinning Top");
  document.getElementById('sp_scroll').nextElementSibling.textContent = (lang === 'ko' ? "서책" : "Book Scroll");
  document.getElementById('sp_incense').nextElementSibling.textContent = (lang === 'ko' ? "향초" : "Incense");
  document.getElementById('sp_hat').nextElementSibling.textContent = (lang === 'ko' ? "갓" : "Hat");
  document.getElementById('sp_fan').nextElementSibling.textContent = (lang === 'ko' ? "부채" : "Fan");
  document.getElementById('sp_mask').nextElementSibling.textContent = (lang === 'ko' ? "탈" : "Mask");
  document.getElementById('sp_potion').nextElementSibling.textContent = (lang === 'ko' ? "영약" : "Elixir");
  document.getElementById('sp_gem').nextElementSibling.textContent = (lang === 'ko' ? "보석" : "Gem");
  document.getElementById('sp_egg').nextElementSibling.textContent = (lang === 'ko' ? "요괴알" : "Yokai Egg");

  document.getElementById('ldLogTitle').textContent = (lang === 'ko' ? "📜 요괴 일지" : "📜 Yokai Log");
  document.getElementById('ldStatusTitle').textContent = (lang === 'ko' ? "📊 현황" : "📊 Status");
  document.getElementById('ascendTitle').textContent = (lang === 'ko' ? "승천" : "Ascension");
  document.getElementById('ldAscendBack').textContent = (lang === 'ko' ? "타이틀로 돌아가기" : "Back to Title");
  document.getElementById('ldEncyTitle').textContent = (lang === 'ko' ? "영혼 도감" : "Spirit Tome");
  document.getElementById('ldEncyLabel').textContent = (lang === 'ko' ? "수집 달성" : "Collection Achieved");
  
};

// --- Initial Load ---
async function init() {
    initCanvas(); // Initialize canvas contexts

    const lang = document.documentElement.lang || 'ko';
    // This is where setLocale from i18n.js is effectively called
    // We update all static text based on selected language
    // The fetch for questions is done here as well
    const response = await fetch(`data/questions_${lang}.json`);
    questions = await response.json();

    // Check for existing Yokai data in localStorage
    if (window.loadGameData()) { // Use window.loadGameData
        yokaiState = window.gS.yk; // Assuming yokaiState is part of window.gS
        showTamagotchiScreen();
    } else {
        switchScreen('titleScreen'); // Start at title screen if no saved game
    }
}

// Ensure init is called after DOMContentLoaded for initial setup
document.addEventListener('DOMContentLoaded', async () => {
    // Initial language setup. setLocale will also call init() implicitly
    // after setting up translations and updating elements.
    const userLang = navigator.language.split('-')[0];
    const initialLang = ['ko', 'en'].includes(userLang) ? userLang : 'ko';
    await window.setLanguage(initialLang); // Call the global setLanguage which wraps setLocale and init
});
