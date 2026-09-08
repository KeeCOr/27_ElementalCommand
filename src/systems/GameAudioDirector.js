const CUE_NAMES = ['ui', 'action', 'danger', 'transition', 'result'];
const CUE_GAIN = { ui: 0.45, action: 1, danger: 1.08, transition: 0.8, result: 1.08 };
const CUE_DURATION_MS = { ui: 420, action: 720, danger: 1150, transition: 900, result: 1450 };

function clamp01(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export class GameAudioDirector {
  constructor({ audioFactory, cues, bgmUrl, storage = null, storageKey = 'game.audio.v4', maxVoices = 8, now = () => Date.now() }) {
    this.audioFactory = audioFactory;
    this.cues = {};
    for (const name of CUE_NAMES) if (cues?.[name]) this.cues[name] = cues[name];
    this.bgmUrl = bgmUrl;
    this.storage = storage;
    this.storageKey = storageKey;
    this.maxVoices = Math.max(1, maxVoices);
    this.now = now;
    this.bgmVolume = 0.24;
    this.sfxVolume = 0.62;
    this.bgmMuted = false;
    this.sfxMuted = false;
    this.bgm = null;
    this.bgmPlaying = false;
    this.resumeAfterFocus = false;
    this.activeSfx = [];
    this.duckUntil = 0;
    this.restore();
  }

  startFromGesture() {
    if (this.bgm) {
      if (this.bgmPlaying) return;
      this.playBgmElement();
      return;
    }
    const bgm = this.audioFactory();
    bgm.src = this.bgmUrl;
    bgm.loop = true;
    this.bgm = bgm;
    this.applyBgmVolume();
    this.playBgmElement();
  }

  playCue(name) {
    const src = this.cues[name];
    if (!src || this.sfxMuted || this.sfxVolume <= 0) return false;
    while (this.activeSfx.length >= this.maxVoices) {
      const oldest = this.activeSfx.shift();
      try { oldest?.pause?.(); } catch {}
    }
    try {
      const sfx = this.audioFactory();
      sfx.src = src;
      sfx.loop = false;
      sfx.volume = Math.min(1, this.sfxVolume * CUE_GAIN[name]);
      this.activeSfx.push(sfx);
      const cleanup = () => { this.activeSfx = this.activeSfx.filter((item) => item !== sfx); };
      sfx.addEventListener?.('ended', cleanup, { once: true });
      sfx.addEventListener?.('error', cleanup, { once: true });
      if (name === 'danger' || name === 'result') this.duckFor(CUE_DURATION_MS[name] + 350);
      const result = sfx.play();
      if (result?.catch) result.catch(cleanup);
      return true;
    } catch {
      return false;
    }
  }

  setBgmVolume(value) { this.bgmVolume = clamp01(value); this.applyBgmVolume(); this.persist(); }
  setSfxVolume(value) { this.sfxVolume = clamp01(value); this.persist(); }
  setBgmMuted(value) { this.bgmMuted = Boolean(value); this.applyBgmVolume(); this.persist(); }
  setSfxMuted(value) { this.sfxMuted = Boolean(value); this.persist(); }
  setMuted(value) { this.setBgmMuted(value); this.setSfxMuted(value); }

  handleVisibility(hidden) {
    if (hidden) {
      this.resumeAfterFocus = this.bgmPlaying;
      this.pauseBgm();
    } else if (this.resumeAfterFocus) {
      this.resumeAfterFocus = false;
      this.startFromGesture();
    }
  }

  pauseBgm() {
    if (!this.bgm) return;
    try { this.bgm.pause(); } catch {}
    this.bgmPlaying = false;
  }

  stopBgm() {
    this.pauseBgm();
    if (this.bgm) this.bgm.currentTime = 0;
  }

  applyBgmVolume() {
    if (!this.bgm) return;
    const ducked = this.now() < this.duckUntil;
    this.bgm.volume = this.bgmMuted ? 0 : this.bgmVolume * (ducked ? 0.48 : 1);
  }

  get settings() {
    return { bgmVolume: this.bgmVolume, sfxVolume: this.sfxVolume, muted: this.bgmMuted && this.sfxMuted };
  }

  get mixSettings() {
    return { bgmVolume: this.bgmVolume, sfxVolume: this.sfxVolume, bgmMuted: this.bgmMuted, sfxMuted: this.sfxMuted };
  }

  get activeVoiceCount() { return this.activeSfx.length; }

  playBgmElement() {
    if (!this.bgm || this.bgmMuted) return;
    try {
      const result = this.bgm.play();
      this.bgmPlaying = true;
      if (result?.catch) result.catch(() => { this.bgmPlaying = false; });
    } catch { this.bgmPlaying = false; }
  }

  duckFor(durationMs) {
    this.duckUntil = Math.max(this.duckUntil, this.now() + durationMs);
    this.applyBgmVolume();
    clearTimeout(this.duckTimer);
    const restore = () => {
      const remaining = this.duckUntil - this.now();
      if (remaining > 0) this.duckTimer = setTimeout(restore, remaining);
      else this.applyBgmVolume();
    };
    this.duckTimer = setTimeout(restore, durationMs);
  }

  restore() {
    if (!this.storage) return;
    try {
      const value = JSON.parse(this.storage.getItem(this.storageKey) || '{}');
      if (typeof value.bgmVolume === 'number') this.bgmVolume = clamp01(value.bgmVolume);
      if (typeof value.sfxVolume === 'number') this.sfxVolume = clamp01(value.sfxVolume);
      this.bgmMuted = Boolean(value.bgmMuted);
      this.sfxMuted = Boolean(value.sfxMuted);
    } catch {}
  }

  persist() {
    if (!this.storage) return;
    try { this.storage.setItem(this.storageKey, JSON.stringify(this.mixSettings)); } catch {}
  }
}
