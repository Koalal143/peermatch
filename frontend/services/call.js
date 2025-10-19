/**
 * Сервис для работы со звонками
 * CRUD операции для управления звонками
 */

import { apiClient } from "./api"

export const callService = {
  /**
   * Инициировать звонок
   * @param {number} chatId - ID чата
   * @param {string} skillType - Тип скилла (teaching или learning)
   * @returns {Promise<Object>} информация о созданном звонке
   */
  async initiateCall(chatId, skillType = "teaching") {
    return apiClient.post("/v1/calls/initiate", {
      chat_id: chatId,
      skill_type: skillType,
    })
  },

  /**
   * Принять входящий звонок
   * @param {number} callId - ID звонка
   * @returns {Promise<Object>} информация о звонке
   */
  async acceptCall(callId) {
    return apiClient.post(`/v1/calls/${callId}/accept`, {})
  },

  /**
   * Отклонить входящий звонок
   * @param {number} callId - ID звонка
   * @returns {Promise<Object>} информация о звонке
   */
  async rejectCall(callId) {
    return apiClient.post(`/v1/calls/${callId}/reject`, {})
  },

  /**
   * Завершить активный звонок
   * @param {number} callId - ID звонка
   * @returns {Promise<Object>} информация о звонке
   */
  async endCall(callId) {
    return apiClient.post(`/v1/calls/${callId}/end`, {})
  },

  /**
   * Получить информацию о звонке
   * @param {number} callId - ID звонка
   * @returns {Promise<Object>} информация о звонке
   */
  async getCall(callId) {
    return apiClient.get(`/v1/calls/${callId}`)
  },

  /**
   * Получить список активных звонков
   * @returns {Promise<Object>} {items: Array, total: number}
   */
  async getActiveCalls() {
    return apiClient.get("/v1/calls/active")
  },
}

