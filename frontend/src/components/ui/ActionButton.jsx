const BASE =
  "inline-flex items-center gap-2 rounded-full text-sm font-medium " +
  "transition active:scale-95 " +
  "motion-reduce:transition-none motion-reduce:active:scale-100";

const SIZES = {
  sm: "px-5 py-2",
  md: "px-6 py-2.5",
  lg: "px-7 py-3",
};

/**
 * `accent` is not listed here — it's passed in from `data/accents.js` so each
 * project keeps the colour it already had.
 */
const VARIANTS = {
  primary:
    "bg-black text-white dark:bg-white dark:text-black hover:opacity-90",
  secondary:
    "bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/10 " +
    "text-black dark:text-white hover:bg-gray-200 dark:hover:bg-white/20",
  ghost:
    "border border-gray-300 dark:border-white/15 text-black dark:text-white " +
    "hover:bg-gray-200 dark:hover:bg-white/10",
};

/**
 * One button that renders as `<a>`, `<button>`, or a muted non-interactive
 * placeholder when the link it would point at doesn't exist yet.
 *
 * The placeholder is why this exists: a project with no deployment shows a
 * disabled "Live Demo" rather than silently dropping the button, so the card
 * layout stays identical across projects.
 */
export default function ActionButton({
  children,
  href,
  onClick,
  variant = "secondary",
  size = "sm",
  className = "",
  external = false,
  disabled = false,
  disabledHint,
  icon: Icon,
  ...rest
}) {
  const style = `${BASE} ${SIZES[size]} ${
    VARIANTS[variant] ?? variant
  } ${className}`;

  const content = (
    <>
      {Icon && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />}
      {children}
    </>
  );

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        title={disabledHint}
        className={`${style} opacity-50 cursor-not-allowed select-none`}
      >
        {content}
      </span>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={style}
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={style} {...rest}>
      {content}
    </button>
  );
}
