import { Router } from 'express';
import { WarehouseController } from '@/controllers/warehouse.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { asyncHandler } from '@/utils/async-handler';

const router = Router();
const controller = new WarehouseController();

router.use(authMiddleware);
router.get('/', asyncHandler(controller.list.bind(controller)));

export { router as warehouseRoutes };
