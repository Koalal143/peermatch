/**
 * Сервис для работы с аутентификацией
 * Регистрация, вход, обновление токенов
 */

import { apiClient } from "./api";

export const authService = {
  /**
   * Регистрация нового пользователя
   * @param {string} username - имя пользователя
   * @param {string} email - email
   * @param {string} password - пароль
   * @returns {Promise<Object>} данные пользователя
   */
  async register(username, email, password) {
    const response = await apiClient.post("/v1/auth/register", {
      username,
      email,
      password,
    });
    return response;
  },

  /**
   * Вход пользователя
   * @param {string} email - email или username
   * @param {string} password - пароль
   * @returns {Promise<Object>} токены доступа
   */
  async login(email, password) {
    const response = await apiClient.post("/v1/auth/login", {
      email,
      username: email, // Бекенд принимает оба поля
      password,
    });

    // Сохраняем токены
    if (response.access_token && response.refresh_token) {
      apiClient.saveTokens(response.access_token, response.refresh_token);
    }

    return response;
  },

  /**
   * Обновить токен доступа
   * @returns {Promise<Object>} новые токены
   */
  async refreshToken() {
    return apiClient.refreshAccessToken();
  },

  /**
   * Выход пользователя
   */
  logout() {
    apiClient.clearTokens();
  },

  /**
   * Проверить, авторизован ли пользователь
   * @returns {boolean}
   */
  isAuthenticated() {
    apiClient.loadTokens();
    return !!apiClient.accessToken;
  },

  /**
   * Получить текущий токен доступа
   * @returns {string|null}
   */
  getAccessToken() {
    apiClient.loadTokens();
    return apiClient.accessToken;
  },
};

