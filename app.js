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
  try { localStorage.setItem(storageKey, JSON.stringify({ cats, theme: themeChoice, language })); } catch {}
}
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let manualTheme = themeChoice !== null;
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll('[data-theme-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme)));
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#121212' : '#f2f3f7';
}
setTheme(themeChoice || (systemTheme.matches ? 'dark' : 'light'));
systemTheme.addEventListener('change', event => { if (!manualTheme) setTheme(event.matches ? 'dark' : 'light'); });
document.querySelector('.theme-controls').addEventListener('click', event => {
  const button = event.target.closest('[data-theme-choice]');
  if (!button) return;
  manualTheme = true;
  themeChoice = button.dataset.themeChoice;
  setTheme(themeChoice);
  saveSettings();
});
const defaults = ['cat1', 'cat2'].map(id => ({ id, name: '', weight: '', ideal: '', factor: '1', food: '', calories: '', automatic: false, portion: '' }));
let cats = defaults.map(cat => {
  const stored = Array.isArray(saved.cats) ? saved.cats.find(item => item && item.id === cat.id) : null;
  const restored = { ...cat };
  if (stored) for (const key of Object.keys(cat)) {
    if (key === 'id') continue;
    const limit = key === 'food' ? 200 : key === 'name' ? 60 : 12;
    if (key === 'automatic' ? typeof stored[key] === 'boolean' : typeof stored[key] === 'string' && stored[key].length <= limit) restored[key] = stored[key];
  }
  return restored;
});
const translations = {
'Hayvan adı':'Cat name','Besleme yöntemi':'Feeding method','Otomat':'Automatic feeder','Elle besleme':'Manual feeding','Günlük mama miktarı':'Daily food amount','gram / gün':'grams / day','Mevcut ağırlık':'Current weight','RER katsayısı':'RER multiplier','İdeal ağırlık (isteğe bağlı)':'Ideal weight (optional)','Mama adı':'Food name','Mamanın enerji değeri':'Food energy','Otomat porsiyonu':'Feeder portion','Günlük porsiyon':'Daily portions','porsiyon':'portions','Açık':'Light','Koyu':'Dark',
'0,8× · Kilo verme':'0.8× · Weight loss','1× · Koruma / düşük aktivite':'1× · Maintenance / low activity','1,2× · Kısır yetişkin':'1.2× · Neutered adult','1,4× · Kısır olmayan yetişkin':'1.4× · Intact adult','1,8× · Kilo alma':'1.8× · Weight gain','2× · Yavru, 4–12 ay':'2× · Kitten, 4–12 months','2,5× · Yavru, 0–4 ay':'2.5× · Kitten, 0–4 months',
'Hesaplamada ideal ağırlık esas alınır.':'Calculation uses ideal weight.','İdeal ağırlık belirtilmedi. Mevcut ağırlık esas alınır.':'Ideal weight is blank. Calculation uses current weight.','Hesaplamak için aşağıdaki değeri düzelt.':'Enter a valid value below to calculate.',
'Ağırlık 0’dan büyük, en fazla 30.000 gram olmalı.':'Weight must be above 0 and at most 30,000 grams.','RER katsayısı 0’dan büyük, en fazla 5 olmalı.':'RER multiplier must be above 0 and at most 5.','Mama enerjisi 0’dan büyük, en fazla 10.000 kcal/kg olmalı.':'Food energy must be above 0 and at most 10,000 kcal/kg.','İdeal ağırlık 0’dan büyük, en fazla 30.000 gram olmalı.':'Ideal weight must be above 0 and at most 30,000 grams.','Bir porsiyon 0’dan büyük, en fazla 100 g olmalı.':'Feeder portion must be above 0 and at most 100 g.'
};
const t = text => language === 'en' ? translations[text] || text : text;
function translatePage() {
  document.documentElement.lang = language;
  document.title = language === 'en' ? 'Cat Food Calculator' : 'Kedi Mama Hesabı';
  document.getElementById('language').value = language;
  document.querySelector('.theme-controls').setAttribute('aria-label', language === 'en' ? 'Appearance' : 'Görünüm');
  document.getElementById('cats').setAttribute('aria-label', language === 'en' ? 'Cat feeding settings' : 'Kedi beslenme ayarları');
  document.querySelectorAll('[data-theme-choice]').forEach(button => { button.textContent = t(button.dataset.themeChoice === 'light' ? 'Açık' : 'Koyu'); });
  const walker = document.createTreeWalker(document.getElementById('cats'), NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode, text = node.textContent.trim();
    if (translations[text]) node.textContent = node.textContent.replace(text, t(text));
  }
}
const format = (value, digits = 1) => value.toLocaleString(language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: digits });
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const factors = [['0.8', '0,8× · Kilo verme'], ['1', '1× · Koruma / düşük aktivite'], ['1.2', '1,2× · Kısır yetişkin'], ['1.4', '1,4× · Kısır olmayan yetişkin'], ['1.8', '1,8× · Kilo alma'], ['2', '2× · Yavru, 4–12 ay'], ['2.5', '2,5× · Yavru, 0–4 ay']];
function input(cat, key, label, unit, wide = false) {
  const id = `${cat.id}-${key}`;
  return `<div class="field${wide ? ' wide' : ''}"><label for="${id}">${label}</label><div class="input-wrap"><input id="${id}" name="${key}" value="${escapeHtml(cat[key])}" ${key === 'food' ? 'maxlength="200"' : 'inputmode="decimal" maxlength="12"'} autocomplete="off" aria-describedby="${cat.id}-error">${unit ? `<span class="unit">${unit}</span>` : ''}</div></div>`;
}
function render() {
document.getElementById('cats').innerHTML = cats.map(cat => `<article class="cat ${cat.id}" id="${cat.id}" aria-label="${escapeHtml(cat.name)}">
  <div class="cat-head"><div class="field"><label for="${cat.id}-name">Hayvan adı</label><div class="input-wrap"><input id="${cat.id}-name" name="name" value="${escapeHtml(cat.name)}" maxlength="60" autocomplete="off"></div></div><div class="field"><label for="${cat.id}-automatic">Besleme yöntemi</label><div class="input-wrap"><select id="${cat.id}-automatic" name="automatic"><option value="true"${cat.automatic ? ' selected' : ''}>Otomat</option><option value="false"${!cat.automatic ? ' selected' : ''}>Elle besleme</option></select></div></div></div>
  <div class="result" role="status" aria-atomic="true"><span class="result-label">Günlük mama miktarı</span><div class="result-main"><strong data-result="grams">—</strong><span>gram / gün</span></div><div class="result-meta" data-result="meta"></div></div>
  <div class="fields"><div class="field-grid">
    ${input(cat, 'weight', 'Mevcut ağırlık', 'g', true)}
    <div class="field wide"><label for="${cat.id}-factor">RER katsayısı</label><div class="input-wrap"><select id="${cat.id}-factor" name="factor">${factors.map(([value, label]) => `<option value="${value}"${cat.factor === value ? ' selected' : ''}>${label}</option>`).join('')}</select></div></div>
    <div class="field wide ideal-field">${input(cat, 'ideal', 'İdeal ağırlık (isteğe bağlı)', 'g')}<p class="hint ideal-note" data-result="ideal-note"></p></div>
    ${input(cat, 'food', 'Mama adı', '', true)}
    <div class="field wide">${input(cat, 'calories', 'Mamanın enerji değeri', 'kcal / kg')}</div>
  </div>
  <div class="portion-box"${cat.automatic ? '' : ' hidden'}>${input(cat, 'portion', 'Otomat porsiyonu', 'g')}<div class="portion-result"><span class="portion-label">Günlük porsiyon</span><div class="portion-value"><strong data-result="portions">—</strong> porsiyon</div></div><p class="portion-rounding" data-result="rounding"></p></div>
  <p class="error" id="${cat.id}-error" role="alert"></p></div>
</article>`).join('');
translatePage();
update();
}
function update() {

  for (const cat of cats) {
    const card = document.getElementById(cat.id);
    card.setAttribute('aria-label', cat.name.trim() || (language === 'en' ? 'Cat' : 'Kedi'));
    card.querySelector('.portion-box').hidden = !cat.automatic;
    const set = (key, value) => { const el = card.querySelector(`[data-result="${key}"]`); if (el) el.textContent = value; };
    const needsIdeal = ['0.8', '1.8'].includes(cat.factor);
    card.querySelector('.ideal-field').hidden = !needsIdeal;
    card.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    try {
      const result = MamaCalculator.calculate(cat);

      set('grams', format(result.grams));
      set('meta', `${format(result.energy)} kcal / ${language === 'en' ? 'day' : 'gün'} · RER ${format(result.rer)} kcal × ${format(MamaCalculator.number(cat.factor))}`);
      set('ideal-note', t(result.hasIdeal ? 'Hesaplamada ideal ağırlık esas alınır.' : 'İdeal ağırlık belirtilmedi. Mevcut ağırlık esas alınır.'));
      if (cat.automatic) {
        set('portions', format(result.portions, 2));
        const lower = Math.floor(result.portions), upper = Math.ceil(result.portions), portion = MamaCalculator.number(cat.portion);
        set('rounding', `${language === 'en' ? 'Whole portions' : 'Tam porsiyon karşılığı'}: ${lower} ${t('porsiyon')} = ${format(lower * portion)} g${lower !== upper ? ` · ${upper} ${t('porsiyon')} = ${format(upper * portion)} g` : ''}.`);
      }
      document.getElementById(`${cat.id}-error`).textContent = '';
    } catch (error) {

      set('grams', '—'); set('meta', t('Hesaplamak için aşağıdaki değeri düzelt.')); set('portions', '—'); set('rounding', '');
      document.getElementById(`${cat.id}-error`).textContent = t(error.message);
      const key = error.message.startsWith('Bir porsiyon') ? 'portion' : error.message.startsWith('Mama') ? 'calories' : error.message.startsWith('İdeal') ? 'ideal' : error.message.startsWith('RER') ? 'factor' : 'weight';
      card.querySelector(`[name="${key}"]`).setAttribute('aria-invalid', 'true');
    }
  }
}
document.getElementById('cats').addEventListener('input', event => {
  if (!event.target.name) return;
  const cat = cats.find(cat => cat.id === event.target.closest('.cat').id);
  cat[event.target.name] = event.target.name === 'automatic' ? event.target.value === 'true' : event.target.value;

  saveSettings();
  update();
});
document.getElementById('language').addEventListener('change', event => { language = event.target.value === 'en' ? 'en' : 'tr'; saveSettings(); render(); });
render();
