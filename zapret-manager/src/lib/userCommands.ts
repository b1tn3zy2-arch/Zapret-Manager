// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function openExternalUrl(url: string): Promise<void> {
  // Ожидаем завершение асинхронной операции await secureInvoke<void>(open_external_url, {….
  await secureInvoke<void>("open_external_url", { url });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Сохраняет настройки через системный диалог.
 * Сохраняет настройки через системный диалог.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Путь выбирает Rust: webview не может передать произвольный…
 * Путь выбирает Rust: webview не может передать произвольный файл.
 // Сохраняем пояснение разработчика: * null означает отмену выбора.
 * `null` означает отмену выбора.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export async function saveSettingsFile(
  // Обрабатываем конструкцию: title.
  title: string,
  // Обрабатываем конструкцию: defaultName.
  defaultName: string,
  // Обрабатываем конструкцию: content.
  content: string
  // Закрываем выражение или список аргументов.
): Promise<string | null> {
  // Возвращаем результат: secureInvoke<string | null>(export_settings_file, { tit….
  return secureInvoke<string | null>("export_settings_file", {
    // Передаём поле title в объект.
    title,
    // Передаём поле defaultName в объект.
    defaultName,
    // Передаём поле content в объект.
    content,
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Читает настройки через системный диалог.
 * Читает настройки через системный диалог.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * null означает отмену выбора.
 * `null` означает отмену выбора.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export async function pickSettingsFile(title: string): Promise<string | null> {
  // Возвращаем результат: secureInvoke<string | null>(import_settings_file, { tit….
  return secureInvoke<string | null>("import_settings_file", { title });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
