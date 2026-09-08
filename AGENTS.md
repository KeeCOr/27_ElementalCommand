# Project Instructions

## Project Identity

`27_EC / Elemental Command`는 5원소(Fire, Water, Grass, Light, Dark) 기반 헥스 그리드 전술 게임이다. 원소 시너지 시스템과 파티 조합이 핵심이며, 짧은 세션(10-15분) 중심으로 설계한다.

## Authoritative Stack

- 이름: ElementalCommand
- 버전: 0.9.0
- Phaser 3 + Vite 기반이며, 자가 포함 Windows HTTP 포터블 런처와 Electron/Steam 빌드 타겟을 함께 지원한다.
- 웹 빌드: `npm run build`
- 단일 포터블 빌드: `npm run portable`
- Steam 배포 빌드: `npm run dist:steam` (Vite 빌드 + electron-builder)
- Electron 실행: `npm run electron`
- 테스트: `npm test` (`vitest run`)
- 진입점: `src/main.js` → Vite로 `dist/` 출력 → `tools/ElementalCommandLauncher.cs` HTTP 런처 또는 Electron `electron/main.cjs`가 로드

## Structure

- `src/main.js`: 엔트리포인트
- `src/scenes/`: 게임 씬
- `src/objects/`: 게임 오브젝트
- `src/systems/`: 게임·오디오 시스템
- `src/data/`: 데이터 (원소 정의, 유닛 스탯)
- `src/constants.js`: 상수
- `public/`: ImageGen PNG와 OGG 런타임 자산
- `tools/ElementalCommandLauncher.cs`: 임베디드 빌드를 `127.0.0.1`로 제공하는 자가 포함 포터블 런처
- `electron/main.cjs`: Electron 메인 (Steam 초기화 포함)
- `electron/preload.cjs`: contextBridge (`window.steam`, `window.steamAchievement`)

## UI·오디오

- HUD는 UI 규칙을 그대로 따른다. 같은 레이어의 정보는 겹치지 않는다.
- 런타임 자산은 PNG와 사전 렌더링 OGG를 사용하며 SVG·합성 오디오를 새로 추가하지 않는다.

## Build And Verification

- 일반 빌드: `npm run build`
- 단일 포터블 빌드: `npm run portable`
- Steam 배포 빌드: `npm run dist:steam` (Vite 빌드 + electron-builder)
- 테스트: `npm test` (`vitest run`)
- 새 씬/시스템 추가 시 Phaser Scene registry 등록 확인
- 원소 시너지 변경은 `src/data/` 데이터와 실제 전투 계산이 일치하는지 확인

## Documentation Rules

- `docs/store-description.md`, `docs/store-description-ko.md` 최신 유지
- `docs/steam-achievements.md`에 신규 업적 추가 시 `src/` 연동 확인
- GDD 변경 시 `.md`와 `.html` 동기화

## AI-Assisted Workflow

1. Plan: 어떤 원소/씬/시스템을 변경할지, 포터블/Electron 중 어느 타겟에 영향이 있는지 정한다
2. Split: 게임 로직, UI, 데이터, 테스트, 문서 갱신을 분리한다
3. Build: Phaser/Vite 구조를 유지하며 좁게 수정한다
4. Verify: vitest, Vite 빌드, 포터블 런처 실행, Electron 실행, GDD 동기화 확인
5. Reflect: 반복되는 원소 규칙을 이 파일이나 GDD에 남긴다

## Do Not

- 원소 시너지 보너스를 임의로 바꾸지 않는다 (`src/data/` 기준)
- Phaser Scene을 등록하지 않고 참조하지 않는다
- 빌드 실패 상태에서 배포 완료를 주장하지 않는다
