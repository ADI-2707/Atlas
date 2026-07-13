-- AlterTable
ALTER TABLE "atlas_core"."organizations" ADD COLUMN     "health_score" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
ADD COLUMN     "mrr" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- CreateTable
CREATE TABLE "atlas_core"."plugin_data" (
    "id" TEXT NOT NULL,
    "plugin_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plugin_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atlas_core"."system_logs" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atlas_core"."support_tickets" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plugin_data_plugin_id_organization_id_entity_type_idx" ON "atlas_core"."plugin_data"("plugin_id", "organization_id", "entity_type");

-- AddForeignKey
ALTER TABLE "atlas_core"."plugin_data" ADD CONSTRAINT "plugin_data_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "atlas_core"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_core"."plugin_data" ADD CONSTRAINT "plugin_data_plugin_id_fkey" FOREIGN KEY ("plugin_id") REFERENCES "atlas_core"."plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_core"."support_tickets" ADD CONSTRAINT "support_tickets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "atlas_core"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
