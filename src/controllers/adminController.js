class AdminController {
    getDashboard(req, res) {
        res.render('dashboard');
    }

    // Additional methods for handling admin-related actions can be added here
}

module.exports = AdminController;