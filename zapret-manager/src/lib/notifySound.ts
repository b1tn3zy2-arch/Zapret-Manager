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

const TONES: Record<NotificationKind, readonly [number, number]> = {
  success: [660, 990],
  error: [440, 300],
  warning: [587, 494],
  info: [740, 988],
};

export function playNotificationSound(kind: NotificationKind): void {
  const audio = ensureContext();

  if (audio === null) {
    return;
  }

  if (audio.state === "suspended") {
    void audio.resume().catch(() => undefined);
  }

  const tones = TONES[kind];
  const start = audio.currentTime + 0.01;

  tones.forEach((frequency, index) => {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const at = start + index * 0.09;

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.12, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.24);

    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(at);
    oscillator.stop(at + 0.26);
  });
}
