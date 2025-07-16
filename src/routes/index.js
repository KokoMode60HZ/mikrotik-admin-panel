const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');

const adminController = new AdminController();

function setRoutes(app) {
    router.get('/dashboard', adminController.getDashboard.bind(adminController));
    // Add more routes as needed

    app.use('/admin', router);
}

module.exports = setRoutes;