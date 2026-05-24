-- Add DB-level CHECK constraints to protect inventory integrity
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inventory_total_quantity_nonnegative'
  ) THEN
    ALTER TABLE "Inventory" ADD CONSTRAINT inventory_total_quantity_nonnegative CHECK ("totalQuantity" >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inventory_reserved_quantity_nonnegative'
  ) THEN
    ALTER TABLE "Inventory" ADD CONSTRAINT inventory_reserved_quantity_nonnegative CHECK ("reservedQuantity" >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inventory_reserved_le_total'
  ) THEN
    ALTER TABLE "Inventory" ADD CONSTRAINT inventory_reserved_le_total CHECK ("reservedQuantity" <= "totalQuantity");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reservation_quantity_positive'
  ) THEN
    ALTER TABLE "Reservation" ADD CONSTRAINT reservation_quantity_positive CHECK ("quantity" > 0);
  END IF;
END$$;
