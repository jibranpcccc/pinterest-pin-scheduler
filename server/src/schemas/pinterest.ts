import { z } from 'zod'

export const createPinSchema = z.object({
  body: z.object({
    boardId: z.string().min(1, 'Board ID is required'),
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
    description: z.string().max(500, 'Description is too long').optional(),
    link: z.string().url('Invalid URL').optional(),
    imageUrl: z.string().url('Invalid image URL'),
    altText: z.string().max(500, 'Alt text is too long').optional(),
    tags: z.array(z.string()).max(10, 'Too many tags').optional(),
  }),
})

export const schedulePinSchema = z.object({
  body: z.object({
    pinId: z.string().min(1, 'Pin ID is required'),
    scheduledTime: z.string().datetime('Invalid date time format'),
    boardId: z.string().min(1, 'Board ID is required'),
  }),
})

export const updatePinSchema = z.object({
  params: z.object({
    pinId: z.string().min(1, 'Pin ID is required'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long').optional(),
    description: z.string().max(500, 'Description is too long').optional(),
    link: z.string().url('Invalid URL').optional(),
    altText: z.string().max(500, 'Alt text is too long').optional(),
    boardId: z.string().min(1, 'Board ID is required').optional(),
  }),
})

export const createBoardSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
    description: z.string().max(500, 'Description is too long').optional(),
    privacy: z.enum(['PUBLIC', 'PROTECTED', 'SECRET']).optional(),
  }),
})

export const getAnalyticsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  query: z.object({
    startDate: z.string().datetime('Invalid start date'),
    endDate: z.string().datetime('Invalid end date'),
    metrics: z.array(z.string()).min(1, 'At least one metric is required'),
  }),
})
