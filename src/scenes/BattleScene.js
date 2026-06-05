import Phaser from 'phaser'
import HexBoard from '../objects/HexBoard.js'
import CharacterSlot from '../objects/CharacterSlot.js'
import EnemySlot from '../objects/EnemySlot.js'
import { buildWeights } from '../systems/GemSpawner.js'
import { checkSequence } from '../systems/SequenceChecker.js'
import { getCharacterSkills, isElementGem, resolveBattleParty, scaleEnemyForStage } from '../systems/CombatBoard.js'
import { GAME_WIDTH, GAME_HEIGHT, GEM_LABEL, UI_FONT } from '../constants.js'
import { ENEMIES } from '../data/enemies.js'
import { STAGES } from '../data/stages.js'
import { CHARACTERS } from '../data/characters.js'

const PARTY_Y = 268
const SEQ_HINT_Y = 328
const SKILL_PANEL_Y = 356

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
    this.skillPanel = this.add.image(GAME_WIDTH / 2, SKILL_PANEL_Y, 'ui-skill-tray')
      .setDepth(8)
  }

  _updateSkillPanel() {
    for (const entry of this.skillCards) {
      entry.card.destroy()
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
      const card = this.add.image(x, SKILL_PANEL_Y, selected ? 'ui-skill-card-selected' : 'ui-skill-card')
        .setDepth(9)
      const hitZone = this.add.zone(x, SKILL_PANEL_Y, 104, 46)
        .setDepth(11)
        .setInteractive({ useHandCursor: true })
      const name = this.add.text(x, SKILL_PANEL_Y - 8, skill.name, {
        fontSize: '9px',
        fontFamily: UI_FONT,
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(10)
      const gems = this.add.text(x, SKILL_PANEL_Y + 9, skill.requiredGems.map(type => GEM_LABEL[type]).join(' > '), {
        fontSize: '10px',
        fontFamily: UI_FONT,
        color: '#fff1a8'
      }).setOrigin(0.5).setDepth(10)

      hitZone.on('pointerover', () => card.setTint(selected ? 0xd4ffe8 : 0xcfefff))
      hitZone.on('pointerout', () => card.clearTint())
      hitZone.on('pointerdown', () => {
        this.selectedSkillByCharacter.set(active.characterData.id, i)
        this._updateSkillPanel()
      })
      this.skillCards.push({ card, hitZone, name, gems })
    })
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
    if (skillFired) this._fireSkill(activeSlot, skill)
    else this._fireBasicAttack(activeSlot)

    const consumed = this.board.consumePath(path)
    this._applyWeaknessProgress(consumed.map(cell => cell.gemType).filter(isElementGem))
    this._advanceCharacter()
  }

  _selectedSkillFor(characterData) {
    const skills = getCharacterSkills(characterData)
    const index = this.selectedSkillByCharacter.get(characterData.id) || 0
    return skills[index] || skills[0]
  }

  _fireSkill(charSlot, skill) {
    const dmg = Math.floor(charSlot.characterData.attack * skill.multiplier)
    this._dealDamageToEnemies(dmg)
    this.cameras.main.flash(250, 255, 238, 150)
    this.cameras.main.shake(120, 0.004)
    this._showSkillCutIn(charSlot, skill)
  }

  _fireBasicAttack(charSlot) {
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
    this.board.addObstacle()
    this._checkDefeat()
  }

  _applyWeaknessProgress(destroyedTypes) {
    if (destroyedTypes.length === 0) return
    for (const slot of this.enemySlots) {
      slot.applyWeakness(destroyedTypes)
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
      this.resultText.setText('Victory!').setVisible(true)
      this.time.delayedCall(2500, () => this.scene.start('StageSelectScene'))
    }
  }

  _checkDefeat() {
    if (this.battleEnded) return
    if (this.characterSlots.every(s => s.isDead())) {
      this.battleEnded = true
      this.resultText.setText('Defeat...').setVisible(true)
      this.time.delayedCall(2500, () => this.scene.start('StageSelectScene'))
    }
  }
}
