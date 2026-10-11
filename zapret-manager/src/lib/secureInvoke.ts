import { translateKey } from "@/i18n/core";
import { invoke } from "@tauri-apps/api/core";
import type { z } from "zod";

import { redactSecrets } from "@/lib/sanitize";

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

  return translateKey("errors.ipcUnknown");
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
    throw new IpcError(translateKey("errors.ipcSchema", { command }), command);
  }

  return result.data;
}
