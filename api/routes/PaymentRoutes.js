import express, { response } from "express";
import dotenv from "dotenv"; // Impor dotenv
dotenv.config(); // Memuat variabel environment
import midtransClient from "midtrans-client";

const router = express.Router();

router.post("/process-transaction", async (req, res) => {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;

    console.log("Server Key:", serverKey);
    console.log("Client Key:", clientKey);

    // --- Perubahan di sini: tambahkan `apiConfig.baseSnapUrl` ---
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: serverKey,
      clientKey: clientKey,
      apiConfig: {
        // URL base untuk Snap API di lingkungan Sandbox
        baseSnapUrl: 'https://app.sandbox.midtrans.com/snap/v1/', 
        // baseCoreApiUrl: 'https://api.sandbox.midtrans.com/v2/' // Ini untuk Core API, tidak perlu jika hanya pakai Snap
      }
    });
    // --- Akhir perubahan ---

    const parameter = {
      transaction_details: {
        order_id: req.body.order_id,
        gross_amount: req.body.total,
      },
      customer_details: {
        first_name: req.body.nama,
      },
      item_details: [
        {
          id: req.body.order_id,
          name: "Pembelian Produk",
          price: req.body.total,
          quantity: 1,
        }
      ]
    };

    const transaction = await snap.createTransaction(parameter);

    const dataPayment = {
      response: transaction,
    };
    const token = transaction.token;

    res.status(200).json({ message: "berhasil", dataPayment, token: token });

  } catch (error) {
    console.error("Error dari Midtrans:", error);

    if (error.ApiResponse) {
        const midtransError = error.ApiResponse;
        // Kirim detail error Midtrans ke frontend untuk debugging lebih lanjut
        res.status(midtransError.httpStatusCode || 500).json({
            message: midtransError.message || "Terjadi kesalahan pada Midtrans API.",
            error_details: midtransError.error_messages // Ini akan menangkap detail error seperti "order_id has already been taken"
        });
    } else {
        // Tangani respons 404 dari Nginx ini secara spesifik jika memungkinkan
        if (error.response && error.response.status === 404 && error.response.data.includes('nginx')) {
            res.status(500).json({ message: "Gagal terhubung ke endpoint Midtrans. URL mungkin salah atau koneksi diblokir.", raw_error: error.response.data });
        } else {
            res.status(500).json({ message: error.message || "Terjadi kesalahan server tidak terduga." });
        }
    }
  }
});

export default router;
