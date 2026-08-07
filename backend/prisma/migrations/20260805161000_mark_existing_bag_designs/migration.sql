UPDATE "customizations"
SET "addedToBag" = true
WHERE EXISTS (
  SELECT 1
  FROM "cart_items"
  WHERE "cart_items"."customizationId" = "customizations"."id"
);
