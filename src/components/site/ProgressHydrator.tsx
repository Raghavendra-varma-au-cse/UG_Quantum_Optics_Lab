"use client";

import { useEffect } from "react";
import { useProgress } from "@/lib/store/progress";

/** Rehydrates local progress after mount, avoiding SSR/client mismatches. */
export function ProgressHydrator() {
  const hydrate = useProgress((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return null;
}
