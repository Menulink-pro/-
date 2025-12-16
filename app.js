/***********************
 * إعدادات المحل
 ***********************/
const STORE_NAME = "Tea Sola";
const WHATSAPP_NUMBER = "966562802660"; // 0562802660 -> 966562802660
const CURRENCY = "ر.س";

/***********************
 * منيو تجريبي (بدون شيت حالياً)
 ***********************/
const CATEGORIES = [
  {
    id: "tea",
    name: "الشاي",
    products: [
      { id: "tea_adani", name: "شاي عدني", price: 3, desc: "حار ومضبوط" },
      { id: "tea_karak", name: "شاي كرك", price: 4, desc: "حليب + هيل" },
      { id: "tea_moroccan", name: "شاي مغربي", price: 4, desc: "نعناع" },
      { id: "tea_red", name: "شاي أحمر", price: 2, desc: "كلاسيك" },
    ],
  },
  {
    id: "coffee",
    name: "القهوة",
    products: [
      { id: "coffee_arabic", name: "قهوة عربية", price: 5, desc: "مع هيل" },
      { id: "coffee_turkish", name: "قهوة تركية", price: 6, desc: "ثقيلة" },
      { id: "latte", name: "لاتيه", price: 7, desc: "كريمي" },
      { id: "americano", name: "أمريكانو", price: 6, desc: "خفيف" },
    ],
  },
  {
    id: "addons",
    name: "إضافات",
    products: [
      { id: "mint", name: "نعناع", price: 1, desc: "زيادة نعناع" },
      { id: "ginger", name: "زنجبيل", price: 1, desc: "نكهة قوية" },
      { id: "milk", name: "حليب", price: 1, desc: "زيادة حليب" },
    ],
  },
];

/***********************
 * عناصر الصفحة
 ***********************/
const storeNameEl = document.getElementById("storeName");
storeNameEl.textContent = STORE_NAME;

const categoryTabsEl = document.getElementById("categoryTabs");
const menuListEl = document.getElementById("menuList");

const cartBarEl = document.getElementById("cartBar");
const cartTotalEl = document.getElementById("cartTotal");
const cartCountEl = document.getElementById("cartCount");
const cartTotal2El = document.getElementById("cartTotal2");

const openCartBtn = document.getElementById("openCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");

/* overlays */
const productOverlay = document.getElementById("productOverlay");
const cartOverlay = document.getElementById("cartOverlay");
const checkoutOverlay = document.getElementById("checkoutOverlay");

/* product sheet */
const sheetProductName = document.getElementById("sheetProductName");
const sheetProductPrice = document.getElementById("sheetProductPrice");
const sheetQty = document.getElementById("sheetQty");
const sheetNote = document.getElementById("sheetNote");
const qtyMinus = document.getElementById("qtyMinus");
const qtyPlus = document.getElementById("qtyPlus");
const addToCartBtn = document.getElementById("addToCartBtn");
const closeProduct = document.getElementById("closeProduct");

/* cart sheet */
const cartItemsEl = document.getElementById("cartItems");
const closeCart = document.getElementById("closeCart");
const clearCartBtn = document.getElementById("clearCartBtn");

/* checkout sheet */
const closeCheckout = document.getElementById("closeCheckout");
const sendWhatsappBtn = document.getElementById("sendWhatsappBtn");
const customerNameEl = document.getElementById("customerName");
const customerPhoneEl = document.getElementById("customerPhone");

const modeBar = document.getElementById("modeBar");
const dineinBox = document.getElementById("dineinBox");
const carBox = document.getElementById("carBox");
const tablesEl = document.getElementById("tables");
const carTypeEl = document.getElementById("carType");
const carColorEl = document.getElementById("carColor");

/***********************
 * الحالة
 ***********************/
let cart = {}; 
// cart[productId] = { id, name, price, qty, note }

let currentProduct = null;

let orderMode = "takeaway"; // takeaway | dinein | car
let selectedTable = null;

/***********************
 * Helpers
 ***********************/
function money(n) {
  return `${n} ${CURRENCY}`;
}

function openOverlay(el) {
  el.classList.add("active");
}
function closeOverlay(el) {
  el.classList.remove("active");
}

function cartCount() {
  return Object.values(cart).reduce((a, x) => a + x.qty, 0);
}

function cartTotal() {
  return Object.values(cart).reduce((a, x) => a + x.qty * x.price, 0);
}

