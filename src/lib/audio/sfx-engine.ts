// ============================================================
// Trading Tazos Game — SFX Engine
// Sound effects powered by Kenney.nl CC0 audio packs
// (UI Audio, Interface Sounds, Digital Audio, Impact Sounds, RPG Audio)
//
// Architecture:
//   - Preloads OGG audio buffers via fetch + decodeAudioData
//   - Web Audio API for low-latency playback with volume/pitch control
//   - Falls back to HTML5 Audio if Web Audio unavailable
//   - MP3 fallback in <audio> tags for Safari
//   - All sounds are CC0 licensed (no attribution required)
// ============================================================

export type SFXName = 'click' | 'bag_open' | 'bag_tear' | 'reveal' | 'battle_hit'
  | 'battle_victory' | 'battle_defeat' | 'nav' | 'equip' | 'error'
  | 'tick' | 'woosh' | 'coin' | 'unlock'
  | 'page_turn' | 'deck_shuffle' | 'tazo_collect' | 'shop_purchase'
  | 'level_up' | 'hover'

interface SFXOptions {
  volume?: number   // 0-1, default 0.3
  pitch?: number    // playback rate multiplier, default 1.0
}

// ── SFX name → filename mapping ──────────────────────
const SFX_FILES: Record<SFXName, string[]> = {
  click:            ['click'],
  bag_open:         ['bag_open'],
  bag_tear:         ['bag_tear'],
  reveal:           ['reveal'],
  battle_hit:       ['battle_hit'],
  battle_victory:   ['battle_victory'],
  battle_defeat:    ['battle_defeat'],
  nav:              ['nav'],
  equip:            ['equip'],
  error:            ['error'],
  tick:             ['tick'],
  woosh:            ['woosh'],
  coin:             ['coin'],
  unlock:           ['unlock'],
  page_turn:        ['page_turn'],
  deck_shuffle:     ['deck_flip1', 'deck_flip2', 'deck_flip3'],
  tazo_collect:     ['tazo_collect'],
  shop_purchase:    ['shop_purchase'],
  level_up:         ['level_up'],
  hover:            ['hover'],
}

// ── Internal State ────────────────────────────────────
let audioCtx: AudioContext | null = null
let muted = false
let unlocked = false
const bufferCache = new Map<string, AudioBuffer>()
let preloadPromise: Promise<void> | null = null

// ── Audio File URL ────────────────────────────────────
function sfxUrl(name: string): string {
  return `/sfx/${name}.ogg`
}

function sfxFallbackUrl(name: string): string {
  return `/sfx/${name}.mp3`
}

