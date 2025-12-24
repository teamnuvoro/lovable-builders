-- =====================================================
-- ADD SARVAM CALL ID SUPPORT
-- Adds sarvam_call_id field to call_sessions table
-- =====================================================

-- Add sarvam_call_id column to call_sessions table
ALTER TABLE call_sessions
ADD COLUMN IF NOT EXISTS sarvam_call_id VARCHAR(255);

-- Create index for Sarvam call lookups
CREATE INDEX IF NOT EXISTS idx_call_sessions_sarvam_call_id 
ON call_sessions(sarvam_call_id) 
WHERE sarvam_call_id IS NOT NULL;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '✅ Sarvam call ID support added!' as status;

