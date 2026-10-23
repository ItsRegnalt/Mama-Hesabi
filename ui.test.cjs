const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
 const browser = await chromium.launch();
 try {
  for (const width of [1440,390,375]) {
   const context = await browser.newContext({viewport:{width,height:1000},colorScheme:'light'});
   const page = await context.newPage();
   await page.goto('http://localhost:4783');
   assert.equal(await page.locator('#cat1-name').inputValue(),'');
   await page.locator('#cat1-weight').fill('4000');
   await page.locator('#cat1-calories').fill('3500');
   assert.equal(await page.locator('#cat1 [data-result="grams"]').innerText(),'56,6');
   await page.locator('#cat1-automatic').selectOption('true');
   await page.locator('#cat1-portion').fill('5');
   assert.equal(await page.locator('#cat1 [data-result="portions"]').innerText(),'11,31');
   await page.locator('#language').selectOption('en');
   await page.locator('[data-theme-choice="dark"]').click();
   await page.reload();
   assert.equal(await page.locator('#language').inputValue(),'en');
   assert.equal(await page.locator('#cat1-weight').inputValue(),'4000');
   assert.equal(await page.locator('[data-theme-choice="dark"]').getAttribute('aria-pressed'),'true');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const fresh=await browser.newContext();
   const clean=await fresh.newPage(); await clean.goto('http://localhost:4783');
   assert.equal(await clean.locator('#cat1-weight').inputValue(),'');
   await fresh.close(); await context.close();
  }
  console.log('UI checks passed.');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
