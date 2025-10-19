import { loginSchema, registrationSchema, profileUpdateSchema } from "./validation/auth.schema";
import { skillCreateSchema, skillUpdateSchema } from "./validation/skills.schema";

export const ValidationRules = {
  username: {
    minLength: 3,
    maxLength: 50,
    required: true,
  },
  email: {
    minLength: 3,
    maxLength: 255,
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    minLength: 8,
    required: true,
  },
  skillName: {
    minLength: 1,
    maxLength: 255,
    required: true,
  },
  skillDescription: {
    maxLength: 1000,
    required: false,
  },
}

export const schemas = {
  login: loginSchema,
  registration: registrationSchema,
  profileUpdate: profileUpdateSchema,
  skillCreate: skillCreateSchema,
  skillUpdate: skillUpdateSchema,
}

export class ValidationError extends Error {
  constructor(field, message, type = "validation_error") {
    super(message)
    this.field = field
    this.type = type
    this.name = "ValidationError"
  }
}

export const validateUsername = (username) => {
  if (!username) {
    throw new ValidationError("username", "Введите имя пользователя", "string_required")
  }
  if (username.length < ValidationRules.username.minLength) {
    throw new ValidationError(
      "username",
      `Имя пользователя должно содержать минимум ${ValidationRules.username.minLength} символа`,
      "string_too_short",
    )
  }
  if (username.length > ValidationRules.username.maxLength) {
    throw new ValidationError(
      "username",
      `Имя пользователя должно содержать максимум ${ValidationRules.username.maxLength} символов`,
      "string_too_long",
    )
  }
  return true
}

export const validateEmail = (email) => {
  if (!email) {
    throw new ValidationError("email", "Введите email", "string_required")
  }
  if (email.length < ValidationRules.email.minLength) {
    throw new ValidationError(
      "email",
      `Email должен содержать минимум ${ValidationRules.email.minLength} символа`,
      "string_too_short",
    )
  }
  if (email.length > ValidationRules.email.maxLength) {
    throw new ValidationError(
      "email",
      `Email должен содержать максимум ${ValidationRules.email.maxLength} символов`,
      "string_too_long",
    )
  }
  if (!ValidationRules.email.pattern.test(email)) {
    throw new ValidationError("email", "Введите корректный email адрес", "value_error")
  }
  return true
}

export const validatePassword = (password) => {
  if (!password) {
    throw new ValidationError("password", "Введите пароль", "string_required")
  }
  if (password.length < ValidationRules.password.minLength) {
    throw new ValidationError(
      "password",
      `Пароль должен содержать минимум ${ValidationRules.password.minLength} символов`,
      "string_too_short",
    )
  }
  return true
}

export const validateSkillName = (name) => {
  if (!name) {
    throw new ValidationError("name", "Введите название навыка", "string_required")
  }
  if (name.length < ValidationRules.skillName.minLength) {
    throw new ValidationError(
      "name",
      `Название должно содержать минимум ${ValidationRules.skillName.minLength} символ`,
      "string_too_short",
    )
  }
  if (name.length > ValidationRules.skillName.maxLength) {
    throw new ValidationError(
      "name",
      `Название должно содержать максимум ${ValidationRules.skillName.maxLength} символов`,
      "string_too_long",
    )
  }
  return true
}

export const validateSkillDescription = (description) => {
  if (description && description.length > ValidationRules.skillDescription.maxLength) {
    throw new ValidationError(
      "description",
      `Описание должно содержать максимум ${ValidationRules.skillDescription.maxLength} символов`,
      "string_too_long",
    )
  }
  return true
}

export const validateRegistrationForm = (formData) => {
  const errors = {}

  try {
    validateUsername(formData.username)
  } catch (error) {
    errors.username = error.message
  }

  try {
    validateEmail(formData.email)
  } catch (error) {
    errors.email = error.message
  }

  try {
    validatePassword(formData.password)
  } catch (error) {
    errors.password = error.message
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = "Подтвердите пароль"
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Пароли не совпадают"
  }

  if (!formData.acceptPrivacy) {
    errors.acceptPrivacy = "Необходимо принять Политику конфиденциальности"
  }

  if (!formData.acceptTerms) {
    errors.acceptTerms = "Необходимо принять Пользовательское соглашение"
  }

  return errors
}

export const validateLoginForm = (formData) => {
  const errors = {}

  if (!formData.emailOrUsername) {
    errors.emailOrUsername = "Введите email или имя пользователя"
  }

  if (!formData.password) {
    errors.password = "Введите пароль"
  }

  return errors
}


export const validateSkillForm = (formData) => {
  const errors = {}

  try {
    validateSkillName(formData.name)
  } catch (error) {
    errors.name = error.message
  }

  try {
    validateSkillDescription(formData.description)
  } catch (error) {
    errors.description = error.message
  }

  if (!formData.type || !["INCOMING", "OUTGOING"].includes(formData.type)) {
    errors.type = "Выберите тип навыка"
  }

  return errors
}


export const validateProfileForm = (formData) => {
  const errors = {}

  if (formData.username !== undefined) {
    try {
      validateUsername(formData.username)
    } catch (error) {
      errors.username = error.message
    }
  }

  if (formData.email !== undefined) {
    try {
      validateEmail(formData.email)
    } catch (error) {
      errors.email = error.message
    }
  }

  return errors
}

/**
 * Валидировать данные с использованием Zod схемы
 * @param {Object} schema - Zod схема
 * @param {Object} data - данные для валидации
 * @returns {Object} объект с ошибками или пустой объект
 */
export const validateWithZod = (schema, data) => {
  try {
    schema.parse(data);
    return {};
  } catch (error) {
    if (error.errors) {
      const errors = {};
      error.errors.forEach((err) => {
        const field = err.path[0];
        errors[field] = err.message;
      });
      return errors;
    }
    return { _general: "Ошибка валидации" };
  }
};


export const handleApiError = (error) => {
  if (error.detail && Array.isArray(error.detail)) {
    const errors = {}
    error.detail.forEach((err) => {
      const field = err.loc[err.loc.length - 1]
      errors[field] = err.msg
    })
    return errors
  }

  if (error.data?.detail?.error_key) {
    const errorMessages = {
      user_nickname_already_exists: "Это имя пользователя уже занято",
      user_email_already_exists: "Этот email уже зарегистрирован",
      incorrect_email_username_or_password: "Неверный email/имя пользователя или пароль",
      invalid_refresh_token: "Недействительный токен. Пожалуйста, войдите снова",
      user_access_denied: "Доступ запрещен",
      user_not_found: "Пользователь не найден",
      skill_not_found: "Навык не найден",
      skill_access_denied: "У вас нет прав для редактирования этого навыка",
    }
    const errorKey = error.data.detail.error_key;
    return { _general: errorMessages[errorKey] || error.data.detail.message || "Произошла ошибка" }
  }

  // Generic error
  return { _general: error.message || "Произошла ошибка. Пожалуйста, попробуйте позже" }
}
