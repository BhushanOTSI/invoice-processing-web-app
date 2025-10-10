import { BaseAPI } from './baseAPI';

export class ProcessInvoiceAPI {
  static async processInvoice(file, options = {}) {
    const { humanInLoop = false, foregroundProcessing = false, caseType = 'case1' } = options;

    try {
      return await BaseAPI.uploadFile('/process-invoice', file, {
        humanInLoop,
        foregroundProcessing,
        caseType,
      });
    } catch (error) {
      throw new Error('Failed to start invoice processing');
    }
  }

  static async getProcessingStatus(processId) {
    try {
      return await BaseAPI.get(`/process-invoice/${processId}/status`);
    } catch (error) {
      throw new Error('Failed to fetch processing status');
    }
  }

  static async getProcessingStream(processId, enabled = false, options = {}) {
    if (!enabled || !processId) return [];

    try {
      return await BaseAPI.streamData(`/process-invoice/${processId}/stream-db`, options);
    } catch (error) {
      throw new Error('Failed to fetch processing stream');
    }
  }

  static async getProcessingHistory() {
    try {
      return await BaseAPI.get(`/process-invoice/history`);
    } catch (error) {
      throw new Error('Failed to fetch processing history');
    }
  }

  static async cancelProcessing(processId) {
    try {
      return await BaseAPI.post(`/process-invoice/${processId}/cancel`);
    } catch (error) {
      throw new Error('Failed to cancel processing');
    }
  }

  static async jsonToMarkdown(json) {
    try {
      const requestBody = {
        model: 'google/gemma-3n-e4b-it',
        messages: [
          {
            role: 'user',
            content: `Generate markdown for the given JSON so that it is more readable for users.\n\n${JSON.stringify(json, null, 2)}`,
          },
        ],
      };

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization:
            'Bearer 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',
          'HTTP-Referer': 'https://invoiceai.pro',
          'X-Title': 'InvoiceAI',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      throw new Error('Failed to convert JSON to markdown');
    }
  }

  static async loadJsonFromUrl(url) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      throw new Error('Failed to load JSON from URL');
    }
  }
}
