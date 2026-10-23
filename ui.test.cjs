const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
 const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge' });
 try {
  for (const width of [1440, 768, 390, 375, 320]) {
   const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce', colorScheme: 'dark' });
   const page = await context.newPage();
   const errors = []; page.on('pageerror', error => errors.push(error.message));
   await page.goto('http://localhost:4783');
   assert.equal(await page.locator('html').getAttribute('data-theme'), 'light', 'First visit opens light even on a dark device');
   assert.equal(await page.getByRole('tab').count(), 1);
   assert.equal(await page.locator('#tab-cat1 .cat-portrait').count(), 1);
   assert.equal(await page.locator('#tab-cat1').innerText(), '');
   assert.equal(await page.locator('input[name=food]').count(), 0);
   assert.equal(await page.locator('#cat1-factor').inputValue(), '1');
   assert.ok(await page.locator('#remove-cat').isHidden());
   assert.equal(await page.locator('label[for=cat1-weight]').innerText(), 'Mevcut ağırlık (g)');
   assert.equal(await page.locator('#cat1-weight').getAttribute('aria-describedby'), null);
   assert.equal(await page.locator('#save-status').innerText(), 'Girdiğiniz bilgiler cihazınızda saklanır.');
   const controls = await page.locator('.toolbar').boundingBox();
   const navigation = await page.locator('.cat-navigation').boundingBox();
   assert.ok(navigation.y - (controls.y + controls.height) >= 30);
   assert.ok(Math.abs(navigation.x + navigation.width / 2 - width / 2) <= 1);
   const originalTheme = await page.locator('html').getAttribute('data-theme');
   await page.locator('#theme-toggle').click();
   assert.notEqual(await page.locator('html').getAttribute('data-theme'), originalTheme);
   await page.reload();
   assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark', 'Explicit dark theme survives reload');
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
   const feederLabel = await page.locator('label[for=cat1-portion]').boundingBox();
   const portionLabel = await page.locator('#cat1 .portion-label').boundingBox();
   assert.ok(Math.abs(feederLabel.y - portionLabel.y) <= 1);
   const portionInput = await page.locator('#cat1-portion').boundingBox();
   const portionValue = await page.locator('#cat1 .portion-value').boundingBox();
   assert.ok(Math.abs(portionInput.y - portionValue.y) <= 1);
   assert.equal(await page.locator('#cat1 [data-result=portions]').innerText(), '11,31');
   await page.locator('#cat1-factor').selectOption('0.8');
   assert.ok(await page.locator('#cat1-ideal').isVisible());
   assert.equal(await page.locator('[aria-invalid=true]').count(), 0);
   assert.equal(await page.locator('#cat1 .ideal-field summary').count(), 0);
   assert.equal(await page.locator('#cat1-weight').inputValue(), '4000');
   await page.locator('#cat1-ideal').fill('3000');
   assert.equal(await page.locator('#cat1 [data-result=weight-reference]').innerText(), 'Hesaplamada hedef ağırlık kullanılır.');
   assert.ok((await page.locator('#cat1 [data-result=reference]').textContent()).includes('3.000 g'));
   await page.locator('#cat1-ideal').fill('');
   assert.equal(await page.locator('#cat1 [data-result=weight-reference]').innerText(), 'Boş bırakırsan mevcut ağırlık kullanılır.');
   assert.equal(await page.locator('[aria-invalid=true]').count(), 0);
   await page.locator('#cat1-factor').selectOption('1');
   await page.locator('#cat1-name').fill('Örnek <kedi>');
   assert.equal(await page.locator('#cat1-name').getAttribute('enterkeyhint'), 'done');
   await page.locator('#cat1-name').press('Enter');
   assert.equal(await page.locator('#cat1-name').evaluate(el => document.activeElement === el), false);
   assert.equal(await page.locator('#cat1-name').inputValue(), 'Örnek <kedi>');
   assert.equal(await page.locator('#tab-cat1').getAttribute('aria-label'), 'Örnek <kedi>');
   assert.equal(await page.locator('#tab-cat1 .cat-portrait').count(), 1);
   assert.equal(await page.locator('#tab-cat1 + .profile-name').innerText(), 'Örnek <kedi>');
   assert.equal(await page.locator('#tab-cat1 + .profile-name kedi').count(), 0);
   await page.locator('#tab-cat1').click();
   assert.equal(await page.locator('#appearance-options button').count(), 12);
   await page.locator('[data-appearance=black]').click();
   assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('mama-payi-v3')).cats[0].appearance), 'black');
   assert.equal(await page.locator('#tab-cat1 .cat-portrait').getAttribute('viewBox'), '926 474 320 320');
   await page.reload();
   assert.equal(await page.locator('#tab-cat1 .cat-portrait').getAttribute('viewBox'), '926 474 320 320');
   await page.locator('#tab-cat1').click();
   await page.locator('[data-appearance=tabby]').click();
   for (let i = 2; i <= 8; i++) {
    await page.locator('#add-cat').press('Enter');
    await page.locator(`#cat${i}-name`).fill(`Test ${i}`);
    assert.ok(await page.locator(`#tab-cat${i}`).evaluate(el => { const tab = el.getBoundingClientRect(), strip = el.parentElement.getBoundingClientRect(); return tab.left >= strip.left && tab.right <= strip.right + 1; }));
   }
   assert.equal(await page.getByRole('tab').count(), 8);
   assert.equal(await page.locator('#tab-cat2').innerText(), '');
   assert.equal(new Set(await page.locator('#cat-tabs .cat-portrait').evaluateAll(paths => paths.slice(0, 6).map(path => path.getAttribute('viewBox')))).size, 6);
   assert.equal(new Set(await page.getByRole('tab').evaluateAll(tabs => tabs.slice(0, 6).map(tab => tab.dataset.color))).size, 6);
   for (const theme of ['light', 'dark']) {
    if (await page.locator('html').getAttribute('data-theme') !== theme) await page.locator('#theme-toggle').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
    for (let i = 1; i <= 8; i++) {
     const tabColor = await page.locator(`#tab-cat${i}`).evaluate(el => getComputedStyle(el).color);
     const resultColor = await page.locator(`#cat${i} .result`).evaluate(el => getComputedStyle(el).color);
     assert.equal(tabColor, resultColor);
     const icon = page.locator(`#tab-cat${i} .cat-portrait`);
     assert.equal(await icon.locator('image').getAttribute('href'), 'cat-portraits.png?v=3');
     assert.equal(await icon.locator('image').evaluate(el => el.getAttribute('clip-path')), null);
     assert.equal(await icon.locator('clipPath path').count(), 0);
     assert.equal(await icon.evaluate(el => getComputedStyle(el).color), ['rgb(49, 93, 139)', 'rgb(57, 102, 71)', 'rgb(139, 69, 93)', 'rgb(121, 91, 45)', 'rgb(102, 81, 138)', 'rgb(48, 104, 101)'][(i - 1) % 6]);
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
   }
   await page.locator('#language').selectOption('en');
   assert.equal(await page.locator('#add-cat').getAttribute('aria-label'), 'Add cat');
   await page.locator('#tab-cat8').click();
   assert.equal(await page.locator('#appearance-title').innerText(), 'Cat appearance');
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('#theme-toggle svg:not([hidden])').count(), 1);
   await page.locator('#tab-cat1').click();
   const rerInfo = page.locator('#cat1 .field-info').filter({ has: page.locator('summary[aria-label="RER multiplier — Information"]') });
   await rerInfo.locator('summary').click();
   assert.ok((await rerInfo.innerText()).includes('Choose a multiplier for your cat’s age and condition.'));
   assert.ok((await rerInfo.innerText()).includes('0.8× and 1.8× use target weight'));
   assert.ok((await rerInfo.innerText()).includes('starting estimate'));
   assert.equal(await page.locator('#cat1 .result-label').innerText(), 'Estimated daily food amount');
   await page.locator('#cat1-weight').click();
   assert.equal(await rerInfo.getAttribute('open'), null);
   const foodInfo = page.locator('#cat1 .field-info').filter({ has: page.locator('summary[aria-label="Food energy — Information"]') });
   await foodInfo.locator('summary').click();
   assert.ok((await foodInfo.innerText()).includes('350 kcal/100 g, enter 3500'));
   assert.ok((await foodInfo.innerText()).includes('metabolizable energy'));
   await foodInfo.locator('summary').click();
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
  await page.evaluate(() => localStorage.setItem('mama-payi-v3', JSON.stringify({ cats: [{weight:'3280',name:'Test',factor:'1',calories:'3352'}, {weight:'5000',appearance:'invalid'}] })));
  await page.reload();
  assert.equal(await page.getByRole('tab').count(), 2);
  assert.equal(await page.locator('.cat-number').count(), 0);

  assert.equal(await page.locator('#cat1-weight').inputValue(), '3280');
  assert.equal(await page.locator('#tab-cat2 .cat-portrait').getAttribute('viewBox'), '315 146 320 320');
  await page.locator('#add-cat').press('Enter'); await page.locator('#cat3-name').fill('Third');
  await page.locator('#tab-cat2').click();
  await page.locator('#tab-cat2').focus(); await page.keyboard.press('Delete');
  assert.ok(await page.locator('#delete-dialog').isVisible());
  await page.locator('#delete-no').click();
  assert.equal(await page.getByRole('tab').count(), 3);
  await page.locator('#tab-cat2').focus(); await page.keyboard.press('Delete'); await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('tab').count(), 3);
  await page.locator('#tab-cat2').focus(); await page.keyboard.press('Delete'); await page.locator('#delete-yes').click();
  assert.ok(await page.locator('#delete-dialog').isVisible());
  await page.waitForFunction(() => document.getElementById('delete-success-message').textContent === 'Kedi profili kaldırıldı.');
  assert.equal(await page.locator('#delete-success-message').innerText(), 'Kedi profili kaldırıldı.');
  assert.equal(await page.locator('#action-status').count(), 0);
  assert.ok(await page.locator('#delete-confirm').isHidden());
  await page.locator('#delete-dialog').waitFor({ state: 'hidden' });
  const thirdColor = await page.locator('#cat3').getAttribute('data-color');
  await page.locator('#add-cat').press('Enter');
  assert.equal(await page.locator('#cat3-name').inputValue(), 'Third');
  assert.equal(await page.locator('#cat4-name').inputValue(), '');
  await page.reload();
  assert.equal(await page.locator('#cat2').getAttribute('data-color'), thirdColor);
  while (await page.getByRole('tab').count() > 1) {
   const before = await page.getByRole('tab').count();
   if (await page.getByRole('tab').last().getAttribute('aria-selected') !== 'true') await page.getByRole('tab').last().click();
   await page.locator('#remove-cat').click(); await page.locator('#delete-yes').click();
   await page.waitForFunction(count => document.querySelectorAll('[role=tab]').length === count - 1, before);
   await page.locator('#delete-done').click();
   await page.locator('#delete-dialog').waitFor({ state: 'hidden' });
  }
  await page.reload(); assert.equal(await page.getByRole('tab').count(), 1);
  await page.locator('#tab-cat1').focus(); await page.keyboard.press('Delete');
  assert.ok(await page.locator('#delete-dialog').isHidden());
  assert.ok(await page.locator('#remove-cat').isHidden());
  await page.locator('#add-cat').press('Enter'); assert.equal(await page.getByRole('tab').count(), 2);
  await context.close();
  const touchContext = await browser.newContext({ viewport: { width: 390, height: 1000 }, hasTouch: true });
  const touchPage = await touchContext.newPage();
  const motionErrors = []; touchPage.on('pageerror', error => motionErrors.push(error.message));
  await touchPage.goto('http://localhost:4783');
  const add = touchPage.locator('#add-cat');
  const first = touchPage.locator('#tab-cat1');
  const firstPoint = await first.boundingBox();
  const addPoint = await add.boundingBox();
  assert.ok(firstPoint.width > addPoint.width);
  assert.equal(firstPoint.width, firstPoint.height);
  assert.equal(await first.evaluate(el => getComputedStyle(el).borderRadius), '50%');
  await touchPage.mouse.move(firstPoint.x + 20, firstPoint.y + 20);
  await touchPage.mouse.down(); await touchPage.waitForTimeout(600);
  assert.equal(await first.evaluate(el => el.classList.contains('holding')), false);
  await touchPage.mouse.up();
  if (await touchPage.locator('#appearance-dialog').isVisible()) await touchPage.locator('#appearance-close').click();
  assert.ok(await touchPage.locator('#delete-dialog').isHidden());
  await add.click();
  assert.equal(await touchPage.getByRole('tab').count(), 2);
  assert.equal(await touchPage.locator('#cat2').evaluate(el => getComputedStyle(el).animationName), 'none');
  // Holding an inactive profile only switches to it on release, without removal feedback.
  await touchPage.waitForTimeout(350);
  await first.click();
  await touchPage.waitForTimeout(350);
  const currentFirstPoint = await first.boundingBox();
  await touchPage.mouse.move(currentFirstPoint.x + 20, currentFirstPoint.y + 20);
  await touchPage.mouse.down(); await touchPage.waitForTimeout(600);
  assert.equal(await first.evaluate(el => el.classList.contains('holding')), false);
  await touchPage.mouse.up();
  if (await touchPage.locator('#appearance-dialog').isVisible()) await touchPage.locator('#appearance-close').click();
  const tab = touchPage.locator('#tab-cat2');
  await tab.focus(); await touchPage.keyboard.press('Delete');
  assert.ok(await touchPage.locator('#delete-dialog').isHidden());
  const point = await tab.boundingBox();
  await touchPage.mouse.move(point.x + 20, point.y + 20);
  await touchPage.mouse.down(); await touchPage.waitForTimeout(600);
  assert.equal(await tab.evaluate(el => el.classList.contains('holding')), false);
  await touchPage.mouse.up();
  if (await touchPage.locator('#appearance-dialog').isVisible()) await touchPage.locator('#appearance-close').click();
  assert.equal(await tab.getAttribute('aria-selected'), 'true');
  assert.ok(await touchPage.locator('#delete-dialog').isHidden());
  // Selected profiles also stay safe during a long press; removal is explicit below the form.
  await touchPage.mouse.down(); await touchPage.waitForTimeout(700);
  assert.ok(await touchPage.locator('#delete-dialog').isHidden());
  assert.equal(await touchPage.locator('.hold-ring').count(), 0);
  await touchPage.mouse.up();
  if (await touchPage.locator('#appearance-dialog').isVisible()) await touchPage.locator('#appearance-close').click();
  await touchPage.locator('#remove-cat').click();
  await touchPage.locator('#delete-yes').click();
  assert.equal(await touchPage.getByRole('tab').count(), 1);
  await touchPage.locator('#delete-dialog').waitFor({ state: 'hidden' });
  await first.focus(); await touchPage.keyboard.press('Shift+F10');
  assert.ok(await touchPage.locator('#delete-dialog').isHidden());
  await touchPage.evaluate(() => {
    const start = document.startViewTransition.bind(document);
    window.themeCaptures = [];
    window.themeAnimations = [];
    const animate = document.documentElement.animate.bind(document.documentElement);
    document.documentElement.animate = (frames, options) => { window.themeAnimations.push({frames, options}); return animate(frames, options); };
    document.startViewTransition = update => start(async () => {
      const browserColor = document.querySelector('meta[name="theme-color"]').content;
      await update();
      const field = document.querySelector('#cat1-factor');
      window.themeCaptures.push({
        theme: document.documentElement.dataset.theme,
        ink: getComputedStyle(field).color,
        fill: getComputedStyle(field).webkitTextFillColor,
        paper: getComputedStyle(field).backgroundColor,
        transition: getComputedStyle(field.parentElement).transitionDuration,
        browserColor,
        capturedBrowserColor: document.querySelector('meta[name="theme-color"]').content
      });
    });
  });
  await touchPage.locator('#theme-toggle').click();
  await touchPage.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  await touchPage.waitForFunction(() => !document.getElementById('theme-toggle').disabled);
  await touchPage.locator('#theme-toggle').click();
  await touchPage.waitForFunction(() => document.documentElement.dataset.theme === 'light');
  await touchPage.waitForFunction(() => !document.getElementById('theme-toggle').disabled);
  const captures = await touchPage.evaluate(() => window.themeCaptures);
  assert.equal(captures.length, 2);
  const animations = await touchPage.evaluate(() => window.themeAnimations);
  assert.equal(animations.length, 2);
  for (const animation of animations) { assert.deepEqual(animation.frames, { opacity: [0, 1] }); assert.equal(animation.options.duration, 280); }
  for (const capture of captures) {
    assert.equal(capture.ink, capture.theme === 'dark' ? 'rgb(237, 237, 237)' : 'rgb(33, 33, 33)');
    assert.equal(capture.fill, capture.ink);
    assert.equal(capture.paper, capture.theme === 'dark' ? 'rgb(30, 30, 30)' : 'rgb(250, 250, 250)');
    assert.equal(capture.transition, '0s');
    assert.equal(capture.browserColor, capture.capturedBrowserColor);
  }
  assert.equal(await touchPage.locator('html').evaluate(el => el.classList.contains('theme-transition')), false);
  assert.equal(await touchPage.locator('meta[name="theme-color"]').getAttribute('content'), '#f2f3f7');
  await touchPage.locator('#cat1-automatic').selectOption('true');
  await touchPage.locator('#cat1-automatic').selectOption('false');
  await touchPage.locator('#cat1-automatic').selectOption('true');
  await touchPage.waitForTimeout(350);
  assert.ok(await touchPage.locator('.portion-box').isVisible());
  await touchPage.evaluate(() => { document.startViewTransition = undefined; });
  await touchPage.locator('#theme-toggle').click();
  assert.equal(await touchPage.locator('html').getAttribute('data-theme'), 'dark');
  assert.deepEqual(motionErrors, []);
  await touchContext.close();
  // First/last tabs must center too, with no vertical jump or focus scroll override.
  const railContext = await browser.newContext({ viewport: { width: 390, height: 1000 } });
  const railPage = await railContext.newPage();
  await railPage.goto('http://localhost:4783');
  const entry = await railPage.evaluate(() => {
    document.getElementById('add-cat').click();
    return document.getElementById('cat2').getAnimations().map(animation => animation.effect.getTiming().duration);
  });
  assert.deepEqual(entry, [220]);
  for (let index = 0; index < 6; index++) await railPage.locator('#add-cat').click();
  for (const id of ['cat1', 'cat8', 'cat4', 'cat2']) {
    await railPage.evaluate(id => document.getElementById(`tab-${id}`).click(), id);
    await railPage.waitForTimeout(550);
    const offset = await railPage.evaluate(id => {
      const rail = document.querySelector('.cat-navigation').getBoundingClientRect();
      const tab = document.getElementById(`tab-${id}`).getBoundingClientRect();
      return tab.left + tab.width / 2 - rail.left - rail.width / 2;
    }, id);
    assert.ok(Math.abs(offset) <= 2, `Centered ${id}: ${offset}`);
    assert.ok(await railPage.locator('#cat-tabs').evaluate(rail => {
      const bounds = rail.getBoundingClientRect();
      return [...rail.querySelectorAll('.profile-tab')].every(profile => {
        const box = profile.getBoundingClientRect();
        return getComputedStyle(profile).opacity === '0' || (box.left >= bounds.left + 2 && box.right <= bounds.right - 2);
      });
    }), `No partial portraits for ${id}`);
  }
  await railPage.evaluate(() => ['cat8', 'cat1', 'cat5'].forEach(id => document.getElementById(`tab-${id}`).click()));
  await railPage.waitForTimeout(550);
  assert.equal(await railPage.locator('[aria-selected=true]').getAttribute('data-cat'), 'cat5');
  assert.equal(await railPage.evaluate(() => window.scrollY), 0);
  // Manual scrolling must select the nearest profile and settle back to an exact center.
  for (const position of ['end', 'start', 'between']) {
    await railPage.locator('#cat-tabs').evaluate((rail, position) => {
      rail.scrollLeft = position === 'end' ? rail.scrollWidth : position === 'start' ? 0 : rail.scrollLeft + 111;
    }, position);
    await railPage.waitForTimeout(900);
    const selected = await railPage.locator('#cat-tabs [aria-selected=true]').evaluate(tab => {
      const bounds = tab.closest('.cat-navigation').getBoundingClientRect();
      const box = tab.getBoundingClientRect();
      return { id: tab.dataset.cat, offset: box.left + box.width / 2 - bounds.left - bounds.width / 2 };
    });
    assert.ok(Math.abs(selected.offset) <= 2, `Manual ${position} centered: ${selected.offset}`);
    if (position === 'end') assert.equal(selected.id, 'cat8');
    if (position === 'start') assert.equal(selected.id, 'cat1');
  }
  const selectedTab = railPage.locator('#cat-tabs [aria-selected=true]');
  await selectedTab.hover();
  await railPage.waitForTimeout(200);
  assert.equal(await selectedTab.locator('.customize-icon').evaluate(el => getComputedStyle(el).opacity), '1');
  assert.ok(await railPage.locator('#cat-tabs').evaluate(rail => {
    const name = rail.querySelector('.profile-name').getBoundingClientRect();
    return rail.getBoundingClientRect().bottom - name.bottom >= 16;
  }), 'Scrollbar is separated from profile names');
  await railPage.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await railPage.evaluate(() => {
    document.getElementById('add-cat').click();
    return document.getElementById('cat9').getAnimations().length;
  }), 0);
  await railPage.locator('#cat9-name').fill('Çok uzun bir örnek profil adı');
  const nameStyle = await railPage.locator('#tab-cat9 + .profile-name').evaluate(el => ({ width: el.clientWidth, overflow: getComputedStyle(el).textOverflow, text: el.textContent }));
  assert.equal(nameStyle.width, 64);
  assert.equal(nameStyle.overflow, 'ellipsis');
  assert.equal(nameStyle.text, 'Çok uzun bir örnek profil adı');
  await railPage.screenshot({ path: process.env.TEMP + '/mamapayi-profiles-light.png' });
  await railPage.locator('#theme-toggle').click();
  await railPage.screenshot({ path: process.env.TEMP + '/mamapayi-profiles-dark.png' });
  await railContext.close();
  const hapticContext = await browser.newContext({ reducedMotion: 'no-preference' });
  await hapticContext.addInitScript(() => {
   window.hapticCalls = [];
   Object.defineProperty(navigator, 'vibrate', { configurable: true, value: pattern => { window.hapticCalls.push(pattern); return true; } });
  });
  const hapticPage = await hapticContext.newPage();
  await hapticPage.goto('http://localhost:4783');
  assert.deepEqual(await hapticPage.evaluate(() => window.hapticCalls), []);
  await hapticPage.locator('#add-cat').press('Enter');
  await hapticPage.locator('#tab-cat1').click();
  await hapticPage.locator('#cat1-factor').selectOption('1.2');
  await hapticPage.locator('#cat1-automatic').selectOption('true');
  await hapticPage.locator('#language').selectOption('en');
  await hapticPage.locator('#theme-toggle').click();
  await hapticPage.waitForFunction(() => !document.getElementById('theme-toggle').disabled);
  await hapticPage.locator('#cat1 summary').first().click();
  await hapticPage.locator('#tab-cat2').click();
  await hapticPage.locator('#remove-cat').click();
  await hapticPage.locator('#delete-yes').click();
  await hapticPage.waitForFunction(() => document.querySelectorAll('[role=tab]').length === 1);
  assert.deepEqual(await hapticPage.evaluate(() => window.hapticCalls), [12, 8, 8, 8, 8, 8, 8, 8, 20, [10, 40, 10]]);
  assert.equal(await hapticPage.locator('#delete-success-message').textContent(), 'Cat profile removed.');
  await hapticPage.locator('#delete-done').click();
  await hapticPage.locator('#delete-dialog').waitFor({ state: 'hidden' });
  await hapticPage.emulateMedia({ reducedMotion: 'reduce' });
  await hapticPage.locator('#add-cat').press('Enter');
  assert.equal(await hapticPage.evaluate(() => window.hapticCalls.length), 10);
  await hapticPage.emulateMedia({ reducedMotion: 'no-preference' });
  await hapticPage.evaluate(() => Object.defineProperty(navigator, 'vibrate', { value: undefined, configurable: true }));
  await hapticPage.locator('#add-cat').press('Enter');
  await hapticPage.evaluate(() => Object.defineProperty(navigator, 'vibrate', { value: () => { throw new Error('Unavailable'); } }));
  await hapticPage.locator('#add-cat').press('Enter');
  assert.equal(await hapticPage.getByRole('tab').count(), 4);
  await hapticContext.close();
  console.log('UI checks passed: five widths, icon navigation, six matching colors in both themes, info popovers, storage, deletion and calculations.');
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
