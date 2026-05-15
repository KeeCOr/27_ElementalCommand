import Phaser from 'phaser'
import { createArtAssets } from '../systems/ArtFactory.js'

export default class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }) }
  preload() {}
  create() {
    createArtAssets(this)
    this.scene.start('StageSelectScene')
  }
}
