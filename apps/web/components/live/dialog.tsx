'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { buttonClass } from './ui';

/**
 * Modal confirmation built on the native <dialog> element, which gives
 * focus trapping, Escape to close and an inert background for free.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="confirm-dialog-title"
      className="w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-border p-0 shadow-xl backdrop:bg-slate-900/40"
    >
      <div className="p-6">
        <h2 id="confirm-dialog-title" className="text-lg font-semibold">
          {title}
        </h2>
        {children && <div className="mt-2 text-sm text-muted-foreground">{children}</div>}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" className={buttonClass('secondary')} onClick={onClose}>
            {cancelLabel}
          </button>
          <button type="button" className={buttonClass('primary')} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
