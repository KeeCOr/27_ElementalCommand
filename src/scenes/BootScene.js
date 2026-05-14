import Phaser from 'phaser'

export default class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }) }
  preload() { /* MVP: 절차적 렌더링이므로 외부 에셋 없음 */ }
  create()  { this.scene.start('StageSelectScene') }
}
