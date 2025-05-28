import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, TextField, CircularProgress, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

// Pastikan Anda memuat script Midtrans Snap JS
// Anda bisa menempatkannya di public/index.html atau memuatnya secara dinamis seperti ini.
// Memuat secara dinamis lebih fleksibel jika Anda tidak ingin script selalu ada di setiap halaman.
const loadMidtransScript = () => {
  return new Promise((resolve, reject) => {
    if (window.snap) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'; // Gunakan sandbox untuk pengembangan
    // PENTING: Ganti 'SB-Mid-client-YOUR_CLIENT_KEY' dengan Client Key Midtrans Anda yang sebenarnya!
    script.setAttribute('data-client-key', 'SB-Mid-client-8l3bJ9A56V2dXbv-'); 
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Gagal memuat script Midtrans Snap.'));
    document.body.appendChild(script);
  });
};

const Home = () => {
  const [nama, setNama] = useState("");
  const [order_id, setOrder_id] = useState(`ORDER-${Date.now()}`); // Ini akan membuat Order ID unik setiap kali komponen dirender
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  

  // Load Midtrans Snap script saat komponen dimuat
  useEffect(() => {
    loadMidtransScript()
      .then(() => {
        console.log("Midtrans Snap script berhasil dimuat.");
      })
      .catch((err) => {
        console.error(err.message);
        setError("Gagal memuat script pembayaran. Coba refresh halaman atau periksa koneksi internet Anda.");
      });
  }, []);

  const showMessage = (message) => {
    setDialogMessage(message);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogMessage("");
  };

  const processPayment = async () => {
    setLoading(true);
    setError(null);

    // Validasi input sederhana
    if (!nama || !order_id || total <= 0) { // Pastikan order_id tetap divalidasi
      showMessage("Mohon lengkapi semua field dengan benar.");
      setLoading(false);
      return;
    }

    const data = {
      nama: nama,
      // PENTING: Jika Anda tidak ingin mengubah order_id di input,
      // Anda bisa membuat order_id unik di sini sebelum mengirim data
      order_id: `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Contoh order_id yang lebih unik
      total: Number(total),
    };

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await axios.post(
        "http://localhost:1000/api/payment/process-transaction",
        data,
        config
      );
      console.log("Response dari backend:", response.data);

      const { token } = response.data; // Ambil token dari respons backend

      if (token) {
        // Panggil Midtrans Snap.pay() untuk menampilkan popup
        window.snap.pay(token, {
          onSuccess: function (result) {
            /* Anda bisa menambahkan implementasi Anda di sini */
            console.log("Pembayaran berhasil:", result);
            showMessage("Pembayaran berhasil!");
          },
          onPending: function (result) {
            /* Anda bisa menambahkan implementasi Anda di sini */
            console.log("Pembayaran tertunda:", result);
            showMessage("Pembayaran tertunda. Mohon selesaikan pembayaran Anda.");
          },
          onError: function (result) {
            /* Anda bisa menambahkan implementasi Anda di sini */
            console.log("Pembayaran error:", result);
            showMessage("Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: function () {
            /* Anda bisa menambahkan implementasi Anda di sini */
            console.log("Popup pembayaran ditutup.");
            showMessage("Anda menutup popup pembayaran tanpa menyelesaikan transaksi.");
          },
        });
      } else {
        setError("Token pembayaran tidak diterima dari server.");
        showMessage("Terjadi kesalahan: Token pembayaran tidak tersedia.");
      }
    } catch (err) {
      console.error("Error memproses pembayaran:", err);
      if (axios.isAxiosError(err)) { // Memeriksa apakah ini error Axios
        if (err.response) {
          // Error dari server (misalnya 500 Internal Server Error)
          setError(err.response.data.message || "Terjadi kesalahan pada server.");
          showMessage(`Error Server: ${err.response.data.message || err.response.statusText}`);
        } else if (err.request) {
          // Request dibuat tapi tidak ada respons (misalnya masalah CORS atau server mati)
          setError("Tidak ada respons dari server. Pastikan backend berjalan.");
          showMessage("Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:1000.");
        } else {
          // Error lain saat menyiapkan request
          setError(err.message);
          showMessage(`Terjadi kesalahan: ${err.message}`);
        }
      } else {
        // Error non-Axios
        setError(err.message);
        showMessage(`Terjadi kesalahan tak terduga: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          width: "100%",
          maxWidth: '500px', // Batasi lebar form
          margin: 'auto', // Pusatkan form
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          Form Pembayaran
        </Typography>
        <TextField
          type="text"
          label="Nama Pelanggan"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          type="text"
          label="Order ID"
          value={order_id}
          onChange={(e) => setOrder_id(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          type="number"
          label="Total Pembayaran"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
          inputProps={{ min: 0 }} // Pastikan total tidak negatif
        />

        <Button
          onClick={processPayment}
          variant="contained"
          color="primary"
          disabled={loading}
          fullWidth
          sx={{ py: 1.5 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Proses Pembayaran"}
        </Button>

        {error && (
          <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}
      </Box>

      {/* Custom Dialog / Message Box */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Informasi Pembayaran</DialogTitle>
        <DialogContent>
          <Typography id="alert-dialog-description">
            {dialogMessage}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} autoFocus>
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Home;

