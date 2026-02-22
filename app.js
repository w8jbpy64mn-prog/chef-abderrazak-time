const KEY_PRODUCTS = 'healthytem_products';
const KEY_LABELS = 'healthytem_labels';
const KEY_SETTINGS = 'healthytem_settings';

let lang = 'ar';
const i18n = {
  ar: {
    products: 'إدارة المنتجات', labelDesigner: 'مصمم الملصق', history: 'سجل الملصقات', settings: 'الإعدادات',
    nameAr: 'الاسم بالعربي', nameEn: 'الاسم بالإنجليزي', category: 'التصنيف', calories: 'السعرات (kcal)', protein: 'البروتين (g)',
    carbs: 'الكربوهيدرات (g)', fat: 'الدهون (g)', fiber: 'الألياف (g)', serving: 'حجم الحصة', notes: 'ملاحظات',
    selectProduct: 'اختر منتج', copies: 'عدد النسخ', createdBy: 'اسم المستخدم', brandName: 'اسم البراند', logoUrl: 'رابط الشعار',
    primaryColor: 'اللون الأساسي', role: 'الدور', saveSettings: 'حفظ الإعدادات', status: 'الحالة', actions: 'إجراءات'
  },
  en: {
    products: 'Products', labelDesigner: 'Label Designer', history: 'Label History', settings: 'Settings',
    nameAr: 'Arabic Name', nameEn: 'English Name', category: 'Category', calories: 'Calories (kcal)', protein: 'Protein (g)',
    carbs: 'Carbs (g)', fat: 'Fat (g)', fiber: 'Fiber (g)', serving: 'Serving Size', notes: 'Notes',
    selectProduct: 'Select Product', copies: 'Copies', createdBy: 'User Name', brandName: 'Brand Name', logoUrl: 'Logo URL',
    primaryColor: 'Primary Color', role: 'Role', saveSettings: 'Save Settings', status: 'Status', actions: 'Actions'
  }
};

const $ = (s) => document.querySelector(s);
const products = load(KEY_PRODUCTS, []);
const labels = load(KEY_LABELS, []);
const settings = load(KEY_SETTINGS, {
  brandName: 'مطعم وقت الصحة | Healthy Tem',
  logoUrl: '',
  primaryColor: '#1b8f5a',
  qrLink: '',
  role: 'admin'
});

function load(k, def) { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } }
function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

function applyTranslations() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    el.textContent = i18n[lang][key] || key;
  });
  $('#langToggle').textContent = lang === 'ar' ? 'English' : 'العربية';
}

