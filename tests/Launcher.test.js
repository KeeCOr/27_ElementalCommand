import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const launcherSource = readFileSync('tools/ElementalCommandLauncher.cs', 'utf8')

describe('Windows launcher', () => {
  it('serves the built dist folder from a local loopback server', () => {
    expect(launcherSource).toContain('Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "dist")')
    expect(launcherSource).toContain('HttpListener')
    expect(launcherSource).toContain('http://127.0.0.1:')
    expect(launcherSource).toContain('EC_NO_BROWSER')
  })
})
