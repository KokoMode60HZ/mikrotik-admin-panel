const express = require("express");
const router = express.Router();

// Route utama root diarahkan ke dashboard
router.get("/", (req, res) => res.redirect("/dashboard"));

// Render halaman kosong untuk setiap menu sidebar
router.get("/dashboard", (req, res) => res.render("pages/dashboard"));
router.get("/pengaturan", (req, res) => res.render("pages/pengaturan"));
router.get("/router-nas", (req, res) => res.render("pages/router-nas"));
router.get("/data-odp-pop", (req, res) => res.render("pages/data-odp-pop"));
router.get("/profil-paket", (req, res) => res.render("pages/profil-paket"));
router.get("/list-pelanggan", (req, res) => res.render("pages/list-pelanggan"));
router.get("/kartu-voucher", (req, res) => res.render("pages/kartu-voucher"));
router.get("/data-tagihan", (req, res) => res.render("pages/data-tagihan"));
router.get("/data-keuangan", (req, res) => res.render("pages/data-keuangan"));
router.get("/online-payment", (req, res) => res.render("pages/online-payment"));
router.get("/tiket-laporan", (req, res) => res.render("pages/tiket-laporan"));
router.get("/tool-sistem", (req, res) => res.render("pages/tool-sistem"));
router.get("/log-aplikasi", (req, res) => res.render("pages/log-aplikasi"));
router.get("/pengaturan-umum", (req, res) => res.render("pages/pengaturan-umum"));
router.get("/payment-gateway", (req, res) => res.render("pages/payment-gateway"));

module.exports = router;
