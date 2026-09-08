import { GameAudioDirector } from './GameAudioDirector.js';

export function installGameAudioRuntime(basePath, options = {}) {
  if (globalThis.__gameAudioRuntime) return globalThis.__gameAudioRuntime;
  const files = {
    bgm: 'bgm-loop.ogg',
    ui: 'sfx-ui.ogg',
    action: 'sfx-action.ogg',
    danger: 'sfx-danger.ogg',
    transition: 'sfx-transition.ogg',
    result: 'sfx-result.ogg',
    ...(typeof options === 'string' ? { bgm: options } : options.files),
  };
  const url = (name) => `${basePath}/${name}`;
  let storage = null;
  try { storage = globalThis.localStorage; } catch {}
  const director = new GameAudioDirector({
    audioFactory: () => new Audio(),
    bgmUrl: url(files.bgm),
    cues: { ui: url(files.ui), action: url(files.action), danger: url(files.danger), transition: url(files.transition), result: url(files.result) },
    storage,
    storageKey: options.storageKey || 'game.audio.v4',
    maxVoices: 8,
  });
  const start = () => director.startFromGesture();
  window.addEventListener('pointerdown', start, { once: true });
  window.addEventListener('keydown', start, { once: true });
  window.addEventListener('pointerdown', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button,[data-audio-cue]') : null;
    if (target) director.playCue(target.getAttribute('data-audio-cue') || 'ui');
    else if (event.target instanceof HTMLCanvasElement) director.playCue('action');
  });
  window.addEventListener('keydown', (event) => {
    if (!event.repeat && (event.code === 'Space' || event.code === 'Enter')) director.playCue('action');
  });
  window.addEventListener('game-audio', (event) => {
    if (event.detail?.cue) director.playCue(event.detail.cue);
  });
  window.addEventListener('game-audio-settings', (event) => {
    const settings = event.detail || {};
    if (typeof settings.bgmVolume === 'number') director.setBgmVolume(settings.bgmVolume);
    if (typeof settings.sfxVolume === 'number') director.setSfxVolume(settings.sfxVolume);
    if (typeof settings.bgmMuted === 'boolean') director.setBgmMuted(settings.bgmMuted);
    if (typeof settings.sfxMuted === 'boolean') director.setSfxMuted(settings.sfxMuted);
  });
  document.addEventListener('visibilitychange', () => director.handleVisibility(document.hidden));
  window.addEventListener('blur', () => director.handleVisibility(true));
  window.addEventListener('focus', () => director.handleVisibility(false));
  globalThis.__gameAudioRuntime = director;
  return director;
}

export function emitGameAudioCue(cue) {
  window.dispatchEvent(new CustomEvent('game-audio', { detail: { cue } }));
}
