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
    document.getElementById('save-status').textContent = t('Bu cihazda otomatik kaydedilir.');
  } catch {
    document.getElementById('save-status').textContent = t('Bu tarayıcıda kayıt yapılamadı.');
  }
}
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let manualTheme = themeChoice !== null;
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const toggle = document.getElementById('theme-toggle');
  const label = language === 'en' ? (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode') : (theme === 'dark' ? 'Açık moda geç' : 'Koyu moda geç');
  toggle.setAttribute('aria-label', label); toggle.title = label;
  toggle.querySelectorAll('[data-theme-icon]').forEach(icon => { icon.toggleAttribute('hidden', icon.dataset.themeIcon === theme); });
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#121212' : '#f2f3f7';
}
setTheme(themeChoice || (systemTheme.matches ? 'dark' : 'light'));
systemTheme.addEventListener('change', event => { if (!manualTheme) setTheme(event.matches ? 'dark' : 'light'); });
document.getElementById('theme-toggle').addEventListener('click', () => {
  manualTheme = true;
  themeChoice = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(themeChoice);
  saveSettings();
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
let activeId = cats[0]?.id || null;
let nextCatId = cats.length + 1;
const translations = {
'Bu kedi profilini kaldırmak ister misin?':'Would you like to remove this cat profile?','Evet':'Yes','Hayır':'No','Kedi profili kaldırıldı.':'Cat profile removed.',
'Kedi ekle':'Add cat','Tam gram: 3280.':'Whole grams: 3280.','Paketteki kcal/kg.':'Package kcal/kg.','Boşsa mevcut ağırlık.':'Blank uses current weight.','Bilgi':'Information','Bu cihazda otomatik kaydedilir.':'Saved automatically on this device.','Profili kaldır':'Remove profile','Hesaplama ayrıntısı':'Calculation details',
'Yalnızca kediler için. RER, dinlenme enerji ihtiyacıdır. Günlük enerji = RER × seçilen çarpan.':'For cats only. RER is resting energy requirement. Daily energy = RER × selected multiplier.',
'Tam gram gir; nokta veya virgül kullanma. Örn. 3280.':'Enter whole grams without dots or commas, e.g. 3280.',
'Ağırlığı tam gram olarak gir. Örn. 3280.':'Enter weight in whole grams, e.g. 3280.',
'Hedef ağırlığı tam gram olarak gir. Örn. 4000.':'Enter target weight in whole grams, e.g. 4000.',
'Mama paketindeki kcal/kg değerini gir.':'Enter the kcal/kg value from the food packaging.',
'Bilgiler bu tarayıcıda otomatik kaydedilir.':'Changes are saved automatically in this browser.',
'Bu tarayıcıda kayıt yapılamadı.':'Changes could not be saved in this browser.',

'Kedi adı':'Cat name','Besleme yöntemi':'Feeding method','Otomat':'Automatic feeder','Elle besleme':'Manual feeding','Günlük mama miktarı':'Daily food amount','gram / gün':'grams / day','Mevcut ağırlık':'Current weight','RER katsayısı':'RER multiplier','Hedef ağırlık (isteğe bağlı)':'Target weight (optional)','Mama adı':'Food name','Mamanın enerji değeri':'Food energy','Otomat porsiyonu':'Feeder portion','Günlük porsiyon':'Daily portions','porsiyon':'portions','Açık':'Light','Koyu':'Dark',
'0,8× · Kilo verme':'0.8× · Weight loss','1× · Koruma / düşük aktivite':'1× · Maintenance / low activity','1,2× · Kısır yetişkin':'1.2× · Neutered adult','1,4× · Kısır olmayan yetişkin':'1.4× · Intact adult','1,8× · Kilo alma':'1.8× · Weight gain','2× · Yavru, 4–12 ay':'2× · Kitten, 4–12 months','2,5× · Yavru, 0–4 ay':'2.5× · Kitten, 0–4 months',
'Hesaplamada hedef ağırlık kullanılır.':'Calculation uses target weight.','Boş bırakırsan mevcut ağırlık kullanılır.':'Leave blank to use current weight.','Hesaplamak için aşağıdaki değeri düzelt.':'Enter a valid value below to calculate.','Ağırlık ve mama enerjisini gir.':'Enter weight and food energy.','Otomat porsiyonunu gir.':'Enter the feeder portion.',
'Ağırlık 0’dan büyük, en fazla 30.000 gram olmalı.':'Weight must be above 0 and at most 30,000 grams.','RER katsayısı 0’dan büyük, en fazla 5 olmalı.':'RER multiplier must be above 0 and at most 5.','Mama enerjisi 0’dan büyük, en fazla 10.000 kcal/kg olmalı.':'Food energy must be above 0 and at most 10,000 kcal/kg.','İdeal ağırlık 0’dan büyük, en fazla 30.000 gram olmalı.':'Ideal weight must be above 0 and at most 30,000 grams.','Bir porsiyon 0’dan büyük, en fazla 100 g olmalı.':'Feeder portion must be above 0 and at most 100 g.'
};
const t = text => language === 'en' ? translations[text] || text : text;
function translatePage() {
  document.documentElement.lang = language;
  document.title = language === 'en' ? 'Cat Food Calculator' : 'Kedi Mama Hesabı';
  document.getElementById('language').value = language;
  document.getElementById('copyright').textContent = `© ${new Date().getFullYear()} ${language === 'en' ? 'Cat Food Calculator' : 'Kedi Mama Hesabı'}`;
  setTheme(document.documentElement.dataset.theme);
  for (const [id, text] of [['delete-question', 'Bu kedi profilini kaldırmak ister misin?'], ['delete-no', 'Hayır'], ['delete-yes', 'Evet']]) document.getElementById(id).textContent = t(text);
  document.getElementById('cats').setAttribute('aria-label', language === 'en' ? 'Cat feeding settings' : 'Kedi beslenme ayarları');
  const walker = document.createTreeWalker(document.getElementById('cats'), NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode, text = node.textContent.trim();
    if (translations[text]) node.textContent = node.textContent.replace(text, t(text));
  }
}
const format = (value, digits = 1) => value.toLocaleString(language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: digits });
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const factors = [['0.8', '0,8× · Kilo verme'], ['1', '1× · Koruma / düşük aktivite'], ['1.2', '1,2× · Kısır yetişkin'], ['1.4', '1,4× · Kısır olmayan yetişkin'], ['1.8', '1,8× · Kilo alma'], ['2', '2× · Yavru, 4–12 ay'], ['2.5', '2,5× · Yavru, 0–4 ay']];
const infoIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/></svg>';
const catIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10V3l6 4h4l6-4v7c1 2 1 5-1 7-3 4-11 4-14 0-2-2-2-5-1-7Z"/><path d="M8 12h.1m7.8 0h.1M10 15l2 1 2-1m-2 1v2M3 14l4 1m10 0 4-1"/></svg>';
function info(label, content) {
  return `<details class="field-info"><summary aria-label="${escapeHtml(t(label))} — ${t('Bilgi')}">${infoIcon}</summary><div class="info-content">${content}</div></details>`;
}
function input(cat, key, label, unit, wide = false) {
  const id = `${cat.id}-${key}`;
  const weight = key === 'weight' || key === 'ideal';
  const hint = key === 'ideal' ? 'Boşsa mevcut ağırlık.' : weight ? 'Tam gram: 3280.' : key === 'calories' ? 'Paketteki kcal/kg.' : '';
  return `<div class="field${wide ? ' wide' : ''}"><div class="label-row"><label for="${id}">${label}</label>${hint ? info(label, `<p id="${id}-hint">${t(hint)}</p>`) : ''}</div><div class="input-wrap"><input id="${id}" name="${key}" value="${escapeHtml(cat[key])}" ${key === 'food' ? 'maxlength="200"' : `inputmode="${weight ? 'numeric' : 'decimal'}" maxlength="12"`} autocomplete="off"${hint ? ` aria-describedby="${id}-hint"` : ''}>${unit ? `<span class="unit">${unit}</span>` : ''}</div><p class="error" id="${id}-error" role="alert"></p></div>`;
}
function catName(cat, index) { return cat.name.trim() || `${language === 'en' ? 'Cat' : 'Kedi'} ${index + 1}`; }
function renderTabs() {
  document.getElementById('cat-tabs').innerHTML = cats.map((cat, index) => `<button type="button" role="tab" id="tab-${cat.id}" aria-controls="${cat.id}" aria-selected="${cat.id === activeId}" tabindex="${cat.id === activeId ? 0 : -1}" data-cat="${cat.id}" data-color="${cat.color}" aria-label="${escapeHtml(catName(cat, index))}" title="${escapeHtml(catName(cat, index))}">${catIcon}${cats.length > 1 ? `<span>${index + 1}</span>` : ''}</button>`).join('');
  document.getElementById('cat-tabs').setAttribute('aria-label', language === 'en' ? 'Cats' : 'Kediler');
  document.getElementById('add-cat').setAttribute('aria-label', t('Kedi ekle'));
  document.getElementById('add-cat').title = t('Kedi ekle');
  document.getElementById(`tab-${activeId}`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
function activateCat(id) {
  activeId = id;
  renderTabs();
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
  <div class="result" role="status" aria-atomic="true"><span class="result-label">Günlük mama miktarı</span><div class="result-main"><strong data-result="grams">—</strong><span>gram / gün</span></div><div class="result-meta" data-result="meta"></div></div>
  <div class="fields"><div class="field-grid">
    ${input(cat, 'weight', 'Mevcut ağırlık', 'g', true)}
    <div class="field wide"><div class="label-row"><label for="${cat.id}-factor">RER katsayısı</label>${info('RER katsayısı', `<p>${t('Yalnızca kediler için. RER, dinlenme enerji ihtiyacıdır. Günlük enerji = RER × seçilen çarpan.')}</p><p>RER = 70 × kg<sup>${format(0.75, 2)}</sup></p><p data-result="reference"></p>`)}</div><div class="input-wrap"><select id="${cat.id}-factor" name="factor">${factors.map(([value, label]) => `<option value="${value}"${cat.factor === value ? ' selected' : ''}>${label}</option>`).join('')}</select></div></div>
    <div class="field wide ideal-field">${input(cat, 'ideal', 'Hedef ağırlık (isteğe bağlı)', 'g')}</div>
    <div class="field wide">${input(cat, 'calories', 'Mamanın enerji değeri', 'kcal / kg')}</div>
  </div>
  <div class="portion-box"${cat.automatic ? '' : ' hidden'}>${input(cat, 'portion', 'Otomat porsiyonu', 'g')}<div class="portion-result"><span class="portion-label">Günlük porsiyon</span><div class="portion-value"><strong data-result="portions">—</strong> porsiyon</div></div><p class="portion-rounding" data-result="rounding"></p></div>
  </div>
  <button type="button" class="delete-cat">Profili kaldır</button>
</article>`).join('');
translatePage();
renderTabs();
document.getElementById('save-status').textContent = t('Bu cihazda otomatik kaydedilir.');
update();
}
function update() {
  for (const cat of cats) {
    const card = document.getElementById(cat.id);
    card.querySelector('.portion-box').hidden = !cat.automatic;
    const set = (key, value) => { const el = card.querySelector(`[data-result="${key}"]`); if (el) el.textContent = value; };
    card.querySelector('.ideal-field').hidden = !['0.8', '1.8'].includes(cat.factor);
    card.querySelectorAll('.error').forEach(el => { el.textContent = ''; });
    card.querySelectorAll('[aria-invalid]').forEach(el => {
      el.removeAttribute('aria-invalid');
      const hint = document.getElementById(`${el.id}-hint`);
      if (hint) el.setAttribute('aria-describedby', hint.id);
      else el.removeAttribute('aria-describedby');
    });
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
  }
  update();
});
const deleteDialog = document.getElementById('delete-dialog');
let pendingDeleteId = null;
document.getElementById('cats').addEventListener('click', event => {
  if (!event.target.closest('.delete-cat')) return;
  pendingDeleteId = event.target.closest('.cat').id;
  deleteDialog.returnValue = 'cancel';
  deleteDialog.showModal();
});
deleteDialog.addEventListener('close', () => {
  const id = pendingDeleteId;
  pendingDeleteId = null;
  if (deleteDialog.returnValue !== 'delete') return;
  const index = cats.findIndex(cat => cat.id === id);
  if (index < 0) return;
  cats.splice(index, 1);
  activeId = cats[Math.min(index, cats.length - 1)]?.id || null;
  render(); saveSettings();
  document.getElementById('action-status').textContent = t('Kedi profili kaldırıldı.');
  (document.getElementById(`tab-${activeId}`) || document.getElementById('add-cat')).focus();
});

document.getElementById('cat-tabs').addEventListener('click', event => {
  const tab = event.target.closest('[data-cat]');
  if (tab) { activateCat(tab.dataset.cat); document.getElementById(`tab-${activeId}`).focus(); }
});
document.getElementById('cat-tabs').addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const index = cats.findIndex(cat => cat.id === activeId);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? cats.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + cats.length) % cats.length;
  activateCat(cats[next].id);
  document.getElementById(`tab-${activeId}`).focus();
});
document.getElementById('add-cat').addEventListener('click', () => {
  const color = palette.find(color => !cats.some(cat => cat.color === color)) || palette[cats.length % palette.length];
  const cat = newCat(`cat${nextCatId++}`, color);
  cats.push(cat); activeId = cat.id;
  document.getElementById('action-status').textContent = '';
  render(); saveSettings();
  document.getElementById(`${cat.id}-name`).focus();
});
document.addEventListener('click', event => {
  document.querySelectorAll('.field-info[open]').forEach(details => {
    if (!details.contains(event.target)) details.open = false;
  });
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const details = document.querySelector('.field-info[open]');
  if (details) { details.open = false; details.querySelector('summary').focus(); }
});

document.getElementById('language').addEventListener('change', event => { language = event.target.value === 'en' ? 'en' : 'tr'; saveSettings(); render(); });
render();
