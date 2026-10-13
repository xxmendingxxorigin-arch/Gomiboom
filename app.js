/**
 * Gomiboom - Modern Interactive Store Engine
 * Cart, Currency Switcher, Customizer, Catalog & WhatsApp Checkout
 */

// ==========================================
// 1. Currency Rates & Formatting
// ==========================================
const CURRENCIES = {
  COP: { symbol: '$', rate: 1, suffix: 'COP', decimals: 0, freeShippingGoal: 50000 },
  MXN: { symbol: '$', rate: 0.0045, suffix: 'MXN', decimals: 0, freeShippingGoal: 250 },
  USD: { symbol: '$', rate: 0.00025, suffix: 'USD', decimals: 2, freeShippingGoal: 15 }
};

let currentCurrency = 'COP';

function formatMoney(amountCOP) {
  const curr = CURRENCIES[currentCurrency];
  const converted = amountCOP * curr.rate;
  if (curr.decimals === 0) {
    return `${curr.suffix} ${curr.symbol}${Math.round(converted).toLocaleString('es-CO')}`;
  }
  return `${curr.suffix} ${curr.symbol}${converted.toFixed(2)}`;
}

// ==========================================
// 2. Product Catalog Data
// ==========================================
const SIZES = [
  { key: 'pequeño', label: 'Pequeño', weight: '100 g', price: 5000,  icon: 'S' },
  { key: 'mediano', label: 'Mediano', weight: '220 g', price: 8000,  icon: 'M' },
  { key: 'grande',  label: 'Grande',  weight: '400 g', price: 10000, icon: 'L' }
];

const PRODUCTS = [
  {
    id: 'ositos-chamoy',
    name: 'Ositos fuego chamoy',
    category: 'clasicos',
    badge: '🔥 Más vendido',
    image: 'img/ositos.jpg',
    basePriceCOP: 16000,
    desc: 'Los clásicos ositos de goma cubiertos con nuestra salsa secreta de chamoy espeso y espolvoreados con Tajín.',
    defaultSpice: '🔥️🔥️ Clásico picosito'
  },
  {
    id: 'mangos-enchilados',
    name: 'Manguitos locos Tajín',
    category: 'clasicos',
    badge: '🍬 Favorito',
    image: 'img/mangos.jpg',
    basePriceCOP: 17500,
    desc: 'Tiras de mango jugoso y dulce cubiertas con abundante chamoy artesanal, chilito en polvo y limón.',
    defaultSpice: '🔥️🔥️ Clásico picosito'
  },
  {
    id: 'aros-durazno',
    name: 'Aros de durazno con chamoy',
    category: 'clasicos',
    badge: '🍋 Suave y delicioso',
    image: 'img/duraznos.jpg',
    basePriceCOP: 16500,
    desc: 'Aros de durazno escarchados con azúcar, tamarindo y salsa de chamoy con toque de Miguelito.',
    defaultSpice: '🔥️ Chamoy suave'
  },
  {
    id: 'sandias-enchiladas',
    name: 'Sandillitas aciditas',
    category: 'acidos',
    badge: '🍭 Mega ácidas',
    image: 'img/sandias.jpg',
    basePriceCOP: 17000,
    desc: 'Gomitas sabor sandía con centro acidito, bañadas en chamoy y cubiertas con polvito picosito.',
    defaultSpice: '🔥️🔥️ Clásico picosito'
  },
  {
    id: 'gusanos-neon',
    name: 'Gusanos neón ácidos',
    category: 'acidos',
    badge: '🍭 Explosión cítrica',
    image: 'img/gusanos.jpg',
    basePriceCOP: 16000,
    desc: 'Gusanos de goma multicolor súper ácidos bañados en chamoy picante y mezcla especial de chiles.',
    defaultSpice: '🔥️🔥️🔥️ Fuego extremo'
  },
  {
    id: 'mega-mix-tub',
    name: 'Tarrina mega mix especial',
    category: 'combos',
    badge: '🍋 El rey de la casa',
    image: 'img/mix.jpg',
    basePriceCOP: 32000,
    desc: 'Tarrina gigante con surtido de todos nuestros sabores de gomitas y contenedor de chamoy aparte para untar.',
    defaultSpice: '🔥️🔥️ Clásico picosito'
  }
];

