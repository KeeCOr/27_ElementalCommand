import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const rate = 44100
function wav(path, seconds, synth) {
  const frames = Math.floor(rate * seconds)
  const out = Buffer.alloc(44 + frames * 2)
  out.write('RIFF', 0); out.writeUInt32LE(36 + frames * 2, 4); out.write('WAVEfmt ', 8)
  out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22)
  out.writeUInt32LE(rate, 24); out.writeUInt32LE(rate * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34)
  out.write('data', 36); out.writeUInt32LE(frames * 2, 40)
  for (let i = 0; i < frames; i += 1) out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, synth(i / rate, i / frames))) * 32767), 44 + i * 2)
  mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, out)
}
const out = resolve('public/assets/audio')
const tone = (start, end, amp = .2) => (t, p) => Math.sin(2 * Math.PI * (start + (end - start) * p) * t) * Math.sin(Math.PI * p) * amp
wav(resolve(out, 'ec-element-select-v1.wav'), .12, tone(720, 980, .15))
wav(resolve(out, 'ec-command-confirm-v1.wav'), .22, tone(380, 780, .19))
wav(resolve(out, 'ec-skill-attack-v1.wav'), .20, (t, p) => (Math.sin(2 * Math.PI * (170 - 90 * p) * t) + Math.sin(2 * Math.PI * 620 * t) * .25) * (1 - p) * .24)
wav(resolve(out, 'ec-basic-attack-v1.wav'), .11, (t, p) => Math.sin(2 * Math.PI * 210 * t) * (1 - p) * (1 - p) * .22)
wav(resolve(out, 'ec-weakness-break-v1.wav'), .28, (t, p) => (Math.sin(2 * Math.PI * 520 * t) + Math.sin(2 * Math.PI * 780 * t)) * Math.sin(Math.PI * p) * .14)
wav(resolve(out, 'ec-enemy-hit-v1.wav'), .14, (t, p) => (Math.sin(2 * Math.PI * 95 * t) + Math.sin(2 * Math.PI * 170 * t) * .45) * (1 - p) * .25)
wav(resolve(out, 'ec-victory-v1.wav'), .58, (t, p) => (Math.sin(2 * Math.PI * 523.25 * t) + (t > .16 ? Math.sin(2 * Math.PI * 659.25 * (t - .16)) : 0) + (t > .32 ? Math.sin(2 * Math.PI * 783.99 * (t - .32)) : 0)) * (1 - p * .55) * .1)
wav(resolve(out, 'ec-defeat-v1.wav'), .42, (t, p) => Math.sin(2 * Math.PI * (330 - 160 * p) * t) * (1 - p * .5) * .18)
