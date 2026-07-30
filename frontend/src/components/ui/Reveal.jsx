import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE, STAGGER, TRAVEL } from "../../lib/motion";

/**
 * Fades and slides its children in once, the first time they scroll into view.
 *
 * Under `prefers-reduced-motion` the element is simply present — no opacity
 * ramp, no travel — so content never depends on animation to become visible.
 */
export default function Reveal({
  children,
  as = "div",
  delay = 0,
  y = TRAVEL,
  duration = DURATION.slow,
  className = "",
  ...rest
}) {
  const reduce = useReducedMotion();
  const M = motion[as] ?? motion.div;

  return (
    <M
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </M>
  );
}

/**
 * Parent for a group of `<RevealItem>`s. Children animate in sequence rather
 * than all at once.
 */
export function RevealGroup({
  children,
  as = "div",
  delay = 0,
  stagger = STAGGER,
  className = "",
  ...rest
}) {
  const reduce = useReducedMotion();
  const M = motion[as] ?? motion.div;

  return (
    <M
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
      {...rest}
    >
      {children}
    </M>
  );
}

export function RevealItem({
  children,
  as = "div",
  y = TRAVEL,
  duration = DURATION.base,
  className = "",
  ...rest
}) {
  const M = motion[as] ?? motion.div;

  return (
    <M
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration, ease: EASE } },
      }}
      {...rest}
    >
      {children}
    </M>
  );
}
