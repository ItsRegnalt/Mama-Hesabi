const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
 const browser = await chromium.launch(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {});
 try {
  for (const width of [1440, 768, 390, 375, 320]) {
   const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: 'light' });
   const page = await context.newPage();
   const errors = [];
   page.on('pageerror', error => errors.push(error.message));
   await page.goto('http://localhost:4783');
   assert.equal(await page.locator('[role=tab]').count(), 2);
   assert.equal(await page.locator('[role=tab][aria-selected=true]').innerText(), 'Kedi 1');
   assert.ok(await page.locator('#cat2').isHidden());
   assert.equal(await page.locator('[aria-invalid=true]').count(), 0);
   await page.locator('#cat1-weight').fill('3.280');
   assert.equal(await page.locator('#cat1-weight').getAttribute('aria-invalid'), 'true');
   assert.ok((await page.locator('#cat1-weight-error').innerText()).includes('tam gram'));
   assert.ok((await page.locator('#cat1-weight').getAttribute('aria-describedby')).includes('weight-error'));
   assert.equal(await page.locator('#cat1-calories').getAttribute('aria-invalid'), null);
   await page.locator('#cat1-weight').fill('4000');
   assert.equal(await page.locator('#cat1-weight-error').innerText(), '');
   await page.locator('#cat1-calories').fill('3500');
   assert.equal(await page.locator('#cat1 [data-result=grams]').innerText(), '56,6');
   await page.locator('#cat1-automatic').selectOption('true');
   assert.equal(await page.locator('#cat1 [data-result=grams]').innerText(), '56,6');
   assert.equal(await page.locator('#cat1 [data-result=portions]').innerText(), '—');
   assert.equal(await page.locator('[aria-invalid=true]').count(), 0);
   await page.locator('#cat1-portion').fill('0');
   assert.equal(await page.locator('#cat1-portion').getAttribute('aria-invalid'), 'true');
   assert.equal(await page.locator('#cat1 [data-result=grams]').innerText(), '56,6');
   await page.locator('#cat1-portion').fill('5');
   assert.equal(await page.locator('#cat1 [data-result=portions]').innerText(), '11,31');
   assert.ok((await page.locator('#cat1 [data-result=rounding]').innerText()).includes('−'));
   await page.locator('#cat1-factor').selectOption('0.8');
   assert.ok(await page.locator('#cat1-ideal').isVisible());
   assert.equal(await page.locator('[aria-invalid=true]').count(), 0);
   assert.equal(await page.locator('#cat1 [data-result=grams]').innerText(), '45,3');
   assert.ok((await page.locator('#cat1 .ideal-note').innerText()).includes('mevcut ağırlık'));
   await page.locator('#cat1-ideal').fill('3000');
   assert.equal(await page.locator('#cat1-ideal').getAttribute('aria-invalid'), null);
   await page.locator('#cat1-ideal').fill('');
   assert.equal(await page.locator('[aria-invalid=true]').count(), 0);
   await page.locator('#cat1-factor').selectOption('1');
   assert.ok(await page.locator('#cat1-ideal').isHidden());
   await page.locator('#cat1-name').fill('Örnek <kedi>');
   assert.equal(await page.locator('#tab-cat1').innerText(), 'Örnek <kedi>');
   await page.locator('#tab-cat2').click();
   assert.ok(await page.locator('#cat1').isHidden());
   await page.keyboard.press('ArrowLeft');
   assert.ok(await page.locator('#cat1').isVisible());
   assert.equal(await page.locator('#cat1-weight').inputValue(), '4000');
   for (let i = 3; i <= 8; i++) {
    await page.locator('#add-cat').click();
    assert.ok(await page.locator(`#cat${i}-name`).evaluate(el => el === document.activeElement));
    await page.locator(`#cat${i}-name`).fill(`Kedi ${i}`);
   }
   assert.equal(await page.locator('[role=tab]').count(), 8);
   assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
   await page.locator('#language').selectOption('en');
   assert.equal(await page.locator('#add-cat').innerText(), '+ Add cat');
   assert.equal(await page.getByRole('button', { name: 'Light', exact: true }).locator('svg').count(), 1);
   assert.equal(await page.getByRole('button', { name: 'Dark', exact: true }).locator('svg').count(), 1);
   for (const selector of ['.language-control', '[data-theme-choice=light]', '[data-theme-choice=dark]']) {
    const box = await page.locator(selector).boundingBox();
    assert.ok(box.width >= 44 && box.height >= 44);
   }
   const toolbar = await page.locator('.toolbar').boundingBox();
   const dark = await page.locator('[data-theme-choice=dark]').boundingBox();
   assert.ok(Math.abs(toolbar.x + toolbar.width - dark.x - dark.width) < 1);
   await page.locator('#tab-cat1').click();
   await page.locator('#cat1 summary').click();
   assert.ok((await page.locator('#cat1 .calculation-help').innerText()).includes('For cats only'));
   await page.locator('[data-theme-choice=dark]').click();
   assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
   await page.reload();
   assert.equal(await page.locator('[role=tab]').count(), 8);
   assert.equal(await page.locator('#language').inputValue(), 'en');
   assert.equal(await page.locator('#cat1-weight').inputValue(), '4000');
   assert.equal(await page.locator('#cat1-name').inputValue(), 'Örnek <kedi>');
   assert.equal(await page.locator('[data-theme-choice=dark]').getAttribute('aria-pressed'), 'true');
   assert.equal(await page.locator('#cat1 [data-result=grams]').innerText(), '56.6');
   assert.equal(await page.locator('#cat8-name').inputValue(), 'Kedi 8');
   assert.deepEqual(errors, []);
   await context.close();
  }
  const fresh = await browser.newContext();
  const clean = await fresh.newPage(); await clean.goto('http://localhost:4783');
  assert.equal(await clean.locator('#cat1-weight').inputValue(), '');
  assert.equal(await clean.locator('[role=tab]').count(), 2);
  // Existing two-cat storage is preserved when migrating to unlimited cats.
  await clean.evaluate(() => localStorage.setItem('mama-payi-v3', JSON.stringify({ cats: [{id:'cat1',weight:'3280',name:'Test',factor:'1',calories:'3352',automatic:false}, {id:'cat2',weight:'5000'}] })));
  await clean.reload();
  assert.equal(await clean.locator('#cat1-weight').inputValue(), '3280');
  assert.equal(await clean.locator('#cat2-weight').inputValue(), '5000');
  // Cancel preserves data; deleting a middle cat and adding another keeps IDs unique.
  await clean.locator('#add-cat').click();
  await clean.locator('#cat3-name').fill('Third');
  await clean.locator('#tab-cat2').click();
  clean.once('dialog', dialog => dialog.dismiss());
  await clean.locator('#cat2 .delete-cat').click();
  assert.equal(await clean.locator('[role=tab]').count(), 3);
  clean.once('dialog', dialog => dialog.accept());
  await clean.locator('#cat2 .delete-cat').click();
  assert.equal(await clean.locator('[role=tab]').count(), 2);
  assert.ok(await clean.locator('#tab-cat3').evaluate(el => el === document.activeElement));
  await clean.locator('#add-cat').click();
  assert.equal(await clean.locator('#cat4-name').inputValue(), '');
  assert.equal(await clean.locator('#cat3-name').inputValue(), 'Third');
  assert.equal(await clean.locator('[id=cat3]').count(), 1);
  await clean.reload();
  assert.equal(await clean.locator('[role=tab]').count(), 3);
  assert.equal(await clean.locator('#cat2-name').inputValue(), 'Third');
  assert.equal(await clean.locator('#cat1-weight').inputValue(), '3280');
  await clean.locator('#language').selectOption('en');
  assert.equal(await clean.locator('#cat1 .delete-cat').innerText(), 'Delete cat');
  clean.on('dialog', dialog => dialog.accept());
  while (await clean.locator('[role=tab]').count()) {
   await clean.locator('.cat:not([hidden]) .delete-cat').click();
  }
  assert.ok(await clean.locator('#add-cat').evaluate(el => el === document.activeElement));
  await clean.reload();
  assert.equal(await clean.locator('[role=tab]').count(), 0);
  await clean.locator('#add-cat').click();
  assert.equal(await clean.locator('[role=tab]').count(), 1);
  assert.equal(await clean.locator('.cat input[name=name]').inputValue(), '');
  await fresh.close();
  console.log('UI checks passed: responsive icon controls, cat deletion/cancellation, unique IDs, empty-state persistence, calculation and validation.');
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
