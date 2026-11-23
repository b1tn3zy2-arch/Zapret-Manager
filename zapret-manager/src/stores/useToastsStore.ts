// Импортируем зависимости из модуля zustand.
import { create } from "zustand";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/types.
import type { NotificationKind } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const TOAST_TTL_MS = 4500;
// Обрабатываем конструкцию: const MAX_TOASTS = 4.
const MAX_TOASTS = 4;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface AppToast {
  // Обрабатываем конструкцию: id.
  id: number;
  // Обрабатываем конструкцию: kind.
  kind: NotificationKind;
  // Обрабатываем конструкцию: title.
  title: string;
  // Обрабатываем конструкцию: body.
  body: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface ToastsState {
  // Обрабатываем конструкцию: toasts.
  toasts: AppToast[];
  // Обрабатываем конструкцию: push.
  push: (kind: NotificationKind, title: string, body: string) => void;
  // Обрабатываем конструкцию: dismiss.
  dismiss: (id: number) => void;
  // Обрабатываем конструкцию: clear.
  clear: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: let nextId = 1.
let nextId = 1;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const useToastsStore = create<ToastsState>()((set) => ({
  // Обрабатываем конструкцию: toasts.
  toasts: [],
  // Обрабатываем конструкцию: push.
  push: (kind, title, body) =>
    // Обрабатываем конструкцию: set.
    set((state) => ({
      // Обрабатываем конструкцию: toasts.
      toasts: [
        // Разворачиваем ...state.toasts.slice(-(MAX_TOASTS - 1)) в коллекцию.
        ...state.toasts.slice(-(MAX_TOASTS - 1)),
        // Открываем объектный литерал.
        { id: nextId++, kind, title, body },
        // Закрываем массив или список.
      ],
      // Закрываем текущий блок.
    })),
  // Обрабатываем конструкцию: dismiss.
  dismiss: (id) =>
    // Обрабатываем конструкцию: set.
    set((state) => ({
      // Обрабатываем конструкцию: toasts.
      toasts: state.toasts.filter((toast) => toast.id !== id),
      // Закрываем текущий блок.
    })),
  // Обрабатываем конструкцию: clear.
  clear: () => set({ toasts: [] }),
  // Закрываем текущий блок.
}));
// — разделитель логических блоков —
