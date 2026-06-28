const STORAGE_KEY = 'buylappysales-products';
const QR_KEY = 'buylappysales-qr';
const OWNER_UNLOCK_KEY = 'buylappysales-owner-unlocked';
const ADMIN_PASSWORD = 'buylappysales';

const productForm = document.getElementById('product-form');
const productGrid = document.getElementById('product-grid');
const adminToggle = document.getElementById('admin-toggle');
const accessModal = document.getElementById('access-modal');
const accessSubmit = document.getElementById('access-submit');
const accessClose = document.getElementById('access-close');
const adminPasswordInput = document.getElementById('admin-password');
const productNameInput = document.getElementById('product-name');
const productPriceInput = document.getElementById('product-price');
const productDescriptionInput = document.getElementById('product-description');
const productImageInput = document.getElementById('product-image');
const qrInput = document.getElementById('qr-image');
const qrPreview = document.getElementById('qr-preview');
const qrPlaceholder = document.getElementById('qr-placeholder');
const productCount = document.getElementById('product-count');
const qrStatus = document.getElementById('qr-status');
const dashboardCard = document.querySelector('.dashboard-card');
const ownerPanelLink = document.getElementById('owner-panel-link');
const dashboardLock = document.getElementById('dashboard-lock');
const ownerControls = document.querySelectorAll('#product-form input, #product-form textarea, #product-form select, #product-form button, #qr-image');
const cartLink = document.getElementById('cart-link');
const cartCountElements = document.querySelectorAll('#cart-count');
const orderForm = document.getElementById('order-form');
const checkoutItems = document.getElementById('checkout-items');
const checkoutTotal = document.getElementById('checkout-total');
const scannerCard = document.getElementById('scanner-card');
const paymentAmount = document.getElementById('payment-amount');
const scanButton = document.getElementById('scan-button');
const paymentStatus = document.getElementById('payment-status');

let products = loadProducts();
let qrImage = localStorage.getItem(QR_KEY) || '';

function on(element, event, handler) {
  if (element) {
    element.addEventListener(event, handler);
  }
}

function loadProducts() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }

  const sampleProducts = [
    {
      id: crypto.randomUUID(),
      name: 'Smartwatch Pro',
      price: 6999,
      description: 'Elegant fitness tracker with AMOLED display.',
      category: 'Electronics',
      image: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="#eef5ff"/><rect x="220" y="120" width="360" height="260" rx="28" fill="white" stroke="#1f6fff" stroke-width="10"/><rect x="296" y="168" width="208" height="140" rx="24" fill="#dbeeff"/><circle cx="400" cy="240" r="46" fill="#1f6fff"/><path d="M354 240h92" stroke="white" stroke-width="12" stroke-linecap="round"/><path d="M400 194v92" stroke="white" stroke-width="12" stroke-linecap="round"/></svg>')
    },
    {
      id: crypto.randomUUID(),
      name: 'Noise Cancelling Headphones',
      price: 4999,
      description: 'Immersive sound for work and travel.',
      category: 'Electronics',
      image: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="#f5f9ff"/><rect x="220" y="180" width="360" height="140" rx="70" fill="#ffffff" stroke="#1f6fff" stroke-width="10"/><rect x="280" y="210" width="120" height="88" rx="40" fill="#dbeeff"/><rect x="400" y="210" width="120" height="88" rx="40" fill="#dbeeff"/><rect x="268" y="160" width="264" height="40" rx="20" fill="#1f6fff"/></svg>')
    }
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleProducts));
  return sampleProducts;
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  renderProducts();
}

function updateCartCount() {
  const count = getCart().length;
  cartCountElements.forEach((element) => {
    element.textContent = count;
  });
}

function safeAddEventListener(element, event, handler) {
  if (element) {
    element.addEventListener(event, handler);
  }
}

