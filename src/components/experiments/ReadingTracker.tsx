"use client";

import { useEffect } from "react";
import { useProgress } from "@/lib/store/progress";

/** Marks theory sections as read when they have been in view for a moment. */
export function ReadingTracker({ slug, sectionIds }: { slug: string; sectionIds: string[] }) {
  const markSection = useProgress((s) => s.markSection);
  const visit = useProgress((s) => s.visit);

  useEffect(() => {
    visit(slug, "understand");
  }, [slug, visit]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id;
          if (!id || seen.has(id)) continue;
          seen.add(id);
          markSection(slug, id);
        }
      },
      { rootMargin: "0px 0px -55% 0px", threshold: 0.15 }
    );
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [markSection, sectionIds, slug]);

  return null;
}
