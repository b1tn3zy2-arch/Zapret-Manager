// Импортируем зависимости из модуля vitest.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// — разделитель логических блоков —

// Объявляем псевдоним типа WindowWithAudio.
type WindowWithAudio = {
  // Обрабатываем конструкцию: AudioContext.
  AudioContext?: unknown;
  // Обрабатываем конструкцию: webkitAudioContext.
  webkitAudioContext?: unknown;
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: const audioWindow = window as unknown as WindowWithAudi….
const audioWindow = window as unknown as WindowWithAudio;
// — разделитель логических блоков —

// Объявляем функцию createMockAudioContext.
function createMockAudioContext(counter: { oscillators: number }) {
  // Объявляем класс MockAudioContext.
  class MockAudioContext {
    // Обрабатываем конструкцию: state.
    state = "running";
    // Обрабатываем конструкцию: currentTime.
    currentTime = 0;
    // Обрабатываем конструкцию: destination.
    destination = {};
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: createOscillator.
    createOscillator() {
      // Обрабатываем конструкцию: counter.
      counter.oscillators += 1;
      // — разделитель логических блоков —

      // Возвращаем результат: { type: , frequency: { value: 0 }, detune: { value: 0 }….
      return {
        // Обрабатываем конструкцию: type.
        type: "",
        // Обрабатываем конструкцию: frequency.
        frequency: { value: 0 },
        // Обрабатываем конструкцию: detune.
        detune: { value: 0 },
        // Обрабатываем конструкцию: connect.
        connect: vi.fn(),
        // Обрабатываем конструкцию: start.
        start: vi.fn(),
        // Обрабатываем конструкцию: stop.
        stop: vi.fn(),
        // Закрываем текущий блок.
      };
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: createGain.
    createGain() {
      // Возвращаем результат: { gain: { value: 0, setValueAtTime: vi.fn(), exponentia….
      return {
        // Обрабатываем конструкцию: gain.
        gain: {
          // Обрабатываем конструкцию: value.
          value: 0,
          // Обрабатываем конструкцию: setValueAtTime.
          setValueAtTime: vi.fn(),
          // Обрабатываем конструкцию: exponentialRampToValueAtTime.
          exponentialRampToValueAtTime: vi.fn(),
          // Закрываем текущий блок.
        },
        // Обрабатываем конструкцию: connect.
        connect: vi.fn(),
        // Закрываем текущий блок.
      };
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: createBiquadFilter.
    createBiquadFilter() {
      // Возвращаем результат: { type: , frequency: { value: 0 }, Q: { value: 0 }, con….
      return {
        // Обрабатываем конструкцию: type.
        type: "",
        // Обрабатываем конструкцию: frequency.
        frequency: { value: 0 },
        // Обрабатываем конструкцию: Q.
        Q: { value: 0 },
        // Обрабатываем конструкцию: connect.
        connect: vi.fn(),
        // Закрываем текущий блок.
      };
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: resume.
    resume() {
      // Возвращаем результат: Promise.resolve().
      return Promise.resolve();
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: MockAudioContext.
  return MockAudioContext;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию createSampleAudioContext.
function createSampleAudioContext(counter: { sources: number }) {
  // Объявляем класс MockAudioContext.
  class MockAudioContext {
    // Обрабатываем конструкцию: state.
    state = "running";
    // Обрабатываем конструкцию: currentTime.
    currentTime = 0;
    // Обрабатываем конструкцию: destination.
    destination = {};
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: decodeAudioData.
    decodeAudioData = vi.fn(async () => ({ duration: 0.4 }) as AudioBuffer);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: createBufferSource.
    createBufferSource() {
      // Обрабатываем конструкцию: counter.
      counter.sources += 1;
      // — разделитель логических блоков —

      // Возвращаем результат: { buffer: null, connect: vi.fn(), start: vi.fn(), }.
      return {
        // Обрабатываем конструкцию: buffer.
        buffer: null,
        // Обрабатываем конструкцию: connect.
        connect: vi.fn(),
        // Обрабатываем конструкцию: start.
        start: vi.fn(),
        // Закрываем текущий блок.
      };
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: createGain.
    createGain() {
      // Возвращаем результат: { gain: { value: 0 }, connect: vi.fn(), }.
      return {
        // Обрабатываем конструкцию: gain.
        gain: { value: 0 },
        // Обрабатываем конструкцию: connect.
        connect: vi.fn(),
        // Закрываем текущий блок.
      };
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: resume.
    resume() {
      // Возвращаем результат: Promise.resolve().
      return Promise.resolve();
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: MockAudioContext.
  return MockAudioContext;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("notifySound", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: vi.
    vi.resetModules();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: afterEach.
  afterEach(() => {
    // Обрабатываем конструкцию: vi.
    vi.unstubAllGlobals();
    // Обрабатываем конструкцию: delete audioWindow.AudioContext.
    delete audioWindow.AudioContext;
    // Обрабатываем конструкцию: delete audioWindow.webkitAudioContext.
    delete audioWindow.webkitAudioContext;
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не падает без AudioContext", async () => {
    // Обрабатываем конструкцию: delete audioWindow.AudioContext.
    delete audioWindow.AudioContext;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const { playNotificationSound, unlockNotificationSound ….
    const { playNotificationSound, unlockNotificationSound } =
      // Ожидаем завершение асинхронной операции await import(@/lib/notifySound).
      await import("@/lib/notifySound");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(() => {
      // Обрабатываем конструкцию: unlockNotificationSound.
      unlockNotificationSound();
      // Обрабатываем конструкцию: playNotificationSound.
      playNotificationSound("success");
      // Закрываем текущий блок.
    }).not.toThrow();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("создаёт ноту с гармоникой для каждого тона в запасном синтезе", async () => {
    // Обрабатываем конструкцию: const counter = { oscillators: 0 }.
    const counter = { oscillators: 0 };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: audioWindow.
    audioWindow.AudioContext = createMockAudioContext(counter);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const { playNotificationSound } = await import(@/lib/no….
    const { playNotificationSound } = await import("@/lib/notifySound");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: playNotificationSound.
    playNotificationSound("success");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(counter.oscillators).toBe(6);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("поддерживает все виды уведомлений", async () => {
    // Обрабатываем конструкцию: const counter = { oscillators: 0 }.
    const counter = { oscillators: 0 };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: audioWindow.
    audioWindow.AudioContext = createMockAudioContext(counter);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const { playNotificationSound } = await import(@/lib/no….
    const { playNotificationSound } = await import("@/lib/notifySound");
    // — разделитель логических блоков —

    // Перебираем элементы коллекции [success, error, warning, info] as const.
    for (const kind of ["success", "error", "warning", "info"] as const) {
      // Обрабатываем конструкцию: playNotificationSound.
      playNotificationSound(kind);
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(counter.oscillators).toBeGreaterThanOrEqual(8);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("играет загруженный сэмпл вместо синтеза", async () => {
    // Обрабатываем конструкцию: const counter = { sources: 0, oscillators: 0 }.
    const counter = { sources: 0, oscillators: 0 };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: audioWindow.
    audioWindow.AudioContext = createSampleAudioContext(counter);
    // Обрабатываем конструкцию: vi.
    vi.stubGlobal(
      // Обрабатываем конструкцию: fetch.
      "fetch",
      // Обрабатываем конструкцию: vi.
      vi.fn(async () => ({
        // Обрабатываем конструкцию: ok.
        ok: true,
        // Обрабатываем конструкцию: arrayBuffer.
        arrayBuffer: async () => new ArrayBuffer(8),
        // Закрываем текущий блок.
      }))
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const { preloadNotificationSounds, playNotificationSoun….
    const { preloadNotificationSounds, playNotificationSound } =
      // Ожидаем завершение асинхронной операции await import(@/lib/notifySound).
      await import("@/lib/notifySound");
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await preloadNotificationSounds().
    await preloadNotificationSounds();
    // Обрабатываем конструкцию: expect.
    expect(counter.sources).toBe(0);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: playNotificationSound.
    playNotificationSound("success");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(counter.sources).toBe(1);
    // Обрабатываем конструкцию: expect.
    expect(counter.oscillators).toBe(0);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("при недоступном сэмпле остаётся синтез", async () => {
    // Обрабатываем конструкцию: const counter = { oscillators: 0 }.
    const counter = { oscillators: 0 };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: audioWindow.
    audioWindow.AudioContext = createMockAudioContext(counter);
    // Обрабатываем конструкцию: vi.
    vi.stubGlobal(
      // Обрабатываем конструкцию: fetch.
      "fetch",
      // Обрабатываем конструкцию: vi.
      vi.fn(async () => {
        // Выбрасываем исключение throw new Error(сеть недоступна);.
        throw new Error("сеть недоступна");
        // Закрываем текущий блок.
      })
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const { preloadNotificationSounds, playNotificationSoun….
    const { preloadNotificationSounds, playNotificationSound } =
      // Ожидаем завершение асинхронной операции await import(@/lib/notifySound).
      await import("@/lib/notifySound");
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await preloadNotificationSounds().
    await preloadNotificationSounds();
    // Обрабатываем конструкцию: playNotificationSound.
    playNotificationSound("info");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(counter.oscillators).toBeGreaterThan(0);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
