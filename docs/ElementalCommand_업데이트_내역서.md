## 2026-07-01 v0.4.0 Weakness Counter Pulse
- Added a resolved weakness-break pulse that only plays when the selected skill preview predicted a full counter completion and the resolved enemy weakness actually completes.
- The pulse reuses existing `gem-*` bitmap textures above the enemy weakness row; no new SVG or code-drawn elemental icon resource was added.
- Added CombatBoard helper coverage for matched preview completion, non-breaking previews, and mismatched/unresolved enemy results.
- Validation: `npm test` and `npm run build` were rerun for this no-release-copy batch.


## 2026-06-29 v0.3.0 Command Matchup Feedback
- Added command matchup preview for selected skills in BattleScene.
- Shows best counter target, before/after weakness counters, resolved effect, and next tactical implication.
- Added CombatBoard helper tests for advantage, weakness break, and neutral/no-counter cases.
- Validation: `npm test` and `npm run build` are required for this release batch.
# ElementalCommand ?낅뜲?댄듃 ?댁뿭??
## 2026-06-24 臾몄꽌 援ъ“ ?뺣━
- 湲고쉷?쒖? ?낅뜲?댄듃 ?댁뿭?쒕? 遺꾨━?덈떎.
- 湲고쉷?쒕뒗 寃뚯엫 ?뚭컻, ?듭떖 猷⑦봽, MVP 媛?? KPI, UX ?먯튃 以묒떖?쇰줈 ?ъ옉?깊뻽??
- 蹂寃??대젰, 援ы쁽 濡쒓렇, 寃利?湲곕줉? ??臾몄꽌?먯꽌 愿由ы븳??

## 湲곗〈 臾몄꽌?먯꽌 遺꾨━???대젰 ?꾨낫
- v0.1.0
- 2026-05-29
- ?쒕옒洹??꾨즺 ???먮룞?쇰줈 ?ㅼ쓬 罹먮┃?곕줈 ?꾪솚
- ?쒕옒洹??꾨즺 ??寃쎈줈?곸쓽 ?ъ씠 ?뚮え??- ?꾪닾 以??쒕옒洹??꾨즺留덈떎 ?먮룞 ?쒗솚
- ?쎌젏 ?꾨즺 ?? ????곕?吏 + ??대㉧ 由ъ뀑 + 吏꾪뻾??珥덇린??- ?꾩옱 UI ?ㅼ틦?대뵫 ?꾨즺, ?곸꽭 硫붿빱??援ы쁽 ?덉젙.
- ?쒋?? SequenceChecker.js    # ?쒕옒洹??쒗??寃利?- v0.1.0 (?꾩옱) - MVP + ?꾪듃 ?낃렇?덉씠??- v0.2.0 - 肄섑뀗痢??뺤옣
- 諛곗튂 ?쒖뒪??援ы쁽
- v0.3.0 - ?대━??- 13. UX ?⑤낫???쒖뒪??(v0.1.0 異붽?)
- 蹂寃??대젰
- v0.2.02026-06-08Monster portrait sheet background removed with transparent edge mask; executable bundle refreshed without launching it.
- v0.1.02026-05-29UX ?⑤낫??異붽? ???띿꽦 ?곸꽦??HUD 異붽?, ?뚰떚 ?좏깮 ?붾㈃ ?띿꽦 諭껋? ?쒖떆, ?꾪닾 以????뚰듃 ?ㅻ쾭?덉씠
- ?먮룞 媛깆떊: 2026-06-04. 肄붾뱶, ?? ?꾨━?? ?ㅼ젙 ?뚯씪?먯꽌 李몄“媛 ?뺤씤??由ъ냼??湲곗??낅땲??
- ?먮룞 媛깆떊: 2026-06-04. 怨듭쑀 ??臾몄꽌? ?④퍡 ?꾨옒 ?대?吏 寃쎈줈媛 ?ы븿?섏뼱???⑸땲??

## ?묒꽦 洹쒖튃
- 湲곕뒫 異붽?, 諛몃윴??蹂寃? UI/UX ?섏젙, 由ъ냼??援먯껜, 鍮뚮뱶/諛고룷 蹂寃쎌? ?좎쭨? 踰꾩쟾???④퍡 湲곕줉?쒕떎.
- 湲고쉷?쒖뿉??理쒖떊 ?뚭컻? ?꾩옱 ?ㅺ퀎 ?섎룄留??④린怨? 怨쇨굅 ?묒뾽 濡쒓렇????臾몄꽌濡??대룞?쒕떎.
- MD? HTML? ??긽 ?④퍡 媛깆떊?쒕떎.



## v0.3.1 - 2026-06-29 전투 HUD 그룹화
- 스킬 선택 정보와 커맨드 결과 예측을 별도 HUD 그룹으로 분리했다.
- BattleHudLayout helper와 테스트를 추가했다.
## 2026-09-23 v0.7.2 결과→덱/명령 선택 연결
- 격차: 기존 전투 회고는 최고 효율·낭비 명령을 표시했지만 2.5초 뒤 자동으로 사라졌고, 다음 명령이나 편성 변경으로 직접 이어지지 않았다.
- 변경: 시도 명령의 요구 보석과 지휘관 속성을 기록하고 `debriefCommands`가 다음 명령과 보강 속성을 계산한다.
- 결과 UI: 자동 전환을 제거하고 `Retry`, `Edit Party`, `Stages`를 제공한다. `Edit Party`는 덱 보강 조언을 편성 화면으로 전달한다.
- 자산: 기존 결과 패널과 버튼 이미지를 재사용했으며 새 이미지 생성 없음.
- 소스 계보: 복원 소스 v0.7.2, 루트 실행파일 v0.6.0, Drive 실행파일 v0.10.2. 대응 소스가 없는 Drive 실행파일로 현재 소스를 덮어쓰지 않았다.
- 검증: 집중 3개 파일·18개, 전체 14개 파일·82개 테스트, `npm run build` 통과. Impeccable detect 0건.
- 미실행: 의존성 강제 업그레이드·보안 감사, 포터블 패키징, Drive 배포, 통합 현황 수정.
- 미검증: 실제 승패 완주, 480×854 줄바꿈·버튼 입력, 저장 복귀.
- 알려진 경고: JavaScript 청크 약 1.53MB가 500kB를 초과한다.
