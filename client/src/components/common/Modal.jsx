import React, { useEffect } from 'react';

/**
 * Reusable Modal dialog component.
 * @param {boolean} isOpen
 * @param {string} title
 * @param {React.ReactNode} children
 * @param {Function} onClose
 * @param {Function} onConfirm
 * @param {string} confirmText
 * @param {boolean} confirmLoading
 */
const Modal = ({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  confirmLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
      />

      {/* Modal Card */}
      <div className="card max-w-md w-full p-6 relative z-10 space-y-4 glass animate-fade-in border-indigo-500/20">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <h3 className="text-lg font-bold text-gradient">{title}</h3>
          <button
            onClick={onClose}
            className="text-[var(--color-muted)] hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div className="py-2 text-sm text-[var(--color-text)]">{children}</div>

        <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold border border-[var(--color-border)] hover:bg-white/5 text-[var(--color-muted)] hover:text-white"
          >
            Cancel
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={confirmLoading}
              className="btn-primary text-xs px-5 py-2 flex items-center gap-2"
            >
              {confirmLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
