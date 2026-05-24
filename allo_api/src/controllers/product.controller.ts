import type { Request, Response } from 'express';
import { HttpStatus } from '@/constants/http-status';
import { ProductService } from '@/services/product.service';
import { ok } from '@/utils/response';

const service = new ProductService();

export class ProductController {
  async list(_req: Request, res: Response): Promise<void> {
    const products = await service.list();
    res.status(HttpStatus.OK).json(ok('Products fetched', products));
  }
}
