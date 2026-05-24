ALTER TABLE "Inventory"
  ADD CONSTRAINT "Inventory_totalQuantity_non_negative"
  CHECK ("totalQuantity" >= 0);

ALTER TABLE "Inventory"
  ADD CONSTRAINT "Inventory_reservedQuantity_non_negative"
  CHECK ("reservedQuantity" >= 0);

ALTER TABLE "Inventory"
  ADD CONSTRAINT "Inventory_reserved_le_total"
  CHECK ("reservedQuantity" <= "totalQuantity");

ALTER TABLE "Reservation"
  ADD CONSTRAINT "Reservation_quantity_positive"
  CHECK (quantity > 0);
