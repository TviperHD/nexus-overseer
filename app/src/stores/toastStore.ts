/**
 * Toast notification store
 * Manages toast notifications for user feedback
 */

import { create } from 'zustand';
import type { Toast, ToastType } from '../types/toast';

interface ToastStore {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

/**
 * Toast notification store
 * Provides functions to show and manage toast notifications
 */
export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  /**
   * Show a toast notification
   * @param message - The message to display
   * @param type - The type of toast (default: 'info')
   * @param duration - Duration in milliseconds (default: 5000)
   */
  showToast: (message: string, type: ToastType = 'info', duration: number = 5000) => {
    const id = crypto.randomUUID();
    const toast: Toast = {
      id,
      message,
      type,
      duration,
    };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  /**
   * Remove a toast notification
   * @param id - The toast ID to remove
   */
  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  /**
   * Clear all toast notifications
   */
  clearAllToasts: () => {
    set({ toasts: [] });
  },
}));

