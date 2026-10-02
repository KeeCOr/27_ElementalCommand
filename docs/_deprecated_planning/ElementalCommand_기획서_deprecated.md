# ElementalCommand 기획서

문제 정의: 전략 플레이어가 속성 상성을 외우는 데 그치지 않고 매 턴 전장 명령으로 활용하고 싶어 한다.

## 게임 소개
원소 상성과 지휘 판단을 중심으로 한 전술 게임.

ElementalCommand의 핵심 매력은 한 번의 선택이 다음 장면의 위험도, 보상, 성장 방향으로 이어지는 구조다. 이 문서는 처음 보는 사람에게 게임의 재미와 현재 방향을 빠르게 소개하기 위한 단일 기획서이며, 세부 변경 이력은 별도 업데이트 내역서에서 관리한다.

## 한 줄 소개
원소 상성과 지휘 판단을 중심으로 한 전술 게임.

## 핵심 루프
유저가 현재 전장의 정보를 읽고 선택을 하면 전투/운영 결과가 갱신되고, 그 보상과 손실 때문에 다시 다음 선택을 준비한다.

## 게임 플레이 예시
- 1단계: 플레이어가 ElementalCommand의 현재 목표, 보유 자원, 즉시 대응해야 할 위험을 확인한다.
- 2단계: 카드, 유닛, 배치, 명령, 이동 중 현재 상황에 맞는 핵심 행동을 선택한다.
- 3단계: 선택 결과가 전투, 운영, 보상, 손실로 즉시 갱신되고 다음 판단의 근거가 된다.
- 4단계: 획득한 보상이나 변화한 상태를 바탕으로 다음 선택을 준비하며 핵심 루프를 반복한다.
- 플레이 감각: 짧은 세션 안에서 상황 파악, 의미 있는 선택, 즉각적인 피드백, 다음 목표 제시가 끊기지 않는 흐름을 지향한다.

## 핵심 재미
- 읽기 쉬운 상황 판단: 지금 위험한 요소와 얻을 수 있는 보상이 한눈에 들어온다.
- 직접적인 선택 피드백: 선택 직후 전투, 점수, 자원, 성장 상태가 변해 손맛을 만든다.
- 누적되는 성장감: 반복 플레이가 단순 재시작이 아니라 다음 전략의 재료로 이어진다.

## 주요 시스템
- 핵심 선택 시스템: 현재 국면에서 가능한 행동을 5개 이하의 명확한 선택지로 제시한다.
- 위험/보상 피드백: 행동 전후의 이득, 손실, 위협 변화를 빠르게 보여준다.
- 성장과 해금: 세션 결과가 능력, 카드, 유닛, 건물, 장비, 스테이지 등 다음 플레이의 선택지를 넓힌다.
- 상태별 UX: 로딩, 빈 상태, 오류, 많은 데이터, 긴 텍스트 상황에서도 레이아웃이 무너지지 않도록 관리한다.
- 실행 안정성: 테스트와 빌드 산출물을 기준으로 현재 플레이 가능한 범위를 계속 확인한다.

## 게임 구성과 규칙 (GDD 통합)
- 통합 기준 문서: `superpowers/specs/2026-05-14-elemental-command-design.md`, `superpowers/specs/2026-05-15-elemental-command-art-upgrade-design.md`, `superpowers/specs/2026-05-15-elemental-command-combat-board-design.md`
- 작성 기준: 16_PokerStrike_GDD처럼 화면 구조, 핵심 시스템, 진행/승패 규칙, UI/HUD, 미결 항목을 한 문서에서 바로 읽을 수 있게 정리한다.

### 화면/플레이 구조
- **1. 개요** (superpowers/specs/2026-05-14-elemental-command-design.md)
  - 젬을 드래그하여 캐릭터 스킬 시퀀스를 완성하면 아군이 적을 공격하는 퍼즐 배틀 게임.
  - 적은 실시간으로 공격해오며, 플레이어는 빠르게 시퀀스를 완성해 아군을 순환시키며 싸운다.
- **3. 프로젝트 구조** (superpowers/specs/2026-05-14-elemental-command-design.md)
  - │ ├── BootScene.js # 에셋 로딩
  - │ ├── StageSelectScene.js # 스테이지 선택
  - │ ├── PartySelectScene.js # 파티 편성 (4인)
  - │ └── BattleScene.js # 핵심 전투 씬
  - │ ├── HexBoard.js # 헥사 퍼즐 보드 (5x6)
  - │ ├── Gem.js # 젬 오브젝트
  - │ ├── Character.js # 아군 캐릭터
