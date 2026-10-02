export function previewCommand({ basePower, elementMultiplier = 1, targets = 1, retaliation = 0 }) {
  const expectedDamage = Math.round(basePower * elementMultiplier);
  const affinity = elementMultiplier > 1 ? '유리' : elementMultiplier < 1 ? '불리' : '보통';
  return { expectedDamage, totalImpact: expectedDamage * Math.max(1, targets), affinity, affinityIcon: affinity === '유리' ? '▲' : affinity === '불리' ? '▼' : '●', retaliation };
}

export function explainElementCombo(elements = []) {
  const key = [...new Set(elements)].sort().join('+');
  const combos = { 'fire+wind': { name: '화염 폭풍', effect: '전체 피해 증가' }, 'earth+water': { name: '생명의 벽', effect: '방어막과 회복' } };
  return combos[key] || { name: '단일 속성', effect: '추가 조합 없음' };
}

export function debriefCommands(commands = []) {
  const ranked = [...commands].sort((a, b) => (b.impact || 0) - (a.impact || 0));
  const wasted = ranked.filter(c => (c.impact || 0) <= 0).map(c => c.name);
  const bestCommand = ranked.find(c => (c.impact || 0) > 0);
  const candidates = ranked.filter(c => (c.impact || 0) <= 0 && Array.isArray(c.requiredGems) && c.requiredGems.length > 0);
  const source = candidates.length > 0 ? candidates : ranked.filter(c => Array.isArray(c.requiredGems) && c.requiredGems.length > 0);
  const elementCounts = source.flatMap(c => c.requiredGems).reduce((counts, type) => {
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {});
  const recommendedElement = Object.entries(elementCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || null;
  const elementName = {
    fire: '불', water: '물', grass: '자연', light: '빛', dark: '어둠',
  }[recommendedElement];
  return {
    best: bestCommand?.name || '기록 없음',
    wasted,
    bestImpact: bestCommand?.impact || 0,
    nextCheck: wasted.length > 0 ? '약점 보석과 명령 순서를 맞춰라' : '최고 효율 명령을 다시 연결하라',
    nextCommand: bestCommand ? `${bestCommand.name} 우선 재현` : '선택 명령 1개를 먼저 완성',
    recommendedElement,
    deckAdvice: elementName
      ? `${elementName} 속성 지휘관 우선 · ${recommendedElement.toUpperCase()} 보석 공급 보강`
      : '현재 편성을 유지하고 약점 명령 순서를 조정',
  };
}
