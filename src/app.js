const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for serving static files
app.use(express.static(path.join(__dirname, '../public')));

// Route utama render dashboard.ejs
app.get('/', (req, res) => {
    res.render('dashboard');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});