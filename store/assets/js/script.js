// Fungsionalitas Keranjang
let cart = [];
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.querySelector(".cart-count");
const cartSidebar = document.getElementById("cartSidebar");
const loadingSpinner = document.querySelector(".loading-spinner");
const errorMessage = document.getElementById("errorMessage");
const retryBtn = document.getElementById("retryBtn");
const overlay = document.createElement("div");
overlay.className = "overlay";
document.body.appendChild(overlay);

// Elemen filter
const searchProductInput = document.getElementById("searchProduct");
const filterBrandSelect = document.getElementById("filterBrand");
const filterCategorySelect = document.getElementById("filterCategory");

// Menyimpan data produk
let productsData = [];

// Elemen modal pembayaran
const paymentModal = document.createElement("div");
paymentModal.className = "payment-modal";
paymentModal.innerHTML = `
    <div class="payment-modal-content">
        <div class="payment-header">
            <h3>Pembayaran</h3>
            <button class="close-payment">&times;</button>
        </div>
        <div class="payment-body">
            <div class="bank-transfer">
                <h4>Transfer Bank</h4>
                <div class="bank-account">
                    <div class="bank-logo">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/1200px-Bank_Central_Asia.svg.png" alt="BCA">
                    </div>
                    <div class="bank-details">
                        <p><strong>BCA</strong></p>
                        <p>No. Rekening: 3570513264</p>
                        <p>Atas Nama: SUYOKO</p>
                    </div>
                </div>
                <div class="bank-account">
                    <div class="bank-logo">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Logo_Bank_BRI_%28Indonesia%29.svg/1200px-Logo_Bank_BRI_%28Indonesia%29.svg.png" alt="BRI">
                    </div>
                    <div class="bank-details">
                        <p><strong>BRI</strong></p>
                        <p>No. Rekening: 661901000007560</p>
                        <p>Atas Nama: SUYOKO</p>
                    </div>
                </div>
            </div>
            <div class="payment-instructions">
                <h4>Instruksi Pembayaran:</h4>
                <ol>
                    <li>Lakukan transfer sesuai total pembayaran</li>
                    <li>Simpan bukti transfer</li>
                    <li>Pesanan akan diproses setelah pembayaran dikonfirmasi</li>
                </ol>
            </div>
            <div class="order-summary">
                <h4>Ringkasan Pesanan</h4>
                <div id="orderSummary"></div>
                <div class="order-total">
                    <p>Total Pembayaran: <strong id="paymentTotal">Rp 0</strong></p>
                </div>
            </div>
        </div>
        <div class="payment-footer">
            <button id="mainConfirmPaymentBtn" class="confirm-payment">Konfirmasi Pembayaran</button>
        </div>
    </div>
`;
document.body.appendChild(paymentModal);

// Elemen modal riwayat transaksi
const transactionHistoryModal = document.getElementById("transactionHistoryModal");
const transactionHistoryBody = document.getElementById("transactionHistoryBody");
const closeHistoryBtn = document.querySelector(".close-history");
const clearHistoryBtn = document.querySelector(".clear-history-btn");
const historyBtn = document.getElementById("historyBtn");

// Elemen modal kuantitas kustom
const quantityModal = document.getElementById("quantityModal");
const quantityModalTitle = document.getElementById("quantityModalTitle");
const quantityModalProductInfo = document.getElementById("quantityModalProductInfo");
const quantityInput = document.getElementById("quantityInput");
const confirmQuantityBtn = document.getElementById("confirmQuantityBtn");
const closeQuantityModalBtn = document.querySelector(".close-quantity-modal");

let currentProductToAdd = null; // Menyimpan produk yang sedang ditambahkan ke keranjang

// Inisialisasi toko
async function initStore() {
    try {
        showLoading();
        productsData = await window.ProductAPI.fetchProducts();
        loadCartFromLocalStorage(); // Memuat keranjang dari localStorage
        populateFilters(); // Memanggil fungsi untuk mengisi filter
        applyFilters(); // Menerapkan filter awal (menampilkan semua produk)
        hideLoading();
        setupCartButtons();
    } catch (error) {
        console.error("Inisialisasi toko gagal:", error);
        showError();
    }
}

