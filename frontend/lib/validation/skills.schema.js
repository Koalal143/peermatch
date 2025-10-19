/**
 * Zod схемы для валидации форм навыков
 */

import { z } from "zod";

export const skillCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Введите название навыка")
    .max(255, "Название не должно превышать 255 символов"),
  description: z
    .string()
    .max(1000, "Описание не должно превышать 1000 символов")
    .optional()
    .or(z.literal("")),
  type: z
    .enum(["INCOMING", "OUTGOING"], {
      errorMap: () => ({ message: "Выберите тип навыка" }),
    }),
});

export const skillUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Введите название навыка")
    .max(255, "Название не должно превышать 255 символов")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(1000, "Описание не должно превышать 1000 символов")
    .optional()
    .or(z.literal("")),
  type: z
    .enum(["INCOMING", "OUTGOING"], {
      errorMap: () => ({ message: "Выберите тип навыка" }),
    })
    .optional(),
});

