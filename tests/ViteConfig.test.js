import { describe, expect, it } from 'vitest'
import config from '../vite.config.js'

describe('vite config', () => {
  it('uses relative asset paths for Electron loadFile packaging', () => {
    expect(config.base).toBe('./')
  })
})