// ==========================================
// 3. State Management
// ==========================================
let cart = JSON.parse(localStorage.getItem('gomiboom_cart') || localStorage.getItem('gomifuego_cart')) || [];
let appliedDiscount = 0; // percentage, e.g., 0.10 for 10%
const PROMO_CODES = {
  'BOOM10': 0.10,
  'FUEGO10': 0.10,
  'GOMIBOOM': 0.10,
  'CHAMOY15': 0.15,
  'GOMILOVERS': 0.10
};

// ==========================================
// 4. UI Elements Cache
// ==========================================
const productsGrid = document.getElementById('productsGrid');
const currencySelector = document.getElementById('currencySelector');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartCount = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartDiscount = document.getElementById('cartDiscount');
const cartDiscountRow = document.getElementById('cartDiscountRow');
const cartShipping = document.getElementById('cartShipping');
const cartShippingRow = document.getElementById('cartShippingRow');
const cartTotalFinal = document.getElementById('cartTotalFinal');
const shippingRemaining = document.getElementById('shippingRemaining');
const shippingProgressBar = document.getElementById('shippingProgressBar');
const toastNotification = document.getElementById('toastNotification');
const promoInput = document.getElementById('promoInput');
const applyPromoBtn = document.getElementById('applyPromoBtn');
const discountNotice = document.getElementById('discountNotice');
const removePromoBtn = document.getElementById('removePromoBtn');
const checkoutWhatsAppBtn = document.getElementById('checkoutWhatsAppBtn');
const openCheckoutModalBtn = document.getElementById('openCheckoutModalBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutModal = document.getElementById('closeCheckoutModal');
const checkoutForm = document.getElementById('checkoutForm');
const modalOrderTotal = document.getElementById('modalOrderTotal');

// ==========================================
// 5. Toast Notification System
// ==========================================
let toastTimeout;
function showToast(message, icon = '🔥️') {
  clearTimeout(toastTimeout);
  toastNotification.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  toastNotification.classList.add('show');
  toastTimeout = setTimeout(() => {
    toastNotification.classList.remove('show');
  }, 3200);
}

// ==========================================
// 6. Render Product Catalog
// ==========================================
function renderProducts(filter = 'all') {
  if (!productsGrid) return;
  productsGrid.innerHTML = '';

  const filtered = filter === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === filter);

  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id;

    // Default size = mediano (index 1)
    const defaultSize = SIZES[1];
    const defaultPrice = defaultSize.price;

    const sizeButtonsHTML = SIZES.map((s, i) => `
      <button class="size-btn${i === 1 ? ' active' : ''}" data-size-key="${s.key}" data-price="${s.price}">
        <span class="size-icon">${s.icon}</span>
        <span class="size-label">${s.label}</span>
        <span class="size-weight">${s.weight}</span>
        <span class="size-price">${formatMoney(s.price)}</span>
      </button>
    `).join('');

    card.innerHTML = `
      <div class="product-img-box">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-badge">${product.badge}</span>
      </div>
      <div class="product-info">
        <div class="product-title-row">
          <h3 class="product-title">${product.name}</h3>
        </div>
        <p class="product-desc">${product.desc}</p>

        <div class="size-selector-box">
          <span class="size-label-title">Tamaño:</span>
          <div class="size-options">${sizeButtonsHTML}</div>
        </div>

        <div class="spice-selector-box">
          <span class="spice-label">Picante:</span>
          <div class="spice-options" data-product="${product.id}">
            <button class="spice-opt-btn active" data-spice="🌶️ Tajín">Tajín</button>
            <button class="spice-opt-btn" data-spice="🍓 Chamoy + Tajín">Chamoy + Tajín</button>
            <button class="spice-opt-btn" data-spice="🔥 Chamoy Habanero">Chamoy habanero 🔥</button>
          </div>
        </div>

        <div class="product-bottom-row">
          <span class="product-price" data-base="${product.basePriceCOP}">${formatMoney(defaultPrice)}</span>
          <button class="btn btn-sm btn-primary add-to-cart-btn" data-id="${product.id}">
            <i class="fa-solid fa-cart-plus"></i> Agregar
          </button>
        </div>
      </div>
    `;

    // Size button toggle + price update
    const sizeBtns = card.querySelectorAll('.size-btn');
    const priceEl = card.querySelector('.product-price');
    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        priceEl.textContent = formatMoney(parseInt(btn.dataset.price, 10));
      });
    });

    // Spice button toggle
    const spiceBtns = card.querySelectorAll('.spice-opt-btn');
    spiceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        spiceBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Add to cart click
    const addBtn = card.querySelector('.add-to-cart-btn');
    addBtn.addEventListener('click', () => {
      const activeSizeBtn = card.querySelector('.size-btn.active');
      const activeSpiceBtn = card.querySelector('.spice-opt-btn.active');
      const selectedSize = activeSizeBtn ? activeSizeBtn.dataset.sizeKey : 'mediano';
      const selectedSpice = activeSpiceBtn ? activeSpiceBtn.dataset.spice : '🔥️🔥️ Clásico picosito';
      const sizeObj = SIZES.find(s => s.key === selectedSize) || SIZES[1];
      const finalPrice = sizeObj.price;
      addToCart({
        id: `${product.id}-${selectedSize}-${selectedSpice}`,
        productId: product.id,
        name: `${product.name} (${sizeObj.label})`,
        image: product.image,
        spice: selectedSpice,
        size: sizeObj.label,
        weight: sizeObj.weight,
        priceCOP: finalPrice,
        quantity: 1,
        isCustom: false
      });
    });

    productsGrid.appendChild(card);
  });
}

