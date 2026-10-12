import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type WindowWithAudio = {
  AudioContext?: unknown;
  webkitAudioContext?: unknown;
};

const audioWindow = window as unknown as WindowWithAudio;

function createMockAudioContext(counter: { oscillators: number }) {
  class MockAudioContext {
    state = "running";
    currentTime = 0;
    destination = {};

    createOscillator() {
      counter.oscillators += 1;

      return {
        type: "",
        frequency: { value: 0 },
        detune: { value: 0 },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };
    }

    createGain() {
      return {
        gain: {
          value: 0,
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      };
    }

    createBiquadFilter() {
      return {
        type: "",
        frequency: { value: 0 },
        Q: { value: 0 },
        connect: vi.fn(),
      };
    }

    resume() {
      return Promise.resolve();
    }
  }

  return MockAudioContext;
}

describe("notifySound", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    delete audioWindow.AudioContext;
    delete audioWindow.webkitAudioContext;
  });

  it("не падает без AudioContext", async () => {
    delete audioWindow.AudioContext;

    const { playNotificationSound, unlockNotificationSound } =
      await import("@/lib/notifySound");

    expect(() => {
      unlockNotificationSound();
      playNotificationSound("success");
    }).not.toThrow();
  });

  it("создаёт ноту с гармоникой для каждого тона", async () => {
    const counter = { oscillators: 0 };

    audioWindow.AudioContext = createMockAudioContext(counter);

    const { playNotificationSound } = await import("@/lib/notifySound");

    playNotificationSound("success");

    expect(counter.oscillators).toBe(6);
  });

  it("поддерживает все виды уведомлений", async () => {
    const counter = { oscillators: 0 };

    audioWindow.AudioContext = createMockAudioContext(counter);

    const { playNotificationSound } = await import("@/lib/notifySound");

    for (const kind of ["success", "error", "warning", "info"] as const) {
      playNotificationSound(kind);
    }

    expect(counter.oscillators).toBeGreaterThanOrEqual(8);
  });
});
