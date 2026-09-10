import Phaser from 'phaser'
import HexBoard from '../objects/HexBoard.js'
import CharacterSlot from '../objects/CharacterSlot.js'
import EnemySlot from '../objects/EnemySlot.js'
import { buildWeights } from '../systems/GemSpawner.js'
import { checkSequence } from '../systems/SequenceChecker.js'
import { buildCommandMatchupPreview, buildWeaknessCounterPulsePlan, getCharacterSkills, isElementGem, resolveBattleParty, scaleEnemyForStage } from '../systems/CombatBoard.js'
import { buildBattleHudGroups } from '../systems/BattleHudLayout.js'
import { playAudioCue, selectBattleResultCue } from '../systems/AudioCues.js'
import { createUiStateFrame, createUiSurface } from '../systems/ArtFactory.js'
import { GAME_WIDTH, GAME_HEIGHT, GEM_LABEL, UI_FONT } from '../constants.js'
import { ENEMIES } from '../data/enemies.js'
import { STAGES } from '../data/stages.js'
import { CHARACTERS } from '../data/characters.js'

const PARTY_Y = 268
const SEQ_HINT_Y = 328
const SKILL_PANEL_Y = 356
const COMMAND_PREVIEW_Y = 404
const HUD_GROUP_LEFT_X = 166
const HUD_GROUP_RIGHT_X = 370
const PANEL_DEPTH = 8
const CARD_DEPTH = 9
const HIGHLIGHT_DEPTH = 9.5
const CONTENT_DEPTH = 10
const HIT_ZONE_DEPTH = 11

export default class BattleScene extends Phaser.Scene {
  constructor() { super({ key: 'BattleScene' }) }

  init(data) {
    this.stageId = data.stageId || 1
    this.party = resolveBattleParty(data.party, CHARACTERS)
    this.battleEnded = false
  }

