import { Router } from 'express'
import { PinterestController } from '../controllers/pinterest'
import { validateRequest } from '../middleware/validate'
import { z } from 'zod'
import {
  createPinSchema,
  schedulePinSchema,
  updatePinSchema,
  createBoardSchema,
  getAnalyticsSchema,
} from '../schemas/pinterest'

const router = Router()
const controller = new PinterestController()

// Board routes
router.get('/boards', (req, res) => controller.getBoards(req, res))
router.post(
  '/boards',
  validate(createBoardSchema),
  (req, res) => controller.createBoard(req, res)
)
router.delete('/boards/:boardId', (req, res) => controller.deleteBoard(req, res))

// Pin routes
router.post(
  '/pins',
  validate(createPinSchema),
  (req, res) => controller.createPin(req, res)
)
router.patch(
  '/pins/:pinId',
  validate(updatePinSchema),
  (req, res) => controller.updatePin(req, res)
)
router.delete('/pins/:pinId', (req, res) => controller.deletePin(req, res))

// Scheduling routes
router.post(
  '/schedule',
  validate(schedulePinSchema),
  (req, res) => controller.schedulePin(req, res)
)

// Analytics routes
router.get(
  '/pins/:id/analytics',
  validate(getAnalyticsSchema),
  (req, res) => controller.getPinAnalytics(req, res)
)
router.get(
  '/boards/:id/analytics',
  validate(getAnalyticsSchema),
  (req, res) => controller.getBoardAnalytics(req, res)
)

// Batch operations endpoint
router.post(
  '/batch',
  validateRequest({
    body: z.object({
      operations: z.array(
        z.object({
          operation: z.enum(['create', 'update', 'delete', 'schedule']),
          data: z.object({
            boardId: z.string(),
            title: z.string().optional(),
            description: z.string().optional(),
            link: z.string().url().optional(),
            imageUrl: z.string().url().optional(),
            altText: z.string().optional(),
            tags: z.array(z.string()).optional(),
            scheduledTime: z.string().optional(),
            pinId: z.string().optional(),
          }),
        })
      ),
      optimizeScheduling: z.boolean().optional(),
      timeSlots: z.array(z.string()).optional(),
      maxPinsPerSlot: z.number().optional(),
    }),
  }),
  controller.batchPinOperations.bind(controller)
)

export default router
