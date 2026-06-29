-- Migration: add_has_completed_setup
ALTER TABLE "atlas_core"."users" ADD COLUMN IF NOT EXISTS "has_completed_setup" BOOLEAN NOT NULL DEFAULT false;
