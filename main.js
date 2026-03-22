document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('physioInputScreen')) {
        initBirthSelects();
    }
});

// 관상 관련 데이터
const physioData = {
    eye: [
        { type: "용의 눈 (Dragon's Eye)", desc: "눈이 크고 동자가 칠흑같이 검으니, 천하를 호령할 기상이로다." },
        { type: "봉황의 눈 (Phoenix's Eye)", desc: "눈꼬리가 길게 뻗어 있으며 총명하고 귀한 인물이 될 상이다." },
        { type: "호랑이의 눈 (Tiger's Eye)", desc: "눈이 둥글고 위엄이 서려 있어, 장군감으로 손색이 없다." }
    ],
    nose: [
        { type: "현담비(懸膽鼻)", desc: "쓸개를 매단 듯한 코. 복과 재물이 따르는 부자의 상이다." },
        { type: "사자코 (Lion's Nose)", desc: "코가 크고 콧구멍이 보이지 않으니, 재물을 지키는 힘이 강하다." }
    ],
    mouth: [
        { type: "사자구(四字口)", desc: "입이 네모반듯하여, 평생 먹을 복이 마르지 않을 상이다." },
        { type: "성주구(星朱口)", desc: "별처럼 붉고 선명한 입으로, 말재주가 뛰어나고 장차 큰 재물을 다스릴 상이로다." }
    ],
    general: [
        "재물운이 북방에서 오고 있으니, 오늘 밤 달빛을 쬐며 기운을 모으소서.",
        "귀인이 동쪽에서 나타나니, 평소 베푼 선행이 곧 큰 복으로 돌아오리이다.",
        "천부적인 재능이 꽃을 피우는 해이니, 주저하지 말고 앞으로 나아가소서.",
        "조상님의 음덕이 깊어 어떤 난관도 지혜롭게 헤쳐나갈 상이로다."
    ],
    lottoPfx: [
        "하늘이 내린 행운의 숫자는 다음과 같소이다.",
        "대박의 기운이 깃든 여섯 보물은 이러하오.",
        "관상에 비친 복권 명당의 기운이 이 숫자들에 모여 있나이다."
    ]
};

let uploadedImage = null;

function initBirthSelects() {
    const yearSelect = document.getElementById('birthYear');
    const monthSelect = document.getElementById('birthMonth');
    const daySelect = document.getElementById('birthDay');
    const currentYear = new Date().getFullYear();

    for (let i = currentYear; i >= currentYear - 100; i--) {
        yearSelect.innerHTML += `<option value="${i}">${i}년</option>`;
    }
    for (let i = 1; i <= 12; i++) {
        monthSelect.innerHTML += `<option value="${i}">${i}월</option>`;
    }
    for (let i = 1; i <= 31; i++) {
        daySelect.innerHTML += `<option value="${i}">${i}일</option>`;
    }
}

function handlePhysioFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('physioPreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
            document.getElementById('uploadLabel').style.display = 'none';
            uploadedImage = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

function startPhysioAnalysis() {
    if (!uploadedImage) {
        alert("사진을 먼저 등록하시오.");
        return;
    }

    showScreen('physioProcessScreen');
    const scanTarget = document.getElementById('scanTarget');
    if(scanTarget) scanTarget.src = uploadedImage;

    setTimeout(() => {
        generatePhysioResult();
        showScreen('physioResultScreen');
    }, 3000); // 3초간 분석하는 척
}

function generatePhysioResult() {
    const year = document.getElementById('birthYear').value;
    const month = document.getElementById('birthMonth').value;
    const day = document.getElementById('birthDay').value;

    const eye = physioData.eye[Math.floor(Math.random() * physioData.eye.length)];
    const nose = physioData.nose[Math.floor(Math.random() * physioData.nose.length)];
    const mouth = physioData.mouth[Math.floor(Math.random() * physioData.mouth.length)];
    const general = physioData.general[Math.floor(Math.random() * physioData.general.length)];
    const lottoPfx = physioData.lottoPfx[Math.floor(Math.random() * physioData.lottoPfx.length)];

    document.getElementById('resultPhoto').src = uploadedImage;
    document.getElementById('resBirth').innerText = `${year}년 ${month}월 ${day}일생`;
    document.getElementById('resSummary').innerText = `${eye.type}, ${nose.type}, ${mouth.type}`;
    document.getElementById('resEye').innerText = eye.desc;
    document.getElementById('resNose').innerText = nose.desc;
    document.getElementById('resMouth').innerText = mouth.desc;
    document.getElementById('resGeneral').innerText = general;
    document.getElementById('lottoPfx').innerText = lottoPfx;
    
    generateLottoNumbers();
}

function generateLottoNumbers() {
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    
    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
    const lottoContainer = document.getElementById('lottoNumbers');
    lottoContainer.innerHTML = '';

    sortedNumbers.forEach(num => {
        let ballClass = 'ball-0';
        if (num > 40) ballClass = 'ball-4';
        else if (num > 30) ballClass = 'ball-3';
        else if (num > 20) ballClass = 'ball-2';
        else if (num > 10) ballClass = 'ball-1';
        lottoContainer.innerHTML += `<div class="lotto-ball ${ballClass}">${num}</div>`;
    });
}

function goPhysio() {
    showScreen('physioInputScreen');
    // Reset input
    const preview = document.getElementById('physioPreview');
    preview.src = '';
    preview.style.display = 'none';
    document.getElementById('uploadLabel').style.display = 'block';
    document.getElementById('physioFile').value = '';
    uploadedImage = null;
}

// Utility to switch screens, should be available in physio.html's context
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
        screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        // Some screens are flex, others are block
        const displayStyle = targetScreen.dataset.display || 'block';
        targetScreen.style.display = displayStyle;
        targetScreen.classList.add('active');
    }
}