- **4.1 퍼즐 보드** (superpowers/specs/2026-05-14-elemental-command-design.md)
  - **형태:** 헥사고날 그리드 5열 x 6행 (검증 후 수정 가능)
  - **젬 종류:** 5가지 — 불(Fire), 물(Water), 풀(Grass), 빛(Light), 어둠(Dark)
  - **젬 스폰 확률:** 기본 각 20%, 파티 구성에 따라 보정
  - 해당 속성 캐릭터 1명당 +5~10% 보정, 초과분은 나머지 속성에서 균등 차감

### 핵심 시스템
- **4.4 캐릭터 순환** (superpowers/specs/2026-05-14-elemental-command-design.md)
  - 아군 4명이 A→B→C→D→A 순서로 순환
  - 드래그 종료마다 다음 캐릭터로 교체 (스킬 발동 여부 무관)
  - 현재 활성 캐릭터는 시각적으로 강조 (앞으로 나오거나 빛남)
- **Visual Direction** (superpowers/specs/2026-05-15-elemental-command-art-upgrade-design.md)
  - Use a colorful mobile fantasy RPG style:
  - A dark magical battlefield background with readable contrast.
  - Element gems that look like polished fantasy stones instead of flat colored hexes.
  - Character cards with portrait art, element frames, and clearer skill identity.
  - Enemy slots with monster portraits or silhouettes, stronger HP bars, and attack gauges.
  - Short elemental impact effects when skills fire.
  - The style should feel polished but still lightweight enough for the current MVP.
- **Assets To Add** (superpowers/specs/2026-05-15-elemental-command-art-upgrade-design.md)
  - Create or add the following under `public/assets/`:
  - `battle-bg-ruins.png`: vertical fantasy battlefield background.
  - `gem-fire.png`, `gem-water.png`, `gem-grass.png`, `gem-light.png`, `gem-dark.png`: transparent elemental hex gems.
  - `portrait-warrior.png`, `portrait-mage.png`, `portrait-ranger.png`, `portrait-paladin.png`, `portrait-assassin.png`: character portraits.
  - `enemy-goblin.png`, `enemy-orc.png`, `enemy-darkKnight.png`, `enemy-fireSpirit.png`, `enemy-shadowBeast.png`: enemy portraits matching `src/data/enemies.js`.
  - `panel-card.png` or equivalent frame texture for cards and slots if it improves the screen without complicating layout.
  - All gameplay-critical objects still need fallback drawing when an image is missing, so the game remains runnable during asset iteration.
- **PartySelectScene** (superpowers/specs/2026-05-15-elemental-command-art-upgrade-design.md)
  - Replace flat character cards with richer cards:
  - Portrait near the top or left side.
  - Element-colored border.
  - Skill sequence shown with small gem icons.
  - Attack and HP text kept compact and readable.
  - Selection should still support up to four characters and must preserve current behavior.

### 진행/승패 규칙
- **4.5 적 실시간 공격** (superpowers/specs/2026-05-14-elemental-command-design.md)
  - 각 적은 개별 공격 타이머 보유
  - 타이머가 차면 즉시 아군에게 공격 (별도 적 턴 없음)
  - 적 공격 게이지를 UI에 실시간 표시
- **스테이지** (superpowers/specs/2026-05-14-elemental-command-design.md)
  - name: '첫 번째 시련',
  - { id: 'goblin', count: 3 }

### UI/HUD/피드백
- **Non-Goals** (superpowers/specs/2026-05-15-elemental-command-art-upgrade-design.md)
  - No new gameplay systems.
  - No sprite-sheet animation pipeline.
  - No inventory, character growth, shop, or story UI.
  - No mobile packaging changes in this pass.

### 구현 메모/미결
- **2. 기술 스택** (superpowers/specs/2026-05-14-elemental-command-design.md)
| 항목 | 선택 |
|------|------|
| 게임 엔진 | Phaser.js 3 |
| 언어 | JavaScript (ES Modules) |
| 빌드 | Vite |
| 모바일 확장 | Capacitor |
| Steam 확장 | Electron |

