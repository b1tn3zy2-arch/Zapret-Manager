import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const list = window.matchMedia(query);

    const sync = (): void => {
      setMatches(list.matches);
    };

    sync();
    list.addEventListener("change", sync);

    return () => {
      list.removeEventListener("change", sync);
    };
  }, [query]);

  return matches;
}
