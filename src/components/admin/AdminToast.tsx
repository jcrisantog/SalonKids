"use client";

import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

type AdminToastProps = {
  message: string | null;
  durationMs?: number;
  onClose: () => void;
};

export function AdminToast({ message, durationMs = 3500, onClose }: AdminToastProps) {
  useEffect(() => {
    if (!message) {
      return;
    }

    const timeoutId = window.setTimeout(onClose, durationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [durationMs, message, onClose]);

  if (!message) {
    return null;
  }

  return (
    <div className="fixed right-5 top-5 z-[1100] w-[min(420px,calc(100vw-2.5rem))] rounded-lg border border-emerald-300/25 bg-[#111116] p-4 text-white shadow-2xl shadow-black/40">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-emerald-300/25 bg-emerald-400/10 text-emerald-200">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-emerald-100">Operacion completada</p>
          <p className="mt-1 text-sm leading-5 text-gray-300">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-gray-500 transition hover:bg-white/10 hover:text-white"
          title="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
