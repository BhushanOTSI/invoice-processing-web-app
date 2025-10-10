import { BaseAPI } from './baseAPI';

export class InvoiceAPI {
  static async getAllInvoices(filters = {}) {
    try {
      return await BaseAPI?.get('/invoices', { params: filters });
    } catch (error) {
      throw new Error('Failed to fetch invoice trace data');
    }
  }

  static async getInvoiceDetails(id) {
    try {
      return await BaseAPI?.get(`/invoices/${id}`);
    } catch (error) {
      throw error;
    }
  }
}
