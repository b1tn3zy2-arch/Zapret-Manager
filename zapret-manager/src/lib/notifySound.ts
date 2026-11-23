// Импортируем зависимости из модуля @/types.
import type { NotificationKind } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: let context: AudioContext | null = null.
let context: AudioContext | null = null;
// Обрабатываем конструкцию: let unlocked = false.
let unlocked = false;
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Звуки уведомления — короткие синтезированные колокольчики …
 * Звуки уведомления — короткие синтезированные колокольчики (WAV лежит
 // Сохраняем пояснение разработчика: * в public/sounds): мягкие ноты с быстрой атакой и естествен…
 * в public/sounds): мягкие ноты с быстрой атакой и естественным спадом,
 // Сохраняем пояснение разработчика: * каждый вид уведомления различим на слух. Синтезатор с чирп…
 * каждый вид уведомления различим на слух. Синтезатор с чирпами остался
 // Сохраняем пояснение разработчика: * как запасной вариант: если сэмпл не отдался (сборка без фа…
 * как запасной вариант: если сэмпл не отдался (сборка без файлов, нет
 // Сохраняем пояснение разработчика: * сети к собственному origin), звук всё равно будет.
 * сети к собственному origin), звук всё равно будет.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: const SAMPLES: Record<NotificationKind, string> = { suc….
const SAMPLES: Record<NotificationKind, string> = {
  // Обрабатываем конструкцию: success.
  success: "sounds/success.wav",
  // Обрабатываем конструкцию: error.
  error: "sounds/error.wav",
  // Обрабатываем конструкцию: warning.
  warning: "sounds/warning.wav",
  // Обрабатываем конструкцию: info.
  info: "sounds/info.wav",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Половина громкости: системные уведомления не должны оглушать…
/** Половина громкости: системные уведомления не должны оглушать. */
// Обрабатываем конструкцию: const SAMPLE_GAIN = 0.5.
const SAMPLE_GAIN = 0.5;
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Загруженные сэмплы. Носят три состояния: нет записи — ещё …
 * Загруженные сэмплы. Носят три состояния: нет записи — ещё не пробовали,
 // Сохраняем пояснение разработчика: * null — загрузить не удалось, AudioBuffer — готов к воспрои…
 * null — загрузить не удалось, AudioBuffer — готов к воспроизведению.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: const buffers = new Map<NotificationKind, AudioBuffer |….
const buffers = new Map<NotificationKind, AudioBuffer | null>();
// Обрабатываем конструкцию: const inFlight = new Set<NotificationKind>().
const inFlight = new Set<NotificationKind>();
// — разделитель логических блоков —

// Объявляем функцию ensureContext.
function ensureContext(): AudioContext | null {
  // Проверяем бизнес-условие: typeof window === undefined.
  if (typeof window === "undefined") {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: context === null.
  if (context === null) {
    // Обрабатываем конструкцию: const constructor = window.AudioContext ?? ( window as ….
    const constructor =
      // Обрабатываем конструкцию: window.
      window.AudioContext ??
      // Обрабатываем конструкцию: ( window as unknown as { webkitAudioContext?: typeof Au….
      // Закрываем выражение или список аргументов.
      // Обрабатываем конструкцию: window.
      // Продолжаем предыдущую конструкцию.
      // Продолжаем предыдущую конструкцию.
      (
        window as unknown as {
          // Обрабатываем конструкцию: webkitAudioContext.
          webkitAudioContext?: typeof AudioContext;
          // Закрываем текущий блок.
        }
      ).webkitAudioContext;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: constructor === undefined.
    if (constructor === undefined) {
      // Возвращаем результат: null.
      return null;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: context.
    context = new constructor();
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: context.
  return context;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function unlockNotificationSound(): void {
  // Обрабатываем конструкцию: const audio = ensureContext().
  const audio = ensureContext();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: audio === null || unlocked.
  if (audio === null || unlocked) {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: unlocked.
  unlocked = true;
  // Обрабатываем конструкцию: void audio.resume().catch(() => undefined).
  void audio.resume().catch(() => undefined);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Предзагрузка сэмплов.
 * Предзагрузка сэмплов.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Вызывается при монтировании тостера: декодирование не треб…
 * Вызывается при монтировании тостера: декодирование не требует жеста
 // Сохраняем пояснение разработчика: * пользователя, поэтому к первому настоящему уведомлению — а…
 * пользователя, поэтому к первому настоящему уведомлению — а это обычно
 // Сохраняем пояснение разработчика: * минуты после запуска — сэмплы уже готовы и приятный звук и…
 * минуты после запуска — сэмплы уже готовы и приятный звук играет сразу.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export function preloadNotificationSounds(): Promise<void> {
  // Обрабатываем конструкцию: const audio = ensureContext().
  const audio = ensureContext();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: audio === null.
  if (audio === null) {
    // Возвращаем результат: Promise.resolve().
    return Promise.resolve();
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: Promise.all( (Object.keys(SAMPLES) as NotificationKind[….
  return Promise.all(
    // Обрабатываем конструкцию: (Object.keys(SAMPLES) as NotificationKind[]).
    (Object.keys(SAMPLES) as NotificationKind[]).map(
      // Продолжаем предыдущую конструкцию.
      (kind) =>
        // Обрабатываем конструкцию: loadSample.
        loadSample(audio, kind)
      // Закрываем выражение или список аргументов.
    )
    // Закрываем выражение или список аргументов.
  ).then(() => undefined);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: async.
async function loadSample(
  // Обрабатываем конструкцию: audio.
  audio: AudioContext,
  // Обрабатываем конструкцию: kind.
  kind: NotificationKind
  // Закрываем выражение или список аргументов.
): Promise<AudioBuffer | null> {
  // Проверяем бизнес-условие: buffers.has(kind) || inFlight.has(kind).
  if (buffers.has(kind) || inFlight.has(kind)) {
    // Возвращаем результат: buffers.get(kind) ?? null.
    return buffers.get(kind) ?? null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: inFlight.
  inFlight.add(kind);
  // — разделитель логических блоков —

  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Обрабатываем конструкцию: const response = await fetch(SAMPLES[kind]).
    const response = await fetch(SAMPLES[kind]);
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: !response.ok.
    if (!response.ok) {
      // Обрабатываем конструкцию: buffers.
      buffers.set(kind, null);
      // — разделитель логических блоков —

      // Возвращаем результат: null.
      return null;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const buffer = await audio.decodeAudioData(await respon….
    const buffer = await audio.decodeAudioData(await response.arrayBuffer());
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: buffers.
    buffers.set(kind, buffer);
    // — разделитель логических блоков —

    // Возвращаем результат: buffer.
    return buffer;
    // Закрываем текущий блок.
  } catch {
    // Обрабатываем конструкцию: buffers.
    buffers.set(kind, null);
    // — разделитель логических блоков —

    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  } finally {
    // Обрабатываем конструкцию: inFlight.
    inFlight.delete(kind);
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function playNotificationSound(kind: NotificationKind): void {
  // Обрабатываем конструкцию: const audio = ensureContext().
  const audio = ensureContext();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: audio === null.
  if (audio === null) {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: audio.state === suspended.
  if (audio.state === "suspended") {
    // Обрабатываем конструкцию: void audio.resume().catch(() => undefined).
    void audio.resume().catch(() => undefined);
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const buffer = buffers.get(kind).
  const buffer = buffers.get(kind);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: buffer.
  if (buffer) {
    // Обрабатываем конструкцию: playSample.
    playSample(audio, buffer);
    // — разделитель логических блоков —

    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: buffer === undefined.
  if (buffer === undefined) {
    // Сохраняем пояснение разработчика: // Первый звук до предзагрузки: играем запасной синтез и зао…
    // Первый звук до предзагрузки: играем запасной синтез и заодно
    // Сохраняем пояснение разработчика: // запускаем загрузку — следующий уведомление уже со сэмплом…
    // запускаем загрузку — следующий уведомление уже со сэмплом.
    // Обрабатываем конструкцию: playSynthChirp.
    playSynthChirp(kind);
    // Обрабатываем конструкцию: void loadSample(audio, kind).
    void loadSample(audio, kind);
    // — разделитель логических блоков —

    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: playSynthChirp.
  playSynthChirp(kind);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию playSample.
function playSample(audio: AudioContext, buffer: AudioBuffer): void {
  // Обрабатываем конструкцию: const source = audio.createBufferSource().
  const source = audio.createBufferSource();
  // Обрабатываем конструкцию: const gain = audio.createGain().
  const gain = audio.createGain();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: source.
  source.buffer = buffer;
  // Обрабатываем конструкцию: gain.
  gain.gain.value = SAMPLE_GAIN;
  // Обрабатываем конструкцию: source.
  source.connect(gain);
  // Обрабатываем конструкцию: gain.
  gain.connect(audio.destination);
  // Обрабатываем конструкцию: source.
  source.start();
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const SCALES: Record<NotificationKind, readonly number[….
const SCALES: Record<NotificationKind, readonly number[]> = {
  // Обрабатываем конструкцию: success.
  success: [523.25, 659.25, 783.99],
  // Обрабатываем конструкцию: error.
  error: [415.3, 311.13],
  // Обрабатываем конструкцию: warning.
  warning: [587.33, 493.88],
  // Обрабатываем конструкцию: info.
  info: [659.25, 987.77],
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: const NOTE_GAP_SECONDS = 0.085.
const NOTE_GAP_SECONDS = 0.085;
// Обрабатываем конструкцию: const LEAD_GAIN = 0.15.
const LEAD_GAIN = 0.15;
// Обрабатываем конструкцию: const HARMONIC_GAIN = 0.3.
const HARMONIC_GAIN = 0.3;
// Обрабатываем конструкцию: const HARMONIC_RATIO = 2.
const HARMONIC_RATIO = 2;
// — разделитель логических блоков —

// Объявляем функцию playSynthChirp.
function playSynthChirp(kind: NotificationKind): void {
  // Обрабатываем конструкцию: const audio = ensureContext().
  const audio = ensureContext();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: audio === null.
  if (audio === null) {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const notes = SCALES[kind].
  const notes = SCALES[kind];
  // Обрабатываем конструкцию: const start = audio.currentTime + 0.01.
  const start = audio.currentTime + 0.01;
  // Обрабатываем конструкцию: const filter = audio.createBiquadFilter().
  const filter = audio.createBiquadFilter();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: filter.
  filter.type = "lowpass";
  // Обрабатываем конструкцию: filter.
  filter.frequency.value = 4200;
  // Обрабатываем конструкцию: filter.
  filter.Q.value = 0.6;
  // Обрабатываем конструкцию: filter.
  filter.connect(audio.destination);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: notes.
  notes.forEach((frequency, index) => {
    // Обрабатываем конструкцию: const at = start + index * NOTE_GAP_SECONDS.
    const at = start + index * NOTE_GAP_SECONDS;
    // Обрабатываем конструкцию: const decay = index === 0 ? 0.65 : 0.5.
    const decay = index === 0 ? 0.65 : 0.5;
    // Обрабатываем конструкцию: const gain = audio.createGain().
    const gain = audio.createGain();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: gain.
    gain.gain.setValueAtTime(0.0001, at);
    // Обрабатываем конструкцию: gain.
    gain.gain.exponentialRampToValueAtTime(
      // Обрабатываем конструкцию: index.
      index === 0 ? LEAD_GAIN : LEAD_GAIN * 0.72,
      // Обрабатываем конструкцию: at.
      at + 0.016
      // Закрываем выражение или список аргументов.
    );
    // Обрабатываем конструкцию: gain.
    gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    // Обрабатываем конструкцию: gain.
    gain.connect(filter);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const fundamental = audio.createOscillator().
    const fundamental = audio.createOscillator();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: fundamental.
    fundamental.type = "sine";
    // Обрабатываем конструкцию: fundamental.
    fundamental.frequency.value = frequency;
    // Обрабатываем конструкцию: fundamental.
    fundamental.connect(gain);
    // Обрабатываем конструкцию: fundamental.
    fundamental.start(at);
    // Обрабатываем конструкцию: fundamental.
    fundamental.stop(at + decay + 0.05);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const harmonic = audio.createOscillator().
    const harmonic = audio.createOscillator();
    // Обрабатываем конструкцию: const harmonicGain = audio.createGain().
    const harmonicGain = audio.createGain();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: harmonic.
    harmonic.type = "sine";
    // Обрабатываем конструкцию: harmonic.
    harmonic.frequency.value = frequency * HARMONIC_RATIO;
    // Обрабатываем конструкцию: harmonic.
    harmonic.detune.value = 5;
    // Обрабатываем конструкцию: harmonicGain.
    harmonicGain.gain.value = HARMONIC_GAIN;
    // Обрабатываем конструкцию: harmonic.
    harmonic.connect(harmonicGain);
    // Обрабатываем конструкцию: harmonicGain.
    harmonicGain.connect(gain);
    // Обрабатываем конструкцию: harmonic.
    harmonic.start(at);
    // Обрабатываем конструкцию: harmonic.
    harmonic.stop(at + decay + 0.05);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
