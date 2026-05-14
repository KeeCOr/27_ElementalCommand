# Elemental Command MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 헥사 퍼즐 보드에서 젬을 드래그해 캐릭터 스킬 시퀀스를 완성하고, 실시간으로 공격해오는 적과 싸우는 웹 퍼즐 배틀 게임 MVP를 만든다.

**Architecture:** Phaser 3 + Vite 구성. 순수 로직(GemSpawner, SequenceChecker, HexGeometry)은 Vitest로 단위 테스트. Phaser 씬/오브젝트는 브라우저에서 통합 테스트. BattleScene이 HexBoard, CharacterSlot, EnemySlot을 조합해 전투를 조율한다.

**Tech Stack:** Phaser 3.80, Vite 5, Vitest 1, JavaScript ES Modules

---

## File Map

| 파일 | 역할 |
|------|------|
| `index.html` | 진입점 |
| `vite.config.js` | Vite + Vitest 설정 |
| `package.json` | 의존성 |
| `src/main.js` | Phaser 게임 초기화 |
| `src/constants.js` | GEM_TYPES, GEM_COLORS, BOARD_CONFIG, 화면 크기 |
| `src/data/characters.js` | 캐릭터 정의 (id, element, skillSequence, attack, maxHp, ...) |
| `src/data/enemies.js` | 적 정의 (id, maxHp, attack, attackInterval) |
| `src/data/stages.js` | 스테이지 정의 (id, name, enemies[]) |
| `src/systems/GemSpawner.js` | 파티 기반 가중치 젬 스폰 (buildWeights, spawnBoard) |
| `src/systems/SequenceChecker.js` | 드래그 경로와 스킬 시퀀스 일치 검사 (checkSequence) |
| `src/systems/HexGeometry.js` | 헥사 좌표 수학 (hexToPixel, getNeighbors, areNeighbors) |
| `src/objects/Gem.js` | Phaser Container — 단일 헥사 젬 렌더링 |
| `src/objects/HexBoard.js` | Phaser Container — 보드 렌더링 + 드래그 입력, dragComplete 이벤트 발행 |
| `src/objects/CharacterSlot.js` | Phaser Container — 캐릭터 표시, HP바, 활성 강조 |
| `src/objects/EnemySlot.js` | Phaser Container — 적 표시, HP바, 공격 타이머 게이지 |
| `src/scenes/BootScene.js` | 에셋 로딩 후 StageSelectScene으로 전환 |
| `src/scenes/StageSelectScene.js` | 스테이지 선택 UI |
| `src/scenes/PartySelectScene.js` | 파티 편성 UI (최대 4인) |
| `src/scenes/BattleScene.js` | 전투 오케스트레이터 |
| `tests/GemSpawner.test.js` | GemSpawner 단위 테스트 |
| `tests/SequenceChecker.test.js` | SequenceChecker 단위 테스트 |
| `tests/HexGeometry.test.js` | HexGeometry 단위 테스트 |

---

