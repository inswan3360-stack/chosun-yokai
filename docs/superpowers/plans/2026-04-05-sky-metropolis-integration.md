# Sky Metropolis Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Sky Metropolis (React/Three.js city sim) with AI disabled and integrate it as a game card on blipzones.com (chosun-yokai).

**Architecture:** Vite builds sky-metropolis into static files with base path `/sky-metropolis/`, output is copied into `chosun-yokai/sky-metropolis/`, and a new game card + modal entry is added to `index.html`.

**Tech Stack:** Vite 6, React 19, Three.js, @react-three/fiber, @react-three/drei — built to static HTML/JS/CSS

---

### Task 1: Configure sky-metropolis for static subdirectory deployment with AI off

**Files:**
- Modify: `D:/#가족용/web/sky-metropolis/vite.config.ts`
- Modify: `D:/#가족용/web/sky-metropolis/App.tsx:36`
- Create: `D:/#가족용/web/sky-metropolis/.env.local`

- [ ] **Step 1: Set Vite base path to `/sky-metropolis/`**

Edit `D:/#가족용/web/sky-metropolis/vite.config.ts` — add `base: '/sky-metropolis/'` inside the returned config object:

```ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/sky-metropolis/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
```

- [ ] **Step 2: Disable AI by default in App.tsx**

In `D:/#가족용/web/sky-metropolis/App.tsx` line 36, change:
```ts
const [aiEnabled, setAiEnabled] = useState(true);
```
to:
```ts
const [aiEnabled, setAiEnabled] = useState(false);
```

- [ ] **Step 3: Create .env.local with dummy API key**

Create `D:/#가족용/web/sky-metropolis/.env.local`:
```
GEMINI_API_KEY=disabled
```

---

### Task 2: Build sky-metropolis and copy dist to chosun-yokai

**Files:**
- Creates: `D:/#가족용/web/chosun-yokai/sky-metropolis/` (entire Vite dist output)

- [ ] **Step 1: Install dependencies**

```bash
cd "D:/#가족용/web/sky-metropolis" && npm install
```

Expected: `added N packages` with no errors.

- [ ] **Step 2: Build**

```bash
cd "D:/#가족용/web/sky-metropolis" && npm run build
```

Expected: `dist/` folder created, output summary showing `index.html` + JS/CSS chunks. No errors.

- [ ] **Step 3: Copy dist to chosun-yokai**

```bash
cp -r "D:/#가족용/web/sky-metropolis/dist/." "D:/#가족용/web/chosun-yokai/sky-metropolis/"
```

Expected: `chosun-yokai/sky-metropolis/index.html` exists.

- [ ] **Step 4: Verify the copy**

```bash
ls "D:/#가족용/web/chosun-yokai/sky-metropolis/"
```

Expected: `index.html`, `assets/` directory (with JS/CSS bundles inside).

---

### Task 3: Add Sky Metropolis game card and modal data to index.html

**Files:**
- Modify: `D:/#가족용/web/chosun-yokai/index.html`

- [ ] **Step 1: Add game card to the playground grid**

In `index.html`, after the Liquid State card (around line 779, just before the closing `</div>` of `.playground-grid`), insert:

```html
      <!-- Sky Metropolis Card -->
      <div class="play-card" onclick="showGameInfo('skymetropolis')" style="background: radial-gradient(ellipse at 30% 70%, #0a1a3a 0%, #061020 40%, #020508 100%); border: 1px solid rgba(56,189,248,0.35); box-shadow: 0 0 40px rgba(56,189,248,0.08), inset 0 0 60px rgba(0,0,0,0.5);">
        <div class="shine"></div>
        <div class="card-content">
          <span class="card-tag">City Builder</span>
          <h2 class="card-title">Sky Metropolis</h2>
          <div class="card-stats">
            <span>3D Isometric</span> • <span>Strategy</span> • <span>Builder</span>
          </div>
        </div>
        <div class="play-now-hint">+</div>
      </div>
```

- [ ] **Step 2: Add game data entry to the gameData object**

In `index.html`, inside the `gameData` object (around line 993, after the `liquid` entry and before the closing `}`), insert:

```js
      skymetropolis: {
        title: "Sky Metropolis",
        tag: "3D City Builder",
        desc: "Build and manage a thriving 3D isometric metropolis. Zone residential, commercial, and industrial districts, lay down roads, and grow your city's population and economy. A relaxing city-builder rendered entirely in your browser with Three.js.",
        controls: "• Click a building type in the UI panel to select it.<br>• Click any tile on the grid to place the selected building.<br>• Watch your population and income grow as you expand.",
        image: "assets/previews/liquid.png",
        link: "sky-metropolis/index.html"
      }
```

Note: `liquid.png` is used as a temporary placeholder hero image. Replace with a real Sky Metropolis screenshot later.

- [ ] **Step 3: Commit**

```bash
cd "D:/#가족용/web/chosun-yokai" && git add sky-metropolis/ index.html docs/ && git commit -m "feat: add Sky Metropolis city builder game (AI disabled)"
```

---

## Notes

- Sky Metropolis의 AI 토글 버튼은 UI에 남아있음. 나중에 Gemini API 키 연결 시 `aiEnabled`를 `true`로 바꾸거나 사용자가 UI에서 켤 수 있음.
- `sky-metropolis/` 빌드 결과물은 git에 포함됨 (정적 배포용). 용량이 크면 `.gitignore`에 추가하고 별도 배포 파이프라인 고려.
- 로컬 테스트: `chosun-yokai` 루트에서 `python -m http.server 8080` 실행 후 `http://localhost:8080/sky-metropolis/` 확인.