// ==========================================
// 7. Interactive Customizer ("Arma tu Mix")
// ==========================================
const BASE_MIX_PRICE_COP = 18000;
const customSummaryText = document.getElementById('customSummaryText');
const customPriceTotal = document.getElementById('customPriceTotal');
const addCustomToCartBtn = document.getElementById('addCustomToCartBtn');

function calculateCustomMix() {
  const selectedSize  = document.querySelector('input[name="customSize"]:checked');
  const selectedBase  = document.querySelector('input[name="customBase"]:checked');
  const selectedSauce = document.querySelector('input[name="customSauce"]:checked');
  const selectedChili = document.querySelector('input[name="customChili"]:checked');
  const selectedExtras = document.querySelectorAll('input[name="customExtra"]:checked');

  // Precio base = precio del tamaño elegido (por defecto Mediano = 8000)
  let totalPrice = selectedSize ? parseInt(selectedSize.dataset.price, 10) : 8000;

  if (selectedBase) {
    totalPrice += parseInt(selectedBase.dataset.price || 0, 10);
  }
  if (selectedSauce) {
    totalPrice += parseInt(selectedSauce.dataset.price || 0, 10);
  }

  let extraNames = [];
  selectedExtras.forEach(extra => {
    totalPrice += parseInt(extra.dataset.price || 0, 10);
    extraNames.push(extra.value);
  });

  const sizeName  = selectedSize  ? selectedSize.value  : 'Mediano';
  const baseName  = selectedBase  ? selectedBase.value  : 'Ositos';
  const sauceName = selectedSauce ? selectedSauce.value : 'Bañadas';
  const chiliName = selectedChili ? selectedChili.value : 'Tajín';
  const extrasStr = extraNames.length > 0 ? ` + ${extraNames.join(', ')}` : '';

  if (customSummaryText) {
    customSummaryText.textContent = `(${sizeName}) ${baseName} 🔥🔥 ${sauceName} 🔥🔥 ${chiliName}${extrasStr}`;
  }

  if (customPriceTotal) {
    customPriceTotal.textContent = formatMoney(totalPrice);
    customPriceTotal.dataset.raw = totalPrice;
  }

  return {
    sizeName,
    baseName,
    sauceName,
    chiliName,
    extras: extraNames,
    totalPrice
  };
}

