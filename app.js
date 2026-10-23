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
// Opaque faces and transparent surrounds keep the reference artwork clear in both themes.
const catPortraits = [
  ['#c4d4f1', 'M4 8Q10 2 18 16Q32 10 46 16Q55 3 59 8L57 30Q62 57 32 59Q2 57 7 30Z', 'M0 0H64V31Q56 49 45 35L32 26 20 39Q8 45 0 30Z', 'M22 14l2 8m8-10v11m9-9-2 8'],
  ['#c0dccd', 'M7 29Q3 15 7 6Q12 3 23 17Q32 14 42 17Q54 3 57 6Q62 12 57 29Q64 57 32 59Q0 57 7 29Z', 'M0 0H26Q34 23 25 37Q18 46 0 46Z', ''],
  ['#edb6b7', 'M7 29 6 5Q9 1 24 18Q32 15 41 18L56 4Q60 1 57 29Q64 58 32 59Q0 58 7 29Z', 'M7 6 19 20 8 25ZM56 6 45 20 57 25Z', 'M25 19l1 7m6-8v11m7-10-1 7M6 36l9 2m-9 7 9-2m34-5 9-2m-9 7 9 2'],
  ['#f6dd87', 'M7 29 5 5Q8 1 24 19Q34 16 43 20L57 4Q61 1 58 30Q64 58 32 59Q0 58 7 29Z', 'M38 0H64V49Q40 49 34 32Z', ''],
  ['#c7abd9', 'M7 25Q2 24 4 18Q9 9 18 15Q32 11 46 15Q55 9 60 18Q63 24 57 25Q66 57 32 59Q-2 57 7 25Z', 'M0 0H64V22L53 27 48 17 40 17 38 26 33 17 30 27 25 17 17 17 12 27 0 24Z', 'M5 38l10 3m-10 7 10-3m34-4 10-3m-10 7 10 3'],
  ['#f5b698', 'M7 29 6 5Q9 1 24 18Q32 15 41 18L56 4Q60 1 57 29Q64 58 32 59Q0 58 7 29Z', 'M8 7 19 21 8 26ZM42 0H64V43Q40 49 35 32ZM10 30Q24 24 26 36Q27 49 14 49Q3 47 10 30Z', '']
];
function catIcon(cat) {
  const [color, head, patch, stripes] = catPortraits[palette.indexOf(cat.color)];
  const clip = `portrait-${cat.id}`;
  return `<svg viewBox="0 0 64 64" fill="none" stroke="#101d49" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><defs><clipPath id="${clip}"><path d="${head}"/></clipPath></defs><path class="cat-face" d="${head}" fill="#faf7ef" stroke="none"/><g clip-path="url(#${clip})"><path class="cat-marking" d="${patch}" fill="${color}" stroke="none"/><path d="${stripes}" stroke="${color}" stroke-width="3.5"/></g><path d="${head}"/><g fill="#101d49" stroke="none"><ellipse cx="21" cy="35" rx="2.5" ry="3.5"/><ellipse cx="43" cy="35" rx="2.5" ry="3.5"/><path d="M28 42Q32 40 36 42Q36 44 32 47Q28 44 28 42Z"/></g><path d="M32 46v3m-8-1q2 7 8 1 6 6 8-1"/></svg>`;
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
function centerActiveTab() {
  const rail = document.getElementById('cat-tabs');
  const tab = document.getElementById(`tab-${activeId}`);
  if (!tab) return;
  const railBounds = rail.getBoundingClientRect();
  const tabBounds = tab.getBoundingClientRect();
  rail.scrollTo({ left: rail.scrollLeft + tabBounds.left - railBounds.left + tabBounds.width / 2 - rail.parentElement.clientWidth / 2, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
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
  <div class="cat-head"><div class="field"><label for="${cat.id}-name">Kedi adı</label><div class="input-wrap"><input id="${cat.id}-name" name="name" value="${escapeHtml(cat.name)}" maxlength="60" autocomplete="off"></div></div><div class="field"><label for="${cat.id}-automatic">Besleme yöntemi</label><div class="input-wrap"><select id="${cat.id}-automatic" name="automatic"><option value="true"${cat.automatic ? ' selected' : ''}>Otomat</option><option value="false"${!cat.automatic ? ' selected' : ''}>Elle besleme</option></select></div></div></div>
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
