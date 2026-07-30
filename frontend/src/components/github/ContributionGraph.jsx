import { useMemo } from "react";
import useCachedFetch from "../../hooks/useCachedFetch";
import { site } from "../../data/site";

/**
 * GitHub's own contribution scale, light and dark variants.
 *
 * This is the one place the page steps outside its greyscale palette — the
 * green is the whole point of a contribution graph, and readers already know
 * how to read it. Values match GitHub's so the graph looks native rather than
 * like an approximation.
 */
const LEVELS = [
  "bg-[#ebedf0] dark:bg-[#161b22]",
  "bg-[#9be9a8] dark:bg-[#0e4429]",
  "bg-[#40c463] dark:bg-[#006d32]",
  "bg-[#30a14e] dark:bg-[#26a641]",
  "bg-[#216e39] dark:bg-[#39d353]",
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Splits a flat list of days into calendar weeks, padding the first column. */
function toWeeks(days) {
  const weeks = [];
  let week = [];

  days.forEach((day, i) => {
    const weekday = new Date(day.date).getDay();

    if (i === 0 && weekday > 0) {
      week = Array.from({ length: weekday }, () => null);
    }

    week.push(day);

    if (weekday === 6) {
      weeks.push(week);
      week = [];
    }
  });

  if (week.length) {
    weeks.push([...week, ...Array.from({ length: 7 - week.length }, () => null)]);
  }

  return weeks;
}

export default function ContributionGraph() {
  const { data, loading, error } = useCachedFetch(
    `https://github-contributions-api.jogruber.de/v4/${site.githubUser}?y=last`,
    { key: `gh:contributions:${site.githubUser}` }
  );

  const weeks = useMemo(
    () => toWeeks(data?.contributions ?? []),
    [data]
  );

  const total = useMemo(() => {
    const totals = data?.total;
    if (!totals) return null;
    return Object.values(totals).reduce((sum, value) => sum + value, 0);
  }, [data]);

  // Nothing to show and nothing to say — hide rather than render an error.
  if (error) return null;

  if (loading) {
    return (
      <div
        className="h-[7.5rem] rounded-xl animate-pulse
                   bg-gray-100 dark:bg-white/5
                   motion-reduce:animate-none"
        aria-hidden="true"
      />
    );
  }

  if (!weeks.length) return null;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {total != null && (
            <>
              <span className="font-medium text-black dark:text-white">
                {total.toLocaleString()}
              </span>{" "}
              contributions in the last year
            </>
          )}
        </p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full">
          {/* Month scale */}
          <div className="flex gap-[3px] mb-1.5 pl-0">
            {weeks.map((week, i) => {
              const first = week.find(Boolean);
              const previous = weeks[i - 1]?.find(Boolean);
              const month = first && new Date(first.date).getMonth();
              const previousMonth =
                previous && new Date(previous.date).getMonth();
              const changed = i === 0 || month !== previousMonth;

              return (
                <span
                  key={`label-${i}`}
                  className="w-[11px] shrink-0 text-[9px] leading-none
                             text-gray-500 dark:text-gray-500"
                >
                  {changed && month != null ? MONTHS[month] : ""}
                </span>
              );
            })}
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((day, dayIndex) =>
                  day ? (
                    <span
                      key={day.date}
                      title={`${day.count} contribution${
                        day.count === 1 ? "" : "s"
                      } on ${day.date}`}
                      className={`w-[11px] h-[11px] rounded-[2px] ${
                        LEVELS[day.level] ?? LEVELS[0]
                      }`}
                    />
                  ) : (
                    <span
                      key={`${weekIndex}-${dayIndex}`}
                      className="w-[11px] h-[11px]"
                    />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-2 text-xs text-gray-600 dark:text-gray-400">
        <span>Less</span>
        {LEVELS.map((level, i) => (
          <span
            key={i}
            className={`w-[11px] h-[11px] rounded-[2px] ${level}`}
            aria-hidden="true"
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
