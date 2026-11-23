// Импортируем зависимости из модуля vitest.
import { beforeEach, describe, expect, it, vi } from "vitest";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const { files } = vi.hoisted(() => ({ files: new Map<st….
const { files } = vi.hoisted(() => ({
  // Обрабатываем конструкцию: files.
  files: new Map<string, string>(),
  // Закрываем текущий блок.
}));
// — разделитель логических блоков —

// Обрабатываем конструкцию: vi.
vi.mock("@tauri-apps/api/path", () => ({
  // Обрабатываем конструкцию: appDataDir.
  appDataDir: vi.fn(async () => "C:\\data"),
  // Закрываем текущий блок.
}));
// — разделитель логических блоков —

// Обрабатываем конструкцию: vi.
vi.mock("@tauri-apps/plugin-fs", () => ({
  // Обрабатываем конструкцию: exists.
  exists: vi.fn(async (path: string) => files.has(path)),
  // Обрабатываем конструкцию: mkdir.
  mkdir: vi.fn(async () => undefined),
  // Обрабатываем конструкцию: readTextFile.
  readTextFile: vi.fn(async (path: string) => {
    // Обрабатываем конструкцию: const value = files.get(path).
    const value = files.get(path);
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: value === undefined.
    if (value === undefined) {
      // Выбрасываем исключение throw new Error(not found);.
      throw new Error("not found");
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Возвращаем результат: value.
    return value;
    // Закрываем текущий блок.
  }),
  // Обрабатываем конструкцию: writeTextFile.
  writeTextFile: vi.fn(async (path: string, content: string) => {
    // Обрабатываем конструкцию: files.
    files.set(path, content);
    // Закрываем текущий блок.
  }),
  // Закрываем текущий блок.
}));
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/storage.
import { readSettingsFile, writeSettingsFile } from "@/lib/storage";
// Импортируем зависимости из модуля @/lib/defaults.
import { DEFAULT_SETTINGS } from "@/lib/defaults";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const SETTINGS = C:\\data\\settings.json.
const SETTINGS = "C:\\data\\settings.json";
// Обрабатываем конструкцию: const BACKUP = ${SETTINGS}.bak.
const BACKUP = `${SETTINGS}.bak`;
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("storage: устойчивость settings.json", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: files.
    files.clear();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("читает резервную копию, если основной файл повреждён", async () => {
    // Обрабатываем конструкцию: files.
    files.set(SETTINGS, '{"strategiesFolder":');
    // Обрабатываем конструкцию: files.
    files.set(BACKUP, JSON.stringify({ strategiesFolder: "C:\\zapret" }));
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const settings = await readSettingsFile().
    const settings = await readSettingsFile();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(settings?.strategiesFolder).toBe("C:\\zapret");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("возвращает null, если повреждены оба файла", async () => {
    // Обрабатываем конструкцию: files.
    files.set(SETTINGS, "not json");
    // Обрабатываем конструкцию: files.
    files.set(BACKUP, "also not json");
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await expect(readSettingsFile()).resolves.toB….
    await expect(readSettingsFile()).resolves.toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("возвращает null, если файла ещё нет", async () => {
    // Ожидаем завершение асинхронной операции await expect(readSettingsFile()).resolves.toB….
    await expect(readSettingsFile()).resolves.toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сохраняет предыдущую версию в .bak перед записью", async () => {
    // Обрабатываем конструкцию: files.
    files.set(SETTINGS, "old");
    // Обрабатываем конструкцию: files.
    files.set(BACKUP, "older");
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await writeSettingsFile(DEFAULT_SETTINGS).
    await writeSettingsFile(DEFAULT_SETTINGS);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(files.get(BACKUP)).toBe("old");
    // Обрабатываем конструкцию: expect.
    expect(files.get(SETTINGS)).toBe(JSON.stringify(DEFAULT_SETTINGS, null, 2));
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не создаёт .bak при первой записи", async () => {
    // Ожидаем завершение асинхронной операции await writeSettingsFile(DEFAULT_SETTINGS).
    await writeSettingsFile(DEFAULT_SETTINGS);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(files.has(SETTINGS)).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(files.has(BACKUP)).toBe(false);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