## Task 1: 프로젝트 스캐폴딩

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.js`

- [ ] **Step 1: package.json 생성**

```json
{
  "name": "elemental-command",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "phaser": "^3.80.1"
  },
  "devDependencies": {
    "vite": "^5.2.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: vite.config.js 생성**

```js
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    environment: 'node'
  }
})
```

- [ ] **Step 3: index.html 생성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Elemental Command</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: src/main.js 빈 파일 생성 (나중에 채움)**

```js
// 추후 Task 9에서 완성
console.log('Elemental Command')
```

- [ ] **Step 5: 의존성 설치 및 개발 서버 확인**

```bash
cd C:/Development/27_EC
npm install
npm run dev
```

Expected: 브라우저에서 `http://localhost:5173` 접속 시 빈 검은 화면 + 콘솔에 "Elemental Command" 출력

- [ ] **Step 6: 커밋**

```bash
git add package.json vite.config.js index.html src/main.js package-lock.json
git commit -m "chore: project scaffolding with Vite + Phaser + Vitest"
```

---

## Task 2: 상수 및 게임 데이터 정의

**Files:**
- Create: `src/constants.js`
- Create: `src/data/characters.js`
- Create: `src/data/enemies.js`
- Create: `src/data/stages.js`

- [ ] **Step 1: src/constants.js 생성**

```js
export const GEM_TYPES = ['fire', 'water', 'grass', 'light', 'dark']

export const GEM_COLORS = {
  fire:  0xff4444,
  water: 0x4488ff,
  grass: 0x44cc44,
  light: 0xffee44,
  dark:  0xaa44cc
}

export const GEM_LABEL = {
  fire:  '불',
  water: '물',
  grass: '풀',
  light: '빛',
  dark:  '어둠'
}

export const BOARD_CONFIG = {
  cols: 5,
  rows: 6,
  hexRadius: 36   // 플레이테스트 후 조정
}

export const GAME_WIDTH  = 480
export const GAME_HEIGHT = 854
```

- [ ] **Step 2: src/data/characters.js 생성**

```js
export const CHARACTERS = [
  {
    id: 'warrior',
    name: '전사',
    element: 'fire',
    maxHp: 1200,
    attack: 180,
    skillSequence: ['fire', 'fire', 'water'],
    skillName: '불꽃 베기',
    skillMultiplier: 3.0,
    color: 0xff4444
  },
  {
    id: 'mage',
    name: '마법사',
    element: 'water',
    maxHp: 800,
    attack: 250,
    skillSequence: ['water', 'water', 'light'],
    skillName: '냉기 폭발',
    skillMultiplier: 3.5,
    color: 0x4488ff
  },
  {
    id: 'ranger',
    name: '레인저',
    element: 'grass',
    maxHp: 1000,
    attack: 200,
    skillSequence: ['grass', 'dark', 'grass'],
    skillName: '독화살',
    skillMultiplier: 2.5,
    color: 0x44cc44
  },
  {
    id: 'paladin',
    name: '팔라딘',
    element: 'light',
    maxHp: 1500,
    attack: 150,
    skillSequence: ['light', 'light', 'fire'],
    skillName: '신성한 검',
    skillMultiplier: 2.8,
    color: 0xffee44
  },
  {
    id: 'assassin',
    name: '암살자',
    element: 'dark',
    maxHp: 900,
    attack: 300,
    skillSequence: ['dark', 'dark', 'dark'],
    skillName: '어둠의 일격',
    skillMultiplier: 4.0,
    color: 0xaa44cc
  }
]
```

- [ ] **Step 3: src/data/enemies.js 생성**

```js
export const ENEMIES = {
  goblin: {
    id: 'goblin',
    name: '고블린',
    maxHp: 500,
    attack: 60,
    attackInterval: 4000,
    color: 0x88cc44
  },
  orc: {
    id: 'orc',
    name: '오크',
    maxHp: 1200,
    attack: 120,
    attackInterval: 5000,
    color: 0x667733
  },
  darkKnight: {
    id: 'darkKnight',
    name: '흑기사',
    maxHp: 2000,
    attack: 180,
    attackInterval: 6000,
    color: 0x334455
  },
  fireSpirit: {
    id: 'fireSpirit',
    name: '화염 정령',
    maxHp: 800,
    attack: 200,
    attackInterval: 3000,
    color: 0xff6600
  },
  shadowBeast: {
    id: 'shadowBeast',
    name: '그림자 짐승',
    maxHp: 3000,
    attack: 250,
    attackInterval: 7000,
    color: 0x220033
  }
}
```

- [ ] **Step 4: src/data/stages.js 생성**

```js
export const STAGES = [
  {
    id: 1,
    name: '첫 번째 시련',
    enemies: [{ id: 'goblin' }, { id: 'goblin' }, { id: 'goblin' }]
  },
  {
    id: 2,
    name: '오크의 습격',
    enemies: [{ id: 'goblin' }, { id: 'orc' }, { id: 'goblin' }]
  },
  {
    id: 3,
    name: '화염의 시험',
    enemies: [{ id: 'fireSpirit' }, { id: 'orc' }]
  },
  {
    id: 4,
    name: '어둠의 기사',
    enemies: [{ id: 'darkKnight' }]
  },
  {
    id: 5,
    name: '그림자의 심연',
    enemies: [{ id: 'shadowBeast' }, { id: 'darkKnight' }]
  }
]
```

- [ ] **Step 5: 커밋**

```bash
git add src/constants.js src/data/
git commit -m "feat: add game constants and data definitions"
```

---

## Task 3: GemSpawner 시스템 (TDD)

**Files:**
- Create: `src/systems/GemSpawner.js`
- Create: `tests/GemSpawner.test.js`

- [ ] **Step 1: 실패 테스트 작성**

`tests/GemSpawner.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { buildWeights, spawnGem, spawnBoard } from '../src/systems/GemSpawner.js'

describe('buildWeights', () => {
  it('파티가 없으면 5속성 균등 20%', () => {
    const w = buildWeights([])
    expect(w.fire).toBeCloseTo(0.2)
    expect(w.water).toBeCloseTo(0.2)
    expect(w.grass).toBeCloseTo(0.2)
    expect(w.light).toBeCloseTo(0.2)
    expect(w.dark).toBeCloseTo(0.2)
    expect(Object.values(w).reduce((a, b) => a + b, 0)).toBeCloseTo(1.0)
  })

  it('파티 멤버 속성이 확률 상승', () => {
    const w = buildWeights([{ element: 'fire' }, { element: 'fire' }])
    expect(w.fire).toBeGreaterThan(w.water)
    expect(Object.values(w).reduce((a, b) => a + b, 0)).toBeCloseTo(1.0)
  })

  it('null 슬롯 무시', () => {
    const w = buildWeights([{ element: 'fire' }, null, null, null])
    expect(w.fire).toBeGreaterThan(w.water)
    expect(Object.values(w).reduce((a, b) => a + b, 0)).toBeCloseTo(1.0)
  })
})

describe('spawnBoard', () => {
  it('요청한 개수만큼 젬 반환', () => {
    const w = buildWeights([])
    expect(spawnBoard(30, w)).toHaveLength(30)
  })

  it('유효한 젬 타입만 반환', () => {
    const valid = new Set(['fire', 'water', 'grass', 'light', 'dark'])
    const w = buildWeights([])
    for (const gem of spawnBoard(30, w)) {
      expect(valid.has(gem)).toBe(true)
    }
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test
```

Expected: `Cannot find module '../src/systems/GemSpawner.js'` 에러

- [ ] **Step 3: GemSpawner 구현**

`src/systems/GemSpawner.js`:
```js
import { GEM_TYPES } from '../constants.js'

/**
 * 파티 구성 기반 젬 타입 가중치 맵 생성.
 * @param {Array} party - 캐릭터 오브젝트 배열 (null 허용)
 * @returns {{ fire, water, grass, light, dark }} 합계 1.0
 */
export function buildWeights(party) {
  const base = { fire: 20, water: 20, grass: 20, light: 20, dark: 20 }
  for (const char of party) {
    if (char && base[char.element] !== undefined) {
      base[char.element] += 8
    }
  }
  const total = Object.values(base).reduce((a, b) => a + b, 0)
  const weights = {}
  for (const [k, v] of Object.entries(base)) {
    weights[k] = v / total
  }
  return weights
}

/**
 * 가중치 기반으로 젬 타입 1개 랜덤 반환.
 * @param {Object} weights - buildWeights() 결과
 * @returns {string} gem type
 */
export function spawnGem(weights) {
  const rand = Math.random()
  let cumulative = 0
  for (const type of GEM_TYPES) {
    cumulative += weights[type]
    if (rand < cumulative) return type
  }
  return GEM_TYPES[GEM_TYPES.length - 1]
}

/**
 * 보드 전체 젬 타입 배열 생성.
 * @param {number} count
 * @param {Object} weights - buildWeights() 결과
 * @returns {string[]}
 */
export function spawnBoard(count, weights) {
  return Array.from({ length: count }, () => spawnGem(weights))
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test
```

Expected: `GemSpawner > buildWeights` 3개, `spawnBoard` 2개 PASS

- [ ] **Step 5: 커밋**

```bash
git add src/systems/GemSpawner.js tests/GemSpawner.test.js
git commit -m "feat: add GemSpawner with party-weighted gem spawning"
```

---

## Task 4: SequenceChecker 시스템 (TDD)

**Files:**
- Create: `src/systems/SequenceChecker.js`
- Create: `tests/SequenceChecker.test.js`

- [ ] **Step 1: 실패 테스트 작성**

`tests/SequenceChecker.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { checkSequence } from '../src/systems/SequenceChecker.js'

describe('checkSequence', () => {
  it('완전 일치', () => {
    expect(checkSequence(['fire', 'fire', 'water'], ['fire', 'fire', 'water'])).toBe(true)
  })

  it('긴 경로에 시퀀스 포함', () => {
    expect(checkSequence(['water', 'fire', 'fire', 'water', 'grass'], ['fire', 'fire', 'water'])).toBe(true)
  })

  it('시퀀스 불일치', () => {
    expect(checkSequence(['fire', 'water', 'fire'], ['fire', 'fire', 'water'])).toBe(false)
  })

  it('경로가 시퀀스보다 짧으면 false', () => {
    expect(checkSequence(['fire', 'fire'], ['fire', 'fire', 'water'])).toBe(false)
  })

  it('빈 경로는 false', () => {
    expect(checkSequence([], ['fire'])).toBe(false)
  })

  it('단일 원소 시퀀스 포함 여부', () => {
    expect(checkSequence(['water', 'fire', 'grass'], ['fire'])).toBe(true)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test
```

Expected: `Cannot find module '../src/systems/SequenceChecker.js'` 에러

- [ ] **Step 3: SequenceChecker 구현**

`src/systems/SequenceChecker.js`:
```js
/**
 * dragPath가 skillSequence를 연속 부분 배열로 포함하면 true.
 * @param {string[]} dragPath - 드래그한 젬 타입 순서
 * @param {string[]} skillSequence - 캐릭터 스킬 필요 시퀀스
 * @returns {boolean}
 */
export function checkSequence(dragPath, skillSequence) {
  if (dragPath.length < skillSequence.length) return false
  const seqLen = skillSequence.length
  for (let i = 0; i <= dragPath.length - seqLen; i++) {
    let match = true
    for (let j = 0; j < seqLen; j++) {
      if (dragPath[i + j] !== skillSequence[j]) {
        match = false
        break
      }
    }
    if (match) return true
  }
  return false
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test
```

Expected: `SequenceChecker` 6개 PASS

- [ ] **Step 5: 커밋**

```bash
git add src/systems/SequenceChecker.js tests/SequenceChecker.test.js
git commit -m "feat: add SequenceChecker for skill sequence validation"
```

---

## Task 5: HexGeometry 시스템 (TDD)

**Files:**
- Create: `src/systems/HexGeometry.js`
- Create: `tests/HexGeometry.test.js`

- [ ] **Step 1: 실패 테스트 작성**

`tests/HexGeometry.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { getNeighbors, areNeighbors } from '../src/systems/HexGeometry.js'

const COLS = 5, ROWS = 6

describe('getNeighbors', () => {
  it('중앙 셀은 이웃 6개', () => {
    expect(getNeighbors(2, 2, COLS, ROWS)).toHaveLength(6)
  })

  it('모서리 셀은 이웃 6개 미만', () => {
    expect(getNeighbors(0, 0, COLS, ROWS).length).toBeLessThan(6)
  })

  it('모든 이웃은 보드 범위 내', () => {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        for (const [c, r] of getNeighbors(col, row, COLS, ROWS)) {
          expect(c).toBeGreaterThanOrEqual(0)
          expect(c).toBeLessThan(COLS)
          expect(r).toBeGreaterThanOrEqual(0)
          expect(r).toBeLessThan(ROWS)
        }
      }
    }
  })
})

describe('areNeighbors', () => {
  it('인접 셀은 이웃', () => {
    expect(areNeighbors(2, 2, 3, 2, COLS, ROWS)).toBe(true)
  })

  it('자기 자신은 이웃 아님', () => {
    expect(areNeighbors(2, 2, 2, 2, COLS, ROWS)).toBe(false)
  })

  it('멀리 떨어진 셀은 이웃 아님', () => {
    expect(areNeighbors(0, 0, 4, 5, COLS, ROWS)).toBe(false)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test
```

Expected: `Cannot find module '../src/systems/HexGeometry.js'` 에러

- [ ] **Step 3: HexGeometry 구현**

odd-r offset 좌표계 사용 (짝수 행 기준, 홀수 행은 오른쪽으로 0.5칸 오프셋).

`src/systems/HexGeometry.js`:
```js
import { BOARD_CONFIG } from '../constants.js'

const { hexRadius } = BOARD_CONFIG

export const HEX_WIDTH     = Math.sqrt(3) * hexRadius  // 수평 중심 간격
export const HEX_HEIGHT    = 2 * hexRadius
export const HEX_SPACING_X = HEX_WIDTH
export const HEX_SPACING_Y = hexRadius * 1.5           // 수직 중심 간격

/**
 * 그리드 (col, row) → 픽셀 중심 (x, y) 변환.
 * odd-r offset: 홀수 행은 HEX_WIDTH * 0.5 오른쪽으로 이동.
 */
export function hexToPixel(col, row, originX, originY) {
  const offset = (row % 2 === 1) ? HEX_SPACING_X * 0.5 : 0
  const x = originX + col * HEX_SPACING_X + offset + HEX_WIDTH * 0.5
  const y = originY + row * HEX_SPACING_Y + hexRadius
  return { x, y }
}

/**
 * (col, row) 의 이웃 셀 목록. 보드 범위 밖 제거.
 * @returns {Array<[number, number]>}
 */
export function getNeighbors(col, row, cols, rows) {
  const isOdd = row % 2 === 1
  const candidates = isOdd
    ? [
        [col,     row - 1],
        [col + 1, row - 1],
        [col - 1, row    ],
        [col + 1, row    ],
        [col,     row + 1],
        [col + 1, row + 1]
      ]
    : [
        [col - 1, row - 1],
        [col,     row - 1],
        [col - 1, row    ],
        [col + 1, row    ],
        [col - 1, row + 1],
        [col,     row + 1]
      ]
  return candidates.filter(([c, r]) => c >= 0 && c < cols && r >= 0 && r < rows)
}

/** 두 셀이 이웃인지 확인 */
export function areNeighbors(col1, row1, col2, row2, cols, rows) {
  return getNeighbors(col1, row1, cols, rows).some(([c, r]) => c === col2 && r === row2)
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test
```

Expected: `HexGeometry` 5개 + 이전 테스트 모두 PASS (총 13개)

- [ ] **Step 5: 커밋**

```bash
git add src/systems/HexGeometry.js tests/HexGeometry.test.js
git commit -m "feat: add HexGeometry with odd-r offset coordinate system"
```

---

## Task 6: Gem 오브젝트 (Phaser)

**Files:**
- Create: `src/objects/Gem.js`

- [ ] **Step 1: Gem.js 생성**

`src/objects/Gem.js`:
```js
import Phaser from 'phaser'
import { GEM_COLORS, GEM_LABEL, BOARD_CONFIG } from '../constants.js'

const { hexRadius } = BOARD_CONFIG

export default class Gem extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x - 픽셀 중심 x
   * @param {number} y - 픽셀 중심 y
   * @param {string} gemType - 'fire' | 'water' | 'grass' | 'light' | 'dark'
   * @param {number} col - 그리드 열
   * @param {number} row - 그리드 행
   */
  constructor(scene, x, y, gemType, col, row) {
    super(scene, x, y)
    this.gemType = gemType
    this.col = col
    this.row = row

    this.hex = scene.add.graphics()
    this._drawHex(GEM_COLORS[gemType], false)
    this.add(this.hex)

    this.label = scene.add.text(0, 0, GEM_LABEL[gemType], {
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    this.add(this.label)

    scene.add.existing(this)
  }

  _drawHex(fillColor, highlighted) {
    this.hex.clear()
    this.hex.fillStyle(fillColor, highlighted ? 0.6 : 1)
    this.hex.lineStyle(highlighted ? 3 : 2, 0xffffff, highlighted ? 1 : 0.3)
    const points = []
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6
      points.push({ x: hexRadius * Math.cos(angle), y: hexRadius * Math.sin(angle) })
    }
    this.hex.fillPoints(points, true)
    this.hex.strokePoints(points, true)
  }

  /** 드래그 경로에 포함될 때 강조 표시 */
  setHighlight(active) {
    this._drawHex(GEM_COLORS[this.gemType], active)
    this.setScale(active ? 1.12 : 1)
  }
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/objects/Gem.js
git commit -m "feat: add Gem Phaser object with hexagonal rendering"
```

---

## Task 7: HexBoard 렌더링 + 드래그 입력

**Files:**
- Create: `src/objects/HexBoard.js`

- [ ] **Step 1: HexBoard.js 생성**

`src/objects/HexBoard.js`:
```js
import Phaser from 'phaser'
import Gem from './Gem.js'
import { BOARD_CONFIG, GAME_WIDTH, GAME_HEIGHT } from '../constants.js'
import { hexToPixel, areNeighbors, HEX_WIDTH, HEX_SPACING_Y } from '../systems/HexGeometry.js'
import { spawnBoard } from '../systems/GemSpawner.js'

const { cols, rows, hexRadius } = BOARD_CONFIG

// 보드 좌상단 기준점 (픽셀)
const BOARD_ORIGIN_X = (GAME_WIDTH - cols * HEX_WIDTH) / 2
const BOARD_ORIGIN_Y = 400   // 플레이테스트 후 조정

export default class HexBoard extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {Object} weights - buildWeights() 결과
   */
  constructor(scene, weights) {
    super(scene, 0, 0)
    this.scene = scene
    this.weights = weights

    // gems[col][row] = Gem
    this.gems = []
    // 드래그 경로: [{col, row, gemType}]
    this.dragPath = []
    this.isDragging = false

    this.lineGraphics = scene.add.graphics().setDepth(5)

    this._buildGrid()
    this._setupInput()

    scene.add.existing(this)
  }

  _buildGrid() {
    const types = spawnBoard(cols * rows, this.weights)
    let i = 0
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const { x, y } = hexToPixel(col, row, BOARD_ORIGIN_X, BOARD_ORIGIN_Y)
        const gem = new Gem(this.scene, x, y, types[i++], col, row)
        gem.setInteractive(
          new Phaser.Geom.Circle(0, 0, hexRadius * 0.9),
          Phaser.Geom.Circle.Contains
        )
        if (!this.gems[col]) this.gems[col] = []
        this.gems[col][row] = gem
      }
    }
  }

  _setupInput() {
    this.scene.input.on('pointerdown', (p) => {
      const gem = this._gemAtPoint(p.x, p.y)
      if (gem) this._startDrag(gem)
    })
    this.scene.input.on('pointermove', (p) => {
      if (!this.isDragging) return
      const gem = this._gemAtPoint(p.x, p.y)
      if (gem) this._extendDrag(gem)
    })
    this.scene.input.on('pointerup', () => {
      if (this.isDragging) this._endDrag()
    })
  }

  _gemAtPoint(px, py) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const gem = this.gems[col]?.[row]
        if (!gem) continue
        const dx = px - gem.x
        const dy = py - gem.y
        if (dx * dx + dy * dy <= hexRadius * hexRadius * 0.81) return gem
      }
    }
    return null
  }

  _startDrag(gem) {
    this.isDragging = true
    this.dragPath = [{ col: gem.col, row: gem.row, gemType: gem.gemType }]
    gem.setHighlight(true)
    this._drawPath()
  }

  _extendDrag(gem) {
    // 이미 경로에 포함된 젬은 무시
    if (this.dragPath.some(p => p.col === gem.col && p.row === gem.row)) return
    // 마지막 젬의 이웃이어야 함
    const last = this.dragPath[this.dragPath.length - 1]
    if (!areNeighbors(last.col, last.row, gem.col, gem.row, cols, rows)) return

    this.dragPath.push({ col: gem.col, row: gem.row, gemType: gem.gemType })
    gem.setHighlight(true)
    this._drawPath()
  }

  _endDrag() {
    this.isDragging = false
    const path = [...this.dragPath]
    this.dragPath = []

    // 하이라이트 해제
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.gems[col]?.[row]?.setHighlight(false)
      }
    }
    this.lineGraphics.clear()

    // dragComplete 이벤트로 경로 전달
    this.emit('dragComplete', path)
  }

  _drawPath() {
    this.lineGraphics.clear()
    if (this.dragPath.length < 2) return
    this.lineGraphics.lineStyle(5, 0xffffff, 0.7)
    this.lineGraphics.beginPath()
    for (let i = 0; i < this.dragPath.length; i++) {
      const { col, row } = this.dragPath[i]
      const gem = this.gems[col][row]
      if (i === 0) this.lineGraphics.moveTo(gem.x, gem.y)
      else         this.lineGraphics.lineTo(gem.x, gem.y)
    }
    this.lineGraphics.strokePath()
  }

  /** 보드를 새로 스폰 (전투 종료 또는 리셋 시 사용) */
  refreshBoard() {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.gems[col]?.[row]?.destroy()
      }
    }
    this.gems = []
    this._buildGrid()
  }
}
```

- [ ] **Step 2: 임시 씬에서 HexBoard 렌더링 확인**

`src/main.js`를 임시로 수정해 HexBoard만 띄워 확인:
```js
import Phaser from 'phaser'
import { buildWeights } from './systems/GemSpawner.js'
import HexBoard from './objects/HexBoard.js'
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js'

class TestScene extends Phaser.Scene {
  constructor() { super({ key: 'TestScene' }) }
  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e)
    const weights = buildWeights([])
    const board = new HexBoard(this, weights)
    board.on('dragComplete', (path) => {
      console.log('drag:', path.map(p => p.gemType))
    })
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  scene: [TestScene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
})
```

```bash
npm run dev
```

Expected: 브라우저에서 헥사 보드 렌더링 확인, 드래그 시 콘솔에 경로 출력

- [ ] **Step 3: 커밋**

```bash
git add src/objects/HexBoard.js src/main.js
git commit -m "feat: add HexBoard with hex rendering and drag input"
```

---

## Task 8: CharacterSlot & EnemySlot UI 오브젝트

**Files:**
- Create: `src/objects/CharacterSlot.js`
- Create: `src/objects/EnemySlot.js`

- [ ] **Step 1: CharacterSlot.js 생성**

`src/objects/CharacterSlot.js`:
```js
import Phaser from 'phaser'
import { GEM_COLORS, GEM_LABEL } from '../constants.js'

const SLOT_W = 90
const SLOT_H = 100

export default class CharacterSlot extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Object} characterData - src/data/characters.js 항목
   */
  constructor(scene, x, y, characterData) {
    super(scene, x, y)
    this.characterData = characterData
    this.hp = characterData.maxHp

    // 배경
    this.bg = scene.add.rectangle(0, 0, SLOT_W, SLOT_H, characterData.color, 0.25)
      .setStrokeStyle(2, characterData.color)
    this.add(this.bg)

    // 이름
    this.nameText = scene.add.text(0, -40, characterData.name, {
      fontSize: '12px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5)
    this.add(this.nameText)

    // HP바 배경
    this.hpBarBg = scene.add.rectangle(0, -20, 80, 8, 0x333333)
    this.add(this.hpBarBg)

    // HP바 채우기 (왼쪽 정렬을 위해 origin 0, 0.5)
    this.hpBar = scene.add.rectangle(-40, -20, 80, 8, 0x44ff44).setOrigin(0, 0.5)
    this.add(this.hpBar)

    // HP 수치
    this.hpText = scene.add.text(0, -8, `${this.hp}`, {
      fontSize: '10px', color: '#aaffaa'
    }).setOrigin(0.5)
    this.add(this.hpText)

    // 스킬 시퀀스 아이콘
    const seqLen = characterData.skillSequence.length
    this.seqIcons = characterData.skillSequence.map((type, i) => {
      const icon = scene.add.circle(
        (i - (seqLen - 1) / 2) * 20,
        16,
        7,
        GEM_COLORS[type]
      )
      this.add(icon)
      return icon
    })

    // 활성 테두리 (기본 투명)
    this.activeBorder = scene.add.rectangle(0, 0, SLOT_W + 6, SLOT_H + 6, 0, 0)
      .setStrokeStyle(3, 0xffffff)
    this.activeBorder.setAlpha(0)
    this.add(this.activeBorder)

    scene.add.existing(this)
  }

  /** 현재 활성 캐릭터 강조 토글 */
  setActive(active) {
    this.activeBorder.setAlpha(active ? 1 : 0)
    this.setScale(active ? 1.08 : 1)
  }

  /**
   * 데미지 적용.
   * @returns {boolean} 사망 여부
   */
  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount)
    this._updateHpBar()
    return this.hp <= 0
  }

  _updateHpBar() {
    const ratio = this.hp / this.characterData.maxHp
    this.hpBar.setScale(ratio, 1)
    this.hpText.setText(`${this.hp}`)
    const color = ratio > 0.5 ? 0x44ff44 : ratio > 0.25 ? 0xffaa00 : 0xff4444
    this.hpBar.setFillStyle(color)
  }

  isDead() {
    return this.hp <= 0
  }
}
```

- [ ] **Step 2: EnemySlot.js 생성**

`src/objects/EnemySlot.js`:
```js
import Phaser from 'phaser'

const SLOT_W = 100

export default class EnemySlot extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Object} enemyData - src/data/enemies.js 항목
   */
  constructor(scene, x, y, enemyData) {
    super(scene, x, y)
    this.enemyData = enemyData
    this.hp = enemyData.maxHp
    this.attackTimer = 0
    this.alive = true

    // 몸통 (단순 사각형)
    this.body = scene.add.rectangle(0, -15, 60, 60, enemyData.color)
    this.add(this.body)

    // 이름
    this.nameText = scene.add.text(0, -52, enemyData.name, {
      fontSize: '11px', color: '#ffffff'
    }).setOrigin(0.5)
    this.add(this.nameText)

    // HP바 배경
    this.hpBarBg = scene.add.rectangle(0, 22, SLOT_W, 8, 0x333333)
    this.add(this.hpBarBg)

    // HP바
    this.hpBar = scene.add.rectangle(-SLOT_W / 2, 22, SLOT_W, 8, 0xff4444).setOrigin(0, 0.5)
    this.add(this.hpBar)

    // 공격 타이머 게이지 배경 (파랑)
    this.timerBg = scene.add.rectangle(0, 34, SLOT_W, 6, 0x222255)
    this.add(this.timerBg)

    // 공격 타이머 채우기
    this.timerBar = scene.add.rectangle(-SLOT_W / 2, 34, SLOT_W, 6, 0x4488ff).setOrigin(0, 0.5)
    this.timerBar.setScale(0, 1)
    this.add(this.timerBar)

    scene.add.existing(this)
  }

  /**
   * 매 프레임 호출. 공격 타이머 진행.
   * @param {number} delta - ms
   * @returns {number|null} 공격 시 데미지 값, 아직이면 null
   */
  update(delta) {
    if (!this.alive) return null
    this.attackTimer += delta
    const progress = Math.min(this.attackTimer / this.enemyData.attackInterval, 1)
    this.timerBar.setScale(progress, 1)
    if (this.attackTimer >= this.enemyData.attackInterval) {
      this.attackTimer = 0
      this.timerBar.setScale(0, 1)
      return this.enemyData.attack
    }
    return null
  }

  /**
   * 데미지 적용.
   * @returns {boolean} 사망 여부
   */
  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount)
    const ratio = this.hp / this.enemyData.maxHp
    this.hpBar.setScale(ratio, 1)
    if (this.hp <= 0) {
      this.alive = false
      this.setVisible(false)
    }
    return this.hp <= 0
  }
}
```

- [ ] **Step 3: 커밋**

```bash
git add src/objects/CharacterSlot.js src/objects/EnemySlot.js
git commit -m "feat: add CharacterSlot and EnemySlot UI objects"
```

---

## Task 9: BattleScene 및 씬 흐름

**Files:**
- Create: `src/scenes/BootScene.js`
- Create: `src/scenes/StageSelectScene.js`
- Create: `src/scenes/PartySelectScene.js`
- Create: `src/scenes/BattleScene.js`
- Modify: `src/main.js`

- [ ] **Step 1: BootScene.js 생성**

`src/scenes/BootScene.js`:
```js
import Phaser from 'phaser'

export default class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }) }
  preload() { /* MVP: 절차적 렌더링이므로 외부 에셋 없음 */ }
  create()  { this.scene.start('StageSelectScene') }
}
```

- [ ] **Step 2: StageSelectScene.js 생성**

`src/scenes/StageSelectScene.js`:
```js
import Phaser from 'phaser'
import { STAGES } from '../data/stages.js'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js'

export default class StageSelectScene extends Phaser.Scene {
  constructor() { super({ key: 'StageSelectScene' }) }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e)

    this.add.text(GAME_WIDTH / 2, 80, 'Elemental Command', {
      fontSize: '28px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 130, '스테이지 선택', {
      fontSize: '18px', color: '#aaaaaa'
    }).setOrigin(0.5)

    STAGES.forEach((stage, i) => {
      const y = 220 + i * 90
      const btn = this.add.rectangle(GAME_WIDTH / 2, y, 300, 70, 0x2a2a4e)
        .setStrokeStyle(2, 0x4444aa)
        .setInteractive({ useHandCursor: true })

      this.add.text(GAME_WIDTH / 2, y - 14, `Stage ${stage.id}`, {
        fontSize: '13px', color: '#aaaaff'
      }).setOrigin(0.5)

      this.add.text(GAME_WIDTH / 2, y + 10, stage.name, {
        fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5)

      btn.on('pointerover', () => btn.setFillStyle(0x3a3a6e))
      btn.on('pointerout',  () => btn.setFillStyle(0x2a2a4e))
      btn.on('pointerdown', () => this.scene.start('PartySelectScene', { stageId: stage.id }))
    })
  }
}
```

- [ ] **Step 3: PartySelectScene.js 생성**

`src/scenes/PartySelectScene.js`:
```js
import Phaser from 'phaser'
import { CHARACTERS } from '../data/characters.js'
import { GEM_LABEL, GAME_WIDTH, GAME_HEIGHT } from '../constants.js'

export default class PartySelectScene extends Phaser.Scene {
  constructor() { super({ key: 'PartySelectScene' }) }

  init(data) { this.stageId = data.stageId }

  create() {
    this.selectedParty = []
    this.cardMap = new Map()  // characterId → card rectangle

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e)

    this.add.text(GAME_WIDTH / 2, 55, '파티 편성 (최대 4인)', {
      fontSize: '20px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5)

    CHARACTERS.forEach((char, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = 120 + col * 242
      const y = 155 + row * 130

      const card = this.add.rectangle(x, y, 210, 110, 0x2a2a4e)
        .setStrokeStyle(2, char.color)
        .setInteractive({ useHandCursor: true })
      this.cardMap.set(char.id, card)

      this.add.text(x, y - 36, char.name, {
        fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5)

      const seqStr = char.skillSequence.map(t => GEM_LABEL[t]).join('→')
      this.add.text(x, y - 10, seqStr, {
        fontSize: '12px', color: '#aaaaaa'
      }).setOrigin(0.5)

      this.add.text(x, y + 12, char.skillName, {
        fontSize: '12px', color: '#ffff88'
      }).setOrigin(0.5)

      this.add.text(x, y + 34, `공격력 ${char.attack}  HP ${char.maxHp}`, {
        fontSize: '10px', color: '#aaaaaa'
      }).setOrigin(0.5)

      card.on('pointerdown', () => this._toggleCharacter(char))
    })

    this.partyDisplay = this.add.text(GAME_WIDTH / 2, 555, '파티: (미선택)', {
      fontSize: '13px', color: '#ffff88'
    }).setOrigin(0.5)

    // 전투 시작 버튼
    const startBtn = this.add.rectangle(GAME_WIDTH / 2, 630, 220, 60, 0x224422)
      .setStrokeStyle(2, 0x44aa44)
      .setInteractive({ useHandCursor: true })

    this.add.text(GAME_WIDTH / 2, 630, '전투 시작!', {
      fontSize: '20px', color: '#44ff44', fontStyle: 'bold'
    }).setOrigin(0.5)

    startBtn.on('pointerover', () => startBtn.setFillStyle(0x336633))
    startBtn.on('pointerout',  () => startBtn.setFillStyle(0x224422))
    startBtn.on('pointerdown', () => {
      if (this.selectedParty.length === 0) return
      this.scene.start('BattleScene', { stageId: this.stageId, party: this.selectedParty })
    })
  }

  _toggleCharacter(char) {
    const idx = this.selectedParty.findIndex(c => c.id === char.id)
    const card = this.cardMap.get(char.id)
    if (idx >= 0) {
      this.selectedParty.splice(idx, 1)
      card.setFillStyle(0x2a2a4e)
    } else {
      if (this.selectedParty.length >= 4) return
      this.selectedParty.push(char)
      card.setFillStyle(0x4a4a8e)
    }
    const names = this.selectedParty.map(c => c.name).join(', ') || '(미선택)'
    this.partyDisplay.setText(`파티: ${names}`)
  }
}
```

- [ ] **Step 4: BattleScene.js 생성**

`src/scenes/BattleScene.js`:
```js
import Phaser from 'phaser'
import HexBoard from '../objects/HexBoard.js'
import CharacterSlot from '../objects/CharacterSlot.js'
import EnemySlot from '../objects/EnemySlot.js'
import { buildWeights } from '../systems/GemSpawner.js'
import { checkSequence } from '../systems/SequenceChecker.js'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js'
import { ENEMIES } from '../data/enemies.js'
import { STAGES } from '../data/stages.js'

export default class BattleScene extends Phaser.Scene {
  constructor() { super({ key: 'BattleScene' }) }

  init(data) {
    this.stageId    = data.stageId || 1
    this.party      = data.party   || []
    this.battleEnded = false
  }

  create() {
    const stage = STAGES.find(s => s.id === this.stageId)

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e)

    this._setupEnemies(stage.enemies)
    this._setupParty()

    const weights = buildWeights(this.party)
    this.board = new HexBoard(this, weights)
    this.board.on('dragComplete', this._onDragComplete, this)

    this.activeIndex = 0
    this.characterSlots[0].setActive(true)
    this._updateSequenceHint()

    // 결과 오버레이 (숨김)
    this.resultText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontSize: '40px', color: '#ffffff',
      backgroundColor: '#000000bb',
      padding: { x: 24, y: 14 }
    }).setOrigin(0.5).setDepth(20).setVisible(false)
  }

  update(_time, delta) {
    if (this.battleEnded) return
    for (const slot of this.enemySlots) {
      const dmg = slot.update(delta)
      if (dmg !== null) this._applyEnemyAttack(dmg)
    }
  }

  // ─── 셋업 ────────────────────────────────────────────

  _setupEnemies(enemyList) {
    const count = enemyList.length
    const startX = GAME_WIDTH / 2 - ((count - 1) * 120) / 2
    this.enemySlots = enemyList.map((e, i) =>
      new EnemySlot(this, startX + i * 120, 130, ENEMIES[e.id])
    )
  }

  _setupParty() {
    const count = this.party.length
    const startX = GAME_WIDTH / 2 - ((count - 1) * 100) / 2
    this.characterSlots = this.party.map((charData, i) =>
      new CharacterSlot(this, startX + i * 100, 310, charData)
    )

    this.seqHint = this.add.text(GAME_WIDTH / 2, 375, '', {
      fontSize: '13px', color: '#ffff88'
    }).setOrigin(0.5)
  }

  // ─── 드래그 처리 ─────────────────────────────────────

  _onDragComplete(path) {
    if (this.battleEnded) return
    const activeSlot = this.characterSlots[this.activeIndex]
    const gemTypes   = path.map(p => p.gemType)

    if (gemTypes.length === 0) {
      this._advanceCharacter()
      return
    }

    const skillFired = checkSequence(gemTypes, activeSlot.characterData.skillSequence)
    if (skillFired) {
      this._fireSkill(activeSlot)
    } else {
      this._fireBasicAttack(activeSlot)
    }

    // 드래그 종료 시 무조건 다음 캐릭터로
    this._advanceCharacter()
  }

  _fireSkill(charSlot) {
    const dmg = Math.floor(charSlot.characterData.attack * charSlot.characterData.skillMultiplier)
    this._dealDamageToEnemies(dmg)
    this.cameras.main.flash(250, 255, 220, 80)
  }

  _fireBasicAttack(charSlot) {
    this._dealDamageToEnemies(charSlot.characterData.attack)
  }

  _dealDamageToEnemies(totalDmg) {
    const alive = this.enemySlots.filter(s => s.alive)
    if (alive.length === 0) return
    const perEnemy = Math.floor(totalDmg / alive.length)
    for (const slot of alive) slot.takeDamage(perEnemy)
    this._checkVictory()
  }

  // ─── 적 공격 ──────────────────────────────────────────

  _applyEnemyAttack(dmg) {
    const alive = this.characterSlots.filter(s => !s.isDead())
    if (alive.length === 0) return
    const target = alive[Math.floor(Math.random() * alive.length)]
    target.takeDamage(dmg)
    this._checkDefeat()
  }

  // ─── 캐릭터 순환 ─────────────────────────────────────

  _advanceCharacter() {
    this.characterSlots[this.activeIndex].setActive(false)
    let attempts = 0
    do {
      this.activeIndex = (this.activeIndex + 1) % this.characterSlots.length
      attempts++
    } while (this.characterSlots[this.activeIndex].isDead() && attempts < this.characterSlots.length)

    this.characterSlots[this.activeIndex].setActive(true)
    this._updateSequenceHint()
  }

  _updateSequenceHint() {
    const active = this.characterSlots[this.activeIndex]
    const labels = { fire: '불', water: '물', grass: '풀', light: '빛', dark: '어둠' }
    const seq = active.characterData.skillSequence.map(t => labels[t]).join(' → ')
    this.seqHint.setText(`${active.characterData.name}: ${seq}`)
  }

  // ─── 승패 판정 ────────────────────────────────────────

  _checkVictory() {
    if (this.battleEnded) return
    if (this.enemySlots.every(s => !s.alive)) {
      this.battleEnded = true
      this.resultText.setText('승리!').setVisible(true)
      this.time.delayedCall(2500, () => this.scene.start('StageSelectScene'))
    }
  }

  _checkDefeat() {
    if (this.battleEnded) return
    if (this.characterSlots.every(s => s.isDead())) {
      this.battleEnded = true
      this.resultText.setText('패배...').setVisible(true)
      this.time.delayedCall(2500, () => this.scene.start('StageSelectScene'))
    }
  }
}
```

- [ ] **Step 5: main.js 완성**

`src/main.js`:
```js
import Phaser from 'phaser'
import BootScene        from './scenes/BootScene.js'
import StageSelectScene from './scenes/StageSelectScene.js'
import PartySelectScene from './scenes/PartySelectScene.js'
import BattleScene      from './scenes/BattleScene.js'
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js'

new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  scene: [BootScene, StageSelectScene, PartySelectScene, BattleScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  parent: document.body
})
```

- [ ] **Step 6: 전체 게임 플레이 확인**

```bash
npm run dev
```

Expected:
1. StageSelectScene — 5개 스테이지 버튼 표시
2. PartySelectScene — 5개 캐릭터 카드, 최대 4인 선택 후 전투 시작
3. BattleScene — 헥사 보드 렌더링, 드래그 시 연결선 표시, 시퀀스 힌트 표시, 적 타이머 게이지 진행, 승패 판정

- [ ] **Step 7: 전체 테스트 통과 확인**

```bash
npm test
```

Expected: GemSpawner 5개 + SequenceChecker 6개 + HexGeometry 5개 = 총 16개 PASS

- [ ] **Step 8: 커밋**

```bash
git add src/scenes/ src/main.js
git commit -m "feat: complete MVP battle game with all scenes and battle logic"
```

---

## Task 10: 빌드 및 배포 준비

**Files:**
- Modify: `package.json` (preview script 확인)

- [ ] **Step 1: 프로덕션 빌드**

```bash
npm run build
```

Expected: `dist/` 폴더 생성, 에러 없음

- [ ] **Step 2: 빌드 결과 미리보기**

```bash
npx vite preview
```

Expected: `http://localhost:4173` 에서 정상 동작 확인

- [ ] **Step 3: .gitignore 생성**

```
node_modules/
dist/
```

- [ ] **Step 4: 최종 커밋 및 푸시**

```bash
git add .gitignore
git commit -m "chore: add gitignore"
git push origin master
```

---

## 자체 검토 (Spec Coverage)

| 스펙 항목 | 구현 Task |
|-----------|-----------|
| 헥사 보드 5×6 | Task 7 (HexBoard) |
| 5속성 젬 | Task 2 (constants), Task 6 (Gem) |
| 드래그 연결 + 경로 시각화 | Task 7 (HexBoard._drawPath) |
| 파티 기반 젬 스폰 확률 | Task 3 (GemSpawner) |
| 시퀀스 검증 | Task 4 (SequenceChecker) |
| 드래그 종료 시 무조건 캐릭터 교체 | Task 9 (_onDragComplete → _advanceCharacter) |
| 4인 파티 순환 A→B→C→D | Task 9 (_advanceCharacter) |
| 적 실시간 공격 타이머 | Task 8 (EnemySlot.update) |
| HP바 (아군/적) | Task 8 (CharacterSlot, EnemySlot) |
| 공격 타이머 게이지 | Task 8 (EnemySlot.timerBar) |
| 시퀀스 힌트 표시 | Task 9 (_updateSequenceHint) |
| 스테이지 5개 | Task 2 (stages.js) |
| 스테이지 선택 씬 | Task 9 (StageSelectScene) |
| 파티 편성 씬 | Task 9 (PartySelectScene) |
| 승리/패배 판정 | Task 9 (_checkVictory, _checkDefeat) |
