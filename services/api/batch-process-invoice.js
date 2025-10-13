import { BaseAPI } from "./baseAPI";

export class BatchProcessInvoiceAPI {
  static async batchProcessInvoice({ files, ...options }) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    Object.keys(options).forEach((key) => {
      formData.append(key, options[key]);
    });

    return BaseAPI.request("/batch/upload", {
      method: "POST",
      body: formData,
    });
  }

  static async getBatchDetails(batchID) {
    return BaseAPI.get(`/batch/${batchID}`);
  }

  static async getTraces(filters) {
    return BaseAPI.post(`/batch/process-details`, filters);
  }

  static async getProcessingStream(processId, options = {}) {
    if (!processId)
      return { success: false, message: "No process ID provided" };

    try {
      await BaseAPI.streamData(
        `/process-invoice/${processId}/stream-db`,
        options
      );
      return { success: true, message: "Stream completed" };
    } catch (error) {
      return { success: false, message: error.message || "Stream failed" };
    }
  }

  static async cancelBatch(batchID) {
    return BaseAPI.post(`/batch/${batchID}/cancel`);
  }
}
