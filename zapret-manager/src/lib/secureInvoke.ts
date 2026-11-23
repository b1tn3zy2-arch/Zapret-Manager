// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля @tauri-apps/api/core.
import { invoke } from "@tauri-apps/api/core";
// Импортируем зависимости из модуля zod.
import type { z } from "zod";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/sanitize.
import { redactSecrets } from "@/lib/sanitize";
// — разделитель логических блоков —

// Объявляем класс IpcError.
class IpcError extends Error {
  // Обрабатываем конструкцию: constructor( message: string, readonly command: string ….
  constructor(
    // Обрабатываем конструкцию: message.
    message: string,
    // Обрабатываем конструкцию: readonly.
    readonly command: string
    // Закрываем выражение или список аргументов.
  ) {
    // Обрабатываем конструкцию: super.
    super(message);
    // Обрабатываем конструкцию: this.
    this.name = "IpcError";
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию toMessage.
function toMessage(error: unknown): string {
  // Проверяем бизнес-условие: error instanceof Error.
  if (error instanceof Error) {
    // Возвращаем результат: redactSecrets(error.message).
    return redactSecrets(error.message);
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: typeof error === string.
  if (typeof error === "string") {
    // Возвращаем результат: redactSecrets(error).
    return redactSecrets(error);
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: typeof error === object && error !== null.
  if (typeof error === "object" && error !== null) {
    // Обрабатываем конструкцию: const message = Reflect.get(error, message).
    const message = Reflect.get(error, "message");
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: typeof message === string && message !==.
    if (typeof message === "string" && message !== "") {
      // Возвращаем результат: redactSecrets(message).
      return redactSecrets(message);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: translateKey(errors.ipcUnknown).
  return translateKey("errors.ipcUnknown");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function secureInvoke<T>(
  // Обрабатываем конструкцию: command.
  command: string,
  // Обрабатываем конструкцию: args.
  args?: Record<string, unknown>
  // Закрываем выражение или список аргументов.
): Promise<T> {
  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Возвращаем результат: await invoke<T>(command, args).
    return await invoke<T>(command, args);
    // Закрываем текущий блок.
  } catch (error) {
    // Выбрасываем исключение throw new IpcError(toMessage(error), command);.
    throw new IpcError(toMessage(error), command);
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function secureInvokeValidated<S extends z.ZodType>(
  // Обрабатываем конструкцию: command.
  command: string,
  // Обрабатываем конструкцию: schema.
  schema: S,
  // Обрабатываем конструкцию: args.
  args?: Record<string, unknown>
  // Закрываем выражение или список аргументов.
): Promise<z.infer<S>> {
  // Обрабатываем конструкцию: const raw = await secureInvoke<unknown>(command, args).
  const raw = await secureInvoke<unknown>(command, args);
  // Обрабатываем конструкцию: const result = schema.safeParse(raw).
  const result = schema.safeParse(raw);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !result.success.
  if (!result.success) {
    // Выбрасываем исключение throw new IpcError(translateKey(errors.ipcSchema, ….
    throw new IpcError(translateKey("errors.ipcSchema", { command }), command);
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: result.data.
  return result.data;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
