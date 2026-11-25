import { chromium } from "playwright-core";
const url = process.argv[2];
const width = Number(process.argv[3] ?? 390);
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage({ viewport: { width, height: 900 } });
await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
const data = await page.evaluate(() => {
  const vw = window.innerWidth;
  const hasScrollAncestor = (el) => {
    let p = el.parentElement;
    while (p) {
      const s = getComputedStyle(p);
      if (/(auto|scroll|hidden)/.test(s.overflowX) && p.getBoundingClientRect().right <= vw + 1) return true;
      p = p.parentElement;
    }
    return false;
  };
  const offenders = [...document.querySelectorAll("body *")]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.right > vw + 1 && !hasScrollAncestor(el);
    })
    .slice(0, 15)
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute("class") ?? "").slice(0, 90),
        text: (el.textContent ?? "").trim().slice(0, 100),
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
        parent: el.parentElement ? `${el.parentElement.tagName.toLowerCase()}.${(el.parentElement.getAttribute("class") ?? "").slice(0, 60)}` : ""
      };
    });
  return { vw, scrollWidth: document.documentElement.scrollWidth, offenders };
});
await browser.close();
console.log(JSON.stringify(data, null, 2));
