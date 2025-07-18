const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET semua pelanggan
router.get('/', async (req, res) => {
    const { data, error } = await supabase.from('pelanggan').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

module.exports = router;
