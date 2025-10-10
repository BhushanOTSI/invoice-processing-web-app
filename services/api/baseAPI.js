import { isValidValue } from "@/lib/utils";

export class BaseAPIError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export class BaseAPI {
  static getBaseURL() {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  static getAuthToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken") || null;
    }
    return null;
  }

  static setAuthToken(token) {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  }

  static clearAuthToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
  }

  static getDefaultHeaders() {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const token = BaseAPI.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  static async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      switch (response.status) {
        case 401:
          BaseAPI.clearAuthToken();

          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }

          throw new BaseAPIError(
            "Authentication required. Please login again.",
            401
          );

        case 403:
          throw new BaseAPIError(
            "Access forbidden. You do not have permission to access this resource."
          );

        case 404:
          throw new BaseAPIError("Resource not found.", 404);

        case 422:
          throw new BaseAPIError(
            errorData.message || "Validation error. Please check your input."
          );

        case 429:
          throw new BaseAPIError(
            "Too many requests. Please try again later.",
            429
          );

        case 500:
          throw new BaseAPIError(
            "Internal server error. Please try again later.",
            500
          );

        default:
          throw new BaseAPIError(
            errorData.message || `HTTP Error: ${response.status}`,
            response.status
          );
      }
    }

    try {
      const data = await response.json();
      return data;
    } catch (error) {
      throw new BaseAPIError("Invalid JSON response from server", 500);
    }
  }

  static async request(endpoint, options = {}) {
    const {
      method = "GET",
      body = null,
      headers = {},
      timeout = 30000,
      params,
    } = options;

    const baseURL = BaseAPI.getBaseURL();
    let url = `${baseURL}${endpoint}`;

    if (params) {
      const filtered = Object.fromEntries(
        Object.entries(params).filter(
          ([key, value]) => isValidValue(value) && isValidValue(key)
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

    if (body && method !== "GET") {
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
    return BaseAPI.request(endpoint, { ...options, method: "GET" });
  }

  static async post(endpoint, body, options = {}) {
    return BaseAPI.request(endpoint, { ...options, method: "POST", body });
  }

  static async put(endpoint, body, options = {}) {
    return BaseAPI.request(endpoint, { ...options, method: "PUT", body });
  }

  static async patch(endpoint, body, options = {}) {
    return BaseAPI.request(endpoint, { ...options, method: "PATCH", body });
  }

  static async delete(endpoint, options = {}) {
    return BaseAPI.request(endpoint, { ...options, method: "DELETE" });
  }

  static async uploadFile(endpoint, file, additionalData = {}, options = {}) {
    const formData = new FormData();
    formData.append("file", file);

    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key]);
    });

    const url = `${BaseAPI.getBaseURL()}${endpoint}`;
    const token = BaseAPI.getAuthToken();

    const requestHeaders = {
      Accept: "application/json",
    };

    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    const requestConfig = {
      method: "POST",
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
      return await BaseAPI.get("/health");
    } catch (error) {
      throw new BaseAPIError("API health check failed", 500);
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
        status: "online",
        timestamp: new Date().toISOString(),
        version: healthData.version || "unknown",
        uptime: healthData.uptime || "unknown",
      };
    } catch (error) {
      return {
        status: "offline",
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}
