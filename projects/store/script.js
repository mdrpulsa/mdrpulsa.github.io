// Data produk contoh
const products = [
    { id: 1, name: "Kaos Polos", price: 75000, image: "../../assets/images/kaos.jpg" },
    { id: 2, name: "Celana Jeans", price: 150000, image: "../../assets/images/jeans.jpg" }
];

// Render produk
document.querySelector('.product-grid').innerHTML = products.map(product => `
    <div class="product-card">
        <img src="${product.image}" alt="${product.name}" style="width:100%">
        <h3>${product.name}</h3>
        <p>Rp ${product.price.toLocaleString('id-ID')}</p>
        <button class="visit-btn">Beli</button>
    </div>
`).join('');
