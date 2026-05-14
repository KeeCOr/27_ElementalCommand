import Phaser from 'phaser'

const SLOT_W = 100

export default class EnemySlot extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Object} enemyData - src/data/enemies.js 항목
   */
  constructor(scene, x, y, enemyData) {
    super(scene, x, y)
    this.enemyData = enemyData
    this.hp = enemyData.maxHp
    this.attackTimer = 0
    this.alive = true

    // 몸통 (단순 사각형)
    this.body = scene.add.rectangle(0, -15, 60, 60, enemyData.color)
    this.add(this.body)

    // 이름
    this.nameText = scene.add.text(0, -52, enemyData.name, {
      fontSize: '11px', color: '#ffffff'
    }).setOrigin(0.5)
    this.add(this.nameText)

    // HP바 배경
    this.hpBarBg = scene.add.rectangle(0, 22, SLOT_W, 8, 0x333333)
    this.add(this.hpBarBg)

    // HP바
    this.hpBar = scene.add.rectangle(-SLOT_W / 2, 22, SLOT_W, 8, 0xff4444).setOrigin(0, 0.5)
    this.add(this.hpBar)

    // 공격 타이머 게이지 배경 (파랑)
    this.timerBg = scene.add.rectangle(0, 34, SLOT_W, 6, 0x222255)
    this.add(this.timerBg)

    // 공격 타이머 채우기
    this.timerBar = scene.add.rectangle(-SLOT_W / 2, 34, SLOT_W, 6, 0x4488ff).setOrigin(0, 0.5)
    this.timerBar.setScale(0, 1)
    this.add(this.timerBar)

    scene.add.existing(this)
  }

  /**
   * 매 프레임 호출. 공격 타이머 진행.
   * @param {number} delta - ms
   * @returns {number|null} 공격 시 데미지 값, 아직이면 null
   */
  update(delta) {
    if (!this.alive) return null
    this.attackTimer += delta
    const progress = Math.min(this.attackTimer / this.enemyData.attackInterval, 1)
    this.timerBar.setScale(progress, 1)
    if (this.attackTimer >= this.enemyData.attackInterval) {
      this.attackTimer = 0
      this.timerBar.setScale(0, 1)
      return this.enemyData.attack
    }
    return null
  }

  /**
   * 데미지 적용.
   * @returns {boolean} 사망 여부
   */
  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount)
    const ratio = this.hp / this.enemyData.maxHp
    this.hpBar.setScale(ratio, 1)
    if (this.hp <= 0) {
      this.alive = false
      this.setVisible(false)
    }
    return this.hp <= 0
  }
}