// Setup customizer change listeners
document.querySelectorAll('.customizer-card input').forEach(input => {
  input.addEventListener('change', () => {
    // Style update
    if (input.type === 'radio') {
      const groupName = input.name;
      document.querySelectorAll(`input[name="${groupName}"]`).forEach(r => {
        r.closest('.custom-opt-btn').classList.remove('selected');
      });
      input.closest('.custom-opt-btn').classList.add('selected');
    } else if (input.type === 'checkbox') {
      if (input.checked) {
        input.closest('.custom-opt-btn').classList.add('selected');
      } else {
        input.closest('.custom-opt-btn').classList.remove('selected');
      }
    }
    calculateCustomMix();
  });
});

if (addCustomToCartBtn) {
  addCustomToCartBtn.addEventListener('click', () => {
    const mixData = calculateCustomMix();
    const itemId = `custom-mix-${Date.now()}`;

    addToCart({
      id: itemId,
      productId: 'custom-mix',
      name: `Mix personalizado ${mixData.sizeName} (${mixData.baseName})`,
      image: 'img/mix.jpg',
      spice: `${mixData.sauceName} | ${mixData.chiliName}${mixData.extras.length ? ` | Toppings: ${mixData.extras.join(', ')}` : ''}`,
      size: mixData.sizeName,
      priceCOP: mixData.totalPrice,
      quantity: 1,
      isCustom: true
    });
  });
}

// Setup Combo buttons
document.querySelectorAll('.add-combo-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const card = e.target.closest('.combo-card');
    const title = card.querySelector('h3').textContent;
    const priceRaw = parseInt(card.querySelector('.current-price').dataset.raw, 10);
    const img = card.querySelector('img').getAttribute('src');
    const comboId = btn.dataset.id;

    addToCart({
      id: `combo-${comboId}`,
      productId: comboId,
      name: title,
      image: img,
      spice: 'Combo especial surtido',
      priceCOP: priceRaw,
      quantity: 1,
      isCustom: false
    });
  });
});

// ==========================================
// 8. Cart Operations & Persistence
// ==========================================
function saveCart() {
  localStorage.setItem('gomiboom_cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(item) {
  const existing = cart.find(i => i.id === item.id);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart();
  openCartDrawer();
  showToast(`¡${item.name} añadido al carrito!`, '🔥️');
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}

function changeQuantity(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(id);
  } else {
    saveCart();
  }
}

