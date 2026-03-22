const fs = require('fs');
let code = fs.readFileSync('yokai.html', 'utf8');

const t1 =     function initYokaiSprites() {
      if (typeof YOKAI === 'undefined') return;
      artist.cache.clear(); // 항상 새로 그리기
      sLoader.sprites.clear();
      sLoader.totalToLoad = 0; sLoader.loadingCount = 0;
      YOKAI.forEach(yk => {
        const img = artist.generate(yk.id);
        if (img) {
          sLoader.sprites.set(yk.id + "_sprite", img);
          sLoader.totalToLoad++;
          if (img.complete) sLoader.loadingCount++;
          else img.onload = () => sLoader.loadingCount++;
        }
      });
    };

const r1 =     function initYokaiSprites() {
      if (typeof YOKAI === 'undefined') return;
      sLoader.sprites.clear();
      
      const img = new Image();
      img.src = "assets/sprites/cute_spritesheet.png";
      
      sLoader.totalToLoad = 16;
      sLoader.loadingCount = 0;
      
      img.onload = () => {
        const cellW = Math.floor(img.width / 4);
        const cellH = Math.floor(img.height / 4);
        
        for (let i = 0; i < 16; i++) {
          if (i >= YOKAI.length) break;
          const yk = YOKAI[i];
          const col = i % 4;
          const row = Math.floor(i / 4);
          
          const tempCv = document.createElement('canvas');
          tempCv.width = cellW;
          tempCv.height = cellH;
          const tCtx = tempCv.getContext('2d', { willReadFrequently: true });
          
          tCtx.clearRect(0, 0, cellW, cellH);
          tCtx.drawImage(img, col * cellW, row * cellH, cellW, cellH, 0, 0, cellW, cellH);
          
          try {
            const imgData = tCtx.getImageData(0, 0, cellW, cellH);
            const data = imgData.data;
            const bgR = data[0], bgG = data[1], bgB = data[2];
            for (let j = 0; j < data.length; j += 4) {
               const r = data[j], g = data[j+1], b = data[j+2];
               if (r > 150 && g < 100 && b > 150) {
                 data[j+3] = 0; 
               } else if (Math.abs(r - bgR) < 30 && Math.abs(g - bgG) < 30 && Math.abs(b - bgB) < 30) {
                 data[j+3] = 0; 
               } else if (r > 100 && g < 130 && b > 100) {
                 const dist = Math.abs(r - 255) + Math.abs(g - 0) + Math.abs(b - 255);
                 if (dist < 200) data[j+3] = Math.max(0, data[j+3] - (200 - dist));
               }
            }
            tCtx.putImageData(imgData, 0, 0);
          } catch(e) {
            console.warn("Could not remove background:", e);
          }
          const finalImg = new Image();
          finalImg.onload = () => sLoader.loadingCount++;
          finalImg.src = tempCv.toDataURL("image/png");
          sLoader.sprites.set(yk.id + "_sprite", finalImg);
        }
      };
    };

