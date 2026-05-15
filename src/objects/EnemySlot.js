import Phaser from 'phaser'
import { UI_FONT } from '../constants.js'

const SLOT_W = 104

export default class EnemySlot extends Phaser.GameObjects.Container {
  constructor(scene, x, y, enemyData) {
    super(scene, x, y)
    this.enemyData = enemyData
    this.hp = enemyData.maxHp
    this.attackTimer = 0
    this.alive = true

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

    scene.add.existing(this)
  }

  update(delta) {
    if (!this.alive) return null
    this.attackTimer += delta
    const progress = Math.min(this.attackTimer / this.enemyData.attackInterval, 1)
    this.timerBar.setScale(progress, 1)
    this.body.rotation = Math.sin(this.attackTimer / 260) * 0.025
    if (this.attackTimer >= this.enemyData.attackInterval) {
      this.attackTimer = 0
      this.timerBar.setScale(0, 1)
      return this.enemyData.attack
    }
    return null
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount)
    const ratio = this.hp / this.enemyData.maxHp
    this.hpBar.setScale(ratio, 1)
    this.scene.tweens.add({
      targets: this.body,
      x: { from: -4, to: 0 },
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
}
