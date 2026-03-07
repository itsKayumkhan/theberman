-- Add soft delete support: deleted_at column to leads, assessments, profiles
-- Items are soft-deleted first (deleted_at set), then can be permanently deleted from "Recently Deleted" tab

ALTER TABLE leads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Index for fast filtering of non-deleted records
CREATE INDEX IF NOT EXISTS idx_leads_deleted_at ON leads (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_assessments_deleted_at ON assessments (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles (deleted_at) WHERE deleted_at IS NULL;
