const translations = {};
let currentLanguage = 'ko';

async function loadTranslations(lang) {
    const response = await fetch(`data/${lang}.json`);
    translations[lang] = await response.json();
}

function translateElement(element) {
    const key = element.dataset.i18n;
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
        element.innerHTML = translations[currentLanguage][key];
    }
}

export async function setLocale(lang) {
    if (!translations[lang]) {
        await loadTranslations(lang);
    }
    currentLanguage = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(translateElement);
    
    // Update language buttons state
    document.getElementById('lang-ko').classList.toggle('active', lang === 'ko');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
}
