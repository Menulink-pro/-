/***************
 * إعدادات سهلة
 ***************/
const WHATSAPP_NUMBER = "966562802660"; // رقم محل الشاي (بدون +) 0562802660
const CURRENCY = "ر.س";

/***************
 * منيو تجريبي (بدون شيت)
 ***************/
const MENU = [
  {
    category: "شاي",
    items: [
      { name: "شاي عدني", price: 3, desc: "حار ومضبوط" },
      { name: "شاي كرك", price: 4, desc: "حليب + هيل" },
      { name: "شاي مغربي", price: 4, desc: "نعناع" },
      { name: "شاي أحمر", price: 2, desc: "كلاسيك" },
    ]
  },
  {
    category: "قهوة",
    items: [
      { name: "قهوة عربية", price: 5, desc: "مع هيل" },
      { name: "قهوة تركية", price: 6, desc: "ثقيلة" },
      { name: "لاتيه", price: 7, desc: "كريمي" },
      { name: "أمريكانو", price: 6, desc: "خفيف" },
    ]
  },
  {
    category: "إضافات",
    items: [
      { name: "نعناع", price: 1, desc: "زيادة نعناع" },
      { name: "زنجبيل", price: 1, desc: "نكهة قوية" },
      { name: "حليب", price: 1, desc: "زيادة حليب" },
    ]
  }
];

/***************
 * حالة التطبيق
 ***************/
let state = {
  mode: null,          // dinein | takeaway | car
  tableNo: null,
  carType: "",
  carColor: "",
  cart: {}             // key -> {name, price, qty}
};

const $ = (id) => document.getElementById(id);

const stepStart = $("stepStart");
const stepDetails = $("stepDetails");
const stepMenu = $("stepMenu");
const stepCheckout = $("stepCheckout");

const dineInBox = $("dineInBox");
const carBox = $("carBox");
const detailsTitle = $("detailsTitle");

const tabs = $("tabs");
const menuEl = $("menu");

const overlay = $("overlay");
const cartEl = $("cart");

const totalEl = $("total");
const total2El = $("total2");
const cartCountEl = $("cartCount");

/***************
 * Helpers
 ***************/
function show(el){ el.classList.remove("hide"); }
function hide(el){ el.classList.add("hide"); }

function money(n){
  return `${n} ${CURRENCY}`;
}

function cartCount(){
  return Object.values(state.cart).reduce((a,x)=>a + x.qty, 0);
}

function cartTotal(){
  return Object.values(state.cart).reduce((a,x)=>a + x.qty * x.price, 0);
}

function updateTotals(){
  const t = cartTotal();
  totalEl.textContent = money(t);
  total2El.textContent = money(t);
  cartCountEl.textContent = cartCount();
}

function resetAll(){
  state = { mode:null, tableNo:null, carType:"", carColor:"", cart:{} };
  // clear inputs
  $("custName").value = "";
  $("custPhone").value = "";
  $("notes").value = "";
  $("carType").value = "";
  $("carColor").value = "";
  // back to start
  hide(stepDetails); hide(stepMenu); hide(stepCheckout);
  show(stepStart);
  hide(overlay);
  updateTotals();
}

function goMenu(){
  hide(stepStart); hide(stepDetails); hide(stepCheckout);
  show(stepMenu);
  window.scrollTo({top:0, behavior:"smooth"});
}

function goCheckout(){
  hide(stepMenu);
  show(stepCheckout);
  window.scrollTo({top:0, behavior:"smooth"});
}

/***************
 * Step: Start
 ***************/
document.querySelectorAll(".choice").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    state.mode = btn.dataset.mode;

    if(state.mode === "takeaway"){
      goMenu();
      return;
    }

    hide(stepStart);
    show(stepDetails);

    if(state.mode === "dinein"){
      detailsTitle.textContent = "طلب محلي";
      show(dineInBox); hide(carBox);
    }else{
      detailsTitle.textContent = "استلام من السيارة";
      show(carBox); hide(dineInBox);
    }
    window.scrollTo({top:0, behavior:"smooth"});
  });
});

