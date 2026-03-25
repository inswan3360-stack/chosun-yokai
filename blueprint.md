
# Blueprint: Chosun Yokai Playground - Digital Folklore Sanctuary

## 1. 프로젝트 개요

본 프로젝트는 단순하고 향수를 불러일으키는 한국형 전통 게임들의 디지털 놀이터입니다. 복잡하고 사양이 높은 게임들에서 벗어나, 순수한 게임의 즐거움과 한국적인 정서를 결합한 미니게임 포털을 지향합니다.

## 2. 디자인 및 기능 명세

### 스타일 및 디자인 (Digital Folklore Sanctuary)
- **테마:** Ink & Paper (먹과 한지). 흑색(#0a0c12), 한지색(#e8d09a), 금색(#c5a059)을 주축으로 한 고급스러운 한식 미니멀리즘.
- **분위기:** 가벼운 게임이지만 디자인은 "Premium & Professional"을 유지.
- **반응형:** 모든 기기에서 최적화된 화면 제공 (모바일 중심 UI).

### 수록 게임 목록
1.  **Yokai: Rebirth (요괴: 환생):** 조상신과 정령들의 평화로운 진화 시뮬레이션. (`yokai.html`)
2.  **Flight Glitch (플라이트 글리치):** 고전 아케이드 스타일의 고강도 생존 비행 게임. (`flight.html`)
3.  **HIGHWAY CHASE (하이웨이 체이스):** 네온 시티를 배경으로 하는 짜릿한 신도주 카체이싱 게임. (`HIGHWAY CHASE.html`)

---

## 3. 현재 요청사항 (v4) - 게임 포털 고도화

### 주요 목표
- **신규 게임 추가:** 메인 페이지(`index.html`)에 "HIGHWAY CHASE" 게임 링크 추가.
- **게임 설명 시스템 도입:** 게임에 바로 진입하는 대신, 각 게임의 특징과 조작법을 설명하는 프리뷰 페이지/모달 구현.

### 실행 단계

#### Step 1: 메인 페이지(`index.html`) 레이아웃 업데이트
- `playground-grid` 섹션에 "HIGHWAY CHASE" 카드 추가.
- 프리미엄 비주얼을 위해 Unsplash/Generated Image 활용.

#### Step 2: 게임 정보 오버레이 (Game Info Overlay) 구현
- 각 게임 카드를 클릭하면 `index.html` 내에서 상세 설명 오버레이가 나타나도록 구현.
- **구성 요소:**
    - 게임 제목 및 태그 (Simulation, Arcade, Racing 등)
    - 게임 시놉시스 및 특징 설명.
    - 조작법 (Keyboard/Touch 안내).
    - "시작하기" 버튼 (해당 .html 파일로 이동).
    - "닫기" 버튼.

#### Step 3: 콘텐츠 현지화 및 정교화
- 설명 텍스트를 한국어로 제공하여 국내 사용자의 접근성 향상.
- 요괴(Simulation), 플라이트(Arcade), 하이웨이(Racing) 각각의 특징을 매력적으로 기술.

#### Step 4: 시각적 완성도 강화
- 오버레이 등장 시 블러 효과(backdrop-filter) 및 부드러운 애니메이션 적용.
- 게임별 대표 이미지 생성 및 적용.

---

## 4. 이전 기록 (v1~v3)
- MBTI 요괴 테스트 기반 진화 시스템 및 픽셀 아트 교체 완료.
- 로컬 스토리지 데이터 저장 및 SNS 공유 기능 기반 마련.
- SEO 최적화 및 광고 연동 구조 설계 완료.
