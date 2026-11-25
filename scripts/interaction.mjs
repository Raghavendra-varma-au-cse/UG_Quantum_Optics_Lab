import { chromium } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:3012";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(String(e)));

const results = {};

// Quiz: finish, results, answer review, study mode
await page.goto(`${base}/experiments/michelson-interferometer/master/`, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(800);
await page.getByRole("button", { name: /Finish/i }).first().click();
await page.waitForTimeout(600);
results.resultsHeading = await page.getByText(/results/i).first().isVisible().catch(() => false);
results.answerReview = await page.getByText("Answer review").isVisible().catch(() => false);
results.modelAnswer = await page.getByText(/Model answer|Correct answer/i).first().isVisible().catch(() => false);
const study = page.getByRole("button", { name: /Study all answers/i }).first();
if (await study.isVisible().catch(() => false)) {
  await study.click();
  await page.waitForTimeout(500);
  results.studyMode = await page.getByText(/study mode/i).first().isVisible().catch(() => false);
}

// Fourier worker + simulation
await page.goto(`${base}/experiments/fourier-optics/experiment/`, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(2500);
results.fourierWorker = await page.getByText(/Web Worker/i).first().isVisible().catch(() => false);
results.fourierCanvases = await page.locator("canvas").count();

// 3D bench
await page.goto(`${base}/experiments/michelson-interferometer/experiment/`, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(1500);
const open3d = page.getByRole("button", { name: /Open 3D bench/i }).first();
if (await open3d.isVisible().catch(() => false)) {
  await open3d.click();
  await page.waitForTimeout(2500);
  results.threeCanvas = await page.locator("canvas").count();
  results.threeText = await page.getByText(/drag to orbit/i).isVisible().catch(() => false);
}

// QKD run
await page.goto(`${base}/experiments/quantum-key-distribution/experiment/`, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(1200);
const run = page.getByRole("button", { name: /Run protocol/i }).first();
if (await run.isVisible().catch(() => false)) {
  await run.click();
  await page.waitForTimeout(1500);
  results.qkdFinalKey = await page.getByText(/FINAL KEY/i).first().isVisible().catch(() => false);
}

// Practical data entry
await page.goto(`${base}/experiments/michelson-interferometer/practical/`, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(800);
results.practical = await page.getByText(/Your measurements/i).first().isVisible().catch(() => false);

console.log(JSON.stringify({ results, errors: [...new Set(errors)].filter((e) => !/404|favicon/i.test(e)).slice(0, 10) }, null, 2));
await browser.close();