// Fungsi UI
function showLoading() {
    if (loadingSpinner) loadingSpinner.style.display = "flex";
    const productGrid = document.getElementById("productGrid");
    if (productGrid) productGrid.style.display = "none";
    if (errorMessage) errorMessage.style.display = "none";
}

function hideLoading() {
    if (loadingSpinner) loadingSpinner.style.display = "none";
    const productGrid = document.getElementById("productGrid");
    if (productGrid) productGrid.style.display = "grid";
}

function showError() {
    if (loadingSpinner) loadingSpinner.style.display = "none";
    if (errorMessage) errorMessage.style.display = "flex";
}

function setupCartButtons() {
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.removeEventListener("click", handleAddToCartClick); // Hapus listener lama jika ada
        button.addEventListener("click", handleAddToCartClick); // Tambahkan listener baru
    });
}

// Mengisi dropdown filter brand dan kategori
function populateFilters() {
    const availableProducts = productsData.filter(product => product.harga_retail > 0);

    const brands = window.ProductAPI.getUniqueBrands(availableProducts);
    const categories = window.ProductAPI.getUniqueCategories(availableProducts);

    filterBrandSelect.innerHTML = '<option value="">Semua Brand</option>';
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        filterBrandSelect.appendChild(option);
    });

    filterCategorySelect.innerHTML = '<option value="">Semua Kategori</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterCategorySelect.appendChild(option);
    });
}

// Menerapkan filter dan merender produk
function applyFilters() {
    const searchTerm = searchProductInput.value.toLowerCase();
    const selectedBrand = filterBrandSelect.value;
    const selectedCategory = filterCategorySelect.value;

    const filteredProducts = productsData.filter(product => {
        const isAvailable = product.harga_retail > 0;

        const matchesSearch = product.nama_produk.toLowerCase().includes(searchTerm) ||
            product.deskripsi.toLowerCase().includes(searchTerm);
        const matchesBrand = selectedBrand === "" || product.brand === selectedBrand;
        const matchesCategory = selectedCategory === "" || product.nama_kategori === selectedCategory;

        return isAvailable && matchesSearch && matchesBrand && matchesCategory;
    });

    window.ProductAPI.renderProducts(filteredProducts);
    setupCartButtons();
}

// Menghitung total kuantitas berdasarkan kategori
function getCategoryTotal(category) {
    return cart.reduce((total, item) => {
        const product = productsData.find(p => p.kode_produk === item.id);
        return product && product.nama_kategori === category
            ? total + item.quantity
            : total;
    }, 0);
}

// Fungsi untuk menampilkan modal kuantitas
function showQuantityModal(product) {
    currentProductToAdd = product;
    quantityModalTitle.textContent = `Beli ${product.nama_produk}`;
    quantityModalProductInfo.textContent = `Masukkan jumlah ${product.nama_produk} yang ingin dibeli:`;
    quantityInput.value = 1; // Default ke 1
    quantityInput.focus(); // Fokuskan input untuk kemudahan pengguna

    quantityModal.classList.add("active");
    overlay.classList.add("active");
}

// Fungsi untuk menyembunyikan modal kuantitas
function hideQuantityModal() {
    quantityModal.classList.remove("active");
    overlay.classList.remove("active");
    currentProductToAdd = null;
}

// Handler saat tombol "Beli" diklik
function handleAddToCartClick(e) {
    const button = e.target.closest(".add-to-cart");
    const productId = button.getAttribute("data-id");
    const product = productsData.find(p => p.kode_produk === productId);

    if (product) {
        showQuantityModal(product);
    }
}

