export class BaseAPI {
  static getBaseURL() {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  static getAuthToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || null;
    }
    return null;
  }

  static setAuthToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  static clearAuthToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  static getDefaultHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const token = BaseAPI.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  static async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      switch (response.status) {
        case 401:
          BaseAPI.clearAuthToken();

          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }

          throw new Error('Authentication required. Please login again.');

        case 403:
          throw new Error('Access forbidden. You do not have permission to access this resource.');

        case 404:
          throw new Error('Resource not found.');

        case 422:
          throw new Error(errorData.message || 'Validation error. Please check your input.');

        case 429:
          throw new Error('Too many requests. Please try again later.');

        case 500:
          throw new Error('Internal server error. Please try again later.');

        default:
          throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }
    }

    try {
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Invalid JSON response from server');
    }
  }

  static async request(endpoint, options = {}) {
    const { method = 'GET', body = null, headers = {}, timeout = 30000, params } = options;

    const baseURL = BaseAPI.getBaseURL();
    let url = `${baseURL}${endpoint}`;

    if (params) {
      const filtered = Object.fromEntries(
        Object.entries(params).filter(
          ([key, value]) =>
            key !== undefined &&
            value !== undefined &&
            value != null &&
            value !== '' &&
            value !== 'undefined' &&
            value !== 'null' &&
            value !== 'NaN' &&
            value !== 'Infinity' &&
            value !== '-Infinity'
        )
      );

      url += `?${new URLSearchParams(filtered).toString()}`;
    }

    const requestHeaders = {
      ...BaseAPI.getDefaultHeaders(),
      ...headers,
    };

    const requestConfig = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout),
    };

    if (body && method !== 'GET') {
      requestConfig.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestConfig);
      return await BaseAPI.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  static async get(endpoint, options = {}) {
    return BaseAPI.request(endpoint, { ...options, method: 'GET' });
  }

  static async post(endpoint, body, options = {}) {
    return BaseAPI.request(endpoint, { ...options, method: 'POST', body });
  }

  static async put(endpoint, body, options = {}) {
    return BaseAPI.request(endpoint, { ...options, method: 'PUT', body });
  }

  static async patch(endpoint, body, options = {}) {
    return BaseAPI.request(endpoint, { ...options, method: 'PATCH', body });
  }

  static async delete(endpoint, options = {}) {
    return BaseAPI.request(endpoint, { ...options, method: 'DELETE' });
  }

  static async uploadFile(endpoint, file, additionalData = {}, options = {}) {
    const formData = new FormData();
    formData.append('file', file);

    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key]);
    });

    const url = `${BaseAPI.getBaseURL()}${endpoint}`;
    const token = BaseAPI.getAuthToken();

    const requestHeaders = {
      Accept: 'application/json',
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const requestConfig = {
      method: 'POST',
      headers: requestHeaders,
      body: formData,
      signal: AbortSignal.timeout(options.timeout || 60000),
    };

    try {
      const response = await fetch(url, requestConfig);
      return await BaseAPI.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  static async healthCheck() {
    try {
      return await BaseAPI.get('/health');
    } catch (error) {
      throw new Error('API health check failed');
    }
  }

  static async isApiAvailable() {
    try {
      await BaseAPI.healthCheck();
      return true;
    } catch (error) {
      return false;
    }
  }

  static async getApiStatus() {
    try {
      const healthData = await BaseAPI.healthCheck();
      return {
        status: 'online',
        timestamp: new Date().toISOString(),
        version: healthData.version || 'unknown',
        uptime: healthData.uptime || 'unknown',
      };
    } catch (error) {
      return {
        status: 'offline',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  static async streamData(endpoint, options = {}) {
    const {
      params,
      onData,
      onError,
      onComplete,
      timeout = 300000,
      onConnected,
      onStepComplete,
      onStepStart,
      onLog,
      onSuccess,
      onFailure,
    } = options;

    return new Promise((resolve, reject) => {
      const baseURL = BaseAPI.getBaseURL();
      let url = `${baseURL}${endpoint}`;

      if (params) {
        const filtered = Object.fromEntries(
          Object.entries(params).filter(([key, value]) => value != null && value !== '')
        );
        url += `?${new URLSearchParams(filtered).toString()}`;
      }

      const token = BaseAPI.getAuthToken();
      const headers = {
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error('Stream timeout'));
      }, timeout);

      fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          if (!response.body) {
            throw new Error('No response body');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                clearTimeout(timeoutId);
                if (onComplete) onComplete();
                resolve();
                break;
              }

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              let currentEvent = null;
              let currentData = null;

              for (const line of lines) {
                if (line.trim() === '') {
                  if (currentEvent && currentData) {
                    try {
                      const parsedData = JSON.parse(currentData);

                      switch (currentEvent) {
                        case 'connected':
                          if (onConnected) onConnected(parsedData);
                          break;
                        case 'step_start':
                          if (onStepStart) onStepStart(parsedData);
                          break;
                        case 'step_complete':
                          if (onStepComplete) onStepComplete(parsedData);
                          break;
                        case 'log':
                          if (onLog) onLog(parsedData);
                          break;
                        case 'success':
                          if (onSuccess) onSuccess(parsedData);
                          break;
                        case 'failure':
                          if (onFailure) onFailure(parsedData);
                          break;
                      }

                      if (onData) onData(parsedData, currentEvent);
                    } catch (error) {
                      if (onData) onData(currentData, currentEvent);
                    }
                  }
                  currentEvent = null;
                  currentData = null;
                  continue;
                }

                if (line.startsWith('event: ')) {
                  currentEvent = line.slice(7).trim();
                } else if (line.startsWith('data: ')) {
                  currentData = line.slice(6);

                  if (currentData === '[DONE]') {
                    clearTimeout(timeoutId);
                    if (onComplete) onComplete();
                    resolve();
                    return;
                  }
                }
              }
            }
          } catch (error) {
            clearTimeout(timeoutId);
            if (onError) onError(error);
            reject(error);
          } finally {
            reader.releaseLock();
          }
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          if (onError) onError(error);
          reject(error);
        });
    });
  }
}
