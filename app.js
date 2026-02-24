const KEY_PRODUCTS = 'healthytime_products';
const KEY_LABELS = 'healthytime_labels';
const KEY_SETTINGS = 'healthytime_settings';

let lang = 'ar';
const $ = (s) => document.querySelector(s);
const products = load(KEY_PRODUCTS, []);
const labels = load(KEY_LABELS, []);
const settings = load(KEY_SETTINGS, {
  brandName: 'مطعم وقت الصحة | Healthy Time',
  logoUrl: '',
  primaryColor: '#0f9f7a',
  qrLink: '',
  role: 'admin',
  cardStyle: 'classic'
});

function load(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  $('#' + pageId).classList.add('active');
  document.querySelector(`.tab[data-page="${pageId}"]`).classList.add('active');
}

document.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => switchPage(btn.dataset.page)));

function seed() {
  if (products.length) return;
  products.push({
    id: crypto.randomUUID(),
    nameAr: 'تشكن راب',
    nameEn: 'Chicken Wrap',
    category: 'ساندويتشات',
    kcal: 230,
    protein: 10,
    carbs: 37,
    fat: 8,
    fiber: 4,
    servingSize: '3/2 كوب (55 غرام)',
    notes: '',
    active: true
  });
  save(KEY_PRODUCTS, products);
}