// Fungsi untuk menambahkan produk ke keranjang dari modal kuantitas
function addProductToCartFromModal() {
    if (!currentProductToAdd) return;

    const qty = parseInt(quantityInput.value) || 1;

    if (qty <= 0) {
        const customAlert = document.createElement('div');
        customAlert.className = 'payment-modal active';
        customAlert.innerHTML = `
            <div class="payment-modal-content" style="max-width: 300px; padding: 20px; text-align: center;">
                <h4>Kuantitas Tidak Valid!</h4>
                <p>Kuantitas harus lebih besar dari 0.</p>
                <button class="confirm-payment" style="margin-top: 15px;" onclick="this.closest('.payment-modal').remove();">Tutup</button>
            </div>
        `;
        document.body.appendChild(customAlert);
        return;
    }

    const productId = currentProductToAdd.kode_produk;
    const product = currentProductToAdd;
    const category = product.nama_kategori;

    // Tentukan min_qty_grosir berdasarkan kategori
    let effectiveMinQtyGrosir = 2; // Default untuk lainnya
    if (category === 'Voucher Internet') {
        effectiveMinQtyGrosir = 100;
    } else if (category === 'Kartu Perdana') { // Menambahkan kondisi untuk Kartu Perdana
        effectiveMinQtyGrosir = 5;
    }
    // Kategori lain seperti 'Kabel Data' akan tetap menggunakan default 2

    const existingItem = cart.find(item => item.id === productId);
    const categoryTotal = getCategoryTotal(product.nama_kategori) + qty;

    const useWholesalePrice = categoryTotal >= effectiveMinQtyGrosir;
    const price = useWholesalePrice
        ? product.harga_grosir
        : product.harga_retail;

    if (existingItem) {
        existingItem.quantity += qty;
        if (useWholesalePrice) {
            existingItem.price = price;
            existingItem.isWholesale = true;
        }
    } else {
        cart.push({
            id: productId,
            name: product.nama_produk,
            price: price,
            image: product.gambar_url,
            quantity: qty,
            isWholesale: useWholesalePrice,
            category: product.nama_kategori
        });
    }

    if (useWholesalePrice) {
        cart.forEach(item => {
            const itemProduct = productsData.find(
                p => p.kode_produk === item.id
            );
            if (
                itemProduct &&
                itemProduct.nama_kategori === product.nama_kategori &&
                !item.isWholesale
            ) {
                item.price = itemProduct.harga_grosir;
                item.isWholesale = true;
            }
        });
    }

    updateCart();
    saveCartToLocalStorage();
    showCartNotification(
        `${qty} ${product.nama_produk} ditambahkan ke keranjang`
    );
    hideQuantityModal(); // Sembunyikan modal setelah menambahkan ke keranjang
}


function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    saveCartToLocalStorage(); // Simpan keranjang setelah perubahan
}

function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        const product = productsData.find(p => p.kode_produk === productId);
        if (product) {
            newQuantity = Math.max(1, newQuantity);
            const category = product.nama_kategori;

            // Tentukan min_qty_grosir berdasarkan kategori
            let effectiveMinQtyGrosir = 2; // Default untuk lainnya
            if (category === 'Voucher Internet') {
                effectiveMinQtyGrosir = 100;
            } else if (category === 'Kartu Perdana') { // Menambahkan kondisi untuk Kartu Perdana
                effectiveMinQtyGrosir = 5;
            }
            // Kategori lain seperti 'Kabel Data' akan tetap menggunakan default 2

            const categoryTotal =
                getCategoryTotal(item.category) - item.quantity + newQuantity;
            const useWholesalePrice = categoryTotal >= effectiveMinQtyGrosir;

            item.quantity = newQuantity;
            item.price = useWholesalePrice
                ? product.harga_grosir
                : product.harga_retail;
            item.isWholesale = useWholesalePrice;

            if (useWholesalePrice) {
                cart.forEach(cartItem => {
                    const cartProduct = productsData.find(
                        p => p.kode_produk === cartItem.id
                    );
                    if (
                        cartProduct &&
                        cartProduct.nama_kategori === item.category &&
                        !cartItem.isWholesale
                    ) {
                        cartItem.price = cartProduct.harga_grosir;
                        cartItem.isWholesale = true;
                    }
                });
            }

            updateCart();
            saveCartToLocalStorage(); // Simpan keranjang setelah perubahan
        }
    }
}

