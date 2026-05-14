import Phaser from 'phaser'
import { buildWeights } from './systems/GemSpawner.js'
import HexBoard from './objects/HexBoard.js'
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js'

class TestScene extends Phaser.Scene {
  constructor() { super({ key: 'TestScene' }) }
  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e)
    const weights = buildWeights([])
    const board = new HexBoard(this, weights)
    board.on('dragComplete', (path) => {
      console.log('drag:', path.map(p => p.gemType))
    })
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  scene: [TestScene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
})
