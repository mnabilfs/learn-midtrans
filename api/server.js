// server.js
import app from './app.js';
import dotenv from "dotenv"; // Impor dotenv

// Memuat variabel environment sesegera mungkin
dotenv.config();

const PORT = 1000;

// Log saat server mulai berjalan
app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
    // Pastikan variabel environment sudah dimuat sebelum diakses

});

// Anda tidak memerlukan app.get("/", ...) di server.js ini
// karena rute sudah ditangani di PaymentRoutes.js dan di-import melalui app.js
// app.get("/", (req, res) => {
//     res.send(`Server berjalan di port ${PORT}`);
// });