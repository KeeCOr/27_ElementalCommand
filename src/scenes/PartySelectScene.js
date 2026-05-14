import Phaser from 'phaser'
import { CHARACTERS } from '../data/characters.js'
import { GEM_LABEL, GAME_WIDTH, GAME_HEIGHT } from '../constants.js'

export default class PartySelectScene extends Phaser.Scene {
  constructor() { super({ key: 'PartySelectScene' }) }

  init(data) { this.stageId = data.stageId }

  create() {
    this.selectedParty = []
    this.cardMap = new Map()  // characterId → card rectangle

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e)

    this.add.text(GAME_WIDTH / 2, 55, '파티 편성 (최대 4인)', {
      fontSize: '20px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5)

    CHARACTERS.forEach((char, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = 120 + col * 242
      const y = 155 + row * 130

      const card = this.add.rectangle(x, y, 210, 110, 0x2a2a4e)
        .setStrokeStyle(2, char.color)
        .setInteractive({ useHandCursor: true })
      this.cardMap.set(char.id, card)

      this.add.text(x, y - 36, char.name, {
        fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5)

      const seqStr = char.skillSequence.map(t => GEM_LABEL[t]).join('→')
      this.add.text(x, y - 10, seqStr, {
        fontSize: '12px', color: '#aaaaaa'
      }).setOrigin(0.5)

      this.add.text(x, y + 12, char.skillName, {
        fontSize: '12px', color: '#ffff88'
      }).setOrigin(0.5)

      this.add.text(x, y + 34, `공격력 ${char.attack}  HP ${char.maxHp}`, {
        fontSize: '10px', color: '#aaaaaa'
      }).setOrigin(0.5)

      card.on('pointerdown', () => this._toggleCharacter(char))
    })

    this.partyDisplay = this.add.text(GAME_WIDTH / 2, 555, '파티: (미선택)', {
      fontSize: '13px', color: '#ffff88'
    }).setOrigin(0.5)

    // 전투 시작 버튼
    const startBtn = this.add.rectangle(GAME_WIDTH / 2, 630, 220, 60, 0x224422)
      .setStrokeStyle(2, 0x44aa44)
      .setInteractive({ useHandCursor: true })

    this.add.text(GAME_WIDTH / 2, 630, '전투 시작!', {
      fontSize: '20px', color: '#44ff44', fontStyle: 'bold'
    }).setOrigin(0.5)

    startBtn.on('pointerover', () => startBtn.setFillStyle(0x336633))
    startBtn.on('pointerout',  () => startBtn.setFillStyle(0x224422))
    startBtn.on('pointerdown', () => {
      if (this.selectedParty.length === 0) return
      this.scene.start('BattleScene', { stageId: this.stageId, party: this.selectedParty })
    })
  }

  _toggleCharacter(char) {
    const idx = this.selectedParty.findIndex(c => c.id === char.id)
    const card = this.cardMap.get(char.id)
    if (idx >= 0) {
      this.selectedParty.splice(idx, 1)
      card.setFillStyle(0x2a2a4e)
    } else {
      if (this.selectedParty.length >= 4) return
      this.selectedParty.push(char)
      card.setFillStyle(0x4a4a8e)
    }
    const names = this.selectedParty.map(c => c.name).join(', ') || '(미선택)'
    this.partyDisplay.setText(`파티: ${names}`)
  }
}
