/**
 * Сервис для работы с чатом
 * CRUD операции для управления чатами и сообщениями
 */

import { apiClient } from "./api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export const chatService = {
  /**
   * Получить список чатов текущего пользователя
   * @param {Object} options - опции (limit, offset)
   * @returns {Promise<Object>} {items: Array, total: number}
   */
  async getUserChats(options = {}) {
    const params = new URLSearchParams()

    if (options.limit) {
      params.append("limit", options.limit)
    } else {
      params.append("limit", 100)
    }

    if (options.offset !== undefined) {
      params.append("offset", options.offset)
    } else {
      params.append("offset", 0)
    }

    const queryString = params.toString()
    return apiClient.get(`/v1/chats?${queryString}`)
  },

  /**
   * Получить список чатов с последними сообщениями
   * @param {Object} options - опции (limit, offset)
   * @returns {Promise<Object>} {items: Array, total: number}
   */
  async getUserChatsWithMessages(options = {}) {
    const params = new URLSearchParams()

    if (options.limit) {
      params.append("limit", options.limit)
    } else {
      params.append("limit", 50)
    }

    if (options.offset !== undefined) {
      params.append("offset", options.offset)
    } else {
      params.append("offset", 0)
    }

    const queryString = params.toString()
    return apiClient.get(`/v1/chats/list/with-messages?${queryString}`)
  },

  /**
   * Создать новый чат
   * @param {number} user1Id - ID первого пользователя
   * @param {number} user2Id - ID второго пользователя
   * @returns {Promise<Object>} созданный чат
   */
  async createChat(user1Id, user2Id) {
    return apiClient.post("/v1/chats", {
      user1_id: user1Id,
      user2_id: user2Id,
    })
  },

  /**
   * Получить информацию о чате
   * @param {number} chatId - ID чата
   * @returns {Promise<Object>} информация о чате
   */
  async getChat(chatId) {
    return apiClient.get(`/v1/chats/${chatId}`)
  },

  /**
   * Получить историю сообщений чата
   * @param {number} chatId - ID чата
   * @param {Object} options - опции (limit, offset)
   * @returns {Promise<Object>} {items: Array, total: number}
   */
  async getChatMessages(chatId, options = {}) {
    const params = new URLSearchParams()

    if (options.limit) {
      params.append("limit", options.limit)
    } else {
      params.append("limit", 100)
    }

    if (options.offset !== undefined) {
      params.append("offset", options.offset)
    } else {
      params.append("offset", 0)
    }

    const queryString = params.toString()
    return apiClient.get(`/v1/chats/${chatId}/messages?${queryString}`)
  },

  /**
   * Отправить сообщение в чат (REST API)
   * @param {number} chatId - ID чата
   * @param {string} text - текст сообщения
   * @returns {Promise<Object>} отправленное сообщение
   */
  async sendMessage(chatId, text) {
    return apiClient.post(`/v1/chats/${chatId}/messages`, {
      text,
    })
  },

  /**
   * Подключиться к WebSocket чата
   * @param {number} chatId - ID чата
   * @param {string} token - JWT токен
   * @param {Function} onMessage - callback для получения сообщений
   * @param {Function} onError - callback для ошибок
   * @param {Function} onClose - callback для закрытия соединения
   * @returns {WebSocket} WebSocket соединение
   */
  connectToChat(chatId, token, onMessage, onError, onClose) {
    // Преобразуем API_BASE_URL в WebSocket URL
    const wsProtocol = API_BASE_URL.startsWith("https") ? "wss:" : "ws:"
    const wsHost = API_BASE_URL.replace(/^https?:\/\//, "").replace(/\/api$/, "")
    const url = `${wsProtocol}//${wsHost}/api/v1/chats/ws/chat/${chatId}?token=${encodeURIComponent(token)}`

    console.log("Creating WebSocket connection:", { url, chatId })

    const ws = new WebSocket(url)

    ws.onopen = () => {
      console.log(`Connected to chat ${chatId}`)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
      if (onError) {
        onError(error)
      }
    }

    ws.onclose = () => {
      console.log(`Disconnected from chat ${chatId}`)
      if (onClose) {
        onClose()
      }
    }

    return ws
  },

  /**
   * Отправить сообщение через WebSocket
   * @param {WebSocket} ws - WebSocket соединение
   * @param {string} text - текст сообщения
   */
  sendWebSocketMessage(ws, text) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "message",
          text,
        })
      )
    }
  },

  /**
   * Закрыть WebSocket соединение
   * @param {WebSocket} ws - WebSocket соединение
   */
  closeConnection(ws) {
    if (ws) {
      ws.close()
    }
  },
}

