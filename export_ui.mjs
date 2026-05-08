import puppeteer from 'puppeteer';
import fs from 'fs';

const PORT = 5173; // Vite default port
const BASE_URL = `http://localhost:${PORT}`;
const EXPORT_DIR = './ui_exports';

if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR);
}

const pagesToExport = [
  { path: '/', name: '01_Config' },
  { path: '/onboarding', name: '02_Onboarding' },
  { path: '/verify', name: '03_BiometricVerify' },
  { path: '/dashboard', name: '04_Dashboard' },
  { path: '/map', name: '05_Map' },
  { path: '/match', name: '06_MatchExperience' },
  { path: '/payment', name: '07_Payment' },
  { path: '/passport', name: '08_Passport' },
];

async function run() {
  console.log(`Starting export process to ${EXPORT_DIR}...`);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to mobile size (iPhone 13 Pro)
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  for (const route of pagesToExport) {
    console.log(`Exporting ${route.name}...`);
    try {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle0', timeout: 10000 });
      // Wait a little extra for animations (like framer motion) to settle
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: `${EXPORT_DIR}/${route.name}.jpg`, type: 'jpeg', quality: 90 });
    } catch (e) {
      console.error(`Failed to export ${route.name}: ${e.message}`);
    }
  }

  await browser.close();
  console.log('Export complete! Check the /ui_exports folder.');
}

run();
