/**
 * Zod схемы для валидации форм аутентификации
 */

import { z } from "zod";
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_REGEX,
  isBannedUsername,
} from "@/constants/validation";

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(USERNAME_MIN_LENGTH, `Юзернейм должен содержать минимум ${USERNAME_MIN_LENGTH} символов`)
    .max(USERNAME_MAX_LENGTH, `Юзернейм не должен превышать ${USERNAME_MAX_LENGTH} символов`),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Пароль должен содержать минимум ${PASSWORD_MIN_LENGTH} символов`),
});

export const registrationSchema = z
  .object({
    username: z
      .string()
      .min(USERNAME_MIN_LENGTH, "Юзернейм должен содержать минимум 3 символа")
      .max(USERNAME_MAX_LENGTH, "Юзернейм не должен превышать 30 символов")
      .regex(USERNAME_REGEX, "Юзернейм может содержать только латинские буквы, цифры, дефис и нижнее подчеркивание")
      .refine((username) => !isBannedUsername(username), {
        message: "Данное имя пользователя запрещено",
      }),
    email: z
      .string()
      .email("Введите корректный email"),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Пароль должен содержать минимум ${PASSWORD_MIN_LENGTH} символов`),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(USERNAME_MIN_LENGTH, "Юзернейм должен содержать минимум 3 символа")
    .max(USERNAME_MAX_LENGTH, "Юзернейм не должен превышать 30 символов")
    .regex(USERNAME_REGEX, "Юзернейм может содержать только латинские буквы, цифры, дефис и нижнее подчеркивание")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Введите корректный email")
    .optional()
    .or(z.literal("")),
});