function updateCart() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML =
            '<p class="empty-cart">Keranjang belanja kosong</p>';
        cartTotal.textContent = "Rp 0";
        return;
    }

    cartItems.innerHTML = "";
    let totalPrice = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;

        const cartItemElement = document.createElement("div");
        cartItemElement.className = "cart-item";
        cartItemElement.innerHTML = `
            <img src="${item.image || "https://via.placeholder.com/60x60?text=No+Image"
            }" 
                 alt="${item.name}" 
                 class="cart-item-img">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.name}</h4>
                <p class="cart-item-price">Rp ${item.price.toLocaleString(
                "id-ID"
            )} ${item.isWholesale ? "(Grosir)" : ""}</p>
                <div class="cart-item-actions">
                    <button class="quantity-btn minus" data-id="${item.id
            }">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity
            }" min="1" data-id="${item.id}">
                    <button class="quantity-btn plus" data-id="${item.id
            }">+</button>
                    <button class="remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        cartItems.appendChild(cartItemElement);
    });

    cartTotal.textContent = `Rp ${totalPrice.toLocaleString("id-ID")}`;

    document.querySelectorAll(".quantity-btn.minus").forEach(btn => {
        btn.addEventListener("click", e => {
            const id = e.target.getAttribute("data-id");
            const item = cart.find(item => item.id === id);
            if (item) {
                updateQuantity(id, item.quantity - 1);
            }
        });
    });

    document.querySelectorAll(".quantity-btn.plus").forEach(btn => {
        btn.addEventListener("click", e => {
            const id = e.target.getAttribute("data-id");
            const item = cart.find(item => item.id === id);
            if (item) {
                updateQuantity(id, item.quantity + 1);
            }
        });
    });

    document.querySelectorAll(".quantity-input").forEach(input => {
        input.addEventListener("change", e => {
            const id = e.target.getAttribute("data-id");
            const newQuantity = parseInt(e.target.value) || 1;
            updateQuantity(id, newQuantity);
        });
    });

    document.querySelectorAll(".remove-item").forEach(btn => {
        btn.addEventListener("click", e => {
            const id = e.target.closest("button").getAttribute("data-id");
            removeFromCart(id);
        });
    });
}

function showCartNotification(message) {
    const notification = document.createElement("div");
    notification.className = "cart-notification";
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add("show");
    }, 10);

    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function toggleCart() {
    cartSidebar.classList.toggle("active");
    overlay.classList.toggle("active");

    if (cartSidebar.classList.contains("active")) {
        updateCart();
    }
}

function hideCart() {
    cartSidebar.classList.remove("active");
    overlay.classList.remove("active");
}

async function showPaymentModal() {
    if (cart.length === 0) {
        const customAlert = document.createElement('div');
        customAlert.className = 'payment-modal active';
        customAlert.innerHTML = `
            <div class="payment-modal-content" style="max-width: 300px; padding: 20px; text-align: center;">
                <h4>Keranjang Belanja Kosong!</h4>
                <p>Silakan tambahkan produk ke keranjang Anda.</p>
                <button class="confirm-payment" style="margin-top: 15px;" onclick="this.closest('.payment-modal').remove(); document.querySelector('.overlay').classList.remove('active');">Tutup</button>
            </div>
        `;
        document.body.appendChild(customAlert);
        overlay.classList.add('active');
        return;
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const orderSummary = document.getElementById("orderSummary");
    const paymentTotal = document.getElementById("paymentTotal");

    // Membangun header tabel
    let tableHTML = `
        <table class="order-summary-table" style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">
            <thead>
                <tr style="background-color: var(--light-color);">
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left; font-size: 0.85rem;">Produk</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left; font-size: 0.85rem;">Jumlah</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right; font-size: 0.85rem;">Total</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Menambahkan baris untuk setiap item di keranjang
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const priceType = item.isWholesale ? 'grosir' : 'retail'; // Menentukan jenis harga
        tableHTML += `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-size: 0.85rem;">
                    <strong>${item.name}</strong><br>
                    <span style="font-size: 0.75rem; color: var(--text-light);">Kode: ${item.id}</span>
                </td>
                <td style="padding: 8px; border: 1px solid #ddd; font-size: 0.85rem;">
                    ${item.quantity} × Rp${item.price.toLocaleString("id-ID")} (${priceType})
                </td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-size: 0.85rem;">
                    Rp${itemTotal.toLocaleString("id-ID")}
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    orderSummary.innerHTML = tableHTML;

    // Hapus pemisah terakhir jika ada (tidak diperlukan lagi dengan tabel)
    // if (orderSummary.lastElementChild && orderSummary.lastElementChild.classList.contains('item-separator')) {
    //     orderSummary.removeChild(orderSummary.lastElementChild);
    // }


    paymentTotal.textContent = `Rp ${total.toLocaleString("id-ID")}`;

    paymentModal.classList.add("active");
    overlay.classList.add("active");
}

function hidePaymentModal() {
    paymentModal.classList.remove("active");
    overlay.classList.remove("active");
}

// Fungsi generateOrderMessage dipindahkan ke whatsapp-message.js

// Fungsi untuk menyimpan keranjang ke localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Fungsi untuk memuat keranjang dari localStorage
function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
        updateCart(); // Perbarui tampilan keranjang setelah dimuat
    }
}

// Fungsi untuk menyimpan transaksi ke localStorage
function saveTransactionToLocalStorage(transaction) {
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Fungsi untuk memuat transaksi dari localStorage
function loadTransactionsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('transactions')) || [];
}

// Fungsi untuk merender riwayat transaksi
function renderTransactionHistory() {
    const transactions = loadTransactionsFromLocalStorage();
    if (transactions.length === 0) {
        transactionHistoryBody.innerHTML = '<p class="empty-history">Tidak ada riwayat transaksi.</p>';
        return;
    }

    transactionHistoryBody.innerHTML = '';
    transactions.forEach((transaction, index) => {
        const transactionDate = new Date(transaction.timestamp).toLocaleString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';
        transactionElement.innerHTML = `
            <h4>Transaksi pada ${transactionDate}</h4>
            <p>Total: <strong>Rp ${transaction.totalAmount.toLocaleString('id-ID')}</strong></p>
            <div class="transaction-details">
                <h5>Detail Pesanan:</h5>
                <ul>
                    ${transaction.cartItems.map(item => `
                        <li>${item.name} (${item.quantity} x Rp ${item.price.toLocaleString('id-ID')})</li>
                    `).join('')}
                </ul>
            </div>
        `;
        transactionHistoryBody.prepend(transactionElement); // Tambahkan yang terbaru di atas
    });
}

// Fungsi untuk menampilkan modal riwayat transaksi
function showTransactionHistoryModal() {
    renderTransactionHistory(); // Muat dan render riwayat setiap kali modal dibuka
    transactionHistoryModal.classList.add("active");
    overlay.classList.add("active");
}

// Fungsi untuk menyembunyikan modal riwayat transaksi
function hideTransactionHistoryModal() {
    transactionHistoryModal.classList.remove("active");
    overlay.classList.remove("active");
}

// Fungsi untuk menghapus riwayat transaksi
function clearTransactionHistory() {
    const customConfirm = document.createElement('div');
    customConfirm.className = 'payment-modal active';
    customConfirm.innerHTML = `
        <div class="payment-modal-content" style="max-width: 350px; padding: 20px; text-align: center;">
            <h4>Konfirmasi Hapus Riwayat</h4>
            <p>Apakah Anda yakin ingin menghapus semua riwayat transaksi?</p>
            <div style="display: flex; justify-content: space-around; margin-top: 20px;">
                <button class="confirm-payment" style="width: 45%; background-color: var(--error-color);" id="confirmClearYes">Ya</button>
                <button class="confirm-payment" style="width: 45%; background-color: var(--secondary-color);" id="confirmClearNo">Tidak</button>
            </div>
        </div>
    `;
    document.body.appendChild(customConfirm);
    overlay.classList.add('active');

    document.getElementById('confirmClearYes').addEventListener('click', () => {
        localStorage.removeItem('transactions');
        renderTransactionHistory();
        customConfirm.remove();
        overlay.classList.remove('active');
        showCartNotification("Riwayat transaksi berhasil dihapus!");
    });

    document.getElementById('confirmClearNo').addEventListener('click', () => {
        customConfirm.remove();
        overlay.classList.remove('active');
    });
}


async function completeOrder() {
    console.log("Fungsi completeOrder dipanggil."); // Log untuk debugging
    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const transactionData = {
        timestamp: new Date().toISOString(),
        cartItems: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            isWholesale: item.isWholesale,
            category: item.category
        })),
        totalAmount: total
    };

    saveTransactionToLocalStorage(transactionData);

    // Memanggil fungsi generateOrderMessage dari objek global yang baru
    const whatsappMessage = window.WhatsAppMessageGenerator.generateOrderMessage(cart);
    const whatsappUrl = `https://wa.me/6282137444888?text=${whatsappMessage}`;
    window.open(whatsappUrl, "_blank");

    // Clear cart after checkout
    cart = [];
    saveCartToLocalStorage(); // Simpan keranjang kosong
    updateCart();
    hidePaymentModal();
    hideCart();
    showCartNotification("Pesanan Anda telah dikirim dan riwayat disimpan!");
}

