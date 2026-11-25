import { chromium } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:3011";
const slugs = [
  "michelson-interferometer",
  "mach-zehnder-interferometer",
  "quantum-bomb-tester",
  "quantum-eraser",
  "polarization-3d-cinema",
  "fourier-optics",
  "quantum-key-distribution",
  "optical-tweezers"
];
const urls = [
  "/",
  "/experiments",
  "/components",
  "/components/mir-plane",
  "/hardware",
  "/instruments",
  "/mathematics",
  "/quantum-mechanics",
  "/alignment",
  "/practical",
  "/analysis",
  "/notebook",
  "/exam",
  "/progress",
  "/validation",
  ...slugs.flatMap((s) => [
    `/experiments/${s}`,
    `/experiments/${s}?mode=experiment`,
    `/experiments/${s}?mode=master`,
    `/experiments/${s}?mode=practical`
  ])
];

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const results = [];

for (const path of urls) {
  const errors = [];
  const onConsole = (m) => {
    if (m.type() === "error") errors.push(m.text());
  };
  const onPageError = (e) => errors.push(`pageerror: ${e}`);
  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  let status = 0;
  let title = "";
  let h1 = "";
  let body = "";
  try {
    const res = await page.goto(base + path, { waitUntil: "domcontentloaded", timeout: 90000 });
    status = res?.status() ?? 0;
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(1800);
    title = await page.title();
    h1 = (await page.locator("h1").first().textContent().catch(() => ""))?.trim() ?? "";
    body = (await page.locator("body").innerText().catch(() => "")).slice(0, 2000);
  } catch (e) {
    errors.push(`navigation: ${String(e)}`);
  }
  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  const errorPage = /Application error|could not finish rendering|Internal Server Error/i.test(body);
  results.push({
    path,
    status,
    h1,
    title,
    errors: [...new Set(errors)].filter((e) => !/favicon|404 \(Not Found\)|Failed to load resource/i.test(e)).slice(0, 5),
    errorPage
  });
}

await browser.close();
const failed = results.filter((r) => r.status >= 400 || r.errorPage || r.errors.length > 0);
console.log(JSON.stringify({ total: results.length, failed: failed.length, failures: failed, ok: results.filter((r) => !failed.includes(r)) }, null, 2));
