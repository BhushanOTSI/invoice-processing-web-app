import { BaseAPI, BaseAPIError } from "./baseAPI";

export class InvoiceAPI {
  static async getAllInvoices(filters = {}) {
    try {
      return await BaseAPI?.get("/invoices", { params: filters });
    } catch (error) {
      throw new BaseAPIError("Failed to fetch all invoices", 500);
    }
  }

  static async getInvoiceDetails(id) {
    try {
      return await BaseAPI?.get(`/invoices/${id}`);
    } catch (error) {
      throw new BaseAPIError("Failed to fetch invoice details", 500);
    }
  }

  static async getProcessTraceStatus(processID) {
    return BaseAPI.get(`/process-invoice/${processID}/status`);
  }

  static async getProcessTraceDag(processID) {
    return BaseAPI.post(`/airflow/get-dag-status-by-process-id`, {
      process_id: processID,
    });
  }
}
