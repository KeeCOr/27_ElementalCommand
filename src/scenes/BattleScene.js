import Phaser from 'phaser'
import HexBoard from '../objects/HexBoard.js'
import CharacterSlot from '../objects/CharacterSlot.js'
import EnemySlot from '../objects/EnemySlot.js'
import { buildWeights } from '../systems/GemSpawner.js'
import { checkSequence } from '../systems/SequenceChecker.js'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js'
import { ENEMIES } from '../data/enemies.js'
import { STAGES } from '../data/stages.js'

export default class BattleScene extends Phaser.Scene {
  constructor() { super({ key: 'BattleScene' }) }

  init(data) {
    this.stageId    = data.stageId || 1
    this.party      = data.party   || []
    this.battleEnded = false
  }

  create() {
    const stage = STAGES.find(s => s.id === this.stageId)

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e)

    this._setupEnemies(stage.enemies)
    this._setupParty()

    const weights = buildWeights(this.party)
    this.board = new HexBoard(this, weights)
    this.board.on('dragComplete', this._onDragComplete, this)

    this.activeIndex = 0
    this.characterSlots[0].setActive(true)
    this._updateSequenceHint()

    // 결과 오버레이 (숨김)
    this.resultText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontSize: '40px', color: '#ffffff',
      backgroundColor: '#000000bb',
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

  // ─── 셋업 ────────────────────────────────────────────

  _setupEnemies(enemyList) {
    const count = enemyList.length
    const startX = GAME_WIDTH / 2 - ((count - 1) * 120) / 2
    this.enemySlots = enemyList.map((e, i) =>
      new EnemySlot(this, startX + i * 120, 130, ENEMIES[e.id])
    )
  }

  _setupParty() {
    const count = this.party.length
    const startX = GAME_WIDTH / 2 - ((count - 1) * 100) / 2
    this.characterSlots = this.party.map((charData, i) =>
      new CharacterSlot(this, startX + i * 100, 310, charData)
    )

    this.seqHint = this.add.text(GAME_WIDTH / 2, 375, '', {
      fontSize: '13px', color: '#ffff88'
    }).setOrigin(0.5)
  }

  // ─── 드래그 처리 ─────────────────────────────────────

  _onDragComplete(path) {
    if (this.battleEnded) return
    const activeSlot = this.characterSlots[this.activeIndex]
    const gemTypes   = path.map(p => p.gemType)

    if (gemTypes.length === 0) {
      this._advanceCharacter()
      return
    }

    const skillFired = checkSequence(gemTypes, activeSlot.characterData.skillSequence)
    if (skillFired) {
      this._fireSkill(activeSlot)
    } else {
      this._fireBasicAttack(activeSlot)
    }

    // 드래그 종료 시 무조건 다음 캐릭터로
    this._advanceCharacter()
  }

  _fireSkill(charSlot) {
    const dmg = Math.floor(charSlot.characterData.attack * charSlot.characterData.skillMultiplier)
    this._dealDamageToEnemies(dmg)
    this.cameras.main.flash(250, 255, 220, 80)
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

  // ─── 적 공격 ──────────────────────────────────────────

  _applyEnemyAttack(dmg) {
    const alive = this.characterSlots.filter(s => !s.isDead())
    if (alive.length === 0) return
    const target = alive[Math.floor(Math.random() * alive.length)]
    target.takeDamage(dmg)
    this._checkDefeat()
  }

  // ─── 캐릭터 순환 ─────────────────────────────────────

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
    const labels = { fire: '불', water: '물', grass: '풀', light: '빛', dark: '어둠' }
    const seq = active.characterData.skillSequence.map(t => labels[t]).join(' → ')
    this.seqHint.setText(`${active.characterData.name}: ${seq}`)
  }

  // ─── 승패 판정 ────────────────────────────────────────

  _checkVictory() {
    if (this.battleEnded) return
    if (this.enemySlots.every(s => !s.alive)) {
      this.battleEnded = true
      this.resultText.setText('승리!').setVisible(true)
      this.time.delayedCall(2500, () => this.scene.start('StageSelectScene'))
    }
  }

  _checkDefeat() {
    if (this.battleEnded) return
    if (this.characterSlots.every(s => s.isDead())) {
      this.battleEnded = true
      this.resultText.setText('패배...').setVisible(true)
      this.time.delayedCall(2500, () => this.scene.start('StageSelectScene'))
    }
  }
}
