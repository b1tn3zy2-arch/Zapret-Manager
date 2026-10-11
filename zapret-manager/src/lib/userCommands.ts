import { translateKey } from "@/i18n/core";
import { secureInvoke } from "@/lib/secureInvoke";
import { validateTextFilePath } from "@/lib/sanitize";

export async function openExternalUrl(url: string): Promise<void> {
  await secureInvoke<void>("open_external_url", { url });
}

export async function readUserTextFile(path: string): Promise<string> {
  const check = validateTextFilePath(path);

  if (!check.valid) {
    throw new Error(
      check.message ?? translateKey("validation.invalidFilePath")
    );
  }

  return secureInvoke<string>("read_user_text_file", { path });
}

export async function writeUserTextFile(
  path: string,
  content: string
): Promise<void> {
  const check = validateTextFilePath(path);

  if (!check.valid) {
    throw new Error(
      check.message ?? translateKey("validation.invalidFilePath")
    );
  }

  await secureInvoke<void>("write_user_text_file", { path, content });
}
