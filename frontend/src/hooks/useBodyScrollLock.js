import { useEffect } from "react";

/**
 * Freezes background scrolling while a modal is open.
 *
 * The scrollbar's width is added back as padding so locking doesn't shift the
 * page sideways underneath the overlay.
 */
export default function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [locked]);
}
