'use strict';
const storageKey = 'mama-payi-v3';
let saved = {};
try {
  const value = JSON.parse(localStorage.getItem(storageKey));
  if (value && typeof value === 'object' && !Array.isArray(value)) saved = value;
} catch {}
let language = ['tr', 'en', 'de', 'es'].includes(saved.language) ? saved.language : 'tr';
const t = text => window.PatiLocales[language]?.[text] || text;
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
function setTheme(theme, updateBrowserColor = true) {
  document.documentElement.dataset.theme = theme;
  const toggle = document.getElementById('theme-toggle');
  const label = t(theme === 'dark' ? 'Açık moda geç' : 'Koyu moda geç');
  toggle.setAttribute('aria-label', label); toggle.title = label;
  toggle.setAttribute('aria-checked', String(theme === 'dark'));
  if (updateBrowserColor) document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#121212' : '#f2f3f7';
}
setTheme(themeChoice || 'light');
document.getElementById('theme-toggle').addEventListener('click', async event => {
  const button = event.currentTarget;
  haptic();
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
const catTypes = [
  ['tabby','Tekir','Brown Tabby'], ['ginger','Sarman','Ginger'], ['tuxedo','Smokin','Tuxedo'], ['calico','Üç Renkli','Calico'],
  ['gray','Gri','Gray'], ['white','Beyaz','White'], ['siamese','Siyam','Siamese'], ['black','Siyah','Black'],
  ['silver','Gümüş Tekir','Silver Tabby'], ['tortie','Bağa','Tortoiseshell'], ['ragdoll','Ragdoll','Ragdoll'], ['bicolor','Sarman Beyaz','Ginger & White']
];
const regionalCatTypes = [['angora','Ankara Kedisi'], ['van','Van Kedisi'], ['anatolian','Anadolu Kedisi']];
const famousCatTypes = [['garfield','Garfield'], ['puss','Çizmeli Kedi'], ['grumpy','Grumpy Cat'], ['smudge','Smudge'], ['bingus','Bingus'], ['beluga','Beluga']];
const appearanceTypes = [...catTypes, ...regionalCatTypes, ...famousCatTypes];
const newCat = (id, color = 'blue', appearance = 'tabby') => ({ id, color, appearance, name: '', weight: '', ideal: '', factor: '1', food: '', calories: '', automatic: false, portion: '' });
const storedCats = Array.isArray(saved.cats) ? saved.cats.filter(cat => cat && typeof cat === 'object') : [];
let cats = (Array.isArray(saved.cats) ? storedCats : [newCat('cat1')]).map((stored, index) => {
  const cat = newCat(`cat${index + 1}`, palette[index % palette.length], catTypes[index % catTypes.length][0]);
  for (const key of Object.keys(cat)) {
    if (key === 'id') continue;
    const limit = key === 'food' ? 200 : key === 'name' ? 60 : 12;
    if (key === 'automatic' ? typeof stored[key] === 'boolean' : typeof stored[key] === 'string' && stored[key].length <= limit) cat[key] = stored[key];
  }
  if (!appearanceTypes.some(type => type[0] === cat.appearance)) cat.appearance = catTypes[index % catTypes.length][0];
  if (!palette.includes(cat.color)) cat.color = palette[index % palette.length];
  if (!['0.8', '1', '1.2', '1.4', '1.8', '2', '2.5'].includes(cat.factor)) cat.factor = '1';
  return cat;
});
if (!cats.length) cats.push(newCat('cat1'));
const defaultCatId = cats[0].id;
const canRemove = id => id === activeId && id !== defaultCatId && cats.some(cat => cat.id === id);
let activeId = cats[0]?.id || null;
let nextCatId = cats.length + 1;
function translatePage() {
  document.documentElement.lang = language;
  document.title = t('Pati Gram · Kedi Mama Hesabı');
  document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
  document.getElementById('copyright').textContent = `© ${new Date().getFullYear()} Vivid Creative Works · ${t('Açık kaynak bir hobi projesi.')}`;
  document.querySelector('#language summary').setAttribute('aria-label', t('Dil'));
  document.querySelector('#language summary').title = t('Dil');
  document.querySelector('.language-menu').setAttribute('aria-label', t('Dil'));
  setTheme(document.documentElement.dataset.theme);
  document.getElementById('install-title').textContent = t('Ana ekrana ekle');
  const installGuides = [
    ['iPhone · Safari', 'Pati Gram’ı Safari’de aç. Paylaş’a (veya Sayfa Menüsü → Paylaş) dokun → Ana Ekrana Ekle. Görünüyorsa “Web Uygulaması Olarak Aç” seçeneğini açık tut ve Ekle’ye dokun.'],
    ['iPhone / iPad · Chrome', 'Pati Gram’ı Chrome’da aç. Adres çubuğunun yanındaki Paylaş → Ana Ekrana Ekle → Ekle yolunu izle. Görünüyorsa “Web Uygulaması Olarak Aç” seçeneğini açık tut.'],
    ['Android · Chrome', 'Pati Gram’ı Chrome’da aç. ⋮ → Yükle ve kısayol oluştur → Yükle yolunu izle ve ekrandaki adımları tamamla. Sürüme göre “Ana ekrana ekle” yazabilir.']
  ];
  const installSources = ['https://support.apple.com/en-gb/guide/iphone/iphea86e5236/ios', 'https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DiOS', 'https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid'];
  document.getElementById('install-instructions').innerHTML = installGuides.map(([title, body], i) => `<section><h3>${title}</h3><p>${t(body)}</p><a href="${installSources[i]}" target="_blank" rel="noopener noreferrer">${t('Resmi rehber')} ↗</a></section>`).join('') + `<p class="install-note">${t('Menü adları sistem sürümüne göre değişebilir. iPhone’da seçenek yoksa Safari’yi dene. Ana ekran uygulaması ayrı depolama kullanabilir; profillerini yeniden girmen gerekebilir.')}</p>`;
  for (const [id, text] of [['delete-question', 'Bu kedi profilini kaldırmak ister misin?'], ['delete-no', 'Hayır'], ['delete-yes', 'Evet']]) document.getElementById(id).textContent = t(text);
  document.getElementById('cat-actions-hint').textContent = t('Profil seçin; görünümünü değiştirmek için seçili kediye tekrar dokunun. Profili formun altından kaldırabilirsiniz. İlk profil korunur.');
  document.getElementById('remove-cat').textContent = t('Kedi profilini kaldır');
  document.getElementById('cats').setAttribute('aria-label', t('Kedi beslenme ayarları'));
  const walker = document.createTreeWalker(document.getElementById('cats'), NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode, text = node.textContent.trim();
    if (text) node.textContent = node.textContent.replace(text, t(text));
  }
}
const format = (value, digits = 1) => value.toLocaleString({tr:'tr-TR', en:'en-US', de:'de-DE', es:'es-ES'}[language], { maximumFractionDigits: digits });
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const factors = [['0.8', '0,8× · Kilo verme'], ['1', '1× · Düşük aktivite'], ['1.2', '1,2× · Kısır yetişkin'], ['1.4', '1,4× · Kısır olmayan yetişkin'], ['2.5', '2,5× · Büyüme dönemi']];
const infoIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/></svg>';
function catIcon(cat) {
  if (regionalCatTypes.some(type => type[0] === cat.appearance)) {
    return `<svg class="cat-portrait" viewBox="100 100 1054 1054" aria-hidden="true"><image href="cat-${cat.appearance}.png" width="1254" height="1254"/></svg>`;
  }
  const famous = famousCatTypes.findIndex(type => type[0] === cat.appearance);
  if (famous >= 0) {
    const boxes = ['0 180 410 430', '410 100 485 510', '850 205 404 405', '0 635 425 480', '425 635 425 480', '840 635 414 480'];
    const clips = ['0px 180px, 410px 180px, 410px 610px, 0px 610px', '410px 100px, 900px 100px, 900px 220px, 850px 300px, 850px 610px, 410px 610px', '900px 205px, 1254px 205px, 1254px 610px, 850px 610px, 850px 360px', '0px 735px, 425px 735px, 425px 1115px, 0px 1115px', '425px 635px, 855px 635px, 855px 870px, 775px 980px, 775px 1115px, 510px 1115px, 510px 1000px, 425px 870px', '865px 710px, 1254px 710px, 1254px 1115px, 825px 1115px, 825px 915px, 865px 850px'];
    return `<svg class="cat-portrait" viewBox="${boxes[famous]}" aria-hidden="true"><image href="famous-cat-portraits.png" width="1254" height="1254" style="clip-path:polygon(${clips[famous]})"/></svg>`;
  }
  const index = Math.max(0, catTypes.findIndex(type => type[0] === cat.appearance));
  // The generated sheet is not a uniform grid; center each portrait on its visible bounds.
  const origins = [[6,146],[315,146],[618,146],[926,145],[5,473],[312,474],[619,473],[926,474],[6,796],[313,796],[619,797],[927,797]];
  return `<svg class="cat-portrait" viewBox="${origins[index].join(' ')} 320 320" aria-hidden="true"><image href="cat-portraits.png?v=3" width="1254" height="1254"/></svg>`;
}
const customizeIcon = '<span class="customize-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15z"/></svg></span>';
function info(label, content) {
  return `<details class="field-info"><summary aria-label="${escapeHtml(t(label))} — ${t('Bilgi')}">${infoIcon}</summary><div class="info-content">${content}</div></details>`;
}
function input(cat, key, label, unit, wide = false) {
  const id = `${cat.id}-${key}`;
  const weight = key === 'weight' || key === 'ideal';
  const hint = key === 'calories' ? 'Pakette “metabolize edilebilir enerji” veya “ME” satırındaki kcal/kg değerini bul.' : '';
  return `<div class="field${wide ? ' wide' : ''}"><div class="label-row"><label for="${id}">${label}</label>${hint ? info(label, `<p id="${id}-hint">${t(hint)}</p><p>${t('Örnek: 350 kcal/100 g yazıyorsa 3500 gir.')}</p>`) : ''}</div><div class="input-wrap"><input id="${id}" name="${key}" value="${escapeHtml(cat[key])}" ${key === 'food' ? 'maxlength="200"' : `inputmode="${weight ? 'numeric' : 'decimal'}" maxlength="12"`} autocomplete="off"${hint ? ` aria-describedby="${id}-hint"` : ''}>${unit ? `<span class="unit">${unit}</span>` : ''}</div><p class="error" id="${id}-error" role="alert"></p></div>`;
}
function catName(cat, index) { return cat.name.trim() || `${t('Kedi')} ${index + 1}`; }
function updateRailEdges() {
  const rail = document.getElementById('cat-tabs');
  const bounds = rail.getBoundingClientRect();
  rail.querySelectorAll('.profile-tab').forEach(profile => {
    const box = profile.getBoundingClientRect();
    profile.classList.toggle('outside-rail', box.left < bounds.left + 2 || box.right > bounds.right - 2);
  });
}
let railSettleTimer;
let railPointerDown = false;
function settleRail() {
  clearTimeout(railSettleTimer);
  railSettleTimer = setTimeout(() => {
    if (railPointerDown) return;
    const rail = document.getElementById('cat-tabs');
    const bounds = rail.parentElement.getBoundingClientRect();
    const center = bounds.left + bounds.width / 2;
    const tabs = [...rail.querySelectorAll('[data-cat]')];
    const distance = tab => { const box = tab.getBoundingClientRect(); return Math.abs(box.left + box.width / 2 - center); };
    const nearest = tabs.reduce((best, tab) => !best || distance(tab) < distance(best) ? tab : best, null);
    if (!nearest || distance(nearest) <= 1 && nearest.dataset.cat === activeId) return;
    activateCat(nearest.dataset.cat);
  }, 180);
}
document.getElementById('cat-tabs').addEventListener('scroll', () => { updateRailEdges(); settleRail(); }, { passive: true });
document.getElementById('cat-tabs').addEventListener('pointerdown', () => { railPointerDown = true; clearTimeout(railSettleTimer); });
for (const type of ['pointerup', 'pointercancel']) window.addEventListener(type, () => {
  if (!railPointerDown) return;
  railPointerDown = false; settleRail();
});
new ResizeObserver(updateRailEdges).observe(document.getElementById('cat-tabs'));
function centerActiveTab() {
  clearTimeout(railSettleTimer);
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
  rail.parentElement.classList.toggle('multiple', cats.length > 0);
  document.getElementById('cat-tabs').innerHTML = cats.map((cat, index) => `<div class="profile-tab outside-rail" role="presentation"><button type="button" role="tab" id="tab-${cat.id}" aria-controls="${cat.id}" aria-selected="${cat.id === activeId}" tabindex="${cat.id === activeId ? 0 : -1}" data-cat="${cat.id}" data-color="${cat.color}" aria-label="${escapeHtml(catName(cat, index))}" title="${escapeHtml(catName(cat, index))}" aria-describedby="cat-actions-hint" aria-keyshortcuts="Delete Shift+F10">${catIcon(cat)}${customizeIcon}</button><span class="profile-name" aria-hidden="true" title="${escapeHtml(catName(cat, index))}">${escapeHtml(catName(cat, index))}</span></div>`).join('');
  document.getElementById('cat-tabs').setAttribute('aria-label', t('Kediler'));
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
  <p class="estimate-note">${t('Bu hesap bir başlangıç tahminidir; veteriner değerlendirmesinin yerini tutmaz. Kilo verme, yavruluk veya hastalıkta beslenme planını veterinerinle belirle.')}</p>
  <div class="fields"><div class="field-grid">
    ${input(cat, 'weight', 'Mevcut ağırlık (g)', '', true)}
    <div class="field wide"><div class="label-row"><label for="${cat.id}-factor">RER katsayısı</label>${info('RER katsayısı', `<p>${t('American Animal Hospital Association (AAHA): RER = 70 × kg⁰·⁷⁵; günlük enerji = RER × katsayı.')}</p><p>${t('RER, dinlenirken gereken enerjidir. Katsayıyı kedinin yaşına ve durumuna göre seç.')}</p><p>${t('AAHA aralıkları: kısır yetişkin 1,2–1,4×; kısır olmayan 1,4–1,6×. Listede alt sınırlar kullanılır; büyüme dönemi 2,5×.')}</p><p>${t('0,8× kilo verme hesabı ideal ağırlık içindir. Hedef boşsa mevcut ağırlıkla ön tahmin yapılır; ideal ağırlığı veterinerinle belirle.')}</p><p data-result="reference"></p><p>${t('Bu bir başlangıç tahminidir; miktarı kilo takibi ve veteriner önerisiyle ayarla.')}</p><a href="https://www.aaha.org/wp-content/uploads/globalassets/02-guidelines/2021-nutrition-and-weight-management/resourcepdfs/nutritiongl_box1.pdf" target="_blank" rel="noopener noreferrer">${t('AAHA 2021 · Enerji gereksinimi hesabı (Kutu 1)')}</a>`)}</div><div class="input-wrap"><select id="${cat.id}-factor" name="factor">${!factors.some(([value]) => value === cat.factor) ? `<option value="${escapeHtml(cat.factor)}" selected disabled>${escapeHtml(cat.factor)}× · ${t('Önceki seçim — yeniden seçin')}</option>` : ''}${factors.map(([value, label]) => `<option value="${value}"${cat.factor === value ? ' selected' : ''}>${label}</option>`).join('')}</select></div><p class="error" id="${cat.id}-factor-error" role="alert"></p></div>
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
    setPanelVisible(card.querySelector('.ideal-field'), cat.factor === '0.8');
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
      set('meta', `${format(result.energy)} kcal / ${t('gün')} · RER ${format(result.rer)} kcal × ${format(MamaCalculator.number(cat.factor))}`);
      set('reference', `${t('Hesapta kullanılan ağırlık')}: ${format(result.referenceWeight * 1000)} g`);
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
        set('rounding', `${t('Günlük miktardan farkı')}: ${difference(lower)}${lower !== upper ? ` · ${difference(upper)}` : ''}`);
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
const appearanceDialog = document.getElementById('appearance-dialog');
function openAppearance() {
  const cat = cats.find(cat => cat.id === activeId);
  if (!cat || appearanceDialog.open) return;
  document.getElementById('appearance-title').textContent = t('Kedi görünümü');
  document.getElementById('appearance-close').textContent = t('Tamam');
  appearanceDialog.dataset.color = cat.color;
  const options = types => types.map(type => `<button type="button" data-appearance="${type[0]}" aria-pressed="${cat.appearance === type[0]}">${catIcon({appearance:type[0]})}<span>${escapeHtml(t(type[1]))}</span></button>`).join('');
  document.getElementById('appearance-options').innerHTML = options(catTypes) + options(regionalCatTypes) + `<h3 class="appearance-group">${t('Ünlü Kediler')}</h3>` + options(famousCatTypes);
  appearanceDialog.showModal();
  appearanceDialog.querySelector('[aria-pressed="true"]').focus();
}
document.getElementById('appearance-options').addEventListener('click', async event => {
  const option = event.target.closest('[data-appearance]');
  const cat = cats.find(cat => cat.id === activeId);
  if (!option || !cat) return;
  cat.appearance = option.dataset.appearance;
  saveSettings(); haptic(); appearanceDialog.close();
  const tab = document.getElementById(`tab-${cat.id}`);
  const old = tab.querySelector('.cat-portrait');
  if (!reducedMotion.matches) await old.animate({opacity:[1,0]}, {duration:100,fill:'forwards'}).finished.catch(() => {});
  if (!tab.isConnected) return;
  old.remove(); tab.insertAdjacentHTML('afterbegin', catIcon(cat));
  if (!reducedMotion.matches) tab.querySelector('svg').animate({opacity:[0,1]}, {duration:180,easing:'ease-out'});
});
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
  document.getElementById('delete-done').textContent = t('Tamam');
  deleteDialog.setAttribute('aria-labelledby', 'delete-success-message');
  document.getElementById('delete-done').focus();
  deleteSuccessTimer = setTimeout(() => deleteDialog.close(), 900);
});
deleteDialog.addEventListener('close', () => {
  if (deleteDialog.open) return;
  clearTimeout(deleteSuccessTimer);
  pendingDeleteId = null;
  if (!document.getElementById('delete-success').hidden) {
    (document.getElementById(`tab-${activeId}`) || document.getElementById('add-cat')).focus();
  }
});

document.getElementById('cat-tabs').addEventListener('click', event => {
  const tab = event.target.closest('[data-cat]');
  if (!tab) return;
  if (tab.dataset.cat === activeId) { openAppearance(); return; }
  haptic(); activateCat(tab.dataset.cat); tab.focus({ preventScroll: true });
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
  const cat = newCat(`cat${nextCatId++}`, color, catTypes[cats.length % catTypes.length][0]);
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
  document.querySelectorAll('.field-info[open], #language[open]').forEach(details => {
    if (!details.contains(event.target)) details.open = false;
  });
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const details = document.querySelector('.field-info[open], #language[open]');
  if (details) { details.open = false; details.querySelector('summary').focus(); }
});

document.getElementById('cats').addEventListener('change', event => {
  if (event.target.matches('select')) haptic();
});
document.getElementById('language').addEventListener('click', event => {
  const option = event.target.closest('[data-language]');
  if (!option) return;
  haptic(); language = ['tr', 'en', 'de', 'es'].includes(option.dataset.language) ? option.dataset.language : 'tr';
  document.getElementById('language').open = false;
  saveSettings(); render(); document.querySelector('#language summary').focus();
});
render();
