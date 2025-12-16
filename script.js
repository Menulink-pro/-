// =======================
// إعدادات العرض (بدون شيت)
// =======================
const STORE_NAME = "شاي صولة";
const STORE_LOGO_URL = "https://via.placeholder.com/300x300.png?text=Tea";
const WHATSAPP_NUMBER = "966593937921"; // رقمك لاستقبال الطلبات (عرض)
// ملاحظة: لما يوافق المحل نغيره لرقمهم

// =======================
// منيو تجريبي (تعديل/إضافة براحتك)
// status: "متوفر" أو "غير متوفر"
// =======================
const CATEGORIES = [
  {
    id: "tea",
    name: "شاي",
    products: [
      { id: "t1", name: "شاي كرك", price: 8, status: "متوفر" },
      { id: "t2", name: "شاي عدني", price: 7, status: "متوفر" },
      { id: "t3", name: "شاي أحمر", price: 5, status: "متوفر" },
      { id: "t4", name: "شاي أخضر", price: 6, status: "غير متوفر" }
    ]
  },
  {
    id: "milk",
    name: "حليب",
    products: [
      { id: "m1", name: "حليب بالزعفران", price: 9, status: "متوفر" },
      { id: "m2", name: "حليب زنجبيل", price: 9, status: "متوفر" }
    ]
  },
  {
    id: "snacks",
    name: "سناك",
    products: [
      { id: "s1", name: "تميس صغير", price: 3, status: "متوفر" },
      { id: "s2", name: "معصوب", price: 12, status: "متوفر" }
    ]
  }
];

// =======================
// خيارات “الاستكانة”
// =======================
const CUP_SIZES = ["صغير", "وسط", "كبير"];
const SUGAR_LEVELS = ["بدون سكر", "قليل", "وسط", "زيادة"];
const ADDONS = ["نعناع", "زنجبيل", "هيل", "قرفة"];

// =======================
// عناصر الصفحة
// =======================
const storeNameEl = document.getElementById("storeName");
const storeLogoEl = document.getElementById("storeLogo");
const tabsEl = document.getElementById("categoryTabs");
const menuEl = document.getElementById("menuList");

const cartBarEl = document.getElementById("cartBar");
const cartTotalEl = document.getElementById("cartTotal");
const openCartBtn = document.getElementById("openCartBtn");

const productOverlay = document.getElementById("productSheetOverlay");
const sheetProductName = document.getElementById("sheetProductName");
const sheetProductPrice = document.getElementById("sheetProductPrice");
const sheetQty = document.getElementById("sheetQty");
const sheetNote = document.getElementById("sheetNote");

const cupSizeRow = document.getElementById("cupSizeRow");
const sugarRow = document.getElementById("sugarRow");
const addonsRow = document.getElementById("addonsRow");

const qtyPlus = document.getElementById("qtyPlus");
const qtyMinus = document.getElementById("qtyMinus");
const addToCartBtn = document.getElementById("addToCartBtn");
const closeProductSheet = document.getElementById("closeProductSheet");

const cartOverlay = document.getElementById("cartSheetOverlay");
const closeCartSheet = document.getElementById("closeCartSheet");
const cartItemsList = document.getElementById("cartItemsList");
const cartTotalBottom = document.getElementById("cartTotalBottom");
const sendWhatsappBtn = document.getElementById("sendWhatsappBtn");

const customerNameEl = document.getElementById("customerName");
const customerPhoneEl = document.getElementById("customerPhone");

// =======================
// بيانات
// =======================
let cart = {}; // key: cartKey
let currentProduct = null;

let selectedCupSize = CUP_SIZES[0];
let selectedSugar = SUGAR_LEVELS[1];
let selectedAddons = new Set();

// =======================
// تهيئة
// =======================
storeNameEl.textContent = STORE_NAME;
storeLogoEl.src = STORE_LOGO_URL;

// =======================
// Helpers
// =======================
function isAvailable(status) {
  return !String(status || "").includes("غير");
}

function money(n){ return `${n} ريال`; }

function cartKeyFor(p){
  // نفس المنتج لكن خيارات مختلفة = عنصر مختلف بالسلة
  const addons = Array.from(selectedAddons).sort().join(",");
  return `${p.id}|${selectedCupSize}|${selectedSugar}|${addons}|${sheetNote.value.trim()}`;
}

function optionsText(){
  const addons = Array.from(selectedAddons);
  const parts = [];
  if (selectedCupSize) parts.push(`حجم: ${selectedCupSize}`);
  if (selectedSugar) parts.push(`سكر: ${selectedSugar}`);
  if (addons.length) parts.push(`إضافات: ${addons.join("، ")}`);
  return parts.join(" • ");
}