function updateCartUI() {
  const total = cartTotal();
  const count = cartCount();

  cartTotalEl.textContent = money(total);
  cartTotal2El.textContent = money(total);
  cartCountEl.textContent = count;

  if (total <= 0) cartBarEl.classList.add("hidden");
  else cartBarEl.classList.remove("hidden");

  renderCartItems();
}

function renderCartItems() {
  cartItemsEl.innerHTML = "";
  const items = Object.values(cart);

  if (!items.length) {
    cartItemsEl.innerHTML = `<div style="color:#b9c2cc;font-size:13px;text-align:center;padding:10px;">السلة فاضية.</div>`;
    return;
  }

  // ترتيب حسب الاسم
  items.sort((a, b) => a.name.localeCompare(b.name, "ar"));

  items.forEach((it) => {
    const row = document.createElement("div");
    row.className = "cartRow";

    const left = document.createElement("div");
    left.innerHTML = `
      <div class="cartName">${it.name}</div>
      <div class="cartMeta">الكمية: ${it.qty}${it.note ? ` — ملاحظة: ${it.note}` : ""}</div>
    `;

    const right = document.createElement("div");
    right.className = "cartRight";

    const sum = document.createElement("div");
    sum.className = "cartSum";
    sum.textContent = money(it.qty * it.price);

    const del = document.createElement("button");
    del.className = "remove";
    del.textContent = "×";
    del.addEventListener("click", () => {
      if (confirm("متأكد تحذف الصنف؟")) {
        delete cart[it.id];
        updateCartUI();
      }
    });

    right.appendChild(sum);
    right.appendChild(del);

    row.appendChild(left);
    row.appendChild(right);

    cartItemsEl.appendChild(row);
  });
}

/***********************
 * Tabs + Menu (كل الأقسام تحت بعض)
 ***********************/
function renderTabs() {
  categoryTabsEl.innerHTML = "";
  CATEGORIES.forEach((cat, idx) => {
    const btn = document.createElement("button");
    btn.className = "tab" + (idx === 0 ? " active" : "");
    btn.textContent = cat.name;

    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      btn.classList.add("active");

      const section = document.getElementById(`section-${cat.id}`);
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    categoryTabsEl.appendChild(btn);
  });
}

function renderMenu() {
  menuListEl.innerHTML = "";

  CATEGORIES.forEach((cat) => {
    const section = document.createElement("section");
    section.className = "section";
    section.id = `section-${cat.id}`;

    const title = document.createElement("h2");
    title.className = "sectionTitle";
    title.textContent = cat.name;
    section.appendChild(title);

    cat.products.forEach((p) => {
      const item = document.createElement("div");
      item.className = "item";

      const left = document.createElement("div");
      left.innerHTML = `
        <div class="itemName">${p.name}</div>
        <div class="itemSub">${p.desc || ""}</div>
      `;

      const right = document.createElement("div");
      right.style.display = "flex";
      right.style.alignItems = "center";
      right.style.gap = "10px";
      right.innerHTML = `
        <div class="itemPrice">${money(p.price)}</div>
        <div class="arrow">›</div>
      `;

      item.appendChild(left);
      item.appendChild(right);

      item.addEventListener("click", () => openProductSheet(p));
      section.appendChild(item);
    });

    menuListEl.appendChild(section);
  });
}

/***********************
 * Product sheet
 ***********************/
function openProductSheet(product) {
  currentProduct = product;
  sheetQty.textContent = "1";
  sheetNote.value = "";
  sheetProductName.textContent = product.name;
  sheetProductPrice.textContent = money(product.price);
  openOverlay(productOverlay);
}

closeProduct.addEventListener("click", () => closeOverlay(productOverlay));

productOverlay.addEventListener("click", (e) => {
  if (e.target === productOverlay) closeOverlay(productOverlay);
});

qtyPlus.addEventListener("click", () => {
  sheetQty.textContent = String(parseInt(sheetQty.textContent, 10) + 1);
});
qtyMinus.addEventListener("click", () => {
  const q = parseInt(sheetQty.textContent, 10);
  if (q > 1) sheetQty.textContent = String(q - 1);
});

addToCartBtn.addEventListener("click", () => {
  if (!currentProduct) return;

  const qty = parseInt(sheetQty.textContent, 10);
  const note = sheetNote.value.trim();

  const existing = cart[currentProduct.id] || {
    id: currentProduct.id,
    name: currentProduct.name,
    price: currentProduct.price,
    qty: 0,
    note: ""
  };

  existing.qty += qty;
  if (note) existing.note = note; // آخر ملاحظة تستبدل
  cart[currentProduct.id] = existing;

  updateCartUI();
  closeOverlay(productOverlay);
});