function renderProducts() {
  if (productCount) {
    productCount.textContent = products.length;
  }
  updateCartCount();

  if (!productGrid) {
    return;
  }

  productGrid.innerHTML = '';

  if (!products.length) {
    productGrid.innerHTML = '<p class="empty-state">No products yet. Add your first electronics listing.</p>';
    return;
  }

  products.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-info">
        <h4>${product.name}</h4>
        <p>${product.description || 'Premium electronics item.'}</p>
        <div class="price-row">
          <span class="price-tag">₹${product.price.toLocaleString('en-IN')}</span>
          <span>${product.category}</span>
        </div>
        <div class="product-actions">
          <button class="primary-btn" type="button" data-id="${product.id}" data-action="buy">Buy now</button>
          <button class="secondary-btn" type="button" data-id="${product.id}" data-action="add">Add to cart</button>
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

function getCart() {
  return JSON.parse(localStorage.getItem('buylappysales-cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('buylappysales-cart', JSON.stringify(cart));
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    cartCount.textContent = cart.length;
  }
}

function addToCart(productId) {
  const cart = getCart();
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  cart.push(product);
  saveCart(cart);
  alert(`Added ${product.name} to cart.`);
}

function buyNow(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  saveCart([product]);
  window.location.href = 'checkout.html';
}

function renderQr() {
  if (!qrPreview || !qrPlaceholder || !qrStatus) {
    return;
  }

  if (qrImage) {
    qrPreview.src = qrImage;
    qrPreview.style.display = 'block';
    qrPlaceholder.style.display = 'none';
    qrStatus.textContent = 'Ready';
  } else {
    qrPreview.removeAttribute('src');
    qrPreview.style.display = 'none';
    qrPlaceholder.style.display = 'block';
    qrStatus.textContent = 'Not set';
  }
}

function showAccessModal() {
  accessModal.classList.remove('hidden');
  accessModal.setAttribute('aria-hidden', 'false');
  adminPasswordInput.focus();
}

function hideAccessModal() {
  accessModal.classList.add('hidden');
  accessModal.setAttribute('aria-hidden', 'true');
}

safeAddEventListener(adminToggle, 'click', showAccessModal);
safeAddEventListener(accessClose, 'click', hideAccessModal);
safeAddEventListener(accessModal, 'click', (event) => {
  if (event.target === accessModal) {
    hideAccessModal();
  }
});

function setOwnerLocked(isLocked) {
  if (!dashboardCard) {
    return;
  }

  if (isLocked) {
    dashboardCard.classList.add('locked', 'hidden');
    if (ownerPanelLink) ownerPanelLink.classList.add('hidden');
    if (dashboardLock) dashboardLock.style.display = 'block';
    ownerControls.forEach((control) => {
      control.disabled = true;
    });
    localStorage.removeItem(OWNER_UNLOCK_KEY);
  } else {
    dashboardCard.classList.remove('locked', 'hidden');
    if (ownerPanelLink) ownerPanelLink.classList.remove('hidden');
    if (dashboardLock) dashboardLock.style.display = 'none';
    ownerControls.forEach((control) => {
      control.disabled = false;
    });
    localStorage.setItem(OWNER_UNLOCK_KEY, 'true');
  }

  if (adminToggle) {
    adminToggle.textContent = isLocked ? 'Admin Access' : 'Dashboard unlocked';
  }
}

safeAddEventListener(accessSubmit, 'click', () => {
  if (adminPasswordInput && adminPasswordInput.value === ADMIN_PASSWORD) {
    setOwnerLocked(false);
    hideAccessModal();
    if (adminPasswordInput) {
      adminPasswordInput.value = '';
    }
    if (adminToggle) {
      adminToggle.textContent = 'Dashboard unlocked';
    }
  } else {
    alert('Incorrect password. Please try again.');
  }
});

const ownerUnlocked = localStorage.getItem(OWNER_UNLOCK_KEY) === 'true';
setOwnerLocked(!ownerUnlocked);

if (productForm) {
  safeAddEventListener(productForm, 'submit', async (event) => {
    event.preventDefault();

    if (!productImageInput.files[0]) {
      alert('Please upload a product image.');
      return;
    }

    const imageBase64 = await readFileAsDataUrl(productImageInput.files[0]);
    const product = {
      id: crypto.randomUUID(),
      name: productNameInput.value.trim(),
      price: Number(productPriceInput.value),
      description: productDescriptionInput.value.trim(),
      category: 'Electronics',
      image: imageBase64
    };

    products = [product, ...products];
    saveProducts();
    productForm.reset();
    alert('Product added to your store.');
  });
}

if (productGrid) {
  safeAddEventListener(productGrid, 'click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    const productId = button.getAttribute('data-id');
    const action = button.getAttribute('data-action');
    if (!productId || !action) return;

    if (action === 'add') {
      addToCart(productId);
    } else if (action === 'buy') {
      buyNow(productId);
    }
  });
}

if (qrInput) {
  safeAddEventListener(qrInput, 'change', async () => {
    if (!qrInput.files[0]) {
      return;
    }

    qrImage = await readFileAsDataUrl(qrInput.files[0]);
    localStorage.setItem(QR_KEY, qrImage);
    renderQr();
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function setupCheckout() {
  if (!checkoutItems || !orderForm || !scannerCard || !paymentAmount || !scanButton || !paymentStatus) {
    updateCartCount();
    return;
  }

  const cart = getCart();
  checkoutItems.innerHTML = '';
  let total = 0;

  if (!cart.length) {
    checkoutItems.innerHTML = '<li>Your cart is empty. Add products from the store.</li>';
  } else {
    cart.forEach((product) => {
      const line = document.createElement('li');
      line.innerHTML = `
        <div class="checkout-item-info">
          <span>${product.name}</span>
          <strong>₹${product.price.toLocaleString('en-IN')}</strong>
        </div>
        <button class="ghost-btn remove-button" type="button" data-remove="${product.id}">Remove</button>
      `;
      checkoutItems.appendChild(line);
      total += product.price;
    });
  }

  checkoutTotal.textContent = `₹${total.toLocaleString('en-IN')}`;
  paymentAmount.textContent = `₹${total.toLocaleString('en-IN')}`;

  safeAddEventListener(checkoutItems, 'click', (event) => {
    const button = event.target.closest('button[data-remove]');
    if (!button) return;

    const productId = button.getAttribute('data-remove');
    const cart = getCart();
    const updatedCart = cart.filter((item) => item.id !== productId);
    saveCart(updatedCart);
    setupCheckout();
    renderProducts();
  });

  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!cart.length) {
      alert('Your cart is empty. Add a product first.');
      return;
    }

    scannerCard.classList.remove('hidden');
    orderForm.querySelector('button').disabled = true;
  });

  scanButton.addEventListener('click', () => {
    const totalAmount = total;
    paymentStatus.innerHTML = `<div class="scan-success">Success! Amount captured: ₹${totalAmount.toLocaleString('en-IN')}.</div>`;
    localStorage.removeItem('buylappysales-cart');
    saveCart([]);
  });
}

renderProducts();
renderQr();
setupCheckout();
