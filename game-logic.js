// ════════════════════════════════════════════════════════════
    //  DATA PERSISTENCE
    // ════════════════════════════════════════════════════════════
    var STORAGE_KEY = 'chosun_yokai_save', ENCY_KEY = 'chosun_yokai_ency', TUTORIAL_KEY = 'chosun_yokai_tut';
    function saveGame() {
      if (!gS || !gS.yk) return;
      var saveData = { gS: gS, mgPlays: mgPlays, mgAdUsed: mgAdUsed, adCooldown: adCooldown, adWatchCount: adWatchCount, curSong: curSong };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData)); } catch (e) { }
    }
    function loadGameData() {
      try { var d = localStorage.getItem(STORAGE_KEY); if (d) return JSON.parse(d); } catch (e) { } return null;
    }
    function clearGameData() {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) { }
    }
    function saveEncy(id) {
      try { var ency = loadEncy(); if (ency.indexOf(id) < 0) { ency.push(id); localStorage.setItem(ENCY_KEY, JSON.stringify(ency)); } } catch (e) { }
    }
    function loadEncy() {
      try { var d = localStorage.getItem(ENCY_KEY); return d ? JSON.parse(d) : []; } catch (e) { return []; }
    }

    // ════════════════════════════════════════════════════════════
    //  AUDIO ENGINE — 8BIT CHIPTUNE
    // ════════════════════════════════════════════════════════════
    var AC, mst, anl;
    var audioVol = 0.7, audioOn = 1, curSong = 0;
    var aPool = [], schedTimer = null, beatTimer = null;
    var seqPos = [0, 0, 0], seqNextT = 0, beatBase = 0, songBPM = 160;

    function initAudio() {
      if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
      AC = new (window.AudioContext || window.webkitAudioContext)();
      mst = AC.createGain(); mst.gain.value = audioVol;
      anl = AC.createAnalyser(); anl.fftSize = 256; anl.smoothingTimeConstant = 0.6;
      mst.connect(anl); anl.connect(AC.destination);
    }

    // Expose functions to the global scope
    window.saveGame = saveGame;
    window.loadGameData = loadGameData;
    window.clearGameData = clearGameData;
    window.saveEncy = saveEncy;
    window.loadEncy = loadEncy;
    window.initAudio = initAudio;
    // Add other functions from original index.html if they exist and are used in onclick
    // For now, I'm assuming these are the only relevant ones. I'll add more as I find them.
    window.toggleMusic = function() { console.log('toggleMusic called'); }; // Placeholder
    window.handleTitleClick = function() { console.log('handleTitleClick called'); }; // Placeholder
    window.goQuiz = function() { console.log('goQuiz called'); }; // Placeholder
    window.continueGame = function() { console.log('continueGame called'); }; // Placeholder
    window.openEncyclopedia = function() { console.log('openEncyclopedia called'); }; // Placeholder
    window.playSong = function(id) { console.log('playSong called with id:', id); }; // Placeholder
    window.setVol = function(val) { console.log('setVol called with val:', val); }; // Placeholder
    window.startGame = function() { console.log('startGame called'); }; // Placeholder
    window.retryQuiz = function() { console.log('retryQuiz called'); }; // Placeholder
    window.shareKakao = function() { console.log('shareKakao called'); }; // Placeholder
    window.saveForInstagram = function() { console.log('saveForInstagram called'); }; // Placeholder
    window.shareWeb = function() { console.log('shareWeb called'); }; // Placeholder
    window.petTap = function() { console.log('petTap called'); }; // Placeholder
    window.switchTab = function(id) { console.log('switchTab called with id:', id); }; // Placeholder
    window.doAct = function(act) { console.log('doAct called with act:', act); }; // Placeholder
    window.watchAd = function() { console.log('watchAd called'); }; // Placeholder
    window.openMG = function(id) { console.log('openMG called with id:', id); }; // Placeholder
    window.archShoot = function() { console.log('archShoot called'); }; // Placeholder
    window.closeMG = function() { console.log('closeMG called'); }; // Placeholder
    window.buyItem = function(item, price) { console.log('buyItem called with item:', item, 'price:', price); }; // Placeholder
    window.shareKakaoAscend = function() { console.log('shareKakaoAscend called'); }; // Placeholder
    window.goTitle = function() { console.log('goTitle called'); }; // Placeholder
    window.tutPrev = function() { console.log('tutPrev called'); }; // Placeholder
    window.tutNext = function() { console.log('tutNext called'); }; // Placeholder