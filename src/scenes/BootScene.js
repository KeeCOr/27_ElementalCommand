import Phaser from 'phaser'
import { createArtAssets } from '../systems/ArtFactory.js'
import { ART_SHEET_SOURCES, ART_SOURCE_IMAGES } from '../systems/AssetManifest.js'
import { preloadAudioCues } from '../systems/AudioCues.js'
import { UI_SKIN_ASSETS } from '../systems/UiSkin.js'

export default class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }) }
  preload() {
    Object.values(ART_SOURCE_IMAGES).forEach(source => {
      this.load.image(source.key, source.path)
    })
    ART_SHEET_SOURCES.forEach(source => {
      this.load.image(source.key, source.path)
    })
    UI_SKIN_ASSETS.forEach(asset => {
      if (asset.type === 'spritesheet') {
        this.load.spritesheet(asset.key, asset.path, asset.frameConfig)
      } else {
        this.load.image(asset.key, asset.path)
      }
    })
    preloadAudioCues(this)
  }

  create() {
    createArtAssets(this)
    this.scene.start('StageSelectScene')
  }
}
