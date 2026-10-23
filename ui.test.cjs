const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
 const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge' });
 try {
  for (const width of [1440, 768, 390, 375, 320]) {
   const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
   const page = await context.newPage();
   const errors = []; page.on('pageerror', error => errors.push(error.message));
   await page.goto('http://localhost:4783');
   assert.equal(await page.getByRole('tab').count(), 1);
   assert.equal(await page.locator('#tab-cat1 svg').count(), 1);
   assert.equal(await page.locator('#tab-cat1').innerText(), '');
   assert.equal(await page.locator('input[name=food]').count(), 0);
   const controls = await page.locator('.toolbar').boundingBox();
   const navigation = await page.locator('.cat-navigation').boundingBox();
   assert.ok(navigation.y - (controls.y + controls.height) >= 30);
   assert.ok(Math.abs(navigation.x + navigation.width / 2 - width / 2) <= 1);
   const originalTheme = await page.locator('html').getAttribute('data-theme');
   await page.locator('#theme-toggle').click();
   assert.notEqual(await page.locator('html').getAttribute('data-theme'), originalTheme);
   await page.locator('#theme-toggle').click();
   assert.equal(await page.locator('html').getAttribute('data-theme'), originalTheme);
   assert.equal(await page.locator('[aria-invalid=true]').count(), 0);
   await page.locator('#cat1-weight').fill('3.280');
   assert.equal(await page.locator('#cat1-weight').getAttribute('aria-invalid'), 'true');
   await page.locator('#cat1-weight').fill('4000');
   await page.locator('#cat1-calories').fill('3500');
   assert.equal(await page.locator('#cat1 [data-result=grams]').innerText(), '56,6');
   await page.locator('#cat1-automatic').selectOption('true');
   assert.equal(await page.locator('#cat1 [data-result=grams]').innerText(), '56,6');
   await page.locator('#cat1-portion').fill('0');
   assert.equal(await page.locator('#cat1-portion').getAttribute('aria-invalid'), 'true');
   await page.locator('#cat1-portion').fill('5');
   assert.equal(await page.locator('#cat1 [data-result=portions]').innerText(), '11,31');
   await page.locator('#cat1-factor').selectOption('0.8');
   assert.ok(await page.locator('#cat1-ideal').isVisible());
   assert.equal(await page.locator('[aria-invalid=true]').count(), 0);
   const targetSummary = page.locator('#cat1 .ideal-field summary');
   await targetSummary.click();
   assert.equal(await page.locator('#cat1-ideal-hint').innerText(), 'Boşsa mevcut ağırlık.');
   await page.keyboard.press('Escape');
   assert.ok(await page.locator('#cat1-ideal-hint').isHidden());
   await page.locator('#cat1-ideal').fill('3000');
   await page.locator('#cat1-ideal').fill('');
   assert.equal(await page.locator('[aria-invalid=true]').count(), 0);
   await page.locator('#cat1-factor').selectOption('1');
   await page.locator('#cat1-name').fill('Örnek <kedi>');
   assert.equal(await page.locator('#tab-cat1').getAttribute('aria-label'), 'Örnek <kedi>');
   assert.equal(await page.locator('#tab-cat1 svg').count(), 1);
   for (let i = 2; i <= 8; i++) {
    await page.locator('#add-cat').click();
    await page.locator(`#cat${i}-name`).fill(`Test ${i}`);
    assert.ok(await page.locator(`#tab-cat${i}`).evaluate(el => { const tab = el.getBoundingClientRect(), strip = el.parentElement.getBoundingClientRect(); return tab.left >= strip.left && tab.right <= strip.right + 1; }));
   }
   assert.equal(await page.getByRole('tab').count(), 8);
   assert.equal(await page.locator('#tab-cat2').innerText(), '2');
   assert.equal(new Set(await page.getByRole('tab').evaluateAll(tabs => tabs.slice(0, 6).map(tab => tab.dataset.color))).size, 6);
   for (const theme of ['light', 'dark']) {
    if (await page.locator('html').getAttribute('data-theme') !== theme) await page.locator('#theme-toggle').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
    for (let i = 1; i <= 8; i++) {
     const tabColor = await page.locator(`#tab-cat${i}`).evaluate(el => getComputedStyle(el).color);
     const resultColor = await page.locator(`#cat${i} .result`).evaluate(el => getComputedStyle(el).color);
     assert.equal(tabColor, resultColor);
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
   }
   await page.locator('#language').selectOption('en');
   assert.equal(await page.locator('#add-cat').getAttribute('aria-label'), 'Add cat');
   assert.equal(await page.locator('#theme-toggle svg:not([hidden])').count(), 1);
   await page.locator('#tab-cat1').click();
   const rerInfo = page.locator('#cat1 .field-info').filter({ has: page.locator('summary[aria-label="RER multiplier — Information"]') });
   await rerInfo.locator('summary').click();
   assert.ok((await rerInfo.innerText()).includes('For cats only'));
   await page.locator('#cat1-weight').click();
   assert.equal(await rerInfo.getAttribute('open'), null);
   const colors = await page.getByRole('tab').evaluateAll(tabs => tabs.map(tab => tab.dataset.color));
   await page.reload();
   assert.equal(await page.getByRole('tab').count(), 8);
   assert.equal(await page.locator('#cat1-weight').inputValue(), '4000');
   assert.equal(await page.locator('#cat1 [data-result=grams]').innerText(), '56.6');
   assert.deepEqual(await page.getByRole('tab').evaluateAll(tabs => tabs.map(tab => tab.dataset.color)), colors);
   assert.ok((await page.locator('#copyright').innerText()).includes(String(new Date().getFullYear())));
   for (const selector of ['#add-cat', '.language-control', '#theme-toggle', '#cat1 summary']) {
    const box = await page.locator(selector).first().boundingBox();
    assert.ok(box.width >= 44 && box.height >= 44);
   }
   assert.deepEqual(errors, []);
   await context.close();
  }
  const context = await browser.newContext(); const page = await context.newPage();
  await page.goto('http://localhost:4783');
  // Preserve existing saved cats, even if their earlier records have no color.
  await page.evaluate(() => localStorage.setItem('mama-payi-v3', JSON.stringify({ cats: [{weight:'3280',name:'Test',factor:'1',calories:'3352'}, {weight:'5000'}] })));
  await page.reload();
  assert.equal(await page.getByRole('tab').count(), 2);
  assert.equal(await page.locator('#cat1-weight').inputValue(), '3280');
  await page.locator('#add-cat').click(); await page.locator('#cat3-name').fill('Third');
  await page.locator('#tab-cat2').click();
  await page.locator('#cat2 .delete-cat').click();
  assert.ok(await page.locator('#delete-dialog').isVisible());
  await page.locator('#delete-no').click();
  assert.equal(await page.getByRole('tab').count(), 3);
  await page.locator('#cat2 .delete-cat').click(); await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('tab').count(), 3);
  await page.locator('#cat2 .delete-cat').click(); await page.locator('#delete-yes').click();
  await page.waitForFunction(() => document.getElementById('action-status').textContent === 'Kedi profili kaldırıldı.');
  const thirdColor = await page.locator('#cat3').getAttribute('data-color');
  await page.locator('#add-cat').click();
  assert.equal(await page.locator('#cat3-name').inputValue(), 'Third');
  assert.equal(await page.locator('#cat4-name').inputValue(), '');
  await page.reload();
  assert.equal(await page.locator('#cat2').getAttribute('data-color'), thirdColor);
  while (await page.getByRole('tab').count()) {
   const before = await page.getByRole('tab').count();
   await page.locator('.cat:not([hidden]) .delete-cat').click(); await page.locator('#delete-yes').click();
   await page.waitForFunction(count => document.querySelectorAll('[role=tab]').length === count - 1, before);
  }
  await page.reload(); assert.equal(await page.getByRole('tab').count(), 0);
  await page.locator('#add-cat').click(); assert.equal(await page.getByRole('tab').count(), 1);
  await context.close();
  console.log('UI checks passed: five widths, icon navigation, six matching colors in both themes, info popovers, storage, deletion and calculations.');
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
