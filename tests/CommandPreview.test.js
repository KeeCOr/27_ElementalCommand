import { describe, expect, it } from 'vitest';
import { debriefCommands, explainElementCombo, previewCommand } from '../src/systems/CommandPreview.js';
describe('command preview', () => { it('shows affinity and total impact', () => expect(previewCommand({basePower:10,elementMultiplier:1.5,targets:2})).toMatchObject({expectedDamage:15,totalImpact:30,affinity:'유리'})); });
it('explains combos and wasted commands', () => { expect(explainElementCombo(['wind','fire']).name).toBe('화염 폭풍'); expect(debriefCommands([{name:'A',impact:10},{name:'B',impact:0}]).wasted).toEqual(['B']); });
it('turns battle history into a learning-oriented next command and deck change', () => {
  expect(debriefCommands([
    { name: '화염 폭풍', impact: 101, requiredGems: ['fire', 'fire', 'water'] },
    { name: '기본 공격', impact: 0, requiredGems: ['water', 'water', 'light'] },
  ])).toEqual({
    best: '화염 폭풍', wasted: ['기본 공격'], bestImpact: 101,
    nextCheck: '약점 보석과 명령 순서를 맞춰라',
    nextCommand: '화염 폭풍 우선 재현',
    recommendedElement: 'water',
    deckAdvice: '물 속성 지휘관 우선 · WATER 보석 공급 보강',
  });
  expect(debriefCommands([])).toMatchObject({
    best: '기록 없음', bestImpact: 0, nextCommand: '선택 명령 1개를 먼저 완성', recommendedElement: null,
  });
});
