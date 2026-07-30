import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DURATION, EASE } from "../../lib/motion";

/**
 * Renders one slide. Images and GIFs load lazily; video is muted, looping and
 * only fetches metadata until the visitor presses play.
 */
export function MediaFrame({ slide, className = "", eager = false }) {
  if (!slide) return null;

  if (slide.type === "video") {
    return (
      <video
        src={slide.src}
        poster={slide.poster || undefined}
        controls
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={slide.alt}
        className={`w-full h-full object-contain bg-white ${className}`}
      />
    );
  }

  return (
    <img
      src={slide.src}
      alt={slide.alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`w-full h-full object-contain bg-white ${className}`}
    />
  );
}

/**
 * Single-slide viewer with arrows, dots and arrow-key support.
 * With one slide it degrades to a plain frame — no controls, no chrome.
 */
export default function MediaCarousel({
  slides,
  className = "",
  frameClassName = "h-64 sm:h-80 md:h-96",
  label = "Project media",
}) {
  const items = slides ?? [];
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  const count = items.length;
  /** Takes an absolute index and wraps it into range. */
  const go = (next) => setIndex(((next % count) + count) % count);

  useEffect(() => {
    if (count < 2) return;

    const onKey = (event) => {
      if (event.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
      if (event.key === "ArrowRight") setIndex((i) => (i + 1) % count);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  if (!count) return null;

  const current = items[index];

  return (
    <div className={className}>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        className={`relative overflow-hidden rounded-xl
                    border border-gray-200 dark:border-white/10
                    bg-white ${frameClassName}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: DURATION.fast, ease: EASE }}
          >
            <MediaFrame slide={current} eager={index === 0} />
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <>
            <CarouselArrow side="left" onClick={() => go(index - 1)} />
            <CarouselArrow side="right" onClick={() => go(index + 1)} />

            <div
              className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full
                         text-xs text-gray-700 dark:text-gray-200
                         bg-white/80 dark:bg-black/70 backdrop-blur-md
                         border border-gray-300 dark:border-white/10"
              aria-hidden="true"
            >
              {index + 1} / {count}
            </div>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {items.map((item, i) => (
            <button
              key={`${item.src}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-6 bg-black dark:bg-white"
                  : "w-1.5 bg-gray-300 dark:bg-white/25 hover:bg-gray-400 dark:hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CarouselArrow({ side, onClick }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous slide" : "Next slide"}
      className={`absolute top-1/2 -translate-y-1/2 ${
        side === "left" ? "left-3" : "right-3"
      }
        w-10 h-10 flex items-center justify-center rounded-full
        bg-white/80 dark:bg-black/70 backdrop-blur-md
        border border-gray-300 dark:border-white/15
        text-black dark:text-white
        hover:bg-white dark:hover:bg-black/90 transition`}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
    </button>
  );
}
