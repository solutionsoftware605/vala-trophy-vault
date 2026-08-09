// Lightweight WebAudio "award ceremony" sound design — no assets, no deps.

let ctx: AudioContext | null = null;
let enabled = true;
const listeners = new Set<(on: boolean) => void>();

export function isSoundEnabled() {
  return enabled;
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  listeners.forEach((l) => l(on));
}

export function onSoundChange(l: (on: boolean) => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

type ToneOpts = {
  freq: number;
  dur: number;
  delay?: number;
  gain?: number;
  type?: OscillatorType;
  sweepTo?: number;
};

function tone({ freq, dur, delay = 0, gain = 0.08, type = "sine", sweepTo }: ToneOpts) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noiseSweep(dur = 0.45, gain = 0.05) {
  const ac = audio();
  if (!ac) return;
  const frames = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 2;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(2400, ac.currentTime);
  filter.frequency.exponentialRampToValueAtTime(7200, ac.currentTime + dur);
  filter.Q.value = 2.5;
  const amp = ac.createGain();
  amp.gain.value = gain;
  src.connect(filter).connect(amp).connect(ac.destination);
  src.start();
}

/** Soft crystal tick when a trophy tile is hovered. */
export function playHover() {
  if (!enabled) return;
  tone({ freq: 1760, dur: 0.16, gain: 0.025, type: "triangle" });
}

/** Bright crystal chime when a trophy is opened. */
export function playReveal() {
  if (!enabled) return;
  noiseSweep(0.5, 0.035);
  tone({ freq: 880, dur: 0.7, gain: 0.06, type: "sine" });
  tone({ freq: 1318.5, dur: 0.8, delay: 0.06, gain: 0.05, type: "sine" });
  tone({ freq: 1760, dur: 0.9, delay: 0.12, gain: 0.04, type: "sine" });
}

/** Metallic glass sweep while the trophy is rotated. */
export function playSpin() {
  if (!enabled) return;
  tone({ freq: 420, dur: 0.22, gain: 0.02, type: "sawtooth", sweepTo: 900 });
}

/** Engraved-plate stamp on download. */
export function playDownload() {
  if (!enabled) return;
  tone({ freq: 220, dur: 0.22, gain: 0.07, type: "square", sweepTo: 90 });
  tone({ freq: 1320, dur: 0.35, delay: 0.05, gain: 0.04, type: "sine" });
}

/** Subtle UI click for filters. */
export function playTap() {
  if (!enabled) return;
  tone({ freq: 640, dur: 0.09, gain: 0.03, type: "triangle" });
}
