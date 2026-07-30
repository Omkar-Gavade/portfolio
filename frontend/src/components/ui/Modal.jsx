import { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import { DURATION, EASE } from "../../lib/motion";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, video[controls], [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog used by the project and certificate previews.
 *
 * Surface, border, radius and typography are the same ones the section cards
 * use, so an open modal reads as part of the page rather than a bolted-on
 * component.
 *
 * Handles: focus trap, focus restoration, Escape to close, backdrop click,
 * background scroll lock, and `prefers-reduced-motion`.
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  labelledBy,
  size = "lg",
}) {
  const panelRef = useRef(null);
  const returnFocusRef = useRef(null);
  const reduce = useReducedMotion();
  const generatedId = useId();
  const headingId = labelledBy ?? `${generatedId}-title`;

  useBodyScrollLock(open);

  // Remember what had focus so it can be handed back on close, and move focus
  // into the dialog itself — landing on the panel rather than the close button
  // keeps the trap honest without lighting up a focus ring on "Close".
  useEffect(() => {
    if (open) {
      returnFocusRef.current = document.activeElement;
      panelRef.current?.focus?.();
    } else {
      returnFocusRef.current?.focus?.();
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const nodes = panelRef.current?.querySelectorAll(FOCUSABLE);
      if (!nodes?.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  const maxWidth = size === "xl" ? "max-w-5xl" : "max-w-3xl";

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center
                     bg-black/60 backdrop-blur-sm
                     p-0 sm:items-center sm:p-6"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: DURATION.fast, ease: EASE }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: DURATION.base, ease: EASE }}
            className={`w-full ${maxWidth} max-h-[92dvh] sm:max-h-[88dvh]
                        flex flex-col overflow-hidden
                        outline-none
                        bg-white dark:bg-black
                        text-black dark:text-white
                        border border-gray-200 dark:border-white/10
                        rounded-t-2xl sm:rounded-2xl
                        shadow-2xl shadow-black/10 dark:shadow-black/60`}
          >
            {/* Header */}
            <div
              className="flex items-start justify-between gap-4
                         px-6 pt-6 pb-4 shrink-0"
            >
              <div className="min-w-0">
                <h3
                  id={headingId}
                  className="text-xl font-semibold leading-snug"
                >
                  {title}
                </h3>
                {subtitle && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full
                           border border-gray-300 dark:border-white/15
                           text-black dark:text-white
                           hover:bg-gray-200 dark:hover:bg-white/10
                           transition"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="shrink-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-white/20 to-transparent" />

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6">
              {children}
            </div>

            {footer && (
              <>
                <div className="shrink-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-white/20 to-transparent" />
                <div className="shrink-0 px-6 py-4">{footer}</div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
