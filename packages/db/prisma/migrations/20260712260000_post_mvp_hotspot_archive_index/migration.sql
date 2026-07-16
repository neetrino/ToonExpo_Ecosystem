-- Composite index for archived hotspot lookups per canvas.
CREATE INDEX "Hotspot_canvasId_archivedAt_idx" ON "Hotspot"("canvasId", "archivedAt");