function updateCartUI() {
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) cartCount.textContent = totalItemsCount;

  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty">
        <i class="fa-solid fa-cookie-bite"></i>
        <h3>Tu carrito está vacío</h3>
        <p>¡Elige tus gomitas enchiladas favoritas y calma tu antojo!</p>
      </div>
    `;
    if (cartSubtotal) cartSubtotal.textContent = formatMoney(0);
    if (cartDiscountRow) cartDiscountRow.classList.add('hidden');
    if (cartShipping) {
      cartShipping.textContent = formatMoney(0);
      cartShipping.classList.remove('shipping-free-text');
    }
    if (cartTotalFinal) cartTotalFinal.textContent = formatMoney(0);
    if (modalOrderTotal) modalOrderTotal.textContent = formatMoney(0);
    updateShippingProgress(0);
    return;
  }

  cartItemsContainer.innerHTML = '';
  let subtotalCOP = 0;

  cart.forEach(item => {
    const itemTotalCOP = item.priceCOP * item.quantity;
    subtotalCOP += itemTotalCOP;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <span class="cart-item-spice">${item.spice}</span>
        <span class="cart-item-price">${formatMoney(item.priceCOP)} c/u</span>
      </div>
      <div class="cart-item-actions">
        <div class="qty-controls">
          <button class="qty-btn btn-minus" data-id="${item.id}">-</button>
          <span class="qty-count">${item.quantity}</span>
          <button class="qty-btn btn-plus" data-id="${item.id}">+</button>
        </div>
        <button class="item-delete-btn" data-id="${item.id}" title="Eliminar"><i class="fa-regular fa-trash-can"></i></button>
      </div>
    `;

    div.querySelector('.btn-minus').addEventListener('click', () => changeQuantity(item.id, -1));
    div.querySelector('.btn-plus').addEventListener('click', () => changeQuantity(item.id, 1));
    div.querySelector('.item-delete-btn').addEventListener('click', () => removeFromCart(item.id));

    cartItemsContainer.appendChild(div);
  });

  const freeShippingGoalCOP = CURRENCIES.COP.freeShippingGoal;
  const isFreeShipping = subtotalCOP >= freeShippingGoalCOP;
  const shippingFeeCOP = (cart.length > 0 && !isFreeShipping) ? 3000 : 0;

  const discountAmountCOP = subtotalCOP * appliedDiscount;
  const finalTotalCOP = cart.length > 0 ? (subtotalCOP - discountAmountCOP + shippingFeeCOP) : 0;

  if (cartSubtotal) cartSubtotal.textContent = formatMoney(subtotalCOP);

  if (appliedDiscount > 0) {
    if (cartDiscountRow) cartDiscountRow.classList.remove('hidden');
    if (cartDiscount) cartDiscount.textContent = `-${formatMoney(discountAmountCOP)}`;
  } else {
    if (cartDiscountRow) cartDiscountRow.classList.add('hidden');
  }

  if (cartShipping) {
    if (cart.length === 0) {
      cartShipping.textContent = formatMoney(0);
      cartShipping.classList.remove('shipping-free-text');
    } else if (isFreeShipping) {
      cartShipping.innerHTML = '<span class="shipping-free-text">¡Gratis! 🎉</span>';
    } else {
      cartShipping.textContent = formatMoney(shippingFeeCOP);
      cartShipping.classList.remove('shipping-free-text');
    }
  }

  if (cartTotalFinal) cartTotalFinal.textContent = formatMoney(finalTotalCOP);
  if (modalOrderTotal) modalOrderTotal.textContent = formatMoney(finalTotalCOP);

  updateShippingProgress(subtotalCOP);
}

function updateShippingProgress(subtotalCOP) {
  if (!shippingRemaining || !shippingProgressBar) return;
  const goal = CURRENCIES[currentCurrency].freeShippingGoal;
  const currSubtotal = subtotalCOP * CURRENCIES[currentCurrency].rate;
  const remaining = goal - currSubtotal;

  if (subtotalCOP === 0) {
    const curr = CURRENCIES[currentCurrency];
    const goalFormatted = `${curr.suffix} ${curr.symbol}${curr.decimals === 0 ? Math.round(goal).toLocaleString('es-CO') : goal.toFixed(2)}`;
    shippingRemaining.textContent = goalFormatted;
    shippingProgressBar.style.width = '0%';
    return;
  }

  if (remaining <= 0) {
    shippingRemaining.textContent = '¡Ya tienes envío gratis en todo el municipio! 🎉';
    shippingProgressBar.style.width = '100%';
  } else {
    const curr = CURRENCIES[currentCurrency];
    const remFormatted = `${curr.suffix} ${curr.symbol}${curr.decimals === 0 ? Math.round(remaining).toLocaleString('es-CO') : remaining.toFixed(2)}`;
    shippingRemaining.textContent = remFormatted;
    const pct = Math.min(100, Math.max(5, (currSubtotal / goal) * 100));
    shippingProgressBar.style.width = `${pct}%`;
  }
}

// Drawer Open/Close
function openCartDrawer() {
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

if (openCartBtn) openCartBtn.addEventListener('click', openCartDrawer);
if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

// ==========================================
// 9. Promo Code Logic
// ==========================================
if (applyPromoBtn && promoInput) {
  applyPromoBtn.addEventListener('click', () => {
    const code = promoInput.value.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      appliedDiscount = PROMO_CODES[code];
      discountNotice.classList.remove('hidden');
      discountNotice.querySelector('span').textContent = `🎉 Cupón "${code}" aplicado (${appliedDiscount * 100}% OFF)`;
      showToast(`¡Cupón de ${appliedDiscount * 100}% aplicado con éxito!`, '🔥');
      saveCart();
    } else {
      showToast('Código de descuento no válido', '🙂');
    }
  });
}