function renderProductsTable() {
  const q = ($('#searchInput').value || '').toLowerCase();
  const cat = $('#categoryFilter').value;
  const list = products.filter(p => (!cat || p.category === cat) && `${p.nameAr} ${p.nameEn} ${p.category}`.toLowerCase().includes(q));

  const tpl = $('#productsTableTemplate').content.cloneNode(true);
  const tbody = tpl.querySelector('tbody');
  list.forEach((p, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${p.nameAr}<br><small>${p.nameEn}</small></td>
      <td>${p.category}</td>
      <td>${p.kcal}</td>
      <td><span class="badge ${p.active ? 'active' : 'hidden'}">${p.active ? 'نشط' : 'مخفي'}</span></td>
      <td>
        <button onclick="editProduct('${p.id}')">تعديل</button>
        <button onclick="toggleProduct('${p.id}')">${p.active ? 'إخفاء' : 'تفعيل'}</button>
        <button onclick="deleteProduct('${p.id}')">حذف</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  $('#productsTableWrap').innerHTML = '';
  $('#productsTableWrap').appendChild(tpl);

  const cats = [...new Set(products.map(p => p.category))];
  $('#categoryFilter').innerHTML = `<option value="">كل التصنيفات</option>` + cats.map(c => `<option ${c === cat ? 'selected' : ''} value="${c}">${c}</option>`).join('');

  $('#labelProduct').innerHTML = products.filter(p => p.active).map(p => `<option value="${p.id}">${lang === 'ar' ? p.nameAr : p.nameEn}</option>`).join('');

  renderPreview();
}

function populateForm(p) {
  $('#productId').value = p?.id || '';
  $('#nameAr').value = p?.nameAr || '';
  $('#nameEn').value = p?.nameEn || '';
  $('#category').value = p?.category || '';
  $('#kcal').value = p?.kcal || '';
  $('#protein').value = p?.protein || '';
  $('#carbs').value = p?.carbs || '';
  $('#fat').value = p?.fat || '';
  $('#fiber').value = p?.fiber || '';
  $('#servingSize').value = p?.servingSize || '';
  $('#notes').value = p?.notes || '';
}

$('#productForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = $('#productId').value || crypto.randomUUID();
  const data = {
    id,
    nameAr: $('#nameAr').value.trim(),
    nameEn: $('#nameEn').value.trim(),
    category: $('#category').value.trim(),
    kcal: Number($('#kcal').value),
    protein: Number($('#protein').value),
    carbs: Number($('#carbs').value),
    fat: Number($('#fat').value),
    fiber: Number($('#fiber').value),
    servingSize: $('#servingSize').value.trim(),
    notes: $('#notes').value.trim(),
    active: true
  };

  const idx = products.findIndex(p => p.id === id);
  if (idx > -1) products[idx] = { ...products[idx], ...data };
  else products.push(data);

  save(KEY_PRODUCTS, products);
  populateForm();
  renderProductsTable();
  switchPage('productsPage');
});

$('#formReset').onclick = () => populateForm();

window.editProduct = (id) => {
  const p = products.find(x => x.id === id);
  if (!p) return;
  populateForm(p);
  switchPage('entryPage');
};
window.toggleProduct = (id) => {
  const p = products.find(x => x.id === id);
  if (!p) return;
  p.active = !p.active;
  save(KEY_PRODUCTS, products);
  renderProductsTable();
};
window.deleteProduct = (id) => {
  const idx = products.findIndex(x => x.id === id);
  if (idx > -1) products.splice(idx, 1);
  save(KEY_PRODUCTS, products);
  renderProductsTable();
};

function renderPreview() {
  const product = products.find(p => p.id === $('#labelProduct').value);
  if (!product) { $('#labelPreview').innerHTML = '<p style="padding:8px">لا يوجد منتج</p>'; return; }

  const dailyValue = [
    { nameAr: 'الدهون الكلية', nameEn: 'Total Fat', val: `${product.fat} غرام`, dv: Math.round((product.fat / 70) * 100) },
    { nameAr: 'الكربوهيدرات الكلية', nameEn: 'Total Carbohydrate', val: `${product.carbs} غرام`, dv: Math.round((product.carbs / 275) * 100) },
    { nameAr: 'الألياف الغذائية', nameEn: 'Dietary Fiber', val: `${product.fiber} غرام`, dv: Math.round((product.fiber / 28) * 100) },
    { nameAr: 'بروتين', nameEn: 'Protein', val: `${product.protein} غرام`, dv: Math.round((product.protein / 50) * 100), strong: true }
  ];

  const b = $('#batch').value;
  const pr = $('#production').value;
  const ex = $('#expiry').value;
  const cardStyle = $('#cardStyle').value || 'classic';

  $('#labelPreview').innerHTML = `
    <div class="fact-card ${cardStyle}">
      <div class="fact-title">${lang === 'ar' ? 'الحقائق التغذوية' : 'Nutrition Facts'}</div>
      <div class="fact-servings">${lang === 'ar' ? 'عدد الحصص في العبوة' : 'Servings Per Container'} 8</div>
      <div class="fact-serving-size">
        <span class="serving-pill">${lang === 'ar' ? 'حجم الحصة' : 'Serving Size'}</span>
        <span class="serving-value">${product.servingSize}</span>
      </div>
      <div class="fact-subline">${lang === 'ar' ? 'الكمية لكل حصة غذائية' : 'Amount Per Serving'}</div>
      <div class="fact-kcal-row"><span>${lang === 'ar' ? 'السعرات الحرارية' : 'Calories'}</span><strong>${product.kcal}</strong></div>
      <div class="fact-dv">${lang === 'ar' ? '*نسبة الاحتياج اليومي %' : '*% Daily Value'}</div>
      <table class="fact-table">
        ${dailyValue.map(row => `<tr class="${row.strong ? 'strong' : ''}"><td class="dv">${Math.max(0, row.dv)}%</td><td class="name">${lang === 'ar' ? row.nameAr : row.nameEn}</td><td class="val">${row.val}</td></tr>`).join('')}
      </table>
      ${(b || pr || ex) ? `<div class="fact-meta">Batch: ${b || '-'} | Prod: ${pr || '-'} | Exp: ${ex || '-'}</div>` : ''}
      ${settings.qrLink ? `<div class="fact-meta">QR: ${settings.qrLink}</div>` : ''}
      <div class="fact-note">${settings.brandName}</div>
    </div>
  `;

  document.documentElement.style.setProperty('--primary', settings.primaryColor || '#0f9f7a');
}

function renderHistory() {
  $('#historyList').innerHTML = labels.map(l => `
    <div class="card" style="margin-bottom:.5rem">
      <strong>${l.productNameAr}</strong>
      <div style="font-size:.8rem">${new Date(l.createdAt).toLocaleString()} | Copies: ${l.copies}</div>
      <button onclick="loadCard('${l.id}')">تحميل البطاقة</button>
    </div>`).join('') || '<p>لا توجد بطاقات محفوظة</p>';
}

window.loadCard = (id) => {
  const l = labels.find(x => x.id === id);
  if (!l) return;
  $('#labelProduct').value = l.productId;
  $('#copies').value = l.copies;
  $('#batch').value = l.batch || '';
  $('#production').value = l.production || '';
  $('#expiry').value = l.expiry || '';
  $('#cardStyle').value = l.cardStyle || settings.cardStyle || 'classic';
  renderPreview();
  switchPage('cardsPage');
};

$('#saveLabel').onclick = () => {
  const p = products.find(x => x.id === $('#labelProduct').value);
  if (!p) return;
  labels.unshift({
    id: crypto.randomUUID(),
    productId: p.id,
    productNameAr: p.nameAr,
    createdAt: new Date().toISOString(),
    copies: Number($('#copies').value || 1),
    batch: $('#batch').value,
    production: $('#production').value,
    expiry: $('#expiry').value,
    cardStyle: $('#cardStyle').value
  });
  save(KEY_LABELS, labels);
  renderHistory();
};

$('#printOne').onclick = () => window.print();
$('#printBulk').onclick = () => {
  const copies = Math.max(1, Number($('#copies').value || 1));
  const html = $('#labelPreview').innerHTML;
  const w = window.open('', '_blank');
  w.document.write(`<style>body{font-family:Arial}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.i{border:1px solid #aaa;min-height:7cm;width:5cm}</style><div class='g'>${new Array(copies).fill(`<div class='i'>${html}</div>`).join('')}</div>`);
  w.document.close();
  w.print();
};

$('#settingsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  settings.brandName = $('#brandName').value || settings.brandName;
  settings.logoUrl = $('#logoUrl').value;
  settings.primaryColor = $('#primaryColor').value;
  settings.qrLink = $('#qrLink').value;
  settings.role = $('#role').value;
  settings.cardStyle = $('#cardStyle').value;
  save(KEY_SETTINGS, settings);
  $('#brandHeader').textContent = settings.brandName;
  renderPreview();
  alert('تم حفظ الإعدادات');
});

$('#searchInput').oninput = renderProductsTable;
$('#categoryFilter').onchange = renderProductsTable;
['labelProduct', 'batch', 'production', 'expiry', 'cardStyle'].forEach(id => $('#' + id).addEventListener('input', renderPreview));

$('#langToggle').onclick = () => {
  lang = lang === 'ar' ? 'en' : 'ar';
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  $('#langToggle').textContent = lang === 'ar' ? 'English' : 'العربية';
  renderProductsTable();
  renderPreview();
};

function initSettings() {
  $('#brandName').value = settings.brandName;
  $('#logoUrl').value = settings.logoUrl;
  $('#primaryColor').value = settings.primaryColor;
  $('#qrLink').value = settings.qrLink;
  $('#role').value = settings.role;
  $('#cardStyle').value = settings.cardStyle || 'classic';
  $('#brandHeader').textContent = settings.brandName;
}

seed();
initSettings();
renderProductsTable();
renderHistory();
renderPreview();
