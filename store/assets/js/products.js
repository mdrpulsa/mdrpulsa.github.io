const API_URL = "https://script.google.com/macros/s/AKfycbwD_mRx7FMyjCSKMNJjsJzzZIl74irM4zyDUlwhAsReCNhPZKyWfOVHi_diJzqtG7M-RA/exec";

// Fungsi untuk mengambil data produk dari API
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        const textData = await response.text();

        // Membersihkan respons dari karakter non-JSON yang mungkin ada
        const jsonStart = textData.indexOf('{');
        const jsonEnd = textData.lastIndexOf('}') + 1;
        const jsonString = textData.slice(jsonStart, jsonEnd);

        const data = JSON.parse(jsonString);

        // Memvalidasi struktur data yang diterima
        if (!data?.data?.data) throw new Error('Struktur data tidak valid');

        // Memetakan data produk ke format yang konsisten
        return data.data.data.map(product => ({
            kode_produk: product.kode_produk || '',
            brand: product.brand || 'Provider',
            nama_produk: product.nama_produk || 'Produk Tanpa Nama',
            deskripsi: product.deskripsi || 'Tidak ada deskripsi',
            harga_retail: Number(product.harga_retail) || 0,
            harga_grosir: Number(product.harga_grosir) || Number(product.harga_retail) || 0,
            min_qty_grosir: Number(product.min_qty_grosir) || 100,
            gambar_url: product.gambar_url || 'https://via.placeholder.com/300?text=No+Image',
            nama_kategori: product.nama_kategori || 'Voucher'
        }));

    } catch (error) {
        console.error('Error fetching products:', error);
        return []; // Mengembalikan array kosong jika terjadi error
    }
}

// Fungsi untuk merender produk ke dalam grid
function renderProducts(productsToRender) {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;

    // Menampilkan pesan jika tidak ada produk yang tersedia
    productGrid.innerHTML = productsToRender.length === 0 ? `
        <div class="empty-message">
            <i class="fas fa-info-circle"></i>
            <p>Tidak ada produk yang tersedia</p>
        </div>
    ` : '';

    // Membuat kartu produk untuk setiap produk
    productsToRender.forEach(product => {
        // Tentukan effectiveMinQtyGrosir berdasarkan kategori produk
        let effectiveMinQtyGrosir = 2; // Default untuk kategori 'lainnya' (seperti Kabel Data, dll.)
        if (product.nama_kategori === 'Voucher Internet') {
            effectiveMinQtyGrosir = 100;
        } else if (product.nama_kategori === 'Kartu Perdana') {
            effectiveMinQtyGrosir = 5;
        }
        // Kategori lain akan menggunakan default 2

        const productCard = document.createElement('div');
        productCard.className = "product-card";
        productCard.innerHTML = `
            <div class="product-brand">${product.brand}</div>
            <div class="product-image-container">
                <img src="${product.gambar_url}" 
                     alt="${product.nama_produk}" 
                     loading="lazy"
                     onerror="this.onerror=null;this.src='https://via.placeholder.com/300?text=Image+Not+Found';">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.nama_produk}</h3>
                <div class="product-duration">${product.nama_kategori}</div>
                <div class="product-description">${formatDescription(product.deskripsi)}</div>
                <div class="product-footer">
                    <div class="price-container">
                        <span class="price-label">Harga:</span>
                        <span class="product-price">Rp ${product.harga_retail.toLocaleString('id-ID')}</span>
                        ${product.harga_grosir && product.harga_grosir < product.harga_retail ?
                `<span class="price-label" style="margin-top:5px;">Grosir (min ${effectiveMinQtyGrosir}):</span>
                           <span class="product-price" style="color:var(--success-color);">Rp ${product.harga_grosir.toLocaleString('id-ID')}</span>` : ''}
                    </div>
                    <button class="add-to-cart" 
                            data-id="${product.kode_produk}"
                            data-name="${product.nama_produk}"
                            data-price="${product.harga_retail}"
                            data-grosir-price="${product.harga_grosir}"
                            data-min-qty="${effectiveMinQtyGrosir}"
                            data-image="${product.gambar_url}"
                            data-category="${product.nama_kategori}">
                        <i class="fas fa-cart-plus"></i> Beli
                    </button>
                </div>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
}

// Fungsi untuk memformat deskripsi produk
function formatDescription(desc) {
    return desc.split('\n').map(item =>
        `<div class="description-item">${item.trim().replace(/▪️/g, '•')}</div>`
    ).join('');
}

// Fungsi untuk mendapatkan daftar unik brand dari produk
function getUniqueBrands(products) {
    const brands = new Set();
    products.forEach(product => {
        if (product.brand) {
            brands.add(product.brand);
        }
    });
    return [...brands].sort();
}

// Fungsi untuk mendapatkan daftar unik kategori dari produk
function getUniqueCategories(products) {
    const categories = new Set();
    products.forEach(product => {
        if (product.nama_kategori) {
            categories.add(product.nama_kategori);
        }
    });
    return [...categories].sort();
}

// Mengekspor fungsi-fungsi yang diperlukan agar dapat diakses oleh script.js
window.ProductAPI = { fetchProducts, renderProducts, getUniqueBrands, getUniqueCategories };
