# ElementalCommand Next Improvement Instruction

Date: 2026-06-24

## Goal
Turn the current biggest project issue into a small, executable improvement batch. This file is intentionally scoped so the next worker can start without rereading the whole workspace audit.

## Instructions
1. Create one elemental matchup example that shows previewed advantage, resolved effect, and next tactical implication.
2. Add feedback for command selection so attribute counters are visible before and after action.
3. Audit runtime visual references for SVG/code-drawn elemental icons when touching combat UI.

## Completion Rules
- Do not include discarded projects in this batch.
- If gameplay, UI, systems, content, controls, build behavior, or project scope changes, update the project planning document and update log before build/release.
- If runtime source changes, run the nearest available validation and then perform the required build/package step from the project instructions.
- If a folder or asset looks ambiguous, document the decision instead of deleting it.

## 2026-06-30 Completion Note
- Completed by v0.3.0/v0.3.1: command matchup preview, resolved effect feedback, before/after weakness counter text, and separated skill-selection/command-preview HUD groups are present.
- Validation to rerun for release freshness: `npm test` and `npm run build`.
- Next recommended batch: add a small visual flash or icon pulse when the previewed weakness counter is completed, reusing existing bitmap assets and keeping code-drawn shapes limited to HUD/progress indicators.

## 2026-07-01 Completion Note
- Completed the recommended weakness-counter feedback batch: resolved full weakness counters now trigger a small enemy-slot gem pulse using existing bitmap gem textures.
- Added pure helper coverage for when the pulse should and should not fire.
- Web build refreshed with `npm run build`; executable packaging is not configured for this Vite-only project batch.


## 2026-09-18 전체 프로젝트 공통 완료 조건

1. **첫 5분 핵심 루프**: 시작 10초 안에 목표가 읽히고, 5분 안에 첫 판단→실행→결과→보상/손실→다음 목표가 한 번 완결되어야 한다.
2. **판단 전후 피드백**: 선택 전 예상 이득·위험·비용, 실행 직후 성공·실패·상태 변화, 결과 화면의 원인·변화·다음 점검 행동을 같은 흐름으로 제공한다. 정답을 자동 추천하지 않는다.
3. **출시 증거 패키지**: 테스트·빌드·첫 5분 수동 확인·대표 실행 화면·로딩/빈 상태/오류/저장 복귀·버전과 검증 날짜를 기록한다. 수행하지 않은 항목은 미검증으로 표시한다.

공통 기준 원문: `C:\Development\_workspace_docs\전체_프로젝트_공통_개선기준_2026-09-18.md`

## 2026-09-18 프로젝트별 고유 개선 3개
> 아래 세 항목은 이 프로젝트의 고유 우선순위다. 구현 후에만 완료로 표시한다.

1. 명령 전 속성 유불리와 예상 피해 차이를 아이콘화
2. 복합 속성 조합의 생성 조건과 효과를 전투 중 설명
3. 전투 후 가장 효과적인 상성 판단과 낭비된 명령 표시
