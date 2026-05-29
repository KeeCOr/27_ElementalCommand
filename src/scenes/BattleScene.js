import Phaser from 'phaser'
import HexBoard from '../objects/HexBoard.js'
import CharacterSlot from '../objects/CharacterSlot.js'
import EnemySlot from '../objects/EnemySlot.js'
import { buildWeights } from '../systems/GemSpawner.js'
import { checkSequence } from '../systems/SequenceChecker.js'
import { GAME_WIDTH, GAME_HEIGHT, GEM_LABEL, UI_FONT, GEM_COLORS } from '../constants.js'
import { ENEMIES } from '../data/enemies.js'
import { STAGES } from '../data/stages.js'

const ELEMENT_HEX = {
  fire: '#ff6655', water: '#55aaff', grass: '#55cc66', light: '#ffee55', dark: '#cc77ff'
}
const ELEMENT_EMOJI = {
  fire: '🔥', water: '💧', grass: '🌿', light: '⚡', dark: '🌑'
}
// Affinity pairs shown in HUD: attacker → defender (strong)
const HUD_AFFINITY = [
  { atk: 'fire', def: 'grass' },
  { atk: 'water', def: 'fire' },
  { atk: 'grass', def: 'water' },
  { atk: 'light', def: 'dark' },
  { atk: 'dark', def: 'light' }
]

export default class BattleScene extends Phaser.Scene {
  constructor() { super({ key: 'BattleScene' }) }

  init(data) {
    this.stageId = data.stageId || 1
    this.party = data.party || []
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

    this.activeIndex = 0
    this.characterSlots[0].setActive(true)
    this._updateSequenceHint()

    // ── Element affinity mini HUD ───────────────────────────────────────────
    this._buildAffinityHUD()

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
      new EnemySlot(this, startX + i * 126, 144, ENEMIES[e.id])
    )
  }

  _setupParty() {
    const count = this.party.length
    const startX = GAME_WIDTH / 2 - ((count - 1) * 106) / 2
    this.characterSlots = this.party.map((charData, i) =>
      new CharacterSlot(this, startX + i * 106, 312, charData)
    )

    this.seqHint = this.add.text(GAME_WIDTH / 2, 389, '', {
      fontSize: '13px',
      fontFamily: UI_FONT,
      color: '#fff1a8',
      backgroundColor: '#101729aa',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5)
  }

  _onDragComplete(path) {
    if (this.battleEnded) return
    const activeSlot = this.characterSlots[this.activeIndex]
    const gemTypes = path.map(p => p.gemType)

    if (gemTypes.length === 0) {
      this._advanceCharacter()
      return
    }

    const skillFired = checkSequence(gemTypes, activeSlot.characterData.skillSequence)
    if (skillFired) this._fireSkill(activeSlot)
    else this._fireBasicAttack(activeSlot)

    this._advanceCharacter()
  }

  _fireSkill(charSlot) {
    const dmg = Math.floor(charSlot.characterData.attack * charSlot.characterData.skillMultiplier)
    this._dealDamageToEnemies(dmg)
    this.cameras.main.flash(250, 255, 238, 150)
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
    this._checkDefeat()
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
    this._updateSequenceHint()
  }

  _updateSequenceHint() {
    const active = this.characterSlots[this.activeIndex]
    const seq = active.characterData.skillSequence.map(t => GEM_LABEL[t]).join(' > ')
    this.seqHint.setText(`${active.characterData.name}: ${seq}`)
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

  // ── Element affinity mini HUD (bottom-right, collapsible) ─────────────────
  _buildAffinityHUD() {
    const panelW = 162
    const panelH = 124
    const px = GAME_WIDTH - panelW - 8
    const py = GAME_HEIGHT - panelH - 8

    // Panel background (low alpha to not clutter battle view)
    const bg = this.add.graphics().setDepth(10)
    bg.fillStyle(0x060c1a, 0.78).fillRoundedRect(px, py, panelW, panelH, 7)
    bg.lineStyle(1.5, 0x3a5a8c, 0.55).strokeRoundedRect(px + 1, py + 1, panelW - 2, panelH - 2, 7)

    this.add.text(px + panelW / 2, py + 10, 'AFFINITY', {
      fontSize: '9px', fontFamily: UI_FONT, color: '#8899bb', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10)

    HUD_AFFINITY.forEach((pair, i) => {
      const rowY = py + 24 + i * 19
      const atkHex = ELEMENT_HEX[pair.atk] || '#ffffff'
      const defHex = ELEMENT_HEX[pair.def] || '#ffffff'
      const atkColor = Phaser.Display.Color.HexStringToColor(atkHex).color
      const defColor = Phaser.Display.Color.HexStringToColor(defHex).color

      const g = this.add.graphics().setDepth(10)
      // Attacker dot
      g.fillStyle(atkColor, 0.9).fillCircle(px + 16, rowY + 6, 6)
      // Arrow
      g.lineStyle(1.5, 0x88cc88, 0.9)
        .lineBetween(px + 24, rowY + 6, px + 36, rowY + 6)
      g.fillStyle(0x88cc88, 1).fillTriangle(px + 40, rowY + 6, px + 34, rowY + 2, px + 34, rowY + 10)
      // Defender dot
      g.fillStyle(defColor, 0.9).fillCircle(px + 50, rowY + 6, 6)

      this.add.text(px + 16, rowY + 6, ELEMENT_EMOJI[pair.atk] || '', {
        fontSize: '7px', fontFamily: UI_FONT
      }).setOrigin(0.5).setDepth(10)

      this.add.text(px + 50, rowY + 6, ELEMENT_EMOJI[pair.def] || '', {
        fontSize: '7px', fontFamily: UI_FONT
      }).setOrigin(0.5).setDepth(10)

      this.add.text(px + 62, rowY + 1, `${pair.atk} → ${pair.def}`, {
        fontSize: '8.5px', fontFamily: UI_FONT, color: '#c8d8f0'
      }).setDepth(10)
    })
  }
}
