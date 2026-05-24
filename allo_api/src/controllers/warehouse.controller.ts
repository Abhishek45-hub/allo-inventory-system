import type { Request, Response } from 'express';
import { HttpStatus } from '@/constants/http-status';
import { WarehouseService } from '@/services/warehouse.service';
import { ok } from '@/utils/response';

const service = new WarehouseService();

export class WarehouseController {
  async list(_req: Request, res: Response): Promise<void> {
    const warehouses = await service.list();
    res.status(HttpStatus.OK).json(ok('Warehouses fetched', warehouses));
  }
}
