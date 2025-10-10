import { BaseAPI } from './baseAPI';

export class DashboardAPI {
  static delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  static async getDashboardStats() {
    try {
      return await BaseAPI.get('/dashboard/stats');
    } catch (error) {
      throw new Error('Failed to fetch dashboard statistics');
    }
  }

  static async getRecentInvoices() {
    try {
      return await BaseAPI.get('/dashboard/recent');
    } catch (error) {
      throw new Error('Failed to fetch recent invoices');
    }
  }

  // Get invoice by ID (for future use)
  static async getInvoiceById(id) {
    try {
      await DashboardAPI?.delay(600); // Fixed: use DashboardAPI.delay instead of this.delay

      const invoices = await DashboardAPI?.getRecentInvoices(); // Fixed: use DashboardAPI instead of this
      const invoice = invoices?.find((invoice) => invoice?.id === parseInt(id));

      if (!invoice) {
        throw new Error(`Invoice with ID ${id} not found`);
      }

      return invoice;
    } catch (error) {
      console.error(`Error fetching invoice ${id}:`, error);
      throw error;
    }
  }
}
