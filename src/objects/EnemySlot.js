import Phaser from 'phaser'
import { GEM_COLORS, UI_FONT } from '../constants.js'
import { accumulateWeakness, getWeaknessRequirements } from '../systems/CombatBoard.js'

const SLOT_W = 104
const ATTACK_INTERVAL_MULTIPLIER = 3
const ATTACK_DAMAGE_MULTIPLIER = 3
const WEAKNESS_DAMAGE_RATIO = 0.35

export default class EnemySlot extends Phaser.GameObjects.Container {
  constructor(scene, x, y, enemyData) {
    super(scene, x, y)
    this.enemyData = enemyData
    this.hp = enemyData.maxHp
    this.attackTimer = 0
    this.alive = true
    this.weaknessProgress = {}

    this.aura = scene.add.graphics()
    this.aura.fillStyle(enemyData.color, 0.16).fillCircle(0, -18, 52)
    this.add(this.aura)

    this.body = scene.add.image(0, -12, `enemy-${enemyData.id}`).setDisplaySize(92, 92)
    this.add(this.body)

    this.nameText = scene.add.text(0, -74, enemyData.name, {
      fontSize: '11px',
      fontFamily: UI_FONT,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#101729',
      strokeThickness: 3
    }).setOrigin(0.5)
    this.add(this.nameText)

    this.hpBarBg = scene.add.rectangle(0, 42, SLOT_W, 8, 0x161827)
      .setStrokeStyle(1, 0xffffff, 0.18)
    this.add(this.hpBarBg)

    this.hpBar = scene.add.rectangle(-SLOT_W / 2, 42, SLOT_W, 8, 0xff5b5b).setOrigin(0, 0.5)
    this.add(this.hpBar)

    this.timerBg = scene.add.rectangle(0, 56, SLOT_W, 6, 0x101830)
    this.add(this.timerBg)

    this.timerBar = scene.add.rectangle(-SLOT_W / 2, 56, SLOT_W, 6, 0x58d7ff).setOrigin(0, 0.5)
    this.timerBar.setScale(0, 1)
    this.add(this.timerBar)

    this.weaknessRequirements = getWeaknessRequirements(enemyData.weaknessGems)
    this.weaknessIcons = this.weaknessRequirements.map((entry, i, list) => {
      const x = (i - (list.length - 1) / 2) * 16
      const icon = scene.add.circle(x, 68, 5, GEM_COLORS[entry.type], 0.25)
        .setStrokeStyle(1, GEM_COLORS[entry.type], 0.95)
      this.add(icon)
      const progressText = scene.add.text(x, 79, `0/${entry.count}`, {
        fontSize: '7px',
        fontFamily: UI_FONT,
        color: '#d9f2ff'
      }).setOrigin(0.5)
      this.add(progressText)
      return { icon, progressText, ...entry }
    })

    scene.add.existing(this)
  }

  update(delta) {
    if (!this.alive) return null
    this.attackTimer += delta
    const interval = this.enemyData.attackInterval * ATTACK_INTERVAL_MULTIPLIER
    const progress = Math.min(this.attackTimer / interval, 1)
    this.timerBar.setScale(progress, 1)
    this.body.rotation = Math.sin(this.attackTimer / 260) * 0.025
    if (this.attackTimer >= interval) {
      this.attackTimer = 0
      this.timerBar.setScale(0, 1)
      return this.enemyData.attack * ATTACK_DAMAGE_MULTIPLIER
    }
    return null
  }

  applyWeakness(destroyedTypes) {
    if (!this.alive || !this.enemyData.weaknessGems?.length) return false
    const result = accumulateWeakness(this.enemyData.weaknessGems, this.weaknessProgress, destroyedTypes)
    this.weaknessProgress = result.progress
    this._updateWeaknessIcons()
    if (!result.complete) return false

    this.attackTimer = 0
    this.timerBar.setScale(0, 1)
    this.takeDamage(Math.ceil(this.enemyData.maxHp * WEAKNESS_DAMAGE_RATIO))
    this.scene.cameras.main.flash(150, 120, 230, 255)
    return true
  }
  playWeaknessCounterPulse(gemTypes = []) {
    const pulseTypes = [...new Set(gemTypes.filter(type => GEM_COLORS[type]))].slice(0, 3)
    if (pulseTypes.length === 0) return

    pulseTypes.forEach((type, i, list) => {
      const x = this.x + (i - (list.length - 1) / 2) * 22
      const icon = this.scene.add.image(x, this.y + 68, `gem-${type}`)
        .setDisplaySize(24, 24)
        .setAlpha(0.92)
        .setDepth(this.depth + 5)

      this.scene.tweens.add({
        targets: icon,
        y: icon.y - 18,
        alpha: { from: 0.92, to: 0 },
        scale: { from: 0.5, to: 1.18 },
        duration: 420,
        ease: 'Cubic.easeOut',
        onComplete: () => icon.destroy()
      })
    })
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount)
    const ratio = this.hp / this.enemyData.maxHp
    this.hpBar.setScale(ratio, 1)
    this.scene.tweens.add({
      targets: this.body,
      x: { from: 0, to: -4 },
      duration: 90,
      yoyo: true
    })
    if (this.hp <= 0) {
      this.alive = false
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        y: this.y + 18,
        duration: 250,
        onComplete: () => this.setVisible(false)
      })
    }
    return this.hp <= 0
  }

  _updateWeaknessIcons() {
    for (const entry of this.weaknessIcons) {
      const progress = Math.min(this.weaknessProgress[entry.type] || 0, entry.count)
      const filled = progress >= entry.count
      entry.icon.setFillStyle(GEM_COLORS[entry.type], filled ? 0.95 : 0.25 + (progress / entry.count) * 0.45)
      entry.icon.setScale(filled ? 1.18 : 1)
      entry.progressText.setText(`${progress}/${entry.count}`)
      entry.progressText.setColor(filled ? '#ffffff' : '#d9f2ff')
    }
  }
}
