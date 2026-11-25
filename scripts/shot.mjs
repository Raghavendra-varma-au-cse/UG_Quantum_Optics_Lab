import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:3011/";
const width = Number(process.argv[3] ?? 390);
const height = Number(process.argv[4] ?? 900);
const prefix = process.argv[5] ?? "C:/Users/varma/AppData/Local/Temp/qol";
const positions = (process.argv[6] ?? "0,900,1800").split(",").map(Number);

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true
});
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(1200);
const dims = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
  scrollHeight: document.documentElement.scrollHeight,
  h1: document.querySelector("h1")?.textContent?.trim()
}));
for (const y of positions) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${prefix}-${width}-${y}.png`, fullPage: false });
}
console.log(JSON.stringify({ url, width, dims, errors: errors.slice(0, 8) }, null, 2));
await browser.close();