if (removePromoBtn) {
  removePromoBtn.addEventListener('click', () => {
    appliedDiscount = 0;
    discountNotice.classList.add('hidden');
    promoInput.value = '';
    saveCart();
    showToast('Cupón removido', '🔥️');
  });
}

// ==========================================
// 10. WhatsApp Direct Order Formatter
// ==========================================
function generateWhatsAppMessage(customerDetails = null) {
  if (cart.length === 0) {
    showToast('Tu carrito está vacío', '⭐️');
    return null;
  }

  let msg = `🔥 *NUEVO PEDIDO - GOMIBOOM* 🔥\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;

  if (customerDetails) {
    msg += `🍓 *Cliente:* ${customerDetails.name}\n`;
    msg += `📱 *Teléfono:* ${customerDetails.phone}\n`;
    msg += `📍 *Dirección:* ${customerDetails.address}\n`;
    msg += `💳 *Método de pago:* ${customerDetails.payment}\n`;
    if (customerDetails.notes) {
      msg += `📝 *Notas:* ${customerDetails.notes}\n`;
    }
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  }

  msg += `📋 *Detalle de productos:*\n`;
  let subtotalCOP = 0;
  cart.forEach((item, index) => {
    const totalItem = item.priceCOP * item.quantity;
    subtotalCOP += totalItem;
    msg += `\n${index + 1}. *${item.name}* (x${item.quantity})\n`;
    msg += `       *Prep:* ${item.spice}\n`;
    msg += `       *Precio:* ${formatMoney(totalItem)}\n`;
  });

  const freeShippingGoalCOP = CURRENCIES.COP.freeShippingGoal;
  const isFreeShipping = subtotalCOP >= freeShippingGoalCOP;
  const shippingFeeCOP = isFreeShipping ? 0 : 3000;

  const discountAmountCOP = subtotalCOP * appliedDiscount;
  const finalTotalCOP = subtotalCOP - discountAmountCOP + shippingFeeCOP;

  msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💵 *Subtotal:* ${formatMoney(subtotalCOP)}\n`;
  if (appliedDiscount > 0) {
    msg += `🎉 *Descuento:* -${formatMoney(discountAmountCOP)} (${appliedDiscount * 100}%)\n`;
  }
  if (isFreeShipping) {
    msg += `🛵 *Envío:* ¡Gratis a todo el municipio! 🎉\n`;
  } else {
    msg += `🛵 *Envío:* ${formatMoney(shippingFeeCOP)} (Domicilio en el municipio)\n`;
  }
  msg += `🔥 *TOTAL A PAGAR:* ${formatMoney(finalTotalCOP)}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `¡Quedo atento(a) para la confirmación de mi pedido! 🍬`;

  return encodeURIComponent(msg);
}

if (checkoutWhatsAppBtn) {
  checkoutWhatsAppBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Tu carrito está vacío', '⭐️');
      return;
    }
    // Abrir modal de dirección
    const quickModal = document.getElementById('quickDeliveryModal');
    if (quickModal) quickModal.classList.add('open');
  });
}

// Cerrar modal de entrega rápida
const closeQuickDeliveryBtn = document.getElementById('closeQuickDeliveryBtn');
const quickDeliveryModal = document.getElementById('quickDeliveryModal');
if (closeQuickDeliveryBtn) {
  closeQuickDeliveryBtn.addEventListener('click', () => {
    quickDeliveryModal.classList.remove('open');
  });
}
if (quickDeliveryModal) {
  quickDeliveryModal.addEventListener('click', (e) => {
    if (e.target === quickDeliveryModal) quickDeliveryModal.classList.remove('open');
  });
}

// Mostrar/ocultar campo de cambio según método de pago
const qdPaymentSelect = document.getElementById('qdPayment');
const qdCashGroup = document.getElementById('qdCashGroup');
if (qdPaymentSelect) {
  qdPaymentSelect.addEventListener('change', () => {
    if (qdPaymentSelect.value === 'Efectivo contra entrega') {
      qdCashGroup.classList.remove('hidden');
    } else {
      qdCashGroup.classList.add('hidden');
      document.getElementById('qdCash').value = '';
    }
  });
}

// Submit del formulario de entrega rápida → WhatsApp
const quickDeliveryForm = document.getElementById('quickDeliveryForm');
if (quickDeliveryForm) {
  quickDeliveryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const paymentMethod = document.getElementById('qdPayment').value;
    const cashAmount    = document.getElementById('qdCash').value;
    const paymentStr    = paymentMethod === 'Efectivo contra entrega' && cashAmount
      ? `Efectivo contra entrega 💵 (paga con $${Number(cashAmount).toLocaleString('es-CO')})`
      : paymentMethod;

    const customerDetails = {
      name:    document.getElementById('qdName').value,
      phone:   document.getElementById('qdPhone').value,
      address: document.getElementById('qdAddress').value,
      payment: paymentStr,
      notes:   document.getElementById('qdNotes').value
    };
    const msg = generateWhatsAppMessage(customerDetails);
    if (msg) {
      const waNumber = '573226015381';
      window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank');
      quickDeliveryModal.classList.remove('open');
      closeCartDrawer();
      showToast('¡Pedido generado! Redirigiendo a WhatsApp...', '🟢');
    }
  });
}

// Checkout Modal
if (openCheckoutModalBtn) {
  openCheckoutModalBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Tu carrito está vacío', '⭐️');
      return;
    }
    checkoutModal.classList.add('open');
  });
}

if (closeCheckoutModal) {
  closeCheckoutModal.addEventListener('click', () => {
    checkoutModal.classList.remove('open');
  });
}

if (checkoutForm) {
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const customerDetails = {
      name: document.getElementById('custName').value,
      phone: document.getElementById('custPhone').value,
      address: document.getElementById('custAddress').value,
      payment: document.getElementById('custPayment').value,
      notes: document.getElementById('custNotes').value
    };

    const msg = generateWhatsAppMessage(customerDetails);
    if (msg) {
      const waNumber = '573226015381';
      window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank');
      checkoutModal.classList.remove('open');
      closeCartDrawer();
      showToast('¡Pedido generado con éxito! Redirigiendo a WhatsApp...', '🟢');
      // Clear cart after submitting
      cart = [];
      appliedDiscount = 0;
      saveCart();
    }
  });
}

// ==========================================
// 11. Category Filters
// ==========================================
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProducts(btn.dataset.filter);
  });
});

// ==========================================
// 12. FAQ Accordion
// ==========================================
document.querySelectorAll('.faq-item').forEach(item => {
  const questionBtn = item.querySelector('.faq-question');
  questionBtn.addEventListener('click', () => {
    const isActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!isActive) {
      item.classList.add('active');
    }
  });
});

// ==========================================
// 13. Currency Switcher Listener
// ==========================================
if (currencySelector) {
  currencySelector.addEventListener('change', (e) => {
    currentCurrency = e.target.value;
    renderProducts(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
    calculateCustomMix();
    updateCombosPrices();
    updateCartUI();
    showToast(`Moneda cambiada a ${currentCurrency}`, '🍓');
  });
}

function updateCombosPrices() {
  document.querySelectorAll('.combo-card').forEach(card => {
    const oldPriceEl = card.querySelector('.old-price');
    const curPriceEl = card.querySelector('.current-price');
    if (oldPriceEl && oldPriceEl.dataset.raw) {
      oldPriceEl.textContent = formatMoney(parseInt(oldPriceEl.dataset.raw, 10));
    }
    if (curPriceEl && curPriceEl.dataset.raw) {
      curPriceEl.textContent = formatMoney(parseInt(curPriceEl.dataset.raw, 10));
    }
  });
}

// ==========================================
// 14. Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  calculateCustomMix();
  updateCartUI();
});