## MVP 가설
| 기능 | 검증할 가설 | 검증 방법 |
|------|-------------|-----------|
| 핵심 전투/운영 루프 | 플레이어는 한 판 안에서 선택 결과를 이해하면 다음 판을 자발적으로 시작한다. | 1회 플레이 후 재시작률 60% 이상 |
| 위험/보상 표시 | 위험과 보상이 동시에 보이면 선택 시간이 줄고 납득도가 오른다. | 주요 선택 평균 8초 이내, 결과 불만 피드백 20% 이하 |
| 성장 보상 | 보상이 다음 전략을 바꾸면 반복 플레이 피로가 낮아진다. | 3판 내 서로 다른 빌드 선택률 50% 이상 |

## 레퍼런스 분석
- 장르 기준 레퍼런스는 한 판 시작까지 3단계 이내, 첫 의미 있는 선택까지 30초 이내가 목표다.
- 적용 교훈: 규칙 설명보다 먼저 선택 가능한 상황을 보여주고, 결과 화면에서 다음 판의 개선 포인트를 바로 제안한다.

## 현재 개발 상태 예상 수치
- 완성 목표 대비 구현 체감도: 약 50%
- 첫 세션에서 핵심 루프가 전달될 가능성: 약 56%
- UI/리소스 일관성 체감: 약 46%
- 콘텐츠와 반복 플레이 분량 충족도: 약 46%
- 빌드/실행 안정성 기대치: 약 40%
- 해석 기준: 현재 문서, 최근 산출물 기록, 연결된 예시 이미지 유무를 기준으로 한 사전 추정치이며 실제 플레이 테스트 후 ±15%p 정도 보정이 필요하다.

- 첫 세션 평균 플레이 시간 8분 이상
- 첫 세션 내 2회차 진입률 55% 이상
- 핵심 선택 화면에서 무응답/이탈률 15% 이하

## 현재 구현 상태
- 이 문서는 2026-06-24 기준으로 현재 플레이 방향과 구현 체감 상태를 요약한다.
- 핵심 루프, 조작 원칙, 리소스 적용 현황, 빌드 기준은 프로젝트별 실제 구현과 산출물 기록을 기준으로 계속 보정한다.
- 세부 변경 이력은 별도 업데이트 내역서에서 관리하고, 본 기획서는 처음 보는 사람이 현재 방향을 빠르게 이해하는 공유 문서로 유지한다.
- 새 기능, 밸런스 변경, 리소스 교체, UX 개선이 들어가면 본문과 HTML 문서를 함께 갱신한다.

## 조작과 UX 원칙
- 주요 버튼은 44px 이상으로 유지하고, 화면당 CTA 강조색은 하나만 사용한다.
- 버튼/선택지는 한 번에 5개 이하로 노출해 판단 부담을 줄인다.
- 로딩, 빈 상태, 에러, 많은 데이터, 긴 텍스트 상태를 각각 별도 화면/컴포넌트로 확인한다.
- HUD 동일 레이어 요소는 겹치지 않게 배치하고, 겹침이 필요한 효과는 별도 depth/z-order를 쓴다.

## 적용 리소스
- 런타임에 쓰이는 대표 이미지와 UI 리소스는 프로젝트별 asset/public/Resources 경로를 기준으로 관리한다.
- 새 이미지가 필요할 때는 프로젝트 접두어를 포함한 lowercase kebab-case 파일명을 사용한다.
- 최종 런타임 비주얼은 PNG/WebP 등 비트맵 자산을 우선 사용하고, SVG 또는 코드 드로잉은 문서/임시 참조로만 남긴다.

## 공유용 이미지 미리보기
![ElementalCommand 공유용 예시 1](ElementalCommand_01_플레이예시.png)

![ElementalCommand 공유용 예시 2](ElementalCommand_레퍼런스_플레이예시_구버전.png)

![ElementalCommand 공유용 예시 3](enemy-portraits-transparent-preview.png)

- assets/bg-menu.png
- assets/bg-menu.tmp.png
- assets/character-portraits-sheet.png

## 빌드, 테스트, 릴리스
- npm test
- npm run build
- 현재 문서 기준 버전: 0.2.0

## 남은 리스크와 다음 우선순위
- 첫 화면에서 게임의 목표와 다음 행동이 5초 안에 보이는지 확인한다.
- 주요 선택의 결과 예측과 실제 결과가 어긋나는 지점을 플레이 테스트로 수집한다.
- 기획서에 남아 있던 변경 이력성 내용은 업데이트 내역서로 계속 이동해 소개 문서의 밀도를 유지한다.
