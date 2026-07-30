import { useEffect, useState } from "react";

const ONE_HOUR = 60 * 60 * 1000;

function readCache(key, ttl) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const { at, data } = JSON.parse(raw);
    if (Date.now() - at > ttl) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* private mode or quota — caching is an optimisation, not a requirement */
  }
}

/**
 * Fetches JSON once per session and caches it in `sessionStorage`.
 *
 * Used for the unauthenticated GitHub endpoints, which are rate-limited per IP
 * — caching keeps a visitor who scrolls past the section twice from spending
 * two requests. Every failure resolves to `error`, never a thrown exception,
 * so a rate-limited or offline visitor just doesn't see that block.
 */
export default function useCachedFetch(url, { ttl = ONE_HOUR, key } = {}) {
  const cacheKey = key ?? `cache:${url}`;
  const [state, setState] = useState(() => {
    const cached = readCache(cacheKey, ttl);
    return cached
      ? { data: cached, loading: false, error: null }
      : { data: null, loading: true, error: null };
  });

  useEffect(() => {
    if (!url || state.data) return;

    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);

        const data = await response.json();
        if (cancelled) return;

        writeCache(cacheKey, data);
        setState({ data, loading: false, error: null });
      } catch (error) {
        if (cancelled || error.name === "AbortError") return;
        setState({ data: null, loading: false, error });
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, cacheKey]);

  return state;
}
