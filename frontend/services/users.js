/**
 * Сервис для работы с пользователями
 * Получение профиля, обновление данных
 */

import { apiClient } from "./api";

export const usersService = {
  /**
   * Получить профиль текущего пользователя
   * @returns {Promise<Object>} данные пользователя
   */
  async getCurrentUser() {
    return apiClient.get("/v1/users/me");
  },

  /**
   * Обновить профиль текущего пользователя
   * @param {Object} data - данные для обновления (username, email)
   * @returns {Promise<Object>} обновленные данные пользователя
   */
  async updateProfile(data) {
    return apiClient.patch("/v1/users/me", data);
  },

  /**
   * Получить пользователя по ID
   * @param {number} userId - ID пользователя
   * @returns {Promise<Object>} данные пользователя
   */
  async getUserById(userId) {
    return apiClient.get(`/v1/users/${userId}`);
  },

  /**
   * Обновить пользователя по ID (для администраторов)
   * @param {number} userId - ID пользователя
   * @param {Object} data - данные для обновления
   * @returns {Promise<Object>} обновленные данные пользователя
   */
  async updateUserById(userId, data) {
    return apiClient.patch(`/v1/users/${userId}`, data);
  },
};

