-- CreateIndex
CREATE INDEX "audit_logs_organization_id_idx" ON "atlas_core"."audit_logs"("organization_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "atlas_core"."audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "atlas_core"."notifications"("user_id");