const t2 =     function drawYokai(ctx, yk, stage, t, ox, oy, extraAnim) {
      if (!ctx || !yk) return;

      // ── 동적 진화 설정 (Dynamic Evolution) ? 캐릭터 확대 ──
      var evoScMap = [0.8, 1.1, 1.4, 1.7, 2.0, 2.3, 2.6];
      var scFactor = evoScMap[Math.min(stage, 6)];
      var baseSc = STAGE_SCALES[Math.min(stage, 6)];
      var alpha = 1;
      // filter 사용 안 함 (globalAlpha로 대체)

      if (stage === 0) { drawSoul(ctx, yk, t, ox, oy, baseSc); return; }
      if (stage === 1) { alpha = 0.4; }
      if (stage === 2) { alpha = 0.75; }
      // stage 4: 오라는 파티클로 표현
      // stage 5: 오라는 파티클로 표현
      // stage 6: 오라는 파티클로 표현

      var bobY = Math.sin(t * 2) * 3;
      var scaleX = scFactor, scaleY = scFactor;
      var rotX = 0;

      // 액션별 애니메이션 보정
      if (extraAnim) {
        var a = extraAnim, at = a.t;
        if (a.act === 'feed') { var s = 1 + Math.abs(Math.sin(at * 8)) * 0.12; scaleX *= s; scaleY *= s; }
        else if (a.act === 'play') { bobY += Math.abs(Math.sin(at * 6)) * (-20); rotX = Math.sin(at * 5) * 0.25; }
        else if (a.act.startsWith('tap_')) {
          if (a.act === 'tap_E') { bobY += Math.abs(Math.sin(at * 7)) * (-25); scaleX *= 1.2; }
          else if (a.act === 'tap_N') { rotX = Math.sin(at * 8) * 0.4; scaleX *= 1.15; }
          else { scaleX *= 1.1; scaleY *= 1.1; }
        }
      }

      ctx.save();
      // ctx.filter 대신 globalAlpha만 사용 (크로스브라우저 안전)
      ctx.globalAlpha = alpha;

      // 64x64 기준 중심점 (ox+32, oy+32)
      var cx = ox + 32;
      var cy = oy + 32;
      ctx.translate(cx, cy + bobY);
      ctx.scale(scaleX, scaleY);
      if (rotX) ctx.rotate(rotX);
      ctx.translate(-cx, -cy - bobY);

      // 이미지 렌더링 (DigitalArtist 기반 고성능 64x64)
      var spriteId = yk.id + "_sprite";
      var img = sLoader.get(spriteId);

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, ox, oy, 64, 64); // 96px 스프라이트를 64px로 축소 렌더
      } else {
        // 이미지 로딩 중일 경우 대비한 기본 형태
        ctx.fillStyle = yk.bc;
        ctx.beginPath();
        ctx.arc(ox + 32, oy + 40, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 단계별 오라 효과 (ctx.filter 대체) ──
      if (stage >= 4) {
        var puls = Math.sin(t * 3) * 0.12 + 0.18;
        ctx.globalAlpha = puls;
        for (var _a = 0; _a < 12; _a++) {
          var _ang = _a / 12 * Math.PI * 2 + t * 0.6;
          var _r = 26 + Math.sin(t * 2 + _a) * 5;
          ctx.fillStyle = stage >= 5 ? '#f8d060' : yk.gc;
          ctx.fillRect(ox + 32 + Math.cos(_ang) * _r - 2, oy + 32 + Math.sin(_ang) * _r * 0.55 - 2, 4, 4);
        }
        ctx.globalAlpha = 1;
      };

const r2 =     function drawYokai(ctx, yk, stage, t, ox, oy, extraAnim) {
      if (!ctx || !yk) return;

      var evoScMap = [0.8, 1.1, 1.4, 1.7, 2.0, 2.3, 2.6];
      var scFactor = evoScMap[Math.min(stage, 6)];
      var baseSc = STAGE_SCALES[Math.min(stage, 6)];
      if (stage === 0) { drawSoul(ctx, yk, t, ox, oy, baseSc); return; }

      var alpha = 1;
      var filt = "none";
      if (stage === 1) { alpha = 0.5; filt = "grayscale(100%) blur(1px)"; }
      else if (stage === 2) { alpha = 0.8; filt = "sepia(100%) hue-rotate(180deg)"; }
      else if (stage === 4) { filt = "brightness(130%) contrast(120%)"; }
      else if (stage === 5) { filt = "drop-shadow(0 0 8px gold) sepia(40%) saturate(150%)"; }
      else if (stage === 6) { filt = "drop-shadow(0 0 15px white) brightness(150%)"; }

      var bobY = Math.sin(t * 2) * 3;
      var scaleX = scFactor, scaleY = scFactor;
      var rotX = 0;

      if (extraAnim) {
        var a = extraAnim, at = a.t;
        if (a.act === 'feed') { var s = 1 + Math.abs(Math.sin(at * 8)) * 0.12; scaleX *= s; scaleY *= s; }
        else if (a.act === 'play') { bobY += Math.abs(Math.sin(at * 6)) * (-20); rotX = Math.sin(at * 5) * 0.25; }
        else if (a.act.startsWith('tap_')) {
          if (a.act === 'tap_E') { bobY += Math.abs(Math.sin(at * 7)) * (-25); scaleX *= 1.2; }
          else if (a.act === 'tap_N') { rotX = Math.sin(at * 8) * 0.4; scaleX *= 1.15; }
          else { scaleX *= 1.1; scaleY *= 1.1; }
        }
      }

      var isWalking = (typeof petWalkVX !== 'undefined' && Math.abs(petWalkVX) > 0.05);
      if (isWalking) {
         bobY += Math.abs(Math.sin(t * 15)) * 8; 
         rotX += Math.sin(t * 10) * 0.12; 
         if (typeof petWalkDir !== 'undefined' && petWalkDir < 0) scaleX *= -1; 
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.filter = filt; 

      var cx = ox + 32;
      var cy = oy + 32;
      ctx.translate(cx, cy + bobY);
      ctx.scale(scaleX, scaleY);
      if (rotX) ctx.rotate(rotX);
      ctx.translate(-cx, -cy - bobY);

      var spriteId = yk.id + "_sprite";
      var img = sLoader.get(spriteId);

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, ox, oy, 64, 64);
      } else {
        ctx.fillStyle = yk.bc || '#000';
        ctx.beginPath();
        ctx.arc(ox + 32, oy + 40, 20, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      if (stage >= 4) {
        ctx.save();
        var puls = Math.sin(t * 3) * 0.15 + 0.2;
        ctx.globalAlpha = puls;
        var pColor = stage >= 6 ? '#ffffff' : (stage >= 5 ? '#f8d060' : yk.gc);
        var pCount = stage >= 6 ? 16 : 12;
        var pSpeed = stage >= 5 ? 1.2 : 0.6;
        for (var _a = 0; _a < pCount; _a++) {
          var _ang = _a / pCount * Math.PI * 2 + t * pSpeed;
          var _r = (stage >= 5 ? 36 : 26) + Math.sin(t * 2 + _a) * 5;
          ctx.fillStyle = pColor;
          ctx.beginPath();
          ctx.arc(ox + 32 + Math.cos(_ang) * _r, oy + 32 + Math.sin(_ang) * _r * 0.55, stage >= 6 ? 4 : 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (extraAnim && extraAnim.act) {
         ctx.save();
         ctx.font = "30px Arial";
         ctx.textAlign = "center";
         var emoY = oy - 20 + Math.sin(t * 5) * 5;
         if (extraAnim.act === 'feed') ctx.fillText("??", ox + 32, emoY);
         else if (extraAnim.act === 'play') ctx.fillText("??", ox + 32, emoY);
         else if (extraAnim.act === 'meditate') ctx.fillText("?", ox + 32, emoY);
         else if (extraAnim.act === 'chat') ctx.fillText("??", ox + 32, emoY);
         else if (extraAnim.act === 'heal') ctx.fillText("??", ox + 32, emoY);
         else if (extraAnim.act === 'study') ctx.fillText("??", ox + 32, emoY);
         ctx.restore();
      };

if (!code.includes("img = artist.generate(yk.id);")) {
  console.log("Error: TargetContent 1 not found");
} else if (!code.includes("var evoScMap = [0.8, 1.1, 1.4, 1.7, 2.0, 2.3, 2.6];")) {
  console.log("Error: TargetContent 2 not found");
} else {
  code = code.replace(t1, r1);
  code = code.replace(t2, r2);
  fs.writeFileSync('yokai.html', code);
  console.log("Success!");
}
