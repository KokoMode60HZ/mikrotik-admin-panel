const freeradiusService = require('../services/freeradiusService');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AdminController {
  // Dashboard
  async getDashboard(req, res) {
    try {
      // Get data from FreeRADIUS database
      const [dashboardStats, activeSessions, recentUsers] = await Promise.all([
        freeradiusService.getDashboardStats(),
        freeradiusService.getActiveSessions(),
        freeradiusService.getAllUsers()
      ]);

      res.json({
        success: true,
        data: {
          stats: dashboardStats,
          sessions: activeSessions,
          users: recentUsers.slice(0, 10) // Get only 10 recent users
        }
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load dashboard data',
        error: error.message
      });
    }
  }

  // User Management
  async getAllUsers(req, res) {
    try {
      const users = await freeradiusService.getAllUsers();
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users',
        error: error.message
      });
    }
  }

  async getUserByUsername(req, res) {
    try {
      const { username } = req.params;
      const user = await freeradiusService.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user',
        error: error.message
      });
    }
  }

  async createUser(req, res) {
    try {
      const userData = req.body;
      
      // Validate required fields
      if (!userData.username || !userData.password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      const newUser = await freeradiusService.createUser(userData);
      res.json({
        success: true,
        data: newUser,
        message: 'User created successfully'
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error.message
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { username } = req.params;
      const userData = req.body;
      
      const updatedUser = await freeradiusService.updateUser(username, userData);
      res.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error.message
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { username } = req.params;
      await freeradiusService.deleteUser(username);
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message
      });
    }
  }

  // Session Management
  async getActiveSessions(req, res) {
    try {
      const sessions = await freeradiusService.getActiveSessions();
      res.json({
        success: true,
        data: sessions
      });
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get active sessions',
        error: error.message
      });
    }
  }

  async getUserSessions(req, res) {
    try {
      const { username } = req.params;
      const sessions = await freeradiusService.getUserSessions(username);
      res.json({
        success: true,
        data: sessions
      });
    } catch (error) {
      console.error('Get user sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user sessions',
        error: error.message
      });
    }
  }

  // NAS Management
  async getNASList(req, res) {
    try {
      const nasList = await freeradiusService.getNASList();
      res.json({
        success: true,
        data: nasList
      });
    } catch (error) {
      console.error('Get NAS list error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get NAS list',
        error: error.message
      });
    }
  }

  // User Groups
  async getUserGroups(req, res) {
    try {
      const groups = await freeradiusService.getUserGroups();
      res.json({
        success: true,
        data: groups
      });
    } catch (error) {
      console.error('Get user groups error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user groups',
        error: error.message
      });
    }
  }

  // Billing Management
  async getBillingData(req, res) {
    try {
      const { limit = 100 } = req.query;
      const billing = await freeradiusService.getBillingData(parseInt(limit));
      res.json({
        success: true,
        data: billing
      });
    } catch (error) {
      console.error('Get billing error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get billing data',
        error: error.message
      });
    }
  }

  // Admin Authentication
  async adminLogin(req, res) {
    try {
      const { username, password } = req.body;
      
      // Check admin credentials in admin_users table
      const [rows] = await pool.execute(
        'SELECT * FROM admin_users WHERE username = ?',
        [username]
      );

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const admin = rows[0];
      const isValidPassword = await bcrypt.compare(password, admin.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: admin.id, 
          username: admin.username,
          role: 'admin'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: 'admin'
        }
      });

    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }

  // Dashboard Statistics
  async getDashboardStats(req, res) {
    try {
      const stats = await freeradiusService.getDashboardStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard statistics',
        error: error.message
      });
    }
  }
}

module.exports = new AdminController();