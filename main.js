
import { calculateMBTI } from './components/mbti.js';
import questions from './data/questions.json' assert { type: 'json' };
import { yokaiData } from './data/yokai-data.js';

// --- App State ---
let currentQuestionIndex = 0;
let userAnswers = [];
let yokaiState = {}; // Holds the current Yokai's data
const storageKey = 'yokaiGameData';

// --- DOM Elements ---
const screen = document.getElementById('screen');
const controls = document.getElementById('controls');
const shopModal = document.getElementById('shop-modal');
const adPopup = document.getElementById('ad-popup');
const minigameCanvas = document.getElementById('minigame-canvas');

// --- Data Persistence (localStorage) ---

function saveData() {
  try {
    const dataToSave = JSON.stringify(yokaiState);
    localStorage.setItem(storageKey, dataToSave);
  } catch (error) {
    console.error("Failed to save data to localStorage:", error);
  }
}

function loadData() {
  try {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      yokaiState = JSON.parse(savedData);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to load data from localStorage:", error);
    return false;
  }
}


// --- UI Update Functions ---

function showQuestion(index) {
  const question = questions[index];
  screen.innerHTML = `
    <p class="mb-4 text-sm">${question.question}</p>
    <button class="option-btn text-xs bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-2 w-full" data-score="${question.option1.score_type}">${question.option1.text}</button>
    <button class="option-btn text-xs bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full" data-score="${question.option2.score_type}">${question.option2.text}</button>
  `;
}

function showResult() {
  const mbti = calculateMBTI(userAnswers);
  const resultYokai = yokaiData[mbti];

  screen.innerHTML = `
    <h2 class="text-xl font-bold mb-2">당신은 바로...</h2>
    <h1 class="text-2xl font-bold mb-4">${resultYokai.name}!</h1>
    <p class="mb-6 text-sm">"${resultYokai.description}"</p>
    <button id="reincarnate-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
      이 요괴로 전생하기
    </button>
  `;
}

function showTamagotchiScreen() {
    screen.innerHTML = `
      <div class="flex justify-between w-full items-start">
        <span class="text-lg font-bold">Lv. ${yokaiState.level}</span>
        <span class="text-lg font-bold">💰 ${yokaiState.coin}</span>
      </div>
      <h1 class="text-2xl font-bold my-4">${yokaiState.name}</h1>
      <div class="w-full">
        <p>배고픔: ${yokaiState.hunger}</p>
        <div class="w-full bg-gray-300 rounded-full h-4 mb-2">
            <div class="bg-green-500 h-4 rounded-full" style="width: ${yokaiState.hunger}%"></div>
        </div>
        <p>행복: ${yokaiState.happiness}</p>
        <div class="w-full bg-gray-300 rounded-full h-4">
            <div class="bg-yellow-500 h-4 rounded-full" style="width: ${yokaiState.happiness}%"></div>
        </div>
      </div>
    `;
    controls.innerHTML = `
        <button id="shop-btn" class="bg-purple-500 text-white p-2 rounded">상점</button>
        <button id="minigame-btn" class="bg-red-500 text-white p-2 rounded">엽전 받기</button>
    `;
}

// --- Event Handlers ---

function handleScreenClick(e) {
    if (e.target.classList.contains('option-btn')) {
        handleAnswer(e.target.dataset.score);
    } else if (e.target.id === 'reincarnate-btn') {
        reincarnate();
    }
}

function handleControlsClick(e) {
    if (e.target.id === 'shop-btn') openShop();
    if (e.target.id === 'minigame-btn') startMinigame();
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

  yokaiState = {
    name: yokai.name, mbti: mbti, description: yokai.description,
    hunger: 100, happiness: 100, level: 1, coin: 0,
    createdAt: new Date()
  };
  saveData();
  showTamagotchiScreen();
}

// #### Shop & Ad System ####
function openShop() { shopModal.classList.remove('hidden'); }
function closeShop() { shopModal.classList.add('hidden'); }

function showAdPopup() {
    shopModal.classList.add('hidden');
    adPopup.classList.remove('hidden');
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
            timerEl.textContent = '광고 끝!';
            rewardBtn.disabled = false;
        }
    }, 1000);
}

function claimAdReward() {
    adPopup.classList.add('hidden');
    yokaiState.hunger = Math.min(100, yokaiState.hunger + 50); // Restore 50 hunger
    saveData();
    showTamagotchiScreen();
}

// #### Minigame ####
function startMinigame() { /* Minigame logic from previous step, unchanged */ }

// --- Initial Load ---

function init() {
    // Set up global event listeners
    screen.addEventListener('click', handleScreenClick);
    controls.addEventListener('click', handleControlsClick);
    document.getElementById('close-shop-btn').addEventListener('click', closeShop);
    document.getElementById('buy-potion-btn').addEventListener('click', showAdPopup);
    document.getElementById('watch-ad-btn').addEventListener('click', claimAdReward);

    // Check for existing Yokai data in localStorage
    if (loadData()) {
        showTamagotchiScreen();
    } else {
        showQuestion(currentQuestionIndex);
    }
}

// Start the application
init();
