import Phaser from 'phaser'
import BootScene        from './scenes/BootScene.js'
import StageSelectScene from './scenes/StageSelectScene.js'
import PartySelectScene from './scenes/PartySelectScene.js'
import BattleScene      from './scenes/BattleScene.js'
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js'

new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  scene: [BootScene, StageSelectScene, PartySelectScene, BattleScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  parent: document.body
})
