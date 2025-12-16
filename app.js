/***********************
 * إعدادات المحل
 ***********************/
const STORE_NAME = "Tea Sola";
const WHATSAPP_NUMBER = "966562802660"; // 0562802660
const CURRENCY = "ر.س";

/***********************
 * إضافات (نعرفها مرة) + نربطها لكل صنف حسب المناسبة
 ***********************/
const ADDONS = {
  mint: { id: "mint", name: "نعناع", price: 1 },
  ginger: { id: "ginger", name: "زنجبيل", price: 1 },
  milk: { id: "milk", name: "حليب", price: 1 },
  saffron: { id: "saffron", name: "زعفران", price: 2 },
};

/***********************
 * منيو تجريبي (بدون شيت حالياً)
 * كل صنف له addons الخاصة فيه
 ***********************/
const CATEGORIES = [
  {
    id: "tea",
    name: "الشاي",
    products: [
      { id: "tea_adani", name: "شاي عدني", price: 3, desc: "حار ومضبوط", addons: ["mint", "ginger", "milk"] },
      { id: "tea_karak", name: "شاي كرك", price: 4, desc: "حليب + هيل", addons: ["mint", "ginger"] },
      { id: "tea_moroccan", name: "شاي مغربي", price: 4, desc: "نعناع", addons: ["ginger"] },
      { id: "tea_red", name: "شاي أحمر", price: 2, desc: "كلاسيك", addons: ["mint", "ginger"] },
    ],
  },
  {
    id: "coffee",
    name: "القهوة",
    products: [
      { id: "coffee_arabic", name: "قهوة عربية", price: 5, desc: "مع هيل", addons: ["saffron"] },
      { id: "coffee_turkish", name: "قهوة تركية", price: 6, desc: "ثقيلة", addons: ["milk"] },
      { id: "latte", name: "لاتيه", price: 7, desc: "كريمي", addons: ["milk"] },
      { id: "americano", name: "أمريكانو", price: 6, desc: "خفيف", addons: [] },
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

/* addons UI */
const addonsBlock = document.getElementById("addonsBlock");
const sheetAddonsEl = document.getElementById("sheetAddons");

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

/* checkout order preview */
const checkoutItemsEl = document.getElementById("checkoutItems");
const checkoutTotalEl = document.getElementById("checkoutTotal");

/* table selected */
const tableSelectedLine = document.getElementById("tableSelectedLine");
const tableChip = document.getElementById("tableChip");
const changeTableBtn = document.getElementById("changeTableBtn");

/***********************
 * الحالة
 ***********************/
let cart = {}; 
// key => { key, baseId, name, basePrice, addons:[{id,name,price}], addonsTotal, unitPrice, qty, note }

let currentProduct = null;
let selectedAddonIds = [];

let orderMode = "takeaway"; // takeaway | dinein | car
let selectedTable = null;

/***********************
 * Helpers
 ***********************/
function money(n) { return `${n} ${CURRENCY}`; }

function openOverlay(el){ el.classList.add("active"); }
function closeOverlay(el){ el.classList.remove("active"); }

function cartCount(){ return Object.values(cart).reduce((a,x)=>a+x.qty,0); }
function cartTotal(){ return Object.values(cart).reduce((a,x)=>a+(x.unitPrice*x.qty),0); }

function makeKey(productId, addonIds, note){
  const a = (addonIds || []).slice().sort().join(",");
  const n = (note || "").trim();
  return `${productId}|${a}|${n}`;
}

function normalizePhone(raw){
  // هنا ما نغيّر شي على طلبك (أنت قلت خلاص يقبل)
  return (raw || "").trim();
}

/***********************
 * سكرول تبويب الأقسام (بدون ينزل واجد)
 ***********************/
function scrollToSection(sectionId){
  const header = document.querySelector(".header");
  const tabs = document.querySelector(".tabs");
  const el = document.getElementById(`section-${sectionId}`);
  if(!el) return;

  const offset = (header?.offsetHeight || 0) + (tabs?.offsetHeight || 0) + 10;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({ top, behavior: "smooth" });
}

/***********************
 * تحديث واجهة السلة + معاينة الإتمام
 ***********************/
function updateCartUI(){
  const total = cartTotal();
  const count = cartCount();

  cartTotalEl.textContent = money(total);
  cartTotal2El.textContent = money(total);
  cartCountEl.textContent = count;

  if(total <= 0) cartBarEl.classList.add("hidden");
  else cartBarEl.classList.remove("hidden");

  renderCartItems();
  renderCheckoutPreview();
}

function renderCartItems(){
  cartItemsEl.innerHTML = "";
  const items = Object.values(cart);

  if(!items.length){
    cartItemsEl.innerHTML = `<div style="color:#b9c2cc;font-size:13px;text-align:center;padding:10px;">السلة فاضية.</div>`;
    return;
  }

  items.forEach((it)=>{
    const row = document.createElement("div");
    row.className = "cartRow";

    const left = document.createElement("div");
    const addonsText = it.addons?.length ? ` — إضافات: ${it.addons.map(a=>a.name).join("، ")}` : "";
    const noteText = it.note ? ` — ملاحظة: ${it.note}` : "";

    left.innerHTML = `
      <div class="cartName">${it.name}</div>
      <div class="cartMeta">الكمية: ${it.qty}${addonsText}${noteText}</div>
    `;

    const right = document.createElement("div");
    right.className = "cartRight";

    const sum = document.createElement("div");
    sum.className = "cartSum";
    sum.textContent = money(it.unitPrice * it.qty);

    const del = document.createElement("button");
    del.className = "remove";
    del.textContent = "×";
    del.addEventListener("click", ()=>{
      if(confirm("متأكد تحذف الصنف؟")){
        delete cart[it.key];
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

function renderCheckoutPreview(){
  checkoutItemsEl.innerHTML = "";
  const items = Object.values(cart);
  const total = cartTotal();
  checkoutTotalEl.textContent = money(total);

  if(!items.length){
    checkoutItemsEl.innerHTML = `<div style="color:#b9c2cc;font-size:13px;text-align:center;padding:6px;">لا يوجد أصناف.</div>`;
    return;
  }

  items.forEach((it)=>{
    const row = document.createElement("div");
    row.className = "cartRow";   // نفس ستايل السلة

    const left = document.createElement("div");
    const addonsText = it.addons?.length ? ` — إضافات: ${it.addons.map(a=>a.name).join("، ")}` : "";
    const noteText = it.note ? ` — ملاحظة: ${it.note}` : "";

    left.innerHTML = `
      <div class="cartName">${it.name}</div>
      <div class="cartMeta">الكمية: ${it.qty}${addonsText}${noteText}</div>
    `;

    const right = document.createElement("div");
    right.className = "cartRight";

    const sum = document.createElement("div");
    sum.className = "cartSum";
    sum.textContent = money(it.unitPrice * it.qty);

    right.appendChild(sum);
    row.appendChild(left);
    row.appendChild(right);

    checkoutItemsEl.appendChild(row);
  });
}

/***********************
 * Tabs + Menu
 ***********************/
function renderTabs(){
  categoryTabsEl.innerHTML = "";
  CATEGORIES.forEach((cat, idx)=>{
    const btn = document.createElement("button");
    btn.className = "tab" + (idx===0 ? " active" : "");
    btn.textContent = cat.name;

    btn.addEventListener("click", ()=>{
      document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
      btn.classList.add("active");
      scrollToSection(cat.id);
    });

    categoryTabsEl.appendChild(btn);
  });
}

function renderMenu(){
  menuListEl.innerHTML = "";

  CATEGORIES.forEach((cat)=>{
    const section = document.createElement("section");
    section.className = "section";
    section.id = `section-${cat.id}`;

    const title = document.createElement("h2");
    title.className = "sectionTitle";
    title.textContent = cat.name;
    section.appendChild(title);

    cat.products.forEach((p)=>{
      const item = document.createElement("div");
      item.className = "item";

      const left = document.createElement("div");
      left.innerHTML = `
        <div class="itemName">${p.name}</div>
        <div class="itemSub">${p.desc || ""}</div>
      `;

      const right = document.createElement("div");
      right.style.display="flex";
      right.style.alignItems="center";
      right.style.gap="10px";
      right.innerHTML = `
        <div class="itemPrice">${money(p.price)}</div>
        <div class="arrow">›</div>
      `;

      item.appendChild(left);
      item.appendChild(right);

      item.addEventListener("click", ()=>openProductSheet(p));
      section.appendChild(item);
    });

    menuListEl.appendChild(section);
  });
}

/***********************
 * Product sheet + إضافات حسب الصنف
 ***********************/
function openProductSheet(product){
  currentProduct = product;
  selectedAddonIds = [];
  sheetQty.textContent = "1";
  sheetNote.value = "";
  sheetProductName.textContent = product.name;
  sheetProductPrice.textContent = money(product.price);

  // Render addons (حسب الصنف)
  sheetAddonsEl.innerHTML = "";
  const addonIds = (product.addons || []).filter(Boolean);

  if(addonIds.length){
    addonsBlock.classList.remove("hidden");
    addonIds.forEach((aid)=>{
      const a = ADDONS[aid];
      if(!a) return;

      const row = document.createElement("label");
      row.className = "addonRow";

      row.innerHTML = `
        <div class="addonLeft">
          <input type="checkbox" data-id="${a.id}" />
          <div>${a.name}</div>
        </div>
        <div class="addonPrice">+ ${money(a.price)}</div>
      `;

      row.querySelector("input").addEventListener("change", (e)=>{
        const id = e.target.dataset.id;
        if(e.target.checked){
          if(!selectedAddonIds.includes(id)) selectedAddonIds.push(id);
        }else{
          selectedAddonIds = selectedAddonIds.filter(x=>x!==id);
        }
      });

      sheetAddonsEl.appendChild(row);
    });
  }else{
    addonsBlock.classList.add("hidden");
  }

  openOverlay(productOverlay);
}

closeProduct.addEventListener("click", ()=>closeOverlay(productOverlay));
productOverlay.addEventListener("click", (e)=>{ if(e.target===productOverlay) closeOverlay(productOverlay); });

qtyPlus.addEventListener("click", ()=>{ sheetQty.textContent = String(parseInt(sheetQty.textContent,10)+1); });
qtyMinus.addEventListener("click", ()=>{
  const q = parseInt(sheetQty.textContent,10);
  if(q>1) sheetQty.textContent = String(q-1);
});

addToCartBtn.addEventListener("click", ()=>{
  if(!currentProduct) return;

  const qty = parseInt(sheetQty.textContent,10);
  const note = sheetNote.value.trim();

  const addons = (selectedAddonIds || []).map(id => ADDONS[id]).filter(Boolean);
  const addonsTotal = addons.reduce((a,x)=>a+x.price,0);
  const unitPrice = currentProduct.price + addonsTotal;

  const key = makeKey(currentProduct.id, selectedAddonIds, note);

  const existing = cart[key] || {
    key,
    baseId: currentProduct.id,
    name: currentProduct.name,
    basePrice: currentProduct.price,
    addons,
    addonsTotal,
    unitPrice,
    qty: 0,
    note: note || ""
  };

  existing.qty += qty;

  // لو كان موجود ونفس الكي، نخلي نفس note/addons زي ما هي
  cart[key] = existing;

  updateCartUI();
  closeOverlay(productOverlay);
});

/***********************
 * Cart sheet
 ***********************/
openCartBtn.addEventListener("click", ()=>openOverlay(cartOverlay));
closeCart.addEventListener("click", ()=>closeOverlay(cartOverlay));
cartOverlay.addEventListener("click", (e)=>{ if(e.target===cartOverlay) closeOverlay(cartOverlay); });

clearCartBtn.addEventListener("click", ()=>{
  if(confirm("متأكد تبغى تفريغ السلة؟")){
    cart = {};
    updateCartUI();
  }
});

/***********************
 * Checkout mode + tables
 ***********************/
function setMode(mode){
  orderMode = mode;

  document.querySelectorAll(".modeBtn").forEach(b=>b.classList.remove("active"));
  document.querySelector(`.modeBtn[data-mode="${mode}"]`).classList.add("active");

  dineinBox.classList.add("hidden");
  carBox.classList.add("hidden");

  if(mode === "dinein") dineinBox.classList.remove("hidden");
  if(mode === "car") carBox.classList.remove("hidden");
}

modeBar.addEventListener("click", (e)=>{
  const btn = e.target.closest(".modeBtn");
  if(!btn) return;
  setMode(btn.dataset.mode);
});

function buildTables(){
  tablesEl.innerHTML = "";
  for(let i=1; i<=30; i++){
    const b = document.createElement("button");
    b.className = "tableBtn";
    b.textContent = i;

    b.addEventListener("click", ()=>{
      selectedTable = i;

      // تفعيل زر الطاولة
      tablesEl.querySelectorAll(".tableBtn").forEach(x=>x.classList.remove("active"));
      b.classList.add("active");

      // إغلاق المربعات مباشرة + إظهار طاولة مختارة
      tableChip.textContent = `طاولة ${i}`;
      tableSelectedLine.classList.remove("hidden");
      tablesEl.classList.add("hidden");
    });

    tablesEl.appendChild(b);
  }
}
buildTables();

changeTableBtn.addEventListener("click", ()=>{
  // فتح المربعات مرة ثانية
  tablesEl.classList.remove("hidden");
  tableSelectedLine.classList.add("hidden");
});

checkoutBtn.addEventListener("click", ()=>{
  if(cartCount()===0){
    alert("السلة فاضية. اختر أصناف أولاً.");
    return;
  }
  openOverlay(checkoutOverlay);
  setMode(orderMode || "takeaway");
  renderCheckoutPreview();
});

closeCheckout.addEventListener("click", ()=>closeOverlay(checkoutOverlay));
checkoutOverlay.addEventListener("click", (e)=>{ if(e.target===checkoutOverlay) closeOverlay(checkoutOverlay); });

/***********************
 * إرسال واتساب
 ***********************/
sendWhatsappBtn.addEventListener("click", ()=>{
  const name = customerNameEl.value.trim();
  const phone = normalizePhone(customerPhoneEl.value);

  if(!name || !phone){
    alert("اكتب اسم العميل ورقم الجوال.");
    return;
  }
  if(cartCount()===0){
    alert("السلة فاضية.");
    return;
  }

  let modeText = "سفري";
  let extra = "";

  if(orderMode === "dinein"){
    modeText = "محلي";
    if(!selectedTable){
      alert("اختَر رقم الطاولة.");
      return;
    }
    extra = `🔢 رقم الطاولة: ${selectedTable}\n`;
  }else if(orderMode === "car"){
    modeText = "استلام من السيارة";
    const ct = carTypeEl.value.trim();
    const cc = carColorEl.value.trim();
    if(!ct || !cc){
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

  Object.values(cart).forEach((it)=>{
    const line = it.unitPrice * it.qty;
    total += line;

    msg += `• ${it.name} × ${it.qty} = ${money(line)}`;

    if(it.addons?.length){
      msg += ` (إضافات: ${it.addons.map(a=>a.name).join("، ")})`;
    }
    if(it.note){
      msg += ` (ملاحظة: ${it.note})`;
    }
    msg += "\n";
  });

  msg += `\nالإجمالي: ${money(total)}\n`;
  msg += `\n📲 مطوّر من MenuLink — 0593937921`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");

  // تنظيف بعد الإرسال
  cart = {};
  selectedTable = null;
  tablesEl.classList.remove("hidden");
  tableSelectedLine.classList.add("hidden");

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