// =======================
// Chips UI
// =======================
function renderChips(rowEl, items, getActive, onPick){
  rowEl.innerHTML = "";
  items.forEach((t) => {
    const b = document.createElement("button");
    b.className = "chip" + (getActive(t) ? " active" : "");
    b.type = "button";
    b.textContent = t;
    b.addEventListener("click", () => onPick(t));
    rowEl.appendChild(b);
  });
}

function setupOptionChips(){
  renderChips(
    cupSizeRow,
    CUP_SIZES,
    (t) => t === selectedCupSize,
    (t) => {
      selectedCupSize = t;
      setupOptionChips();
    }
  );

  renderChips(
    sugarRow,
    SUGAR_LEVELS,
    (t) => t === selectedSugar,
    (t) => {
      selectedSugar = t;
      setupOptionChips();
    }
  );

  // إضافات (multi-select)
  addonsRow.innerHTML = "";
  ADDONS.forEach((t) => {
    const b = document.createElement("button");
    b.className = "chip" + (selectedAddons.has(t) ? " active" : "");
    b.type = "button";
    b.textContent = t;
    b.addEventListener("click", () => {
      if (selectedAddons.has(t)) selectedAddons.delete(t);
      else selectedAddons.add(t);
      setupOptionChips();
    });
    addonsRow.appendChild(b);
  });
}

// =======================
// Tabs
// =======================
function renderTabs(){
  tabsEl.innerHTML = "";
  CATEGORIES.forEach((cat, i) => {
    const btn = document.createElement("button");
    btn.className = "tab" + (i === 0 ? " active" : "");
    btn.textContent = cat.name;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`section-${cat.id}`)?.scrollIntoView({behavior:"smooth", block:"start"});
    });
    tabsEl.appendChild(btn);
  });
}

// =======================
// Menu Render
// =======================
function renderMenu(){
  menuEl.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const section = document.createElement("section");
    section.className = "section";
    section.id = `section-${cat.id}`;

    const title = document.createElement("div");
    title.className = "section-title";
    title.textContent = cat.name;
    section.appendChild(title);

    cat.products.forEach((p) => {
      const card = document.createElement("div");
      const available = isAvailable(p.status);
      card.className = "product" + (!available ? " disabled" : "");

      const left = document.createElement("div");
      left.className = "p-left";

      const name = document.createElement("div");
      name.className = "p-name";
      name.textContent = p.name;

      const meta = document.createElement("div");
      meta.className = "p-meta";

      const price = document.createElement("div");
      price.className = "p-price";
      price.textContent = money(p.price);
      meta.appendChild(price);

      if (!available){
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = "غير متوفر";
        meta.appendChild(badge);
      }

      left.appendChild(name);
      left.appendChild(meta);

      const right = document.createElement("div");
      right.className = "p-right";
      const chev = document.createElement("div");
      chev.className = "chev";
      chev.textContent = "›";
      right.appendChild(chev);

      card.appendChild(left);
      card.appendChild(right);

      if (available){
        card.addEventListener("click", () => openProductSheet(p, cat.name));
      }

      section.appendChild(card);
    });

    menuEl.appendChild(section);
  });
}

// =======================
// Product Sheet
// =======================
function openProductSheet(p, categoryName){
  currentProduct = {...p, categoryName};

  // Reset options default (تحسها احترافية)
  selectedCupSize = CUP_SIZES[0];
  selectedSugar = SUGAR_LEVELS[1];
  selectedAddons = new Set();
  sheetNote.value = "";
  sheetQty.textContent = "1";

  sheetProductName.textContent = p.name;
  sheetProductPrice.textContent = money(p.price);

  setupOptionChips();

  productOverlay.classList.add("active");
  productOverlay.setAttribute("aria-hidden","false");
}

function closeProduct(){
  currentProduct = null;
  productOverlay.classList.remove("active");
  productOverlay.setAttribute("aria-hidden","true");
}

closeProductSheet.addEventListener("click", closeProduct);
productOverlay.addEventListener("click", (e) => {
  if (e.target === productOverlay) closeProduct();
});

qtyPlus.addEventListener("click", () => {
  sheetQty.textContent = String(parseInt(sheetQty.textContent,10) + 1);
});
qtyMinus.addEventListener("click", () => {
  const q = parseInt(sheetQty.textContent,10);
  if (q > 1) sheetQty.textContent = String(q - 1);
});

