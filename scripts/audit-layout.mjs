import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:3011/";
const width = Number(process.argv[3] ?? 390);
const out = process.argv[4] ?? "C:/Users/varma/AppData/Local/Temp/qol-shot.png";
const full = process.argv[5] !== "viewport";

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true
});
const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
const metrics = await page.evaluate(() => {
  const vw = window.innerWidth;
  const doc = document.documentElement;
  const offenders = [...document.querySelectorAll("body *")]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.right > vw + 1;
    })
    .slice(0, 20)
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute("class") ?? "").slice(0, 120),
        text: (el.textContent ?? "").trim().slice(0, 60),
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width)
      };
    });
  return {
    innerWidth: vw,
    scrollWidth: doc.scrollWidth,
    clientWidth: doc.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    offenders
  };
});
console.log(JSON.stringify({ url, width, metrics, errors: errors.slice(0, 10) }, null, 2));
await page.screenshot({ path: out, fullPage: full });
await browser.close();
