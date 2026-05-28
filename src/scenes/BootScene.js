import Phaser from 'phaser'
import { createArtAssets } from '../systems/ArtFactory.js'
import { ART_SHEET_SOURCES, ART_SOURCE_IMAGES } from '../systems/AssetManifest.js'

export default class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }) }
  preload() {
    Object.values(ART_SOURCE_IMAGES).forEach(source => {
      this.load.image(source.key, source.path)
    })
    ART_SHEET_SOURCES.forEach(source => {
      this.load.image(source.key, source.path)
    })
  }

  create() {
    createArtAssets(this)
    this.scene.start('StageSelectScene')
  }
}