addToCartBtn.addEventListener("click", () => {
  if (!currentProduct) return;

  const qty = parseInt(sheetQty.textContent,10);
  const note = sheetNote.value.trim();
  const addonsArr = Array.from(selectedAddons).sort();

  const key = `${currentProduct.id}|${selectedCupSize}|${selectedSugar}|${addonsArr.join(",")}|${note}`;

  const item = cart[key] || {
    key,
    id: currentProduct.id,
    name: currentProduct.name,
    price: currentProduct.price,
    qty: 0,
    categoryName: currentProduct.categoryName,
    cupSize: selectedCupSize,
    sugar: selectedSugar,
    addons: addonsArr,
    note
  };

  item.qty += qty;
  cart[key] = item;

  updateCartUI();
  closeProduct();
});

// =======================
// Cart
// =======================
function total(){
  return Object.values(cart).reduce((s,it)=>s + it.price*it.qty,0);
}

function updateCartUI(){
  const t = total();
  cartTotalEl.textContent = money(t);
  cartTotalBottom.textContent = money(t);
  if (t>0) cartBarEl.classList.remove("hidden");
  else cartBarEl.classList.add("hidden");
  renderCartItems();
}

function renderCartItems(){
  const items = Object.values(cart);
  cartItemsList.innerHTML = "";

  if (!items.length){
    cartItemsList.innerHTML = `<p style="text-align:center;color:#9ca3af;font-weight:800;">السلة فارغة حالياً.</p>`;
    return;
  }

  items.forEach((it)=>{
    const row = document.createElement("div");
    row.className = "cart-row";

    const left = document.createElement("div");
    left.className = "cart-left";

    const name = document.createElement("div");
    name.className = "cart-name";
    name.textContent = it.name;

    const meta = document.createElement("div");
    meta.className = "cart-meta";

    const parts = [];
    parts.push(`الكمية: ${it.qty}`);
    if (it.cupSize) parts.push(`حجم: ${it.cupSize}`);
    if (it.sugar) parts.push(`سكر: ${it.sugar}`);
    if (it.addons?.length) parts.push(`إضافات: ${it.addons.join("، ")}`);
    if (it.note) parts.push(`ملاحظة: ${it.note}`);

    meta.textContent = parts.join(" • ");

    left.appendChild(name);
    left.appendChild(meta);

    const right = document.createElement("div");
    right.className = "cart-right";

    const price = document.createElement("div");
    price.className = "cart-price";
    price.textContent = money(it.price * it.qty);

    const rm = document.createElement("button");
    rm.className = "remove-btn";
    rm.textContent = "✕";
    rm.addEventListener("click", () => {
      delete cart[it.key];
      updateCartUI();
    });

    right.appendChild(price);
    right.appendChild(rm);

    row.appendChild(left);
    row.appendChild(right);
    cartItemsList.appendChild(row);
  });
}

// =======================
// Cart Sheet
// =======================
openCartBtn.addEventListener("click", () => {
  cartOverlay.classList.add("active");
  cartOverlay.setAttribute("aria-hidden","false");
});
closeCartSheet.addEventListener("click", () => {
  cartOverlay.classList.remove("active");
  cartOverlay.setAttribute("aria-hidden","true");
});
cartOverlay.addEventListener("click",(e)=>{
  if(e.target===cartOverlay){
    cartOverlay.classList.remove("active");
    cartOverlay.setAttribute("aria-hidden","true");
  }
});

// =======================
// WhatsApp Send (للرقم حقك عرض)
// =======================
sendWhatsappBtn.addEventListener("click", () => {
  const items = Object.values(cart);
  if (!items.length) return alert("السلة فارغة حالياً.");

  let t = 0;
  let msg = `السلام عليكم 🌟\nطلب جديد (عرض) من ${STORE_NAME}:\n\n`;

  items.forEach((it) => {
    const line = it.price * it.qty;
    t += line;

    msg += `• ${it.name} × ${it.qty} = ${line} ريال\n`;
    msg += `  - حجم: ${it.cupSize}\n`;
    msg += `  - سكر: ${it.sugar}\n`;
    if (it.addons?.length) msg += `  - إضافات: ${it.addons.join("، ")}\n`;
    if (it.note) msg += `  - ملاحظة: ${it.note}\n`;
    msg += `\n`;
  });

  msg += `الإجمالي: ${t} ريال\n`;

  const cname = customerNameEl.value.trim();
  const cphone = customerPhoneEl.value.trim();
  if (cname) msg += `\nاسم العميل: ${cname}`;
  if (cphone) msg += `\nرقم الجوال: ${cphone}`;

  msg += `\n\nمطور بواسطة MenuLink - 0593937921`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
});

// =======================
// تشغيل
// =======================
renderTabs();
renderMenu();
updateCartUI();
