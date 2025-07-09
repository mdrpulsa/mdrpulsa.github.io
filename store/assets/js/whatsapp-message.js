// File: assets/js/whatsapp-message.js

// Fungsi untuk menghasilkan pesan pesanan yang akan dikirim ke WhatsApp
// Menerima array 'cart' sebagai argumen
window.WhatsAppMessageGenerator = {
    generateOrderMessage: function (cart) {
        const totalPembayaranGlobal = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        // Membangun detail untuk setiap item di keranjang
        const detailPesananPerItem = cart
            .map(item => {
                const itemTotal = item.price * item.quantity;
                // Menambahkan "(retail)" atau "(grosir)" di samping harga
                const priceType = item.isWholesale ? 'grosir' : 'retail';
                // Mengganti icon bullet (▪️) dengan tanda hubung (-)
                return `- *Kode Produk:* ${item.id}%0A` +
                    `- *Produk:* ${item.name}%0A` +
                    `- *Jumlah:* ${item.quantity} × Rp${item.price.toLocaleString("id-ID")} (${priceType})%0A` +
                    `- *Total Pembayaran:* Rp${itemTotal.toLocaleString("id-ID")}`;
            })
            .join("%0A%0A"); // Pisahkan setiap detail item dengan dua baris baru

        // Membangun seluruh pesan
        const fullMessage =
            `*Konfirmasi Pembayaran*%0A` +
            `============================%0A` +
            `*Detail Pesanan*%0A` +
            `============================%0A` + // Garis pembatas di atas detail pesanan
            `${detailPesananPerItem}%0A%0A` +
            `============================%0A` + // Garis pembatas di bawah detail pesanan
            `*Total Keseluruhan:* Rp${totalPembayaranGlobal.toLocaleString("id-ID")}%0A%0A` +
            `Pembayaran sudah saya lakukan, mohon segera diproses ya. Terima kasih!`;
        // Bagian "Salam," dan "[Nama Pelanggan Anda]" telah dihapus

        return fullMessage;
    }
};
