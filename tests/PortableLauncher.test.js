import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = readFileSync(fileURLToPath(new URL('../tools/ElementalCommandLauncher.cs', import.meta.url)), 'utf8');

describe('self-contained portable launcher', () => {
  it('serves the embedded build over loopback HTTP', () => {
    expect(source).toContain('ElementalCommand.dist.zip');
    expect(source).toContain('http://127.0.0.1:');
  });

  it('rejects paths outside the extracted build root', () => {
    expect(source).toContain('StartsWith(canonicalRoot, StringComparison.OrdinalIgnoreCase)');
    expect(source).toContain('Unsafe embedded path');
  });

  it('serves raster and audio formats without an SVG runtime path', () => {
    expect(source).toContain('case ".png"');
    expect(source).toContain('case ".ogg"');
    expect(source).not.toContain('image/svg+xml');
  });
});