function renderProducts() {
  const query = $('#searchInput').value?.toLowerCase() || '';
  const cf = $('#categoryFilter').value;
  const filtered = products.filter(p =>
    (!cf || p.category === cf) &&
    (`${p.nameAr} ${p.nameEn} ${p.category}`).toLowerCase().includes(query)
  );

  const tpl = $('#productTableTpl').content.cloneNode(true);
  const tbody = tpl.querySelector('tbody');
  filtered.forEach((p, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i + 1}</td><td>${p.nameAr}<br/><span class="small">${p.nameEn}</span></td>
      <td>${p.category}</td><td>${p.kcal}</td>
      <td><span class="badge ${p.active ? 'active' : 'hiddenp'}">${p.active ? 'Active' : 'Hidden'}</span></td>
      <td>
        <button onclick="editProduct('${p.id}')">Edit</button>
        <button onclick="toggleProduct('${p.id}')">${p.active ? 'Hide' : 'Show'}</button>
        <button onclick="deleteProduct('${p.id}')">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
  $('#productsList').innerHTML = '';
  $('#productsList').appendChild(tpl);

  const categories = [...new Set(products.map(p => p.category))];
  $('#categoryFilter').innerHTML = `<option value="">${lang === 'ar' ? 'كل التصنيفات' : 'All categories'}</option>` +
    categories.map(c => `<option ${c === cf ? 'selected' : ''} value="${c}">${c}</option>`).join('');

  $('#labelProduct').innerHTML = products.filter(p => p.active).map((p) =>
    `<option value="${p.id}">${lang === 'ar' ? p.nameAr : p.nameEn}</option>`).join('');

  renderPreview();
}

function getFormData() {
  return {
    id: $('#productId').value || crypto.randomUUID(),
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
}

$('#productForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = getFormData();
  if (settings.role === 'staff' && $('#productId').value) return alert('Staff cannot edit existing product settings.');
  const idx = products.findIndex(p => p.id === data.id);
  if (idx > -1) products[idx] = { ...products[idx], ...data };
  else products.push(data);
  save(KEY_PRODUCTS, products);
  e.target.reset();
  $('#productId').value = '';
  renderProducts();
});

window.editProduct = (id) => {
  const p = products.find(x => x.id === id);
  if (!p) return;
  Object.entries(p).forEach(([k, v]) => { const el = $('#' + k); if (el) el.value = v; });
};

window.toggleProduct = (id) => {
  const p = products.find(x => x.id === id);
  if (!p) return;
  p.active = !p.active;
  save(KEY_PRODUCTS, products);
  renderProducts();
};
window.deleteProduct = (id) => {
  const idx = products.findIndex(x => x.id === id);
  if (idx > -1) products.splice(idx, 1);
  save(KEY_PRODUCTS, products);
  renderProducts();
};

$('#resetForm').onclick = () => { $('#productForm').reset(); $('#productId').value = ''; };
$('#searchInput').oninput = renderProducts;
$('#categoryFilter').onchange = renderProducts;
$('#labelProduct').onchange = renderPreview;
['copies', 'batch', 'production', 'expiry'].forEach(id => $('#' + id).addEventListener('input', renderPreview));

function renderPreview() {
  const pid = $('#labelProduct').value;
  const p = products.find(x => x.id === pid);
  if (!p) { $('#labelPreview').innerHTML = '<p>لا يوجد منتج نشط.</p>'; return; }

  const b = $('#batch').value;
  const prod = $('#production').value;
  const exp = $('#expiry').value;

  const servingHeadline = lang === 'ar' ? 'عدد الحصص في العبوة' : 'Servings Per Container';
  const servingAmount = lang === 'ar' ? 'حجم الحصة' : 'Serving Size';
  const servingLine = p.servingSize || (lang === 'ar' ? 'غير محدد' : 'Not set');
  const dailyValueLabel = lang === 'ar' ? '*نسبة الاحتياج اليومي %' : '* % Daily Value';
  const noteLine = lang === 'ar'
    ? 'تدل %القيمة اليومية على نسبة المغذيات في الحصة الواحدة ضمن نظام 2000 سعرة حرارية.'
    : '% Daily Value indicates nutrient contribution in one serving based on a 2000 kcal diet.';

  const nutrientRows = [
    { ar: 'الدهون الكلية', en: 'Total Fat', val: `${p.fat} غرام`, dv: Math.round((Number(p.fat) / 70) * 100) },
    { ar: 'الدهون المشبعة', en: 'Saturated Fat', val: `${(Number(p.fat) * 0.3).toFixed(1)} غرام`, dv: Math.round((Number(p.fat) * 0.3 / 20) * 100) },
    { ar: 'دهون متحولة', en: 'Trans Fat', val: `0 غرام`, dv: 0 },
    { ar: 'كوليسترول', en: 'Cholesterol', val: `0 ملغرام`, dv: 0 },
    { ar: 'صوديوم', en: 'Sodium', val: `${Math.round(Number(p.kcal) * 0.75)} ملغرام`, dv: Math.round((Number(p.kcal) * 0.75 / 2300) * 100) },
    { ar: 'الكربوهيدرات الكلية', en: 'Total Carbohydrate', val: `${p.carbs} غرام`, dv: Math.round((Number(p.carbs) / 275) * 100) },
    { ar: 'الألياف الغذائية', en: 'Dietary Fiber', val: `${p.fiber} غرام`, dv: Math.round((Number(p.fiber) / 28) * 100) },
    { ar: 'بروتين', en: 'Protein', val: `${p.protein} غرام`, dv: Math.round((Number(p.protein) / 50) * 100), strong: true }
  ];

  $('#labelPreview').innerHTML = `
    <div class="fact-card">
      <div class="fact-title">${lang === 'ar' ? 'الحقائق التغذوية' : 'Nutrition Facts'}</div>

      <div class="fact-servings">${servingHeadline} <strong>8</strong></div>
      <div class="fact-serving-size">
        <span class="serving-pill">${servingAmount}</span>
        <span class="serving-value">${servingLine}</span>
      </div>

      <div class="fact-subline">${lang === 'ar' ? 'الكمية لكل حصة غذائية' : 'Amount Per Serving'}</div>

      <div class="fact-kcal-row">
        <span>${lang === 'ar' ? 'السعرات الحرارية' : 'Calories'}</span>
        <strong>${p.kcal}</strong>
      </div>

      <div class="fact-dv">${dailyValueLabel}</div>

      <table class="fact-table">
        ${nutrientRows.map((n) => `
          <tr class="${n.strong ? 'strong' : ''}">
            <td class="dv">${Math.max(0, n.dv)}%</td>
            <td class="name">${lang === 'ar' ? n.ar : n.en}</td>
            <td class="val">${n.val}</td>
          </tr>
        `).join('')}
      </table>

      ${b || prod || exp ? `<div class="fact-meta">Batch: ${b || '-'} | Prod: ${prod || '-'} | Exp: ${exp || '-'}</div>` : ''}
      ${settings.qrLink ? `<div class="fact-meta">QR: ${settings.qrLink}</div>` : ''}
      <div class="fact-note">${noteLine}</div>
    </div>
  `;

  document.documentElement.style.setProperty('--primary', settings.primaryColor || '#1b8f5a');
}

$('#printLabel').onclick = () => window.print();
$('#printBulk').onclick = () => {
  const pid = $('#labelProduct').value;
  const p = products.find(x => x.id === pid);
  if (!p) return;
  const copies = Math.max(1, Number($('#copies').value || 1));
  const win = window.open('', '_blank');
  const item = $('#labelPreview').innerHTML;
  win.document.write(`<style>body{font-family:Arial}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.item{border:1px solid #000;padding:6px;min-height:7cm}</style><div class="grid">${new Array(copies).fill(`<div class="item">${item}</div>`).join('')}</div>`);
  win.document.close();
  win.focus();
  win.print();
};

$('#saveLabel').onclick = () => {
  const pid = $('#labelProduct').value;
  const p = products.find(x => x.id === pid);
  if (!p) return alert('Select product');
  labels.unshift({
    id: crypto.randomUUID(),
    productId: p.id,
    productNameAr: p.nameAr,
    productNameEn: p.nameEn,
    createdAt: new Date().toISOString(),
    copies: Number($('#copies').value || 1),
    createdBy: $('#createdBy').value || 'Admin',
    payload: {
      batch: $('#batch').value,
      production: $('#production').value,
      expiry: $('#expiry').value
    }
  });
  save(KEY_LABELS, labels);
  renderHistory();
};

function renderHistory() {
  $('#historyList').innerHTML = labels.map(l =>
    `<div class="card" style="margin-bottom:.5rem"><strong>${lang==='ar'?l.productNameAr:l.productNameEn}</strong>
      <div class="small">${new Date(l.createdAt).toLocaleString()} | ${l.createdBy} | Copies: ${l.copies}</div>
      <button onclick="reloadLabel('${l.id}')">Reload</button>
    </div>`).join('') || '<p class="small">No labels yet.</p>';
}

window.reloadLabel = (id) => {
  const l = labels.find(x => x.id === id);
  if (!l) return;
  $('#labelProduct').value = l.productId;
  $('#copies').value = l.copies;
  $('#createdBy').value = l.createdBy;
  $('#batch').value = l.payload.batch || '';
  $('#production').value = l.payload.production || '';
  $('#expiry').value = l.payload.expiry || '';
  renderPreview();
};

$('#settingsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  settings.brandName = $('#brandName').value || settings.brandName;
  settings.logoUrl = $('#logoUrl').value;
  settings.primaryColor = $('#primaryColor').value;
  settings.qrLink = $('#qrLink').value;
  settings.role = $('#currentRole').value;
  save(KEY_SETTINGS, settings);
  $('#appTitle').textContent = settings.brandName;
  renderPreview();
  alert('Saved');
});

$('#langToggle').onclick = () => { lang = lang === 'ar' ? 'en' : 'ar'; applyTranslations(); renderProducts(); renderHistory(); };

function seed() {
  if (products.length) return;
  products.push({
    id: crypto.randomUUID(),
    nameAr: 'تشكن راب', nameEn: 'Chicken Wrap', category: 'ساندويتشات',
    kcal: 420, protein: 30, carbs: 40, fat: 14, fiber: 6,
    servingSize: '1 sandwich', notes: '', active: true
  });
  save(KEY_PRODUCTS, products);
}

function initSettings() {
  $('#brandName').value = settings.brandName;
  $('#logoUrl').value = settings.logoUrl;
  $('#primaryColor').value = settings.primaryColor;
  $('#qrLink').value = settings.qrLink;
  $('#currentRole').value = settings.role;
  $('#appTitle').textContent = settings.brandName;
}

seed();
initSettings();
applyTranslations();
renderProducts();
renderHistory();
