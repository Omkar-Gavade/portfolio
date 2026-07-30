/**
 * The pill used for tech stacks, coursework and skills.
 * Both variants already existed in the page — this just names them.
 */
const VARIANTS = {
  solid:
    "bg-white dark:bg-white/10 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-200",
  outline:
    "bg-gray-100 dark:bg-transparent border border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-300",
};

const SIZES = {
  xs: "px-3 py-1 text-xs",
  sm: "px-3 py-1 text-sm",
};

export default function Chip({
  children,
  variant = "solid",
  size = "xs",
  className = "",
}) {
  return (
    <span
      className={`rounded-full ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

/** A wrapped row of chips — the `flex flex-wrap gap-2` pattern used everywhere. */
export function ChipList({ items, variant, size, className = "" }) {
  if (!items?.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item) => (
        <Chip key={item} variant={variant} size={size}>
          {item}
        </Chip>
      ))}
    </div>
  );
}
