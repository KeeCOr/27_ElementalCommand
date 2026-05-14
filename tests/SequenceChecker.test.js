import { describe, it, expect } from 'vitest'
import { checkSequence } from '../src/systems/SequenceChecker.js'

describe('checkSequence', () => {
  it('완전 일치', () => {
    expect(checkSequence(['fire', 'fire', 'water'], ['fire', 'fire', 'water'])).toBe(true)
  })

  it('긴 경로에 시퀀스 포함', () => {
    expect(checkSequence(['water', 'fire', 'fire', 'water', 'grass'], ['fire', 'fire', 'water'])).toBe(true)
  })

  it('시퀀스 불일치', () => {
    expect(checkSequence(['fire', 'water', 'fire'], ['fire', 'fire', 'water'])).toBe(false)
  })

  it('경로가 시퀀스보다 짧으면 false', () => {
    expect(checkSequence(['fire', 'fire'], ['fire', 'fire', 'water'])).toBe(false)
  })

  it('빈 경로는 false', () => {
    expect(checkSequence([], ['fire'])).toBe(false)
  })

  it('단일 원소 시퀀스 포함 여부', () => {
    expect(checkSequence(['water', 'fire', 'grass'], ['fire'])).toBe(true)
  })
})
