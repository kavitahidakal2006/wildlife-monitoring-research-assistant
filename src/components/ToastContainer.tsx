import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useResearch } from '../context/ResearchContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useResearch();

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2.5"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'warning'
              ? AlertTriangle
              : toast.type === 'error'
                ? XCircle
                : Info;

        const iconColor =
          toast.type === 'success'
            ? 'text-[#244B35]'
            : toast.type === 'warning'
              ? 'text-[#D99A3B]'
              : toast.type === 'error'
                ? 'text-[#C65B4B]'
                : 'text-[#547A50]';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-[#E2E5DA] bg-white p-3.5 shadow-lg"
          >
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#202B24]">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-[#788078]">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="rounded p-1 text-[#788078] hover:bg-[#F5F6EF] hover:text-[#202B24]"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
