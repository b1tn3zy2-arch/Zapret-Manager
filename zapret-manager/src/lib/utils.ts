import { translateKey } from "@/i18n/core";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatLogTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function hasMessage(value: object): value is { message: string } {
  const message = Reflect.get(value, "message");
  return typeof message === "string" && message.trim() !== "";
}

export function toErrorMessage(caught: unknown): string {
  if (typeof caught === "string") {
    return caught;
  }

  if (caught instanceof Error) {
    return caught.message;
  }

  if (typeof caught === "object" && caught !== null && hasMessage(caught)) {
    return caught.message;
  }

  return translateKey("errors.unknown");
}
