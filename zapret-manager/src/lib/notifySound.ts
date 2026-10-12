import type { NotificationKind } from "@/types";

let context: AudioContext | null = null;
let unlocked = false;

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (context === null) {
    const constructor =
      window.AudioContext ??
      (
        window as unknown as {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (constructor === undefined) {
      return null;
    }

    context = new constructor();
  }

  return context;
}

export function unlockNotificationSound(): void {
  const audio = ensureContext();

  if (audio === null || unlocked) {
    return;
  }

  unlocked = true;
  void audio.resume().catch(() => undefined);
}

const SCALES: Record<NotificationKind, readonly number[]> = {
  success: [523.25, 659.25, 783.99],
  error: [415.3, 311.13],
  warning: [587.33, 493.88],
  info: [659.25, 987.77],
};

const NOTE_GAP_SECONDS = 0.085;
const LEAD_GAIN = 0.15;
const HARMONIC_GAIN = 0.3;
const HARMONIC_RATIO = 2;

export function playNotificationSound(kind: NotificationKind): void {
  const audio = ensureContext();

  if (audio === null) {
    return;
  }

  if (audio.state === "suspended") {
    void audio.resume().catch(() => undefined);
  }

  const notes = SCALES[kind];
  const start = audio.currentTime + 0.01;
  const filter = audio.createBiquadFilter();

  filter.type = "lowpass";
  filter.frequency.value = 4200;
  filter.Q.value = 0.6;
  filter.connect(audio.destination);

  notes.forEach((frequency, index) => {
    const at = start + index * NOTE_GAP_SECONDS;
    const decay = index === 0 ? 0.65 : 0.5;
    const gain = audio.createGain();

    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(
      index === 0 ? LEAD_GAIN : LEAD_GAIN * 0.72,
      at + 0.016
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    gain.connect(filter);

    const fundamental = audio.createOscillator();

    fundamental.type = "sine";
    fundamental.frequency.value = frequency;
    fundamental.connect(gain);
    fundamental.start(at);
    fundamental.stop(at + decay + 0.05);

    const harmonic = audio.createOscillator();
    const harmonicGain = audio.createGain();

    harmonic.type = "sine";
    harmonic.frequency.value = frequency * HARMONIC_RATIO;
    harmonic.detune.value = 5;
    harmonicGain.gain.value = HARMONIC_GAIN;
    harmonic.connect(harmonicGain);
    harmonicGain.connect(gain);
    harmonic.start(at);
    harmonic.stop(at + decay + 0.05);
  });
}
