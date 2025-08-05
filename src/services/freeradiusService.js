const pool = require('../config/database');

class FreeRADIUSService {
  // Get all users from radcheck table
  async getAllUsers() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          rc.id,
          rc.username,
          rc.attribute,
          rc.op,
          rc.value,
          rug.groupname,
          rc.created_at,
          rc.updated_at
        FROM radcheck rc
        LEFT JOIN radusergroup rug ON rc.username = rug.username
        ORDER BY rc.username
      `);
      return rows;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  // Get user by username
  async getUserByUsername(username) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          rc.id,
          rc.username,
          rc.attribute,
          rc.op,
          rc.value,
          rug.groupname,
          rc.created_at,
          rc.updated_at
        FROM radcheck rc
        LEFT JOIN radusergroup rug ON rc.username = rug.username
        WHERE rc.username = ?
      `, [username]);
      return rows[0];
    } catch (error) {
      console.error('Get user by username error:', error);
      throw error;
    }
  }

  // Create new user
  async createUser(userData) {
    const { username, password, groupname = 'users' } = userData;
    
    try {
      await pool.execute('START TRANSACTION');

      // Insert into radcheck (username and password)
      const [radcheckResult] = await pool.execute(`
        INSERT INTO radcheck (username, attribute, op, value) 
        VALUES (?, 'Cleartext-Password', ':=', ?)
      `, [username, password]);

      // Insert into radusergroup (user group)
      await pool.execute(`
        INSERT INTO radusergroup (username, groupname, priority) 
        VALUES (?, ?, 1)
      `, [username, groupname]);

      await pool.execute('COMMIT');

      return {
        id: radcheckResult.insertId,
        username,
        groupname,
        message: 'User created successfully'
      };
    } catch (error) {
      await pool.execute('ROLLBACK');
      console.error('Create user error:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(username, userData) {
    const { password, groupname } = userData;
    
    try {
      await pool.execute('START TRANSACTION');

      // Update password in radcheck
      if (password) {
        await pool.execute(`
          UPDATE radcheck 
          SET value = ?, updated_at = NOW() 
          WHERE username = ? AND attribute = 'Cleartext-Password'
        `, [password, username]);
      }

      // Update group in radusergroup
      if (groupname) {
        await pool.execute(`
          UPDATE radusergroup 
          SET groupname = ? 
          WHERE username = ?
        `, [groupname, username]);
      }

      await pool.execute('COMMIT');

      return {
        username,
        message: 'User updated successfully'
      };
    } catch (error) {
      await pool.execute('ROLLBACK');
      console.error('Update user error:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(username) {
    try {
      await pool.execute('START TRANSACTION');

      // Delete from radcheck
      await pool.execute('DELETE FROM radcheck WHERE username = ?', [username]);

      // Delete from radusergroup
      await pool.execute('DELETE FROM radusergroup WHERE username = ?', [username]);

      // Delete from radacct (accounting data)
      await pool.execute('DELETE FROM radacct WHERE username = ?', [username]);

      await pool.execute('COMMIT');

      return {
        username,
        message: 'User deleted successfully'
      };
    } catch (error) {
      await pool.execute('ROLLBACK');
      console.error('Delete user error:', error);
      throw error;
    }
  }

  // Get active sessions from radacct
  async getActiveSessions() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          id,
          username,
          nasipaddress,
          nasportid,
          acctstarttime,
          acctstoptime,
          acctsessiontime,
          acctinputoctets,
          acctoutputoctets,
          acctterminatecause,
          framedipaddress
        FROM radacct 
        WHERE acctstoptime IS NULL 
        ORDER BY acctstarttime DESC
      `);
      return rows;
    } catch (error) {
      console.error('Get active sessions error:', error);
      throw error;
    }
  }

  // Get user sessions history
  async getUserSessions(username) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          id,
          username,
          nasipaddress,
          nasportid,
          acctstarttime,
          acctstoptime,
          acctsessiontime,
          acctinputoctets,
          acctoutputoctets,
          acctterminatecause,
          framedipaddress
        FROM radacct 
        WHERE username = ?
        ORDER BY acctstarttime DESC
        LIMIT 50
      `, [username]);
      return rows;
    } catch (error) {
      console.error('Get user sessions error:', error);
      throw error;
    }
  }

  // Get NAS (Network Access Server) list
  async getNASList() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          id,
          nasname,
          shortname,
          type,
          ports,
          secret,
          server,
          community,
          description
        FROM nas 
        ORDER BY nasname
      `);
      return rows;
    } catch (error) {
      console.error('Get NAS list error:', error);
      throw error;
    }
  }

  // Get user groups
  async getUserGroups() {
    try {
      const [rows] = await pool.execute(`
        SELECT DISTINCT groupname 
        FROM radusergroup 
        ORDER BY groupname
      `);
      return rows.map(row => row.groupname);
    } catch (error) {
      console.error('Get user groups error:', error);
      throw error;
    }
  }

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const [totalUsers] = await pool.execute('SELECT COUNT(*) as count FROM radcheck');
      const [activeSessions] = await pool.execute('SELECT COUNT(*) as count FROM radacct WHERE acctstoptime IS NULL');
      const [totalNAS] = await pool.execute('SELECT COUNT(*) as count FROM nas');
      const [todaySessions] = await pool.execute(`
        SELECT COUNT(*) as count 
        FROM radacct 
        WHERE DATE(acctstarttime) = CURDATE()
      `);

      return {
        totalUsers: totalUsers[0].count,
        activeSessions: activeSessions[0].count,
        totalNAS: totalNAS[0].count,
        todaySessions: todaySessions[0].count
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  }

  // Get billing data (from radacct)
  async getBillingData(limit = 100) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          username,
          nasipaddress,
          acctstarttime,
          acctstoptime,
          acctsessiontime,
          acctinputoctets,
          acctoutputoctets,
          acctterminatecause
        FROM radacct 
        WHERE acctstoptime IS NOT NULL
        ORDER BY acctstarttime DESC
        LIMIT ?
      `, [limit]);
      return rows;
    } catch (error) {
      console.error('Get billing data error:', error);
      throw error;
    }
  }
}

module.exports = new FreeRADIUSService(); 