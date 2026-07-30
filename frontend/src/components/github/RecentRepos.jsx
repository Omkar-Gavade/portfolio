import { GitFork, Star } from "lucide-react";
import useCachedFetch from "../../hooks/useCachedFetch";
import { site } from "../../data/site";
import { EVENTS, track } from "../../lib/analytics";
import Chip from "../ui/Chip";
import { RevealGroup, RevealItem } from "../ui/Reveal";

const COUNT = 6;

/** A description of "." or "-" is effectively blank — don't print a bare dot. */
const describe = (text) =>
  text && /[a-z0-9]/i.test(text) ? text : "No description provided.";

/**
 * Builds the list to display: the curated repos from `site.pinnedRepos` first,
 * in the order they're written, then the rest of the account's own repos to
 * fill the grid — most-starred first, falling back to most recently pushed
 * (the API already returns them in that order, and the sort is stable).
 *
 * Names are matched case-insensitively, and any name that doesn't resolve is
 * skipped rather than leaving a hole, so a typo in the data file can't empty
 * the section.
 */
function pickRepos(data) {
  if (!Array.isArray(data)) return [];

  const byName = new Map(data.map((repo) => [repo.name.toLowerCase(), repo]));

  const pinned = (site.pinnedRepos ?? [])
    .map((name) => byName.get(name.toLowerCase()))
    .filter(Boolean);

  const alreadyPicked = new Set(pinned.map((repo) => repo.id));
  const backfill = data
    .filter((repo) => !repo.fork && !alreadyPicked.has(repo.id))
    .sort((a, b) => b.stargazers_count - a.stargazers_count);

  return [...pinned, ...backfill].slice(0, COUNT);
}

const relativeDate = (iso) => {
  const days = Math.floor((Date.now() - new Date(iso)) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
};

function RepoSkeleton() {
  return (
    <div
      className="border border-gray-200 dark:border-white/10
                 bg-gray-50 dark:bg-transparent
                 rounded-xl p-5 h-32 animate-pulse
                 motion-reduce:animate-none"
      aria-hidden="true"
    />
  );
}

export default function RecentRepos() {
  const { data, loading, error } = useCachedFetch(
    // Fetch the full list so a curated name resolves even if that repo hasn't
    // been touched recently. One request, still well inside the rate limit.
    `https://api.github.com/users/${site.githubUser}/repos?sort=updated&per_page=100`,
    { key: `gh:repos:v2:${site.githubUser}` }
  );

  const repos = pickRepos(data);

  if (error) return null;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: COUNT }, (_, i) => (
          <RepoSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!repos.length) return null;

  return (
    <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {repos.map((repo) => (
        <RevealItem key={repo.id}>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() =>
              track(EVENTS.GITHUB_CLICK, {
                repo: repo.name,
                source: "activity",
              })
            }
            className="group h-full flex flex-col
                       border border-gray-200 dark:border-white/10
                       bg-gray-50 dark:bg-transparent
                       rounded-xl p-5
                       hover:bg-gray-100 dark:hover:bg-white/5
                       transition"
          >
            <h4 className="font-medium truncate">{repo.name}</h4>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
              {describe(repo.description)}
            </p>

            <div className="mt-auto pt-4 flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
              {repo.language && <Chip size="xs">{repo.language}</Chip>}

              <span className="inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5" aria-hidden="true" />
                {repo.stargazers_count}
              </span>

              <span className="inline-flex items-center gap-1">
                <GitFork className="w-3.5 h-3.5" aria-hidden="true" />
                {repo.forks_count}
              </span>

              <span className="ml-auto">
                Updated {relativeDate(repo.pushed_at)}
              </span>
            </div>
          </a>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