$("btnBackToStart").addEventListener("click", ()=>{
  show(stepStart);
  hide(stepDetails);
});

$("btnGoMenu").addEventListener("click", ()=>{
  if(state.mode === "dinein" && !state.tableNo){
    alert("اختَر رقم الطاولة أولاً.");
    return;
  }
  if(state.mode === "car"){
    const t = $("carType").value.trim();
    const c = $("carColor").value.trim();
    if(!t || !c){
      alert("اختَر نوع السيارة واللون.");
      return;
    }
    state.carType = t;
    state.carColor = c;
  }
  goMenu();
});

$("btnReset").addEventListener("click", resetAll);

/***************
 * Tables UI
 ***************/
function buildTables(){
  const box = $("tables");
  box.innerHTML = "";
  for(let i=1;i<=30;i++){
    const b = document.createElement("button");
    b.className = "tbtn";
    b.textContent = i;
    b.addEventListener("click", ()=>{
      state.tableNo = i;
      box.querySelectorAll(".tbtn").forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
    });
    box.appendChild(b);
  }
}
buildTables();

/***************
 * Menu UI
 ***************/
let activeCat = MENU[0].category;

function keyFor(item){
  return `${activeCat}__${item.name}`;
}

function buildTabs(){
  tabs.innerHTML = "";
  MENU.forEach(cat=>{
    const t = document.createElement("button");
    t.className = "tab" + (cat.category===activeCat ? " active" : "");
    t.textContent = cat.category;
    t.addEventListener("click", ()=>{
      activeCat = cat.category;
      buildTabs();
      buildMenu();
    });
    tabs.appendChild(t);
  });
}

function buildMenu(){
  menuEl.innerHTML = "";
  const cat = MENU.find(x=>x.category===activeCat);
  cat.items.forEach(item=>{
    const k = `${activeCat}__${item.name}`;
    const inCart = state.cart[k]?.qty || 0;

    const card = document.createElement("div");
    card.className = "item";

    card.innerHTML = `
      <div class="itemTop">
        <div>
          <div class="itemName">${item.name}</div>
          <div class="itemDesc">${item.desc || ""}</div>
        </div>
        <div class="itemPrice">${money(item.price)}</div>
      </div>

      <div class="qtyRow">
        <div class="itemDesc">الكمية</div>
        <div class="qtyBtns">
          <button class="qbtn" data-act="minus">−</button>
          <div class="qnum">${inCart}</div>
          <button class="qbtn" data-act="plus">+</button>
        </div>
      </div>
    `;

    const qnum = card.querySelector(".qnum");
    const minus = card.querySelector('[data-act="minus"]');
    const plus = card.querySelector('[data-act="plus"]');

    plus.addEventListener("click", ()=>{
      if(!state.cart[k]) state.cart[k] = { name:item.name, price:item.price, qty:0, cat:activeCat };
      state.cart[k].qty++;
      qnum.textContent = state.cart[k].qty;
      updateTotals();
    });

    minus.addEventListener("click", ()=>{
      if(!state.cart[k]) return;
      state.cart[k].qty--;
      if(state.cart[k].qty <= 0) delete state.cart[k];
      qnum.textContent = state.cart[k]?.qty || 0;
      updateTotals();
    });

    menuEl.appendChild(card);
  });

  updateTotals();
}

buildTabs();
buildMenu();

/***************
 * Cart Overlay
 ***************/
function openOverlay(){
  renderCart();
  show(overlay);
}
function closeOverlay(){
  hide(overlay);
}

$("btnOpenCart").addEventListener("click", openOverlay);
$("btnCloseOverlay").addEventListener("click", closeOverlay);
overlay.addEventListener("click", (e)=>{
  if(e.target === overlay) closeOverlay();
});

