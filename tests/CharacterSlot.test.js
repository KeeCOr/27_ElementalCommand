import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const characterSlotSource = readFileSync('src/objects/CharacterSlot.js', 'utf8')

describe('CharacterSlot bitmap-backed panel', () => {
  it('renders the slot panel from the bitmap nine-slice frame instead of a hand-drawn rounded rect', () => {
    expect(characterSlotSource).toMatch(/scene\.add\.nineslice\([\s\S]*?'ec-character-slot-frame-9s'/)
    expect(characterSlotSource).not.toMatch(/fillRoundedRect\(-SLOT_W \/ 2, -SLOT_H \/ 2, SLOT_W, SLOT_H, 8\)/)
  })

  it('renders the empty HP shell from a bitmap nine-slice while keeping the dynamic fill a separate rectangle', () => {
    expect(characterSlotSource).toMatch(/this\.hpBarBg\s*=\s*scene\.add\.nineslice\([\s\S]*?'ec-hp-shell-9s'/)
    expect(characterSlotSource).toMatch(/this\.hpBar\s*=\s*scene\.add\.rectangle\(-39,\s*-30,\s*78,\s*7,\s*0x44ff88\)\.setOrigin\(0,\s*0\.5\)/)
    expect(characterSlotSource).toMatch(/this\.hpBar\.setScale\(ratio,\s*1\)/)
  })

  it('keeps the portrait contain-safe and square, and introduces no SVG references', () => {
    expect(characterSlotSource).toMatch(/setDisplaySize\(58,\s*58\)/)
    expect(characterSlotSource).not.toMatch(/\.svg/i)
  })
})
