import { invoke } from "@tauri-apps/api/core";
import type { z } from "zod";

import { redactSecrets } from "@/lib/sanitize";

const INVOKE_ERROR_PREFIX = "Ошибка вызова Tauri:";

class IpcError extends Error {
  constructor(
    message: string,
    readonly command: string
  ) {
    super(message);
    this.name = "IpcError";
  }
}

function toMessage(error: unknown): string {
  if (error instanceof Error) {
    return redactSecrets(error.message);
  }

  if (typeof error === "string") {
    return redactSecrets(error);
  }

  if (typeof error === "object" && error !== null) {
    const message = Reflect.get(error, "message");

    if (typeof message === "string" && message !== "") {
      return redactSecrets(message);
    }
  }

  return "Неизвестная ошибка IPC";
}

export async function secureInvoke<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    throw new IpcError(toMessage(error), command);
  }
}

export async function secureInvokeValidated<S extends z.ZodType>(
  command: string,
  schema: S,
  args?: Record<string, unknown>
): Promise<z.infer<S>> {
  const raw = await secureInvoke<unknown>(command, args);
  const result = schema.safeParse(raw);

  if (!result.success) {
    throw new IpcError(
      `${INVOKE_ERROR_PREFIX} ответ ${command} не прошёл проверку схемы`,
      command
    );
  }

  return result.data;
}
