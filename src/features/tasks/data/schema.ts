import { z } from 'zod'

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  location: z.string(),
  description: z.string(),
  photo: z.string().optional(),
  status: z.string(),
})

export type Task = z.infer<typeof taskSchema>