// ── AudioContext Lazy Init ────────────────────────────
function getCtx(): AudioContext | null {
  if (muted || !unlocked) return null
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch {
      return null
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

// ── Buffer Loading ────────────────────────────────────
async function loadBuffer(name: string): Promise<AudioBuffer | null> {
  if (bufferCache.has(name)) {
    return bufferCache.get(name)!
  }

  const ctx = audioCtx
  if (!ctx) return null

  const urls = [sfxUrl(name), sfxFallbackUrl(name)]

  for (const url of urls) {
    try {
      const resp = await fetch(url)
      if (!resp.ok) continue
      const arrayBuf = await resp.arrayBuffer()
      const audioBuf = await ctx.decodeAudioData(arrayBuf)
      bufferCache.set(name, audioBuf)
      return audioBuf
    } catch {
      continue
    }
  }

  console.warn(`[SFX] Failed to load: ${name}`)
  return null
}

// ── Preload All Sounds ────────────────────────────────
export async function sfxPreload(): Promise<void> {
  if (preloadPromise) return preloadPromise

  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch { return }
  }

  const allNames = new Set<string>()
  for (const files of Object.values(SFX_FILES)) {
    for (const f of files) allNames.add(f)
  }

  preloadPromise = Promise.allSettled(
    Array.from(allNames).map(name => loadBuffer(name))
  ).then(() => {
    // Preload complete
  })

  return preloadPromise
}

// ── HTML5 Audio Fallback Pool ─────────────────────────
const htmlAudioPool = new Map<string, HTMLAudioElement[]>()

function getHtmlAudio(name: string): HTMLAudioElement | null {
  const pool = htmlAudioPool.get(name)
  if (pool && pool.length > 0) {
    const el = pool.pop()!
    el.currentTime = 0
    return el
  }

  try {
    const audio = new Audio()
    audio.preload = 'auto'

    const oggSrc = document.createElement('source')
    oggSrc.src = sfxUrl(name)
    oggSrc.type = 'audio/ogg'
    audio.appendChild(oggSrc)

    const mp3Src = document.createElement('source')
    mp3Src.src = sfxFallbackUrl(name)
    mp3Src.type = 'audio/mpeg'
    audio.appendChild(mp3Src)

    audio.addEventListener('ended', () => {
      const p = htmlAudioPool.get(name) || []
      p.push(audio)
      htmlAudioPool.set(name, p)
    })

    return audio
  } catch {
    return null
  }
}

function playViaHtml(name: string, vol: number, pitch: number) {
  const audio = getHtmlAudio(name)
  if (!audio) return
  audio.volume = Math.min(1, Math.max(0, vol))
  audio.playbackRate = Math.min(4, Math.max(0.25, pitch))
  audio.play().catch(() => {})
}

// ── Play via Web Audio API ────────────────────────────
async function playViaWebAudio(name: string, vol: number, pitch: number) {
  const ctx = getCtx()
  if (!ctx) return

  const buffer = await loadBuffer(name)
  if (!buffer) {
    playViaHtml(name, vol, pitch)
    return
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.playbackRate.value = Math.min(4, Math.max(0.25, pitch))

  const gain = ctx.createGain()
  gain.gain.value = Math.min(1, Math.max(0, vol))

  source.connect(gain).connect(ctx.destination)
  source.start(0)
}

// ── Public API ────────────────────────────────────────

export function sfxMute(m: boolean) {
  muted = m
}

export function sfxToggle(): boolean {
  muted = !muted
  return muted
}

export function sfxIsMuted(): boolean {
  return muted
}

export function sfxUnlock() {
  if (unlocked) return
  unlocked = true
  const ctx = audioCtx
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  sfxPreload()
}

export function sfxEnsureUnlocked() {
  if (unlocked) return
  unlocked = true

  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {})
    }
  } catch {
    // Silently fail
  }
  sfxPreload()
}

export function playSFX(name: SFXName, opts: SFXOptions = {}) {
  if (muted) return

  const vol = opts.volume ?? 0.3
  const pitch = opts.pitch ?? 1.0

  if (!unlocked) {
    sfxEnsureUnlocked()
    if (!audioCtx) {
      const firstFile = SFX_FILES[name][0]
      playViaHtml(firstFile, vol, pitch)
      return
    }
  }

  const files = SFX_FILES[name]

  if (name === 'deck_shuffle') {
    const ctx = getCtx()
    if (!ctx) {
      playViaHtml(files[0], vol, pitch)
      return
    }

    files.forEach((file, i) => {
      setTimeout(() => {
        if (!muted) {
          playViaWebAudio(file, vol * 0.7, pitch * (1 + i * 0.05))
        }
      }, i * 80)
    })
    return
  }

  const targetFile = files[0]
  if (audioCtx) {
    playViaWebAudio(targetFile, vol, pitch)
  } else {
    playViaHtml(targetFile, vol, pitch)
  }
}

// ── React Hook ────────────────────────────────────────

export function createSFX() {
  return {
    play: playSFX,
    mute: sfxMute,
    toggle: sfxToggle,
    isMuted: sfxIsMuted,
    unlock: sfxEnsureUnlocked,
    preload: sfxPreload,
  }
}
