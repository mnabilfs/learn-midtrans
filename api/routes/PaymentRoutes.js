import express from "express";
import dotenv from "dotenv"; // Impor dotenv
dotenv.config(); // Memuat variabel environment
import midtransClient from "midtrans-client";

const router = express.Router();

router.post("/process-transaction", (req, res) => {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: serverKey,
      clientKey: clientKey,
    });

    const parameter = {
      transaction_details: {
        order_id: req.body.order_id,
        gross_amount: req.body.total,
      },
      customer_details: {
        first_name: req.body.nama,
      },
    };
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
