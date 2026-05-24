import { WarehouseRepository } from '@/repositories/warehouse.repository';

const repository = new WarehouseRepository();

export class WarehouseService {
  list() {
    return repository.list();
  }
}
