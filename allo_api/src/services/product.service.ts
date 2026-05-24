import { ProductRepository } from '@/repositories/product.repository';

const repository = new ProductRepository();

export class ProductService {
  async list() {
    const products = await repository.listWithInventory();
    return products.map((product) => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      warehouses: product.inventories.map((inventory) => ({
        warehouseId: inventory.warehouseId,
        warehouseName: inventory.warehouse.name,
        totalQuantity: inventory.totalQuantity,
        reservedQuantity: inventory.reservedQuantity,
        availableQuantity: inventory.totalQuantity - inventory.reservedQuantity,
      })),
    }));
  }
}
