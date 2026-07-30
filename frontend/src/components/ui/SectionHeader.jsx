import Reveal from "./Reveal";

/**
 * The centred "heading + supporting line" block that opens every section.
 */
export default function SectionHeader({
  title,
  children,
  className = "mb-16",
  titleClassName = "text-3xl md:text-4xl font-semibold mb-3",
  align = "center",
}) {
  return (
    <Reveal
      className={`${align === "center" ? "text-center" : ""} ${className}`}
    >
      <h2 className={titleClassName}>{title}</h2>
      {children && (
        <p
          className={`text-gray-600 dark:text-gray-400 max-w-2xl ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {children}
        </p>
      )}
    </Reveal>
  );
}
