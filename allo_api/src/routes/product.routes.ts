import { Router } from 'express';
import { ProductController } from '@/controllers/product.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { asyncHandler } from '@/utils/async-handler';

const router = Router();
const controller = new ProductController();

router.use(authMiddleware);
router.get('/', asyncHandler(controller.list.bind(controller)));

export { router as productRoutes };