function renderCart(){
  cartEl.innerHTML = "";
  const items = Object.values(state.cart);

  if(items.length === 0){
    cartEl.innerHTML = `<div class="itemDesc">السلة فاضية.</div>`;
    updateTotals();
    return;
  }

  // ترتيب حسب القسم ثم الاسم
  items.sort((a,b)=> (a.cat||"").localeCompare(b.cat||"") || a.name.localeCompare(b.name));

  items.forEach(it=>{
    const row = document.createElement("div");
    row.className = "cartRow";
    row.innerHTML = `
      <div>
        <div class="cartName">${it.name}</div>
        <div class="cartMeta">${it.qty} × ${money(it.price)}</div>
      </div>
      <div class="qtyBtns">
        <button class="qbtn">−</button>
        <div class="qnum">${it.qty}</div>
        <button class="qbtn">+</button>
      </div>
    `;
    const [minus, , plus] = row.querySelectorAll(".qbtn, .qnum, .qbtn"); // won't work as intended
    // safer:
    const btns = row.querySelectorAll(".qbtn");
    const minusBtn = btns[0];
    const plusBtn  = btns[1];
    const numEl = row.querySelector(".qnum");

    const key = `${it.cat}__${it.name}`;

    plusBtn.addEventListener("click", ()=>{
      state.cart[key].qty++;
      numEl.textContent = state.cart[key].qty;
      row.querySelector(".cartMeta").textContent = `${state.cart[key].qty} × ${money(it.price)}`;
      updateTotals();
    });

    minusBtn.addEventListener("click", ()=>{
      state.cart[key].qty--;
      if(state.cart[key].qty <= 0){
        delete state.cart[key];
        renderCart();
        return;
      }
      numEl.textContent = state.cart[key].qty;
      row.querySelector(".cartMeta").textContent = `${state.cart[key].qty} × ${money(it.price)}`;
      updateTotals();
    });

    cartEl.appendChild(row);
  });

  updateTotals();
}

$("btnClearCart").addEventListener("click", ()=>{
  if(confirm("متأكد تبغى تفريغ السلة؟")){
    state.cart = {};
    renderCart();
    buildMenu();
  }
});

/***************
 * Checkout
 ***************/
$("btnCheckout").addEventListener("click", ()=>{
  if(cartCount() === 0){
    alert("السلة فاضية. اختر أصناف أولاً.");
    return;
  }
  goCheckout();
});

$("btnBackToMenu").addEventListener("click", ()=>{
  hide(stepCheckout);
  show(stepMenu);
});

$("btnSend").addEventListener("click", ()=>{
  const name = $("custName").value.trim();
  const phone = $("custPhone").value.trim();
  const notes = $("notes").value.trim();

  if(!name || !phone){
    alert("الرجاء تعبئة الاسم ورقم الجوال.");
    return;
  }
  if(cartCount() === 0){
    alert("السلة فاضية.");
    return;
  }

  const t = cartTotal();

  // رأس الرسالة حسب النوع
  let header = `السلام عليكم ورحمة الله وبركاته 🌹\n\n`;
  header += `طلب جديد من Tea Sola\n`;
  header += `👤 الاسم: ${name}\n`;
  header += `📱 الجوال: ${phone}\n`;

  if(state.mode === "dinein"){
    header += `🍽️ النوع: محلي\n`;
    header += `🔢 رقم الطاولة: ${state.tableNo}\n`;
  } else if(state.mode === "car"){
    header += `🚗 النوع: استلام من السيارة\n`;
    header += `🚘 السيارة: ${state.carType} - ${state.carColor}\n`;
  } else {
    header += `🧾 النوع: سفري\n`;
  }

  header += `\n— الأصناف —\n`;

  const lines = Object.values(state.cart)
    .sort((a,b)=> (a.cat||"").localeCompare(b.cat||"") || a.name.localeCompare(b.name))
    .map(it => `• ${it.name} × ${it.qty} = ${money(it.qty * it.price)}`)
    .join("\n");

  let msg = header + lines + `\n\nالإجمالي: ${money(t)}\n`;

  if(notes){
    msg += `\nملاحظات: ${notes}\n`;
  }

  msg += `\n📲 MenuLink`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");

  // بعد الإرسال: يفضّل يرجع للمنيو ويفرّغ البيانات (زي ما تحب)
  // تقدر تغيّر هذا لو تبي
  resetAll();
});
