/**
 * Сервис для работы с навыками
 * CRUD операции для управления навыками пользователя
 */

import { apiClient } from "./api";

export const skillsService = {
  /**
   * Создать новый навык
   * @param {Object} data - данные навыка (name, description, type)
   * @returns {Promise<Object>} созданный навык
   */
  async createSkill(data) {
    return apiClient.post("/v1/skills", data);
  },

  /**
   * Получить навыки пользователя
   * @param {number} userId - ID пользователя
   * @param {Object} options - опции (skillType, limit, offset)
   * @returns {Promise<Array>} список навыков
   */
  async getUserSkills(userId, options = {}) {
    const params = new URLSearchParams();

    if (options.skillType) {
      params.append("skill_type", options.skillType);
    }

    if (options.limit) {
      params.append("limit", options.limit);
    }

    if (options.offset) {
      params.append("offset", options.offset);
    }

    const queryString = params.toString();
    const endpoint = `/v1/skills/users/${userId}${queryString ? `?${queryString}` : ""}`;

    return apiClient.get(endpoint);
  },

  /**
   * Получить навык по ID
   * @param {number} skillId - ID навыка
   * @returns {Promise<Object>} данные навыка
   */
  async getSkillById(skillId) {
    return apiClient.get(`/v1/skills/${skillId}`);
  },

  /**
   * Обновить навык
   * @param {number} skillId - ID навыка
   * @param {Object} data - данные для обновления
   * @returns {Promise<Object>} обновленный навык
   */
  async updateSkill(skillId, data) {
    return apiClient.put(`/v1/skills/${skillId}`, data);
  },

  /**
   * Удалить навык
   * @param {number} skillId - ID навыка
   * @returns {Promise<void>}
   */
  async deleteSkill(skillId) {
    return apiClient.delete(`/v1/skills/${skillId}`);
  },

  /**
   * Массовое удаление навыков
   * @param {Array<number>} skillIds - массив ID навыков
   * @returns {Promise<void>}
   */
  async bulkDeleteSkills(skillIds) {
    return apiClient.post("/v1/skills/bulk-delete", {
      skill_ids: skillIds,
    });
  },

  /**
   * Поиск навыков
   * @param {string} query - поисковый запрос
   * @param {Object} options - опции (limit, offset)
   * @returns {Promise<Array>} результаты поиска
   */
  async searchSkills(query, options = {}) {
    const params = new URLSearchParams();

    if (query) {
      params.append("q", query);
    }

    if (options.limit) {
      params.append("limit", options.limit);
    }

    if (options.offset) {
      params.append("offset", options.offset);
    }

    const queryString = params.toString();
    const endpoint = `/v1/skills/search${queryString ? `?${queryString}` : ""}`;

    return apiClient.get(endpoint);
  },

  /**
   * Векторный поиск навыков
   * @param {string} query - поисковый запрос
   * @param {Object} options - опции (skillType, limit, offset)
   * @returns {Promise<Array>} результаты поиска
   */
  async vectorSearchSkills(query, options = {}) {
    const params = new URLSearchParams();

    if (query) {
      params.append("query", query);
    }

    if (options.skillType) {
      params.append("skill_type", options.skillType);
    }

    params.append("limit", options.limit || 100);
    params.append("offset", options.offset !== undefined ? options.offset : 0);

    const queryString = params.toString();
    const endpoint = `/v1/skills/vector-search${queryString ? `?${queryString}` : ""}`;

    return apiClient.get(endpoint);
  },

  /**
   * Получить все навыки
   * @param {Object} options - опции (skillType, limit, offset)
   * @returns {Promise<Array>} список всех навыков
   */
  async getAllSkills(options = {}) {
    const params = new URLSearchParams();

    if (options.skillType) {
      params.append("skill_type", options.skillType);
    }

    params.append("limit", options.limit || 100);
    params.append("offset", options.offset !== undefined ? options.offset : 0);

    const queryString = params.toString();
    const endpoint = `/v1/skills${queryString ? `?${queryString}` : ""}`;

    return apiClient.get(endpoint);
  },
};

