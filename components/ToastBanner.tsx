"use client";

type ToastTone = 'success' | 'error' | 'info';

type Props = {
  title: string;
  message?: string;
  tone?: ToastTone;
  onClose?: () => void;
};

const toneClasses: Record<ToastTone, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
  info: 'border-sky-200 bg-sky-50 text-sky-900',
};

export default function ToastBanner({title, message, tone = 'info', onClose}: Props) {
  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-lg ${toneClasses[tone]}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-current opacity-70" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          {message ? <p className="mt-1 text-xs leading-5 opacity-80">{message}</p> : null}
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} className="text-xs font-semibold uppercase tracking-[0.16em] opacity-60 transition hover:opacity-100">
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}