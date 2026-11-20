// Procedural Web Audio API + Bengali Speech Callout sound generator for Chanda De
class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;
  private musicEnabled = true;
  private sfxVolume = 0.8;
  private musicVolume = 0.45;
  private bgSongAudio: HTMLAudioElement | null = null;
  private rainNoiseNode: AudioNode | null = null;
  private isBgmPlaying = false;
  private shouldPlayBgm = false;
  private bgmUnlockBound = false;
  private chandaDeAudio: HTMLAudioElement | null = null;
  private lastChandaVoiceTime = 0;
  private chandaRefusalClips: HTMLAudioElement[] = [];
  private nextRefusalClipIndex = Math.random() < 0.5 ? 0 : 1;
  private shopRefusalClipMap: Map<string, number> = new Map();
  private lastRefusalVoiceTime = 0;
  private pendingRefusalAfterChanda = false;
  private pendingMolomAfterRefusal = false;
  private pendingRefusalShopId: string | undefined = undefined;
  private vangchurClips: HTMLAudioElement[] = [];
  private vangchurClipIndex = 0;
  private lastVangchurVoiceTime = 0;
  private policeCaughtAudio: HTMLAudioElement | null = null;
  private policeReleaseAudio: HTMLAudioElement | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSettings(sound: boolean, music: boolean, sfxVol: number, musicVol: number) {
    this.soundEnabled = sound;
    this.musicEnabled = music;
    this.sfxVolume = sfxVol;
    this.musicVolume = musicVol;

    if (this.bgSongAudio) {
      this.bgSongAudio.volume = this.getEffectiveBgmVolume();
    }

    if (!music) {
      if (this.bgSongAudio && !this.bgSongAudio.paused) {
        this.bgSongAudio.pause();
      }
      this.isBgmPlaying = false;
    } else if (this.shouldPlayBgm && !this.isBgmPlaying) {
      this.startBGM();
    }
    if (this.chandaDeAudio) {
      this.chandaDeAudio.volume = Math.min(1, sfxVol);
      if (!sound) {
        this.chandaDeAudio.pause();
      }
    }
    for (const clip of this.chandaRefusalClips) {
      clip.volume = Math.min(1, sfxVol);
      if (!sound) {
        this.pendingRefusalAfterChanda = false;
        this.pendingMolomAfterRefusal = false;
        clip.pause();
      }
    }
    for (const clip of this.vangchurClips) {
      clip.volume = Math.min(1, sfxVol);
      if (!sound) {
        clip.pause();
      }
    }
    if (this.policeCaughtAudio) {
      this.policeCaughtAudio.volume = Math.min(0.42, Math.max(0.05, sfxVol * 0.42));
      if (!sound) {
        this.policeCaughtAudio.pause();
      }
    }
    if (this.policeReleaseAudio) {
      this.policeReleaseAudio.volume = Math.min(0.65, Math.max(0.05, sfxVol * 0.65));
      if (!sound) {
        this.policeReleaseAudio.pause();
      }
    }
    if (!sound) {
      this.setRain(false);
    }
  }

  private ensureVangchurClips() {
    if (this.vangchurClips.length > 0 || typeof window === 'undefined') return;
    const sources = [
      '/assets/aistudio/videoplayback_78346700.m4a',
      '/assets/aistudio/videoplayback__1__ec2e3fa3.m4a',
    ];
    this.vangchurClips = sources.map((src) => {
      const audio = new Audio(src);
      audio.preload = 'auto';
      return audio;
    });
  }

  private ensureRefusalClips() {
    if (this.chandaRefusalClips.length > 0 || typeof window === 'undefined') return;
    const sources = [
      '/assets/aistudio/Generated_Audio_November_13__2026_-_5_16PM_b6692dc2.wav',
      '/assets/aistudio/Generated_Audio_November_13__2026_-_5_08PM_8153a71d.wav',
    ];
    this.chandaRefusalClips = sources.map((src) => {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.addEventListener('ended', () => {
        if (this.pendingMolomAfterRefusal && this.soundEnabled) {
          this.pendingMolomAfterRefusal = false;
          this.playMolomWarningVoice();
        }
      });
      return audio;
    });
  }

  public stopShopChandaAudio() {
    this.pendingRefusalAfterChanda = false;
    this.pendingMolomAfterRefusal = false;
    this.pendingRefusalShopId = undefined;
    if (this.chandaDeAudio && !this.chandaDeAudio.paused) {
      this.chandaDeAudio.pause();
    }
    for (const clip of this.chandaRefusalClips) {
      if (!clip.paused) clip.pause();
    }
    if (this.vangchurClips[0] && !this.vangchurClips[0].paused) {
      this.vangchurClips[0].pause();
    }
  }

  private pauseAllChandaDialogues() {
    this.stopShopChandaAudio();
  }

  // Play "তোর মরণের চুলকানি উঠছে! আমি তোরে মলম লাগায় দিমু!" right after shopkeeper refuses
  public playMolomWarningVoice() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    this.ensureVangchurClips();
    const molomClip = this.vangchurClips[0];
    if (!molomClip) return;
    try {
      for (const c of this.vangchurClips) {
        if (!c.paused) c.pause();
      }
      molomClip.volume = Math.min(1, Math.max(0.1, this.sfxVolume));
      molomClip.currentTime = 0;
      const p = molomClip.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
    } catch {}
  }

  // Play uploaded Bengali comedy dialogues when smashing/vangchur
  public playVangchurVoice() {
    if (!this.soundEnabled || typeof window === 'undefined') return;

    this.pauseAllChandaDialogues();

    this.ensureVangchurClips();
    const isAnyPlaying = this.vangchurClips.some((clip) => !clip.paused && !clip.ended);
    if (isAnyPlaying) return;

    const nowMs = Date.now();
    if (nowMs - this.lastVangchurVoiceTime < 800) return;
    this.lastVangchurVoiceTime = nowMs;

    const clip = this.vangchurClips[this.vangchurClipIndex];
    this.vangchurClipIndex = (this.vangchurClipIndex + 1) % this.vangchurClips.length;

    if (!clip) return;
    try {
      clip.volume = Math.min(1, Math.max(0.1, this.sfxVolume));
      clip.currentTime = 0;
      const playPromise = clip.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          this.playBreak();
        });
      }
    } catch {
      this.playBreak();
    }
  }

  // Play apology clip ("আমার ভুল হইছে, ক্ষমা কইরা দে!") directly when shopkeeper surrenders
  public playVangchurSorryVoice() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    this.pauseAllChandaDialogues();
    this.ensureVangchurClips();
    for (const c of this.vangchurClips) {
      c.pause();
    }
    const sorryClip = this.vangchurClips[1];
    if (!sorryClip) return;
    try {
      sorryClip.volume = Math.min(1, Math.max(0.1, this.sfxVolume));
      sorryClip.currentTime = 0;
      sorryClip.play().catch(() => {});
    } catch {}
  }

  // Play funny MP3 track when caught by police
  public playPoliceCaughtAudio() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    this.stopShopChandaAudio();
    for (const c of this.vangchurClips) {
      if (!c.paused) c.pause();
    }

    try {
      if (!this.policeCaughtAudio) {
        this.policeCaughtAudio = new Audio('/assets/aistudio/ssstik-mp3cutnet_4SqJkrAD_3626ec5b.mp3');
        this.policeCaughtAudio.preload = 'auto';
      }
      this.policeCaughtAudio.pause();
      this.policeCaughtAudio.volume = Math.min(0.42, Math.max(0.05, this.sfxVolume * 0.42));
      this.policeCaughtAudio.currentTime = 0;
      const p = this.policeCaughtAudio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          this.playPoliceSiren();
        });
      }
    } catch {
      this.playPoliceSiren();
    }
  }

  public stopPoliceCaughtAudio() {
    if (this.policeCaughtAudio) {
      this.policeCaughtAudio.pause();
      this.policeCaughtAudio.currentTime = 0;
    }
  }

  // Play release dialogue clip at medium volume when player gets released from police custody
  public playPoliceReleaseAudio() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    this.stopPoliceCaughtAudio();
    try {
      if (!this.policeReleaseAudio) {
        this.policeReleaseAudio = new Audio('/assets/aistudio/DUM_DUM_Tedao_acab623e.mp3');
        this.policeReleaseAudio.preload = 'auto';
      }
      this.policeReleaseAudio.pause();
      this.policeReleaseAudio.volume = Math.min(0.65, Math.max(0.08, this.sfxVolume * 0.65));
      this.policeReleaseAudio.currentTime = 0;
      const p = this.policeReleaseAudio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
    } catch {}
  }

  public stopPoliceReleaseAudio() {
    if (this.policeReleaseAudio) {
      this.policeReleaseAudio.pause();
      this.policeReleaseAudio.currentTime = 0;
    }
  }

  // Play uploaded "এই, চান্দা দে!" audio and follow immediately with one of the two refusal clips
  public playChandaDeVoice(force = false, followWithRefusal = true, shopId?: string) {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    const nowMs = Date.now();
    if (!force && nowMs - this.lastChandaVoiceTime < 1500) return;
    const isAnyRefusalPlaying = this.chandaRefusalClips.some((c) => !c.paused && !c.ended);
    if (!force && isAnyRefusalPlaying) return;

    try {
      this.ensureRefusalClips();
      if (!this.chandaDeAudio) {
        this.chandaDeAudio = new Audio('/assets/aistudio/Generated_Audio_November_13__2026_-_4_56PM_fc41084e.wav');
        this.chandaDeAudio.preload = 'auto';
        this.chandaDeAudio.addEventListener('ended', () => {
          if (this.pendingRefusalAfterChanda && this.soundEnabled) {
            const targetShopId = this.pendingRefusalShopId;
            this.pendingRefusalAfterChanda = false;
            this.pendingRefusalShopId = undefined;
            this.playChandaRefusalVoice(true, targetShopId);
          }
        });
      }
      if (!force && !this.chandaDeAudio.paused && !this.chandaDeAudio.ended) {
        return;
      }
      this.lastChandaVoiceTime = nowMs;
      if (force) {
        this.chandaDeAudio.pause();
        for (const clip of this.chandaRefusalClips) {
          if (!clip.paused) clip.pause();
        }
      }
      this.pendingRefusalAfterChanda = followWithRefusal;
      this.pendingRefusalShopId = shopId;
      this.chandaDeAudio.volume = Math.min(1, Math.max(0.1, this.sfxVolume));
      this.chandaDeAudio.currentTime = 0;
      const playPromise = this.chandaDeAudio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          this.pendingRefusalAfterChanda = false;
          this.pendingRefusalShopId = undefined;
          this.playChandaFallbackSting();
        });
      }
    } catch {
      this.pendingRefusalAfterChanda = false;
      this.pendingRefusalShopId = undefined;
      this.playChandaFallbackSting();
    }
  }

  // Alternate between "বেচাকেনা নাই, আজকে হবে না" and "দিমু না, কি করবি" across shops, then follow with molom warning
  public playChandaRefusalVoice(force = false, shopId?: string, followWithMolom = true) {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    this.ensureRefusalClips();
    if (this.chandaRefusalClips.length === 0) return;

    const nowMs = Date.now();
    if (!force && nowMs - this.lastRefusalVoiceTime < 1200) return;
    this.lastRefusalVoiceTime = nowMs;
    this.pendingRefusalAfterChanda = false;
    this.pendingRefusalShopId = undefined;

    let clipIdx: number;
    if (shopId && this.shopRefusalClipMap.has(shopId)) {
      clipIdx = this.shopRefusalClipMap.get(shopId)!;
    } else {
      clipIdx = this.nextRefusalClipIndex;
      this.nextRefusalClipIndex = (clipIdx + 1) % this.chandaRefusalClips.length;
      if (shopId) {
        this.shopRefusalClipMap.set(shopId, clipIdx);
      }
    }

    const activeClip = this.chandaRefusalClips[clipIdx];
    if (!activeClip) return;

    try {
      if (!force && this.chandaRefusalClips.some((c) => !c.paused && !c.ended)) {
        return;
      }
      if (force) {
        if (this.chandaDeAudio && !this.chandaDeAudio.paused) {
          this.chandaDeAudio.pause();
        }
        for (const c of this.chandaRefusalClips) {
          if (!c.paused) c.pause();
        }
      }
      this.pendingMolomAfterRefusal = followWithMolom;
      activeClip.volume = Math.min(1, Math.max(0.1, this.sfxVolume));
      activeClip.currentTime = 0;
      const playPromise = activeClip.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          this.pendingMolomAfterRefusal = false;
          this.playDialogueBlip(0.85);
        });
      }
    } catch {
      this.pendingMolomAfterRefusal = false;
      this.playDialogueBlip(0.85);
    }
  }

  public resetShopRefusals() {
    this.shopRefusalClipMap.clear();
    this.pendingRefusalAfterChanda = false;
    this.pendingMolomAfterRefusal = false;
    this.pendingRefusalShopId = undefined;
  }

  private playChandaFallbackSting() {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [392.0, 493.88, 587.33];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.085;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.24 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.23);
    });
  }

  // Cartoon street brawl punch / slap ("ধুম! ঠাস!")
  public playPunch() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Deep punch thud
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(190, now);
    thud.frequency.exponentialRampToValueAtTime(42, now + 0.14);
    thudGain.gain.setValueAtTime(0.45 * this.sfxVolume, now);
    thudGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    thud.connect(thudGain);
    thudGain.connect(this.ctx.destination);
    thud.start(now);
    thud.stop(now + 0.16);

    // Comic slap snap
    const bufLen = Math.floor(this.ctx.sampleRate * 0.08);
    const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.35));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const slapGain = this.ctx.createGain();
    slapGain.gain.setValueAtTime(0.32 * this.sfxVolume, now);
    noise.connect(slapGain);
    slapGain.connect(this.ctx.destination);
    noise.start(now);
  }

  // Shopkeeper surrenders and hands over cash
  public playShopSurrender() {
    if (!this.soundEnabled) return;
    this.playVangchurSorryVoice();
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.07;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.22 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.29);
    });
  }

  public playRickshawBell() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const playTing = (timeOffset: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, now + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(1800, now + timeOffset + 0.1);
      gain.gain.setValueAtTime(0.25 * this.sfxVolume, now + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.13);
    };

    playTing(0);
    playTing(0.12);
  }

  public playBusHorn() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [330, 440].forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.18 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    });
  }

  public playHit() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);
    gain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  public playBreak() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.value = 2.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);

    const boing = this.ctx.createOscillator();
    const boingGain = this.ctx.createGain();
    boing.type = 'sine';
    boing.frequency.setValueAtTime(120, now);
    boing.frequency.exponentialRampToValueAtTime(480, now + 0.2);
    boingGain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
    boingGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    boing.connect(boingGain);
    boingGain.connect(this.ctx.destination);
    boing.start(now);
    boing.stop(now + 0.22);
  }

  public playCash() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [987.77, 1318.51, 1567.98, 1975.53];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.06;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.2 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.26);
    });
  }

  public playPoliceSiren() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(950, now + 0.3);
    osc.frequency.linearRampToValueAtTime(600, now + 0.6);
    gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.61);
  }

  public playMissionComplete() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = now + idx * 0.1;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.28 * this.sfxVolume, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.36);
    });
  }

  public playDialogueBlip(pitch = 1) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const baseFreq = 300 * pitch + (Math.random() * 100 - 50);
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, now + 0.05);
    gain.gain.setValueAtTime(0.12 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playHammerRepair() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
    gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  private getEffectiveBgmVolume(): number {
    // Keep background song soft and non-intrusive compared to voice clips and SFX
    return Math.min(0.24, Math.max(0, this.musicVolume * 0.25));
  }

  private ensureBgSongAudio() {
    if (this.bgSongAudio || typeof window === 'undefined') return;
    const audio = new Audio('/assets/aistudio/Chanda_de_bg_song_a822b1ef.mp3');
    audio.loop = true;
    audio.preload = 'auto';
    audio.addEventListener('ended', () => {
      if (this.shouldPlayBgm && this.musicEnabled) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    });
    this.bgSongAudio = audio;
  }

  private bindBgmAutoplayUnlock() {
    if (this.bgmUnlockBound || typeof window === 'undefined') return;
    this.bgmUnlockBound = true;
    const unlock = () => {
      this.bgmUnlockBound = false;
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      if (this.shouldPlayBgm && this.musicEnabled && !this.isBgmPlaying) {
        this.startBGM();
      }
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  public startBGM() {
    this.shouldPlayBgm = true;
    if (!this.musicEnabled || typeof window === 'undefined') return;

    this.ensureBgSongAudio();
    if (!this.bgSongAudio) return;

    this.bgSongAudio.loop = true;
    this.bgSongAudio.volume = this.getEffectiveBgmVolume();

    if (!this.bgSongAudio.paused && this.isBgmPlaying) return;

    try {
      const playPromise = this.bgSongAudio.play();
      this.isBgmPlaying = true;
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          this.isBgmPlaying = false;
          this.bindBgmAutoplayUnlock();
        });
      }
    } catch {
      this.isBgmPlaying = false;
      this.bindBgmAutoplayUnlock();
    }
  }

  public stopBGM(resetPosition = false) {
    this.shouldPlayBgm = false;
    this.isBgmPlaying = false;
    if (this.bgSongAudio) {
      this.bgSongAudio.pause();
      if (resetPosition) {
        this.bgSongAudio.currentTime = 0;
      }
    }
  }

  public setRain(active: boolean) {
    if (!this.soundEnabled || !active) {
      if (this.rainNoiseNode) {
        try {
          (this.rainNoiseNode as AudioBufferSourceNode).stop();
        } catch {}
        this.rainNoiseNode = null;
      }
      return;
    }

    if (this.rainNoiseNode) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      const gain = this.ctx.createGain();
      gain.gain.value = 0.08 * this.sfxVolume;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      this.rainNoiseNode = noise;
    } catch {}
  }
}

export const soundManager = new SoundManager();
