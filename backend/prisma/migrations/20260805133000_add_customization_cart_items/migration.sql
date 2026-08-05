-- Allow a cart entry to reference a saved customization instead of a shop product.
ALTER TABLE "cart_items" ALTER COLUMN "productId" DROP NOT NULL;
ALTER TABLE "cart_items" ADD COLUMN "customizationId" TEXT;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_customizationId_fkey" FOREIGN KEY ("customizationId") REFERENCES "customizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "cart_items_userId_customizationId_size_key" ON "cart_items"("userId", "customizationId", "size");
