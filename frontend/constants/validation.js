/**
 * Константы для валидации форм
 */

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 50;
export const PASSWORD_MIN_LENGTH = 8;

export const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

const BANNED_USERNAMES = [
  "admin",
  "root",
  "system",
  "api",
  "test",
  "demo",
  "guest",
  "user",
  "moderator",
  "administrator",
];

/**
 * Проверить, запрещено ли имя пользователя
 * @param {string} username - имя пользователя
 * @returns {boolean}
 */
export const isBannedUsername = (username) => {
  return BANNED_USERNAMES.includes(username.toLowerCase());
};

