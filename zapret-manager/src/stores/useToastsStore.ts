import { create } from "zustand";

import type { NotificationKind } from "@/types";

export const TOAST_TTL_MS = 4500;
const MAX_TOASTS = 4;

export interface AppToast {
  id: number;
  kind: NotificationKind;
  title: string;
  body: string;
}

export interface ToastsState {
  toasts: AppToast[];
  push: (kind: NotificationKind, title: string, body: string) => void;
  dismiss: (id: number) => void;
  clear: () => void;
}

let nextId = 1;

export const useToastsStore = create<ToastsState>()((set) => ({
  toasts: [],
  push: (kind, title, body) =>
    set((state) => ({
      toasts: [
        ...state.toasts.slice(-(MAX_TOASTS - 1)),
        { id: nextId++, kind, title, body },
      ],
    })),
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
  clear: () => set({ toasts: [] }),
}));
