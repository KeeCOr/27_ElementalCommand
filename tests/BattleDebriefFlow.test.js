import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const battleSource = readFileSync('src/scenes/BattleScene.js', 'utf8')
const partySource = readFileSync('src/scenes/PartySelectScene.js', 'utf8')

describe('battle debrief decision flow', () => {
  it('keeps the result visible until the player chooses the next action', () => {
    expect(battleSource).not.toContain("delayedCall(2500, () => this.scene.start('StageSelectScene'))")
    expect(battleSource).toContain("label: 'Retry'")
    expect(battleSource).toContain("label: 'Edit Party'")
    expect(battleSource).toContain("label: 'Stages'")
  })

  it('passes deck advice into party selection and renders it there', () => {
    expect(battleSource).toContain('recommendation: debrief.deckAdvice')
    expect(partySource).toContain("this.recommendation = data.recommendation || ''")
    expect(partySource).toContain('Battle review · ${this.recommendation}')
  })

  it('records attempted command gems for the next deck decision', () => {
    expect(battleSource).toContain('requiredGems: [...skill.requiredGems]')
    expect(battleSource).toContain('commanderElement: activeSlot.characterData.element')
  })
})