// Event Listeners
retryBtn.addEventListener("click", initStore);

document.addEventListener("DOMContentLoaded", () => {
    initStore();

    const cartIcon = document.querySelector(".cart-icon");
    cartIcon.addEventListener("click", toggleCart);

    const closeCart = document.querySelector(".close-cart");
    closeCart.addEventListener("click", hideCart);

    overlay.addEventListener("click", () => {
        hideCart();
        hidePaymentModal();
        hideTransactionHistoryModal(); // Tutup modal riwayat juga
        hideQuantityModal(); // Tutup modal kuantitas juga
        // Menutup alert kustom jika ada
        const customAlert = document.querySelector('.payment-modal.active .payment-modal-content h4:contains("Keranjang Belanja Kosong!")');
        if (customAlert) {
            customAlert.closest('.payment-modal').remove();
        }
    });

    const checkoutBtn = document.querySelector(".checkout-btn");
    checkoutBtn.addEventListener("click", showPaymentModal);

    const closePayment = document.querySelector(".close-payment");
    closePayment.addEventListener("click", hidePaymentModal);

    // Dapatkan tombol konfirmasi pembayaran utama menggunakan ID unik
    const mainConfirmPaymentBtn = document.getElementById("mainConfirmPaymentBtn");
    if (mainConfirmPaymentBtn) {
        mainConfirmPaymentBtn.addEventListener("click", completeOrder);
        console.log("Event listener berhasil dilampirkan ke tombol Konfirmasi Pembayaran utama.");
    } else {
        console.error("Tombol Konfirmasi Pembayaran utama tidak ditemukan!");
    }


    // Event listener untuk filter dan pencarian
    searchProductInput.addEventListener("input", applyFilters);
    filterBrandSelect.addEventListener("change", applyFilters);
    filterCategorySelect.addEventListener("change", applyFilters);

    // Event listener untuk riwayat transaksi
    historyBtn.addEventListener("click", showTransactionHistoryModal);
    closeHistoryBtn.addEventListener("click", hideTransactionHistoryModal);
    clearHistoryBtn.addEventListener("click", clearTransactionHistory);

    // Event listener untuk modal kuantitas kustom
    confirmQuantityBtn.addEventListener("click", addProductToCartFromModal);
    closeQuantityModalBtn.addEventListener("click", hideQuantityModal);
    quantityInput.addEventListener("keypress", (e) => {
        if (e.key === 'Enter') {
            addProductToCartFromModal();
        }
    });
});
