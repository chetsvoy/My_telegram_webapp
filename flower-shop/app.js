const PRODUCT_LIST = [
  { id: 'roses_classic', name: 'Классические розы', price: 2490, image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=60', desc: '15 алых роз, лента' },
  { id: 'tulips_mix', name: 'Тюльпаны микс', price: 1790, image: 'https://images.unsplash.com/photo-1455813870877-04a32045af63?auto=format&fit=crop&w=800&q=60', desc: '21 тюльпан, крафт' },
  { id: 'peony_dream', name: 'Пионы мечты', price: 4290, image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=60', desc: '9 пионов, нежная упаковка' },
  { id: 'wild_flower', name: 'Полевой букет', price: 1990, image: 'https://images.unsplash.com/photo-1491002052546-7312450f2ef6?auto=format&fit=crop&w=800&q=60', desc: 'Сезонные цветы и травы' },
  { id: 'orchid_elegance', name: 'Орхидея фаленопсис', price: 3590, image: 'https://images.unsplash.com/photo-1504199367641-aba8151af406?auto=format&fit=crop&w=800&q=60', desc: 'В горшке, 2 цветоноса' },
  { id: 'sunflower_bright', name: 'Подсолнухи яркие', price: 1690, image: 'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?auto=format&fit=crop&w=800&q=60', desc: '7 подсолнухов' },
  { id: 'eustoma_tender', name: 'Эустома нежная', price: 2290, image: 'https://images.unsplash.com/photo-1496060169243-453fde45943b?auto=format&fit=crop&w=800&q=60', desc: '11 эустом, пастель' },
  { id: 'mix_deluxe', name: 'Микс делюкс', price: 5490, image: 'https://images.unsplash.com/photo-1457089328109-e5d9bd499191?auto=format&fit=crop&w=800&q=60', desc: 'Авторский букет' },
];

const currency = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' });
const cartKey = 'flower_shop_cart';

function loadCart() {
  try { return JSON.parse(localStorage.getItem(cartKey)) || []; } catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

function getCartCount(cart) { return cart.reduce((s, i) => s + i.qty, 0); }
function getCartTotal(cart) { return cart.reduce((s, i) => s + i.qty * i.price, 0); }

function renderProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  PRODUCT_LIST.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div class="content">
        <div class="title">${p.name}</div>
        <div class="desc">${p.desc}</div>
        <div class="row">
          <div class="price">${currency.format(p.price)}</div>
          <button class="btn-primary" data-add="${p.id}">В корзину</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderCart(cart) {
  const itemsEl = document.getElementById('cartItems');
  const countEl = document.getElementById('cartCount');
  const totalEl = document.getElementById('cartTotal');
  itemsEl.innerHTML = '';

  if (cart.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'muted';
    empty.textContent = 'Ваша корзина пуста';
    itemsEl.appendChild(empty);
  }

  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div>
        <div class="name">${item.name}</div>
        <div class="muted">${currency.format(item.price)}</div>
      </div>
      <div>
        <div class="qty">
          <button data-dec="${item.id}">−</button>
          <span>${item.qty}</span>
          <button data-inc="${item.id}">+</button>
        </div>
      </div>
    `;
    itemsEl.appendChild(row);
  });

  countEl.textContent = String(getCartCount(cart));
  totalEl.textContent = currency.format(getCartTotal(cart));
}

function findProduct(productId) {
  return PRODUCT_LIST.find(p => p.id === productId);
}

function upsertCart(cart, product, delta) {
  const idx = cart.findIndex(i => i.id === product.id);
  if (idx === -1 && delta > 0) {
    cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty: delta });
  } else if (idx !== -1) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
  }
}

function openCart() {
  const drawer = document.getElementById('cartDrawer');
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
}
function closeCart() {
  const drawer = document.getElementById('cartDrawer');
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
}

function setupEvents() {
  const grid = document.getElementById('productGrid');
  const cartBtn = document.getElementById('cartButton');
  const closeBtn = document.getElementById('closeCart');
  const form = document.getElementById('checkoutForm');
  const msg = document.getElementById('orderMessage');

  let cart = loadCart();
  renderCart(cart);

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    const id = btn.getAttribute('data-add');
    const product = findProduct(id);
    if (!product) return;
    upsertCart(cart, product, 1);
    saveCart(cart);
    renderCart(cart);
    openCart();
  });

  document.getElementById('cartItems').addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    if (!inc && !dec) return;
    const id = (inc || dec).getAttribute('data-inc') || (inc || dec).getAttribute('data-dec');
    const product = findProduct(id);
    if (!product) return;
    upsertCart(cart, product, inc ? 1 : -1);
    saveCart(cart);
    renderCart(cart);
  });

  cartBtn.addEventListener('click', openCart);
  closeBtn.addEventListener('click', closeCart);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.textContent = '';
    msg.className = 'order-message';

    if (cart.length === 0) {
      msg.textContent = 'Добавьте товары в корзину';
      msg.classList.add('error');
      return;
    }

    const formData = new FormData(form);
    const payload = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      items: cart.map(i => ({ id: i.id, qty: i.qty })),
      total: getCartTotal(cart),
    };

    console.log('Order payload', payload);
    msg.textContent = 'Заказ оформлен! Мы свяжемся с вами для подтверждения.';
    msg.classList.add('success');
    cart = [];
    saveCart(cart);
    renderCart(cart);
    form.reset();
  });
}

renderProducts();
setupEvents();
