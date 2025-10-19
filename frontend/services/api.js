/**
 * Базовый API клиент для работы с бекендом
 * Обрабатывает аутентификацию, токены и ошибки
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.accessToken = null;
    this.refreshToken = null;
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  /**
   * Загрузить токены из localStorage
   */
  loadTokens() {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("access_token");
      this.refreshToken = localStorage.getItem("refresh_token");
    }
  }

  /**
   * Сохранить токены в localStorage
   */
  saveTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
    }
  }

  /**
   * Очистить токены
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  }

  /**
   * Получить заголовки для запроса
   */
  getHeaders(contentType = "application/json") {
    const headers = {
      "Content-Type": contentType,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  /**
   * Обновить access token используя refresh token
   */
  async refreshAccessToken() {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push(resolve);
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${this.baseURL}/v1/auth/refresh`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      this.saveTokens(data.access_token, data.refresh_token);

      this.refreshSubscribers.forEach((callback) => callback());
      this.refreshSubscribers = [];

      return data;
    } catch (error) {
      this.clearTokens();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Выполнить HTTP запрос
   */
  async request(endpoint, options = {}) {
    this.loadTokens();

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.headers?.["Content-Type"]),
        ...options.headers,
      },
    };

    let response = await fetch(url, config);

    // Если получили 401, пытаемся обновить токен
    if (response.status === 401 && this.refreshToken) {
      try {
        await this.refreshAccessToken();
        config.headers.Authorization = `Bearer ${this.accessToken}`;
        response = await fetch(url, config);
      } catch (error) {
        this.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        throw error;
      }
    }

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || "API Error");
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  /**
   * GET запрос
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "GET",
    });
  }

  /**
   * POST запрос
   */
  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH запрос
   */
  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT запрос
   */
  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE запрос
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();

