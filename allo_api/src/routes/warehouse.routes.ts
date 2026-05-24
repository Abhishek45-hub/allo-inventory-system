import { Router } from 'express';
import { WarehouseController } from '@/controllers/warehouse.controller';
import { asyncHandler } from '@/utils/async-handler';

const router = Router();
const controller = new WarehouseController();

router.get('/', asyncHandler(controller.list.bind(controller)));

export { router as warehouseRoutes };
