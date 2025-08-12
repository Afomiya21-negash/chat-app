import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  categoryId: z.coerce.number().optional(),
})
