import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * GitHub Pages post-build step.
 * - `.nojekyll` prevents Jekyll from dropping the `_next` asset directory.
 * - A `404.html` is produced by Next's not-found page; verify it exists.
 */
const out = join(process.cwd(), "out");
if (!existsSync(out)) {
  console.error("postbuild: out/ is missing. Did next build run with output: export?");
  process.exit(1);
}
writeFileSync(join(out, ".nojekyll"), "");
if (!existsSync(join(out, "404.html"))) {
  console.warn("postbuild: warning — 404.html was not generated.");
}
console.log("postbuild: wrote out/.nojekyll");
