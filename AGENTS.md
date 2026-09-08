# ElementalCommand

## 프로젝트
- 이름: ElementalCommand
- 버전: 0.9.0
- 스택: Phaser 3 + Vite + 자가 포함 Windows HTTP 런처
- 웹 빌드: `npm run build`
- 단일 포터블 빌드: `npm run portable`
- 테스트: `npm test`

## 구조
- `src/main.js`: 엔트리포인트
- `src/scenes/`: 게임 씬
- `src/objects/`: 게임 오브젝트
- `src/systems/`: 게임·오디오 시스템
- `public/`: ImageGen PNG와 OGG 런타임 자산
- `tools/ElementalCommandLauncher.cs`: 임베디드 빌드를 `127.0.0.1`로 제공하는 런처

## UI·오디오
- HUD는 UI 규칙을 그대로 따른다. 같은 레이어의 정보는 겹치지 않는다.
- 런타임 자산은 PNG와 사전 렌더링 OGG를 사용하며 SVG·합성 오디오를 새로 추가하지 않는다.
