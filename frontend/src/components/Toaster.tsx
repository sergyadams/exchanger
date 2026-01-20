'use client';

import { useToastStore } from '@/store/toastStore';
import { useEffect } from 'react';

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, 5000);
      return () => clearTimeout(timer);
    });
  }, [toasts, removeToast]);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[300px] px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : toast.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