  create() {
    const stage = STAGES.find(s => s.id === this.stageId)

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-battle')
    this.add.text(GAME_WIDTH / 2, 34, stage.name, {
      fontSize: '18px',
      fontFamily: UI_FONT,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#101729',
      strokeThickness: 4
    }).setOrigin(0.5)

    this._setupEnemies(stage.enemies)
    this._setupParty()

    const weights = buildWeights(this.party)
    this.board = new HexBoard(this, weights)
    this.board.on('dragComplete', this._onDragComplete, this)
    this.selectedSkillByCharacter = new Map()

    this.activeIndex = 0
    this.characterSlots[0].setActive(true)
    this._setupSkillPanel()
    this._updateSkillPanel()

    this.resultText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontSize: '38px',
      fontFamily: UI_FONT,
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: '#000000cc',
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

  _setupEnemies(enemyList) {
    const count = enemyList.length
    const startX = GAME_WIDTH / 2 - ((count - 1) * 126) / 2
    this.enemySlots = enemyList.map((e, i) =>
      new EnemySlot(this, startX + i * 126, 144, scaleEnemyForStage(ENEMIES[e.id], this.stageId))
    )
  }

  _setupParty() {
    const count = this.party.length
    const startX = GAME_WIDTH / 2 - ((count - 1) * 106) / 2
    this.characterSlots = this.party.map((charData, i) =>
      new CharacterSlot(this, startX + i * 106, PARTY_Y, charData)
    )

    this.seqHint = this.add.text(GAME_WIDTH / 2, SEQ_HINT_Y, '', {
      fontSize: '12px',
      fontFamily: UI_FONT,
      color: '#fff1a8',
      backgroundColor: '#101729aa',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5)
  }

  _setupSkillPanel() {
    this.skillCards = []
    this.skillPanel = createUiSurface(this, GAME_WIDTH / 2, SKILL_PANEL_Y, 356, 44)
      .setDepth(PANEL_DEPTH)
    this.hudGroupPanels = [
      createUiSurface(this, HUD_GROUP_LEFT_X, COMMAND_PREVIEW_Y, 188, 54).setAlpha(0.86).setDepth(PANEL_DEPTH),
      createUiSurface(this, HUD_GROUP_RIGHT_X, COMMAND_PREVIEW_Y, 268, 70).setAlpha(0.9).setDepth(PANEL_DEPTH)
    ]
    this.hudGroupLabels = [
      this.add.text(HUD_GROUP_LEFT_X - 82, COMMAND_PREVIEW_Y - 20, 'SKILL SELECTION', {
        fontSize: '8px', fontFamily: UI_FONT, color: '#fff1a8', fontStyle: 'bold'
      }).setDepth(CONTENT_DEPTH),
      this.add.text(HUD_GROUP_RIGHT_X - 122, COMMAND_PREVIEW_Y - 20, 'COMMAND PREVIEW', {
        fontSize: '8px', fontFamily: UI_FONT, color: '#d9f2ff', fontStyle: 'bold'
      }).setDepth(CONTENT_DEPTH)
    ]
    this.hudGroupTexts = [
      this.add.text(HUD_GROUP_LEFT_X - 82, COMMAND_PREVIEW_Y - 6, '', {
        fontSize: '9px', fontFamily: UI_FONT, color: '#ffffff', lineSpacing: 2, wordWrap: { width: 158 }
      }).setDepth(CONTENT_DEPTH),
      this.add.text(HUD_GROUP_RIGHT_X - 122, COMMAND_PREVIEW_Y - 6, '', {
        fontSize: '8px', fontFamily: UI_FONT, color: '#d9f2ff', lineSpacing: 1, wordWrap: { width: 236 }
      }).setDepth(CONTENT_DEPTH)
    ]
  }

  _updateSkillPanel() {
    for (const entry of this.skillCards) {
      entry.card.destroy()
      entry.highlight.destroy()
      entry.hitZone.destroy()
      entry.name.destroy()
      entry.gems.destroy()
    }
    this.skillCards = []

    const active = this.characterSlots[this.activeIndex]
    const skills = getCharacterSkills(active.characterData)
    const selectedIndex = this.selectedSkillByCharacter.get(active.characterData.id) || 0
    const selectedSkill = skills[selectedIndex] || skills[0]
    this.seqHint.setText(`${active.characterData.name} - Selected: ${selectedSkill.name}`)

    skills.forEach((skill, i) => {
      const x = GAME_WIDTH / 2 - ((skills.length - 1) * 112) / 2 + i * 112
      const selected = skill.id === selectedSkill.id
      const card = createUiStateFrame(this, x, SKILL_PANEL_Y, 104, 38, selected ? 'selected' : 'normal')
        .setDepth(CARD_DEPTH)
      const highlight = this.add.rectangle(x, SKILL_PANEL_Y, 104, 38)
        .setStrokeStyle(2, selected ? 0xd4ffe8 : 0xcfefff, 0.9)
        .setDepth(HIGHLIGHT_DEPTH)
        .setVisible(false)
      const hitZone = this.add.zone(x, SKILL_PANEL_Y, 104, 46)
        .setDepth(HIT_ZONE_DEPTH)
        .setInteractive({ useHandCursor: true })
      const name = this.add.text(x, SKILL_PANEL_Y - 8, skill.name, {
        fontSize: '9px',
        fontFamily: UI_FONT,
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(CONTENT_DEPTH)
      const gems = this.add.text(x, SKILL_PANEL_Y + 9, skill.requiredGems.map(type => GEM_LABEL[type]).join(' > '), {
        fontSize: '10px',
        fontFamily: UI_FONT,
        color: '#fff1a8'
      }).setOrigin(0.5).setDepth(CONTENT_DEPTH)

      hitZone.on('pointerover', () => highlight.setVisible(true))
      hitZone.on('pointerout', () => highlight.setVisible(false))
      hitZone.on('pointerdown', () => {
        playAudioCue(this, 'elementSelect')
        this.selectedSkillByCharacter.set(active.characterData.id, i)
        this._updateSkillPanel()
      })
      this.skillCards.push({ card, highlight, hitZone, name, gems })
    })

    this._updateCommandPreview('Preview')
  }

  _onDragComplete(path) {
    if (this.battleEnded) return
    const activeSlot = this.characterSlots[this.activeIndex]
    const gemTypes = path.map(p => p.gemType).filter(isElementGem)

    if (path.length === 0) {
      this._advanceCharacter()
      return
    }

    const skill = this._selectedSkillFor(activeSlot.characterData)
    const skillFired = checkSequence(gemTypes, skill.requiredGems)
    const previewBeforeResolution = skillFired ? buildCommandMatchupPreview(skill, this.enemySlots, activeSlot.characterData) : null
    if (skillFired) this._fireSkill(activeSlot, skill)
    else this._fireBasicAttack(activeSlot)

    const consumed = this.board.consumePath(path)
    this._applyWeaknessProgress(consumed.map(cell => cell.gemType).filter(isElementGem), previewBeforeResolution)
    this._advanceCharacter()
    this._updateCommandPreview(skillFired ? 'Resolved skill' : 'Resolved basic', skill)
  }

  _updateCommandPreview(prefix = 'Preview', skill = null) {
    if (!this.hudGroupTexts || !this.enemySlots?.length || !this.characterSlots?.length) return
    const activeSlot = this.characterSlots[this.activeIndex]
    const selectedSkill = skill || this._selectedSkillFor(activeSlot.characterData)
    const preview = buildCommandMatchupPreview(selectedSkill, this.enemySlots, activeSlot.characterData)
    const counterLine = formatCounterDelta(preview.countersBefore, preview.countersAfter)
    const groups = buildBattleHudGroups({
      characterName: activeSlot.characterData.name,
      selectedSkillName: selectedSkill.name,
      preview: { ...preview, counterLine }
    })
    groups.forEach((group, index) => {
      if (!this.hudGroupLabels?.[index] || !this.hudGroupTexts?.[index]) return
      this.hudGroupLabels[index].setText(group.label)
      this.hudGroupTexts[index]
        .setColor(group.emphasis === 'break' ? '#fff1a8' : (group.role === 'primary-action' ? '#ffffff' : '#d9f2ff'))
        .setText(group.lines.join('\n'))
    })
  }

  _selectedSkillFor(characterData) {
    const skills = getCharacterSkills(characterData)
    const index = this.selectedSkillByCharacter.get(characterData.id) || 0
    return skills[index] || skills[0]
  }

  _fireSkill(charSlot, skill) {
    playAudioCue(this, 'skillAttack')
    const dmg = Math.floor(charSlot.characterData.attack * skill.multiplier)
    this._dealDamageToEnemies(dmg)
    this.cameras.main.flash(250, 255, 238, 150)
    this.cameras.main.shake(120, 0.004)
    this._showSkillCutIn(charSlot, skill)
  }

  _fireBasicAttack(charSlot) {
    playAudioCue(this, 'basicAttack')
    this._dealDamageToEnemies(charSlot.characterData.attack)
  }

  _dealDamageToEnemies(totalDmg) {
    const alive = this.enemySlots.filter(s => s.alive)
    if (alive.length === 0) return
    const perEnemy = Math.floor(totalDmg / alive.length)
    for (const slot of alive) slot.takeDamage(perEnemy)
    this._checkVictory()
  }

  _applyEnemyAttack(dmg) {
    const alive = this.characterSlots.filter(s => !s.isDead())
    if (alive.length === 0) return
    const target = alive[Math.floor(Math.random() * alive.length)]
    target.takeDamage(dmg)
    playAudioCue(this, 'enemyHit')
    this.board.addObstacle()
    this._checkDefeat()
  }

  _applyWeaknessProgress(destroyedTypes, previewBeforeResolution = null) {
    if (destroyedTypes.length === 0) return
    for (const slot of this.enemySlots) {
      const completed = slot.applyWeakness(destroyedTypes)
      const pulsePlan = buildWeaknessCounterPulsePlan(previewBeforeResolution, slot, completed)
      if (pulsePlan) {
        playAudioCue(this, 'weaknessBreak')
        slot.playWeaknessCounterPulse(pulsePlan.gemTypes)
      }
    }
    this._checkVictory()
  }

  _showSkillCutIn(charSlot, skill) {
    const portrait = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, `portrait-${charSlot.characterData.id}`)
      .setDisplaySize(250, 250)
      .setAlpha(0)
      .setDepth(18)
    const name = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 112, skill.name, {
      fontSize: '22px',
      fontFamily: UI_FONT,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#101729',
      strokeThickness: 5
    }).setOrigin(0.5).setAlpha(0).setDepth(19)

    this.tweens.add({
      targets: [portrait, name],
      alpha: { from: 0, to: 0.88 },
      scale: { from: 0.82, to: 1.08 },
      duration: 180,
      yoyo: true,
      hold: 260,
      onComplete: () => {
        portrait.destroy()
        name.destroy()
      }
    })
  }

  _advanceCharacter() {
    if (this.battleEnded) return
    this.characterSlots[this.activeIndex].setActive(false)
    let attempts = 0
    do {
      this.activeIndex = (this.activeIndex + 1) % this.characterSlots.length
      attempts++
    } while (this.characterSlots[this.activeIndex].isDead() && attempts < this.characterSlots.length)

    this.characterSlots[this.activeIndex].setActive(true)
    this._updateSkillPanel()
  }

  _checkVictory() {
    if (this.battleEnded) return
    if (this.enemySlots.every(s => !s.alive)) {
      this.battleEnded = true
      playAudioCue(this, selectBattleResultCue('victory'))
      this.resultText.setText('Victory!').setVisible(true)
      this.time.delayedCall(2500, () => this.scene.start('StageSelectScene'))
    }
  }

  _checkDefeat() {
    if (this.battleEnded) return
    if (this.characterSlots.every(s => s.isDead())) {
      this.battleEnded = true
      playAudioCue(this, selectBattleResultCue('defeat'))
      this.resultText.setText('Defeat...').setVisible(true)
      this.time.delayedCall(2500, () => this.scene.start('StageSelectScene'))
    }
  }
}

function formatCounterDelta(before, after) {
  if (!before.length || !after.length) return 'Counters: no matching weakness gems visible.'
  const parts = after.map((entry, i) => {
    const previous = before[i] || entry
    return `${GEM_LABEL[entry.type]} ${previous.current}/${entry.required} > ${entry.current}/${entry.required}`
  })
  return `Counters: ${parts.join(' | ')}`
}

