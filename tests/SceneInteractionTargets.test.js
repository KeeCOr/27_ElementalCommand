import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const stageSelectSource = readFileSync('src/scenes/StageSelectScene.js', 'utf8')
const partySelectSource = readFileSync('src/scenes/PartySelectScene.js', 'utf8')
const battleSceneSource = readFileSync('src/scenes/BattleScene.js', 'utf8')
const hexBoardSource = readFileSync('src/objects/HexBoard.js', 'utf8')

describe('scene interaction targets', () => {
  it('uses explicit stage hit zones instead of relying on generated image bounds', () => {
    expect(stageSelectSource).toMatch(/add\.zone\(GAME_WIDTH \/ 2,\s*y,\s*300,\s*76\)/)
    expect(stageSelectSource).toMatch(/hitZone\.on\('pointerdown'/)
  })

  it('previews enemy art on stage cards', () => {
    expect(stageSelectSource).toMatch(/stage\.enemies\.slice\(0,\s*3\)\.forEach/)
    expect(stageSelectSource).toMatch(/`enemy-\$\{enemy\.id\}`/)
  })

  it('uses image-backed stage card frames', () => {
    expect(stageSelectSource).toMatch(/'ui-stage-card'/)
    expect(stageSelectSource).toMatch(/'ui-button-ready'/)
  })

  it('uses explicit party card hit zones instead of relying on generated image bounds', () => {
    expect(partySelectSource).toMatch(/add\.zone\(x,\s*y,\s*214,\s*116\)/)
    expect(partySelectSource).toMatch(/hitZone\.on\('pointerdown'/)
  })

  it('updates start battle affordance from party selection state', () => {
    expect(partySelectSource).toMatch(/this\.startLabel/)
    expect(partySelectSource).toMatch(/_refreshStartButton/)
    expect(partySelectSource).toMatch(/Select Commander/)
  })

  it('uses button and frame textures on the party screen', () => {
    expect(partySelectSource).toMatch(/'ui-party-card'/)
    expect(partySelectSource).toMatch(/'ui-button-disabled'/)
    expect(partySelectSource).toMatch(/'ui-button-ready'/)
  })

  it('keeps the skill selector above the hex board input area', () => {
    expect(battleSceneSource).toMatch(/SKILL_PANEL_Y\s*=\s*356/)
    expect(hexBoardSource).toMatch(/BOARD_ORIGIN_Y\s*=\s*410/)
  })

  it('uses explicit skill card hit zones so skill changes do not compete with board input', () => {
    expect(battleSceneSource).toMatch(/add\.zone\(x,\s*SKILL_PANEL_Y,\s*104,\s*46\)/)
    expect(battleSceneSource).toMatch(/hitZone\.on\('pointerdown'/)
  })

  it('uses frame textures for battle skill and deployable panels', () => {
    expect(battleSceneSource).toMatch(/'ui-skill-card'/)
    expect(battleSceneSource).toMatch(/'ui-skill-card-selected'/)
    expect(battleSceneSource).toMatch(/'ui-deploy-card'/)
    expect(battleSceneSource).toMatch(/'ui-deploy-card-selected'/)
  })

  it('shows the selected skill name in the active character hint', () => {
    expect(battleSceneSource).toMatch(/Selected: \$\{selectedSkill\.name\}/)
  })
})