/***********************
 * Cart sheet
 ***********************/
openCartBtn.addEventListener("click", () => openOverlay(cartOverlay));
closeCart.addEventListener("click", () => closeOverlay(cartOverlay));
cartOverlay.addEventListener("click", (e) => {
  if (e.target === cartOverlay) closeOverlay(cartOverlay);
});

clearCartBtn.addEventListener("click", () => {
  if (confirm("متأكد تبغى تفريغ السلة؟")) {
    cart = {};
    updateCartUI();
  }
});

/***********************
 * Checkout sheet (طريقة الاستلام داخل الإتمام)
 ***********************/
function setMode(mode) {
  orderMode = mode;

  document.querySelectorAll(".modeBtn").forEach((b) => b.classList.remove("active"));
  document.querySelector(`.modeBtn[data-mode="${mode}"]`).classList.add("active");

  // إخفاء/إظهار
  dineinBox.classList.add("hidden");
  carBox.classList.add("hidden");

  if (mode === "dinein") dineinBox.classList.remove("hidden");
  if (mode === "car") carBox.classList.remove("hidden");
}

modeBar.addEventListener("click", (e) => {
  const btn = e.target.closest(".modeBtn");
  if (!btn) return;
  setMode(btn.dataset.mode);
});

function buildTables() {
  tablesEl.innerHTML = "";
  for (let i = 1; i <= 30; i++) {
    const b = document.createElement("button");
    b.className = "tableBtn";
    b.textContent = i;

    b.addEventListener("click", () => {
      selectedTable = i;
      tablesEl.querySelectorAll(".tableBtn").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
    });

    tablesEl.appendChild(b);
  }
}
buildTables();

checkoutBtn.addEventListener("click", () => {
  if (cartCount() === 0) {
    alert("السلة فاضية. اختر أصناف أولاً.");
    return;
  }
  openOverlay(checkoutOverlay);
  // الافتراضي سفري
  setMode(orderMode || "takeaway");
});

closeCheckout.addEventListener("click", () => closeOverlay(checkoutOverlay));
checkoutOverlay.addEventListener("click", (e) => {
  if (e.target === checkoutOverlay) closeOverlay(checkoutOverlay);
});

/***********************
 * إرسال واتساب
 ***********************/
sendWhatsappBtn.addEventListener("click", () => {
  const name = customerNameEl.value.trim();
  const phone = customerPhoneEl.value.trim();

  if (!name || !phone) {
    alert("اكتب اسم العميل ورقم الجوال.");
    return;
  }
  if (cartCount() === 0) {
    alert("السلة فاضية.");
    return;
  }

  // تحقق طريقة الاستلام
  let modeText = "سفري";
  let extra = "";

  if (orderMode === "dinein") {
    modeText = "محلي";
    if (!selectedTable) {
      alert("اختَر رقم الطاولة.");
      return;
    }
    extra = `🔢 رقم الطاولة: ${selectedTable}\n`;
  } else if (orderMode === "car") {
    modeText = "استلام من السيارة";
    const ct = carTypeEl.value.trim();
    const cc = carColorEl.value.trim();
    if (!ct || !cc) {
      alert("اختَر نوع السيارة واللون.");
      return;
    }
    extra = `🚗 السيارة: ${ct} - ${cc}\n`;
  }

  let total = 0;
  let msg =
`السلام عليكم ورحمة الله وبركاته 🌹

طلب جديد من ${STORE_NAME}

👤 الاسم: ${name}
📱 الجوال: ${phone}
🧾 النوع: ${modeText}
${extra}
— الأصناف —
`;

  Object.values(cart).forEach((it) => {
    const line = it.qty * it.price;
    total += line;
    msg += `• ${it.name} × ${it.qty} = ${money(line)}`;
    if (it.note) msg += ` (ملاحظة: ${it.note})`;
    msg += `\n`;
  });

  msg += `\nالإجمالي: ${money(total)}\n`;
  msg += `\n📲 مطوّر من MenuLink — 0593937921`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");

  // تنظيف بعد الإرسال
  cart = {};
  selectedTable = null;
  carTypeEl.value = "";
  carColorEl.value = "";
  customerNameEl.value = "";
  customerPhoneEl.value = "";
  updateCartUI();
  closeOverlay(checkoutOverlay);
});

/***********************
 * تشغيل أولي
 ***********************/
renderTabs();
renderMenu();
updateCartUI();
