ALTER TABLE "customizations"
  ADD COLUMN IF NOT EXISTS "designConfig" JSONB;
