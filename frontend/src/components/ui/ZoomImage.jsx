import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { DURATION, EASE } from "../../lib/motion";

const LEVELS = [1, 1.6, 2.4];

/**
 * Certificate viewer with click-to-zoom and drag-to-pan.
 *
 * Clicking cycles through zoom levels; once past 1× the image becomes
 * draggable within its frame. Controls are duplicated as buttons so the
 * behaviour is reachable without knowing the click gesture exists.
 */
export default function ZoomImage({
  src,
  alt,
  className = "",
  frameClassName = "h-[55vh] sm:h-[62vh]",
}) {
  const [level, setLevel] = useState(0);
  const frameRef = useRef(null);
  const reduce = useReducedMotion();

  const scale = LEVELS[level];
  const zoomed = level > 0;

  const cycle = () => setLevel((current) => (current + 1) % LEVELS.length);
  const zoomIn = () => setLevel((c) => Math.min(c + 1, LEVELS.length - 1));
  const zoomOut = () => setLevel((c) => Math.max(c - 1, 0));
  const reset = () => setLevel(0);

  if (!src) return null;

  return (
    <div className={className}>
      <div
        ref={frameRef}
        className={`relative overflow-hidden rounded-xl
                    border border-gray-200 dark:border-white/10
                    bg-white ${frameClassName}`}
      >
        <motion.img
          src={src}
          alt={alt}
          loading="eager"
          decoding="async"
          drag={zoomed}
          dragConstraints={frameRef}
          dragElastic={0.05}
          dragMomentum={false}
          onClick={cycle}
          animate={{ scale, x: zoomed ? undefined : 0, y: zoomed ? undefined : 0 }}
          transition={
            reduce ? { duration: 0 } : { duration: DURATION.base, ease: EASE }
          }
          className={`w-full h-full object-contain select-none
                      ${zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
          style={{ touchAction: zoomed ? "none" : "auto" }}
          draggable={false}
        />

        {/* Controls */}
        <div
          className="absolute bottom-3 right-3 flex items-center gap-1 p-1 rounded-full
                     bg-white/80 dark:bg-black/70 backdrop-blur-md
                     border border-gray-300 dark:border-white/10"
        >
          <ZoomButton
            onClick={zoomOut}
            disabled={level === 0}
            label="Zoom out"
            icon={Minus}
          />
          <span
            className="px-1.5 text-xs tabular-nums text-gray-700 dark:text-gray-200"
            aria-live="polite"
          >
            {scale.toFixed(1)}×
          </span>
          <ZoomButton
            onClick={zoomIn}
            disabled={level === LEVELS.length - 1}
            label="Zoom in"
            icon={Plus}
          />
          <ZoomButton
            onClick={reset}
            disabled={level === 0}
            label="Reset zoom"
            icon={RotateCcw}
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-center text-gray-600 dark:text-gray-400">
        {zoomed ? "Drag to pan · click to keep zooming" : "Click the image to zoom"}
      </p>
    </div>
  );
}

function ZoomButton({ onClick, disabled, label, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-8 h-8 flex items-center justify-center rounded-full
                 text-black dark:text-white
                 hover:bg-gray-200 dark:hover:bg-white/10
                 disabled:opacity-40 disabled:hover:bg-transparent
                 transition"
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
    </button>
  );
}
