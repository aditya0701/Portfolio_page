import { useEffect } from "react";

/**
 * Sets document.title for the current route and restores the previous title on
 * unmount. This is a single-page app, so without it every case study shares the
 * one <title> baked into index.html: a recruiter with three tabs open sees three
 * identical labels and can't tell them apart. Kept deliberately tiny rather than
 * pulling in react-helmet for one string.
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
