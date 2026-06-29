export function buildBattleHudGroups({ characterName, selectedSkillName, preview }) {
  const previewLines = [
    `Target: ${preview.enemyName}`,
    preview.resolvedEffect,
    preview.counterLine,
    preview.tacticalImplication,
  ].filter(Boolean)

  return [
    {
      id: 'skill-selection',
      label: 'SKILL SELECTION',
      role: 'primary-action',
      lines: [characterName, `Selected: ${selectedSkillName}`],
    },
    {
      id: 'command-preview',
      label: 'COMMAND PREVIEW',
      role: 'result-preview',
      emphasis: preview.willBreakWeakness ? 'break' : 'normal',
      lines: previewLines,
    },
  ]
}