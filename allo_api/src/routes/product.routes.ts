import { Router } from 'express';
import { ProductController } from '@/controllers/product.controller';
import { asyncHandler } from '@/utils/async-handler';

const router = Router();
const controller = new ProductController();

router.get('/', asyncHandler(controller.list.bind(controller)));

export { router as productRoutes };
