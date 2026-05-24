import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { asyncHandler } from '@/utils/async-handler';
import { validate } from '@/middlewares/validate.middleware';
import { loginSchema, refreshSchema } from '@/schemas/auth.schema';

const router = Router();
const controller = new AuthController();

router.post('/login', validate(loginSchema), asyncHandler(controller.login.bind(controller)));
router.post('/refresh', validate(refreshSchema), asyncHandler(controller.refresh.bind(controller)));

export { router as authRoutes };
