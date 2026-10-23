'use strict';
const storageKey = 'mama-payi-v3';
let saved = {};
try {
  const value = JSON.parse(localStorage.getItem(storageKey));
  if (value && typeof value === 'object' && !Array.isArray(value)) saved = value;
} catch {}
let language = saved.language === 'en' ? 'en' : 'tr';
let themeChoice = ['light', 'dark'].includes(saved.theme) ? saved.theme : null;
function saveSettings() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ cats, theme: themeChoice, language }));
    document.getElementById('save-status').textContent = t('Girdiğiniz bilgiler cihazınızda saklanır.');
  } catch {
    document.getElementById('save-status').textContent = t('Bu tarayıcıda kayıt yapılamadı.');
  }
}
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function haptic(pattern = 8) {
  if (reducedMotion.matches) return;
  try { navigator.vibrate?.(pattern); } catch {}
}
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let manualTheme = themeChoice !== null;
function setTheme(theme, updateBrowserColor = true) {
  document.documentElement.dataset.theme = theme;
  const toggle = document.getElementById('theme-toggle');
  const label = language === 'en' ? (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode') : (theme === 'dark' ? 'Açık moda geç' : 'Koyu moda geç');
  toggle.setAttribute('aria-label', label); toggle.title = label;
  toggle.querySelectorAll('[data-theme-icon]').forEach(icon => { icon.toggleAttribute('hidden', icon.dataset.themeIcon === theme); });
  if (updateBrowserColor) document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#121212' : '#f2f3f7';
}
setTheme(themeChoice || (systemTheme.matches ? 'dark' : 'light'));
systemTheme.addEventListener('change', event => { if (!manualTheme) setTheme(event.matches ? 'dark' : 'light'); });
document.getElementById('theme-toggle').addEventListener('click', async event => {
  const button = event.currentTarget;
  haptic();
  manualTheme = true;
  themeChoice = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  const apply = () => { setTheme(themeChoice, false); saveSettings(); };
  if (reducedMotion.matches || !document.startViewTransition) { apply(); setTheme(themeChoice); return; }
  button.disabled = true;
  // Capture complete theme colors, rather than intermediate control transitions.
  document.documentElement.classList.add('theme-transition');
  getComputedStyle(document.documentElement).color;
  try {
    const transition = document.startViewTransition(apply);
    await transition.ready;
    document.documentElement.animate({ opacity: [0, 1] }, {
      duration: 280, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)'
    });
    await transition.finished;
  } catch { apply(); }
  finally {
    setTheme(themeChoice);
    document.documentElement.classList.remove('theme-transition');
    button.disabled = false;
  }
});
const palette = ['blue', 'green', 'rose', 'amber', 'purple', 'teal'];
const newCat = (id, color = 'blue') => ({ id, color, name: '', weight: '', ideal: '', factor: '1', food: '', calories: '', automatic: false, portion: '' });
const storedCats = Array.isArray(saved.cats) ? saved.cats.filter(cat => cat && typeof cat === 'object') : [];
let cats = (Array.isArray(saved.cats) ? storedCats : [newCat('cat1')]).map((stored, index) => {
  const cat = newCat(`cat${index + 1}`, palette[index % palette.length]);
  for (const key of Object.keys(cat)) {
    if (key === 'id') continue;
    const limit = key === 'food' ? 200 : key === 'name' ? 60 : 12;
    if (key === 'automatic' ? typeof stored[key] === 'boolean' : typeof stored[key] === 'string' && stored[key].length <= limit) cat[key] = stored[key];
  }
  if (!palette.includes(cat.color)) cat.color = palette[index % palette.length];
  if (!['0.8', '1', '1.2', '1.4', '1.8', '2', '2.5'].includes(cat.factor)) cat.factor = '1';
  return cat;
});
if (!cats.length) cats.push(newCat('cat1'));
const defaultCatId = cats[0].id;
const canRemove = id => id === activeId && id !== defaultCatId && cats.some(cat => cat.id === id);
let activeId = cats[0]?.id || null;
let nextCatId = cats.length + 1;
const translations = {
'Tahmini günlük mama miktarı':'Estimated daily food amount',
'RER, dinlenirken gereken enerjidir. Katsayıyı kedinin yaşına ve durumuna göre seç.':'RER is energy needed at rest. Choose a multiplier for your cat’s age and condition.',
'1× düşük aktivite; 1,2× kısır yetişkin; yavrular için yaş aralığını seç.':'1× for low activity; 1.2× for neutered adults; choose the age range for kittens.',
'0,8× ve 1,8× hedef ağırlığı kullanır; hedef boşsa mevcut ağırlık kullanılır.':'0.8× and 1.8× use target weight; a blank target uses current weight.',
'Bu bir başlangıç tahminidir; miktarı kilo takibi ve veteriner önerisiyle ayarla.':'This is a starting estimate; adjust with weight monitoring and veterinary advice.',
'Pakette “metabolize edilebilir enerji” veya “ME” satırındaki kcal/kg değerini bul.':'Find kcal/kg under “metabolizable energy” or “ME” on the package.',
'Örnek: 350 kcal/100 g yazıyorsa 3500 gir.':'Example: if it says 350 kcal/100 g, enter 3500.',
'Veteriner kaynağı':'Veterinary reference',

'Bu kedi profilini kaldırmak ister misin?':'Would you like to remove this cat profile?','Evet':'Yes','Hayır':'No','Kedi profili kaldırıldı.':'Cat profile removed.',
'Kedi ekle':'Add cat','Tam gram: 3280.':'Whole grams: 3280.','Paketteki kcal/kg.':'Package kcal/kg.','Boşsa mevcut ağırlık.':'Blank uses current weight.','Bilgi':'Information','Girdiğiniz bilgiler cihazınızda saklanır.':'Your information is stored on your device.','Profili kaldır':'Remove profile','Hesaplama ayrıntısı':'Calculation details',
'Çarpan, hesaplanan kaloriyi değiştirir: 1× aynı tutar, 0,8× %20 azaltır, 1,2× %20 artırır.':'The multiplier adjusts calculated calories: 1× keeps them unchanged, 0.8× reduces them by 20%, and 1.2× increases them by 20%.',
'Tam gram gir; nokta veya virgül kullanma. Örn. 3280.':'Enter whole grams without dots or commas, e.g. 3280.',
'Ağırlığı tam gram olarak gir. Örn. 3280.':'Enter weight in whole grams, e.g. 3280.',
'Hedef ağırlığı tam gram olarak gir. Örn. 4000.':'Enter target weight in whole grams, e.g. 4000.',
'Mama paketindeki kcal/kg değerini gir.':'Enter the kcal/kg value from the food packaging.',
'Bilgiler bu tarayıcıda otomatik kaydedilir.':'Changes are saved automatically in this browser.',
'Bu tarayıcıda kayıt yapılamadı.':'Changes could not be saved in this browser.',

'Kedi adı':'Cat name','Besleme yöntemi':'Feeding method','Otomat':'Automatic feeder','Elle besleme':'Manual feeding','Günlük mama miktarı':'Daily food amount','gram / gün':'grams / day','Mevcut ağırlık (g)':'Current weight (g)','RER katsayısı':'RER multiplier','Hedef ağırlık (g, isteğe bağlı)':'Target weight (g, optional)','Mama adı':'Food name','Mamanın enerji değeri':'Food energy','Otomat porsiyonu':'Feeder portion','Günlük porsiyon':'Daily portions','porsiyon':'portions','Açık':'Light','Koyu':'Dark',
'0,8× · Kilo verme':'0.8× · Weight loss','1× · Kiloyu koruma':'1× · Weight maintenance','1,2× · Kısır yetişkin':'1.2× · Neutered adult','1,4× · Kısır olmayan yetişkin':'1.4× · Intact adult','1,8× · Kilo alma':'1.8× · Weight gain','2× · Yavru, 4–12 ay':'2× · Kitten, 4–12 months','2,5× · Yavru, 0–4 ay':'2.5× · Kitten, 0–4 months',
'Hesaplamada hedef ağırlık kullanılır.':'Calculation uses target weight.','Boş bırakırsan mevcut ağırlık kullanılır.':'Leave blank to use current weight.','Hesaplamak için aşağıdaki değeri düzelt.':'Enter a valid value below to calculate.','Ağırlık ve mama enerjisini gir.':'Enter weight and food energy.','Otomat porsiyonunu gir.':'Enter the feeder portion.',
'Ağırlık 0’dan büyük, en fazla 30.000 gram olmalı.':'Weight must be above 0 and at most 30,000 grams.','RER katsayısı 0’dan büyük, en fazla 5 olmalı.':'RER multiplier must be above 0 and at most 5.','Mama enerjisi 0’dan büyük, en fazla 10.000 kcal/kg olmalı.':'Food energy must be above 0 and at most 10,000 kcal/kg.','İdeal ağırlık 0’dan büyük, en fazla 30.000 gram olmalı.':'Ideal weight must be above 0 and at most 30,000 grams.','Bir porsiyon 0’dan büyük, en fazla 100 g olmalı.':'Feeder portion must be above 0 and at most 100 g.'
};
const t = text => language === 'en' ? translations[text] || text : text;
function translatePage() {
  document.documentElement.lang = language;
  document.title = language === 'en' ? 'Pati Gram · Cat Food Calculator' : 'Pati Gram · Kedi Mama Hesabı';
  document.getElementById('language').value = language;
  document.getElementById('copyright').textContent = `© ${new Date().getFullYear()} Vivid Creative Works · ${language === 'en' ? 'An open-source hobby project.' : 'Açık kaynak bir hobi projesi.'}`;
  setTheme(document.documentElement.dataset.theme);
  for (const [id, text] of [['delete-question', 'Bu kedi profilini kaldırmak ister misin?'], ['delete-no', 'Hayır'], ['delete-yes', 'Evet']]) document.getElementById(id).textContent = t(text);
  document.getElementById('cat-actions-hint').textContent = language === 'en' ? 'Choose a cat profile. Use the button below the form to remove the selected profile. The first profile is protected.' : 'Kedi profilini seçin. Seçili profili kaldırmak için formun altındaki butonu kullanın. İlk profil korunur.';
  document.getElementById('remove-cat').textContent = language === 'en' ? 'Remove cat profile' : 'Kedi profilini kaldır';
  document.getElementById('cats').setAttribute('aria-label', language === 'en' ? 'Cat feeding settings' : 'Kedi beslenme ayarları');
  const walker = document.createTreeWalker(document.getElementById('cats'), NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode, text = node.textContent.trim();
    if (translations[text]) node.textContent = node.textContent.replace(text, t(text));
  }
}
const format = (value, digits = 1) => value.toLocaleString(language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: digits });
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const factors = [['0.8', '0,8× · Kilo verme'], ['1', '1× · Kiloyu koruma'], ['1.2', '1,2× · Kısır yetişkin'], ['1.4', '1,4× · Kısır olmayan yetişkin'], ['1.8', '1,8× · Kilo alma'], ['2', '2× · Yavru, 4–12 ay'], ['2.5', '2,5× · Yavru, 0–4 ay']];
const infoIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/></svg>';
// Mask the original artwork so its baked checkerboard never appears in either theme.
const catPortraits = [
  [1335, 150, 445, 'M1362 193Q1380 158 1412 181L1480 220Q1556 189 1625 222L1689 183Q1739 157 1750 214Q1759 270 1735 319Q1785 399 1738 474Q1684 556 1557 559Q1426 558 1374 479Q1328 408 1369 328Q1343 250 1362 193Z'],
  [140, 150, 425, 'M175 181Q179 154 207 171Q240 190 280 234Q347 208 422 235L486 177Q519 148 530 182Q541 224 523 316Q565 404 532 471Q489 553 360 557Q230 561 182 492Q141 437 161 370L181 316Q162 224 175 181Z'],
  [745, 145, 430, 'M775 185Q782 143 812 163Q850 190 902 244Q954 228 1011 244L1081 176Q1119 140 1134 178Q1149 222 1130 337Q1170 411 1133 476Q1083 559 959 561Q831 558 784 487Q744 425 774 349Q761 241 775 185Z'],
  [1335, 725, 450, 'M1353 761Q1363 732 1387 742L1483 824Q1556 809 1628 829L1728 749Q1764 719 1772 755Q1781 803 1744 923Q1776 1028 1714 1092Q1656 1147 1556 1150Q1447 1148 1397 1098Q1354 1057 1356 1003Q1354 961 1372 940Q1339 852 1353 761Z'],
  [130, 755, 440, 'M148 837Q169 797 206 792Q232 779 266 806Q346 776 426 805Q455 772 480 790Q515 797 544 833Q555 851 542 867L528 879Q571 957 549 1029Q520 1134 351 1140Q191 1140 154 1048Q125 975 162 881Q136 868 148 837Z'],
  [745, 730, 430, 'M766 773Q780 730 809 747Q851 777 902 827Q951 812 1007 828L1090 753Q1124 723 1138 766Q1152 811 1133 921Q1175 1004 1134 1069Q1081 1144 958 1147Q825 1145 782 1077Q741 1010 768 934Q754 823 766 773Z']
];
function catIcon(cat) {
  const [x, y, size, outline] = catPortraits[palette.indexOf(cat.color)];
  const clip = `portrait-${cat.id}`;
  return `<svg viewBox="${x} ${y} ${size} ${size}" aria-hidden="true"><defs><clipPath id="${clip}"><path d="${outline}" transform="translate(${x + size / 2} ${y + size / 2}) scale(0.96) translate(${-x - size / 2} ${-y - size / 2})"/></clipPath></defs><image href="cat-portraits.jpg" width="1907" height="1280" preserveAspectRatio="none" clip-path="url(#${clip})"/></svg>`;
}
function info(label, content) {
  return `<details class="field-info"><summary aria-label="${escapeHtml(t(label))} — ${t('Bilgi')}">${infoIcon}</summary><div class="info-content">${content}</div></details>`;
}
function input(cat, key, label, unit, wide = false) {
  const id = `${cat.id}-${key}`;
  const weight = key === 'weight' || key === 'ideal';
  const hint = key === 'calories' ? 'Pakette “metabolize edilebilir enerji” veya “ME” satırındaki kcal/kg değerini bul.' : '';
  return `<div class="field${wide ? ' wide' : ''}"><div class="label-row"><label for="${id}">${label}</label>${hint ? info(label, `<p id="${id}-hint">${t(hint)}</p><p>${t('Örnek: 350 kcal/100 g yazıyorsa 3500 gir.')}</p>`) : ''}</div><div class="input-wrap"><input id="${id}" name="${key}" value="${escapeHtml(cat[key])}" ${key === 'food' ? 'maxlength="200"' : `inputmode="${weight ? 'numeric' : 'decimal'}" maxlength="12"`} autocomplete="off"${hint ? ` aria-describedby="${id}-hint"` : ''}>${unit ? `<span class="unit">${unit}</span>` : ''}</div><p class="error" id="${id}-error" role="alert"></p></div>`;
}
function catName(cat, index) { return cat.name.trim() || `${language === 'en' ? 'Cat' : 'Kedi'} ${index + 1}`; }
function updateRailEdges() {
  const rail = document.getElementById('cat-tabs');
  const bounds = rail.getBoundingClientRect();
  rail.querySelectorAll('.profile-tab').forEach(profile => {
    const box = profile.getBoundingClientRect();
    profile.classList.toggle('outside-rail', box.left < bounds.left + 2 || box.right > bounds.right - 2);
  });
}
document.getElementById('cat-tabs').addEventListener('scroll', updateRailEdges, { passive: true });
new ResizeObserver(updateRailEdges).observe(document.getElementById('cat-tabs'));
function centerActiveTab() {
  const rail = document.getElementById('cat-tabs');
  const tab = document.getElementById(`tab-${activeId}`);
  if (!tab) return;
  const railBounds = rail.getBoundingClientRect();
  const tabBounds = tab.getBoundingClientRect();
  rail.scrollTo({ left: rail.scrollLeft + tabBounds.left - railBounds.left + tabBounds.width / 2 - rail.parentElement.clientWidth / 2, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  updateRailEdges();
}
function renderTabs() {
  const rail = document.getElementById('cat-tabs');
  const previousScroll = rail.scrollLeft;
  rail.parentElement.classList.toggle('multiple', cats.length > 1);
  document.getElementById('cat-tabs').innerHTML = cats.map((cat, index) => `<div class="profile-tab" role="presentation"><button type="button" role="tab" id="tab-${cat.id}" aria-controls="${cat.id}" aria-selected="${cat.id === activeId}" tabindex="${cat.id === activeId ? 0 : -1}" data-cat="${cat.id}" data-color="${cat.color}" aria-label="${escapeHtml(catName(cat, index))}" title="${escapeHtml(catName(cat, index))}" aria-describedby="cat-actions-hint" aria-keyshortcuts="Delete Shift+F10">${catIcon(cat)}${cats.length > 1 ? `<span class="cat-number" aria-hidden="true">${index + 1}</span>` : ''}</button><span class="profile-name" aria-hidden="true" title="${escapeHtml(catName(cat, index))}">${escapeHtml(catName(cat, index))}</span></div>`).join('');
  document.getElementById('cat-tabs').setAttribute('aria-label', language === 'en' ? 'Cats' : 'Kediler');
  document.getElementById('add-cat').setAttribute('aria-label', t('Kedi ekle'));
  document.getElementById('add-cat').title = t('Kedi ekle');
  document.getElementById('remove-cat').hidden = !canRemove(activeId);
  rail.scrollLeft = previousScroll;
  centerActiveTab();
}
function activateCat(id) {
  activeId = id;
  document.querySelectorAll('#cat-tabs [data-cat]').forEach(tab => {
    const selected = tab.dataset.cat === activeId;
    tab.setAttribute('aria-selected', selected);
    tab.tabIndex = selected ? 0 : -1;
  });
  document.getElementById('remove-cat').hidden = !canRemove(activeId);
  centerActiveTab();
  cats.forEach(cat => { document.getElementById(cat.id).hidden = cat.id !== activeId; });
}
function showError(card, key, message) {
  const field = card.querySelector(`[name="${key}"]`);
  const error = document.getElementById(`${card.id}-${key}-error`);
  error.textContent = t(message);
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', [field.getAttribute('aria-describedby'), error.id].filter(Boolean).join(' '));
}
function render() {
document.getElementById('cats').innerHTML = cats.map(cat => `<article class="cat" data-color="${cat.color}" id="${cat.id}" role="tabpanel" aria-labelledby="tab-${cat.id}"${cat.id === activeId ? '' : ' hidden'}>
  <div class="cat-head"><div class="field"><label for="${cat.id}-name">Kedi adı</label><div class="input-wrap"><input id="${cat.id}-name" name="name" value="${escapeHtml(cat.name)}" maxlength="60" autocomplete="off" enterkeyhint="done"></div></div><div class="field"><label for="${cat.id}-automatic">Besleme yöntemi</label><div class="input-wrap"><select id="${cat.id}-automatic" name="automatic"><option value="true"${cat.automatic ? ' selected' : ''}>Otomat</option><option value="false"${!cat.automatic ? ' selected' : ''}>Elle besleme</option></select></div></div></div>
  <div class="result" role="status" aria-atomic="true"><span class="result-label">Tahmini günlük mama miktarı</span><div class="result-main"><strong data-result="grams">—</strong><span>gram / gün</span></div><div class="result-meta" data-result="meta"></div></div>
  <div class="fields"><div class="field-grid">
    ${input(cat, 'weight', 'Mevcut ağırlık (g)', '', true)}
    <div class="field wide"><div class="label-row"><label for="${cat.id}-factor">RER katsayısı</label>${info('RER katsayısı', `<p>${t('RER, dinlenirken gereken enerjidir. Katsayıyı kedinin yaşına ve durumuna göre seç.')}</p><p>${t('1× düşük aktivite; 1,2× kısır yetişkin; yavrular için yaş aralığını seç.')}</p><p>${t('0,8× ve 1,8× hedef ağırlığı kullanır; hedef boşsa mevcut ağırlık kullanılır.')}</p><p data-result="reference"></p><p>${t('Bu bir başlangıç tahminidir; miktarı kilo takibi ve veteriner önerisiyle ayarla.')}</p><a href="https://www.merckvetmanual.com/multimedia/table/daily-maintenance-energy-requirements-for-dogs-and-cats" target="_blank" rel="noopener noreferrer">${t('Veteriner kaynağı')}</a>`)}</div><div class="input-wrap"><select id="${cat.id}-factor" name="factor">${factors.map(([value, label]) => `<option value="${value}"${cat.factor === value ? ' selected' : ''}>${label}</option>`).join('')}</select></div></div>
    <div class="field wide ideal-field">${input(cat, 'ideal', 'Hedef ağırlık (g, isteğe bağlı)', '')}<p class="weight-reference" data-result="weight-reference"></p></div>
    <div class="field wide">${input(cat, 'calories', 'Mamanın enerji değeri', 'kcal / kg')}</div>
  </div>
  <div class="portion-box"${cat.automatic ? '' : ' hidden'}>${input(cat, 'portion', 'Otomat porsiyonu', 'g')}<div class="portion-result"><span class="portion-label">Günlük porsiyon</span><div class="portion-value"><strong data-result="portions">—</strong> porsiyon</div></div><p class="portion-rounding" data-result="rounding"></p></div>
  </div>
</article>`).join('');
translatePage();
renderTabs();
document.getElementById('save-status').textContent = t('Girdiğiniz bilgiler cihazınızda saklanır.');
update();
}
const panelStates = new WeakMap();
function setPanelVisible(panel, visible) {
  const previous = panelStates.get(panel);
  if ((previous ? previous.visible : !panel.hidden) === visible) return;
  previous?.animation?.cancel();
  const state = { visible };
  panelStates.set(panel, state);
  if (reducedMotion.matches) { panel.hidden = !visible; return; }
  panel.hidden = false;
  const height = panel.getBoundingClientRect().height;
  state.animation = panel.animate(visible ? [
    { opacity: 0, height: '0px', transform: 'translateY(-6px)' },
    { opacity: 1, height: `${height}px`, transform: 'translateY(0)' }
  ] : [{ opacity: 1, height: `${height}px` }, { opacity: 0, height: '0px' }], {
    duration: visible ? 280 : 180, easing: 'cubic-bezier(.22, 1, .36, 1)'
  });
  state.animation.onfinish = () => { panel.hidden = !visible; state.animation = null; };
}
function update() {
  for (const cat of cats) {
    const card = document.getElementById(cat.id);
    setPanelVisible(card.querySelector('.portion-box'), cat.automatic);
    const set = (key, value) => { const el = card.querySelector(`[data-result="${key}"]`); if (el) el.textContent = value; };
    setPanelVisible(card.querySelector('.ideal-field'), ['0.8', '1.8'].includes(cat.factor));
    card.querySelectorAll('.error').forEach(el => { el.textContent = ''; });
    card.querySelectorAll('[aria-invalid]').forEach(el => {
      el.removeAttribute('aria-invalid');
      const hint = document.getElementById(`${el.id}-hint`);
      if (hint) el.setAttribute('aria-describedby', hint.id);
      else el.removeAttribute('aria-describedby');
    });
    set('weight-reference', t(String(cat.ideal).trim() ? 'Hesaplamada hedef ağırlık kullanılır.' : 'Boş bırakırsan mevcut ağırlık kullanılır.'));
    set('grams', '—'); set('portions', '—'); set('rounding', ''); set('reference', '');
    try {
      // Daily grams remain available even while feeder settings are incomplete.
      const result = MamaCalculator.calculate({ ...cat, automatic: false });
      set('grams', format(result.grams));
      set('meta', `${format(result.energy)} kcal / ${language === 'en' ? 'day' : 'gün'} · RER ${format(result.rer)} kcal × ${format(MamaCalculator.number(cat.factor))}`);
      set('reference', `${language === 'en' ? 'Weight used' : 'Hesapta kullanılan ağırlık'}: ${format(result.referenceWeight * 1000)} g`);
      if (cat.automatic) {
        if (String(cat.portion).trim() === '') { set('rounding', t('Otomat porsiyonunu gir.')); continue; }
        const portion = MamaCalculator.number(cat.portion);
        if (!(portion > 0 && portion <= 100)) { showError(card, 'portion', 'Bir porsiyon 0’dan büyük, en fazla 100 g olmalı.'); continue; }
        const portions = result.grams / portion;
        set('portions', format(portions, 2));
        const lower = Math.floor(portions), upper = Math.ceil(portions);
        const difference = count => {
          const delta = count * portion - result.grams;
          return `${count} ${t('porsiyon')} = ${format(count * portion)} g (${delta >= 0 ? '+' : '−'}${format(Math.abs(delta))} g)`;
        };
        set('rounding', `${language === 'en' ? 'Difference from target' : 'Günlük miktardan farkı'}: ${difference(lower)}${lower !== upper ? ` · ${difference(upper)}` : ''}`);
      }
    } catch (error) {
      const key = error.message.startsWith('Mama') ? 'calories' : error.message.startsWith('İdeal') || error.message.startsWith('Hedef') ? 'ideal' : error.message.startsWith('RER') ? 'factor' : 'weight';
      const empty = String(cat[key]).trim() === '';
      set('meta', t(empty ? 'Ağırlık ve mama enerjisini gir.' : 'Hesaplamak için aşağıdaki değeri düzelt.'));
      if (!empty) showError(card, key, error.message);
    }
  }
}

document.getElementById('cats').addEventListener('keydown', event => {
  if (event.key !== 'Enter' || event.isComposing || !event.target.matches('input[name="name"]')) return;
  event.preventDefault();
  event.target.blur();
});
document.getElementById('cats').addEventListener('input', event => {
  if (!event.target.name) return;
  const cat = cats.find(cat => cat.id === event.target.closest('.cat').id);
  cat[event.target.name] = event.target.name === 'automatic' ? event.target.value === 'true' : event.target.value;

  saveSettings();
  if (event.target.name === 'name') {
    const tab = document.getElementById(`tab-${cat.id}`);
    tab.setAttribute('aria-label', catName(cat, cats.indexOf(cat)));
    tab.title = catName(cat, cats.indexOf(cat));
    const label = tab.parentElement.querySelector('.profile-name');
    label.textContent = tab.title;
    label.title = tab.title;
  }
  update();
});
const deleteDialog = document.getElementById('delete-dialog');
let pendingDeleteId = null;
let deleteSuccessTimer;
function requestRemoval(id) {
  if (deleteDialog.open || !canRemove(id)) return;
  pendingDeleteId = id;
  document.getElementById('delete-confirm').hidden = false;
  document.getElementById('delete-success').hidden = true;
  deleteDialog.setAttribute('aria-labelledby', 'delete-question');
  deleteDialog.returnValue = 'cancel';
  deleteDialog.showModal();
  haptic(20);
}
const catTabs = document.getElementById('cat-tabs');
catTabs.addEventListener('keydown', event => {
  if (event.key !== 'Delete' && !(event.shiftKey && event.key === 'F10')) return;
  const tab = event.target.closest('[data-cat]');
  if (tab) { event.preventDefault(); requestRemoval(tab.dataset.cat); }
});
deleteDialog.querySelector('form').addEventListener('submit', event => {
  if (event.submitter?.value !== 'delete') return;
  event.preventDefault();
  const id = pendingDeleteId;
  pendingDeleteId = null;
  if (!canRemove(id)) return;
  const index = cats.findIndex(cat => cat.id === id);
  if (index < 0) return;
  haptic([10, 40, 10]);
  cats.splice(index, 1);
  activeId = cats[Math.min(index, cats.length - 1)]?.id || null;
  render(); saveSettings();
  document.getElementById('delete-confirm').hidden = true;
  document.getElementById('delete-success').hidden = false;
  document.getElementById('delete-success-message').textContent = t('Kedi profili kaldırıldı.');
  document.getElementById('delete-done').textContent = language === 'en' ? 'Done' : 'Tamam';
  deleteDialog.setAttribute('aria-labelledby', 'delete-success-message');
  document.getElementById('delete-done').focus();
  deleteSuccessTimer = setTimeout(() => deleteDialog.close(), 900);
});
deleteDialog.addEventListener('close', () => {
  clearTimeout(deleteSuccessTimer);
  pendingDeleteId = null;
  if (!document.getElementById('delete-success').hidden) {
    (document.getElementById(`tab-${activeId}`) || document.getElementById('add-cat')).focus();
  }
});

document.getElementById('cat-tabs').addEventListener('click', event => {
  const tab = event.target.closest('[data-cat]');
  if (tab) { if (tab.dataset.cat !== activeId) haptic(); activateCat(tab.dataset.cat); document.getElementById(`tab-${activeId}`).focus({ preventScroll: true }); }
});
document.getElementById('cat-tabs').addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const index = cats.findIndex(cat => cat.id === activeId);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? cats.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + cats.length) % cats.length;
  activateCat(cats[next].id);
  document.getElementById(`tab-${activeId}`).focus({ preventScroll: true });
});
function addCat() {
  haptic(12);
  const color = palette.find(color => !cats.some(cat => cat.color === color)) || palette[cats.length % palette.length];
  const cat = newCat(`cat${nextCatId++}`, color);
  cats.push(cat); activeId = cat.id;
  render(); saveSettings();
  if (!reducedMotion.matches) {
    document.getElementById(cat.id).animate([
      { opacity: 0, transform: 'translateY(10px) scale(.99)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' }
    ], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' });
    document.getElementById(`tab-${cat.id}`).animate([
      { opacity: 0, transform: 'scale(.85)' }, { opacity: 1, transform: 'scale(1)' }
    ], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }
  document.getElementById(`${cat.id}-name`).focus({ preventScroll: true });
}
document.getElementById('add-cat').addEventListener('click', addCat);
new ResizeObserver(centerActiveTab).observe(document.getElementById('cat-tabs'));
document.getElementById('remove-cat').addEventListener('click', () => requestRemoval(activeId));
document.addEventListener('click', event => {
  if (event.target.closest('.field-info summary')) haptic();
  document.querySelectorAll('.field-info[open]').forEach(details => {
    if (!details.contains(event.target)) details.open = false;
  });
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const details = document.querySelector('.field-info[open]');
  if (details) { details.open = false; details.querySelector('summary').focus(); }
});

document.getElementById('cats').addEventListener('change', event => {
  if (event.target.matches('select')) haptic();
});
document.getElementById('language').addEventListener('change', event => { haptic(); language = event.target.value === 'en' ? 'en' : 'tr'; saveSettings(); render(); });
render();
