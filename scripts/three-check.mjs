import { chromium } from "playwright-core";
const url = process.argv[2];
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
const failed = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
page.on("requestfailed", (r) => failed.push(`${r.url()} :: ${r.failure()?.errorText}`));
await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(2000);
const btn = page.getByRole("button", { name: /Open 3D bench/i }).first();
const visible = await btn.isVisible().catch(() => false);
if (visible) {
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
}
await page.waitForTimeout(7000);
const canvases = await page.locator("canvas").count();
const loading = await page.getByText(/Loading spatial bench/i).isVisible().catch(() => false);
const orbit = await page.getByText(/drag to orbit/i).isVisible().catch(() => false);
const tail = (await page.locator("body").innerText()).slice(-400);
await browser.close();
console.log(JSON.stringify({ visible, canvases, loading, orbit, errors: errors.slice(0, 6), failed: failed.slice(0, 6), tail }, null, 2));
