const axios = require('axios');

const MikroTikApi = {
    baseUrl: 'http://<mikrotik-ip-address>/api/', // Replace with your MikroTik device IP

    async getResource(endpoint) {
        try {
            const response = await axios.get(`${this.baseUrl}${endpoint}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching resource: ${error.message}`);
        }
    },

    async createResource(endpoint, data) {
        try {
            const response = await axios.post(`${this.baseUrl}${endpoint}`, data);
            return response.data;
        } catch (error) {
            throw new Error(`Error creating resource: ${error.message}`);
        }
    },

    async updateResource(endpoint, data) {
        try {
            const response = await axios.put(`${this.baseUrl}${endpoint}`, data);
            return response.data;
        } catch (error) {
            throw new Error(`Error updating resource: ${error.message}`);
        }
    },

    async deleteResource(endpoint) {
        try {
            const response = await axios.delete(`${this.baseUrl}${endpoint}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error deleting resource: ${error.message}`);
        }
    }
};

module.exports = MikroTikApi;