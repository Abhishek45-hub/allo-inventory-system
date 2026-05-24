import { Router } from 'express';
import { healthController } from '@/controllers/health.controller';
import { authRoutes } from '@/routes/auth.routes';
import { productRoutes } from '@/routes/product.routes';
import { reservationRoutes } from '@/routes/reservation.routes';
import { warehouseRoutes } from '@/routes/warehouse.routes';

const router = Router();

router.get('/health', healthController);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/reservations', reservationRoutes);

export { router as apiRouter };
