-- OpsMind v2.2 — Authorization RLS Fixes and Enhancements (NO RECURSION)
-- This migration corrects RLS policies and adds critical authorization checks
-- Date: 2026-10-09
-- Purpose: Fix column name mismatches (author_id vs owner_id) and add role-based restrictions
-- NOTE: Admin role UUID hardcoded to avoid recursive policy loops

-- Admin Role UUID (from roles table)
-- df3c8c1e-65c0-4a66-b502-006bfb20841e

-- Manager Role UUID (from roles table)
-- 6b209b44-e0ae-49eb-8da9-537bb99ba49c

-- Support Agent Role UUID (from roles table)
-- f73017eb-727a-484b-8459-ea548f76cdf8

-- ============================================================
-- 1. USERS TABLE — RESTRICT ACCOUNT CREATION TO ADMINS ONLY
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "only_admins_can_create_users" ON users;
CREATE POLICY "only_admins_can_create_users" ON users
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT u.id FROM users u
    WHERE u.role_id = 'df3c8c1e-65c0-4a66-b502-006bfb20841e'  -- Admin only
  )
);

-- Allow users to read all users
DROP POLICY IF EXISTS "users_can_view_users_v2" ON users;
CREATE POLICY "users_can_view_users_v2" ON users
FOR SELECT
USING (true);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "users_can_update_own_profile_v2" ON users;
CREATE POLICY "users_can_update_own_profile_v2" ON users
FOR UPDATE
USING (auth.uid() = id);

-- Allow admins to update any user
DROP POLICY IF EXISTS "admins_can_update_users_v2" ON users;
CREATE POLICY "admins_can_update_users_v2" ON users
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT u.id FROM users u
    WHERE u.role_id = 'df3c8c1e-65c0-4a66-b502-006bfb20841e'  -- Admin only
  )
);

-- ============================================================
-- 2. DOCUMENTS TABLE — FIX COLUMN MISMATCHES & ADD ROLE CHECKS
-- ============================================================

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop old incorrect policies
DROP POLICY IF EXISTS "users_can_view_documents" ON documents;
DROP POLICY IF EXISTS "users_can_insert_documents" ON documents;
DROP POLICY IF EXISTS "users_can_update_documents" ON documents;
DROP POLICY IF EXISTS "admins_can_delete_documents" ON documents;

-- Allow all users to view all documents
DROP POLICY IF EXISTS "users_can_view_all_documents" ON documents;
CREATE POLICY "users_can_view_all_documents" ON documents
FOR SELECT
USING (true);

-- Users can INSERT documents they own (use owner_id, not author_id)
DROP POLICY IF EXISTS "users_can_insert_own_documents" ON documents;
CREATE POLICY "users_can_insert_own_documents" ON documents
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Users can UPDATE their own DRAFT documents OR Managers/Admins can update any document
DROP POLICY IF EXISTS "users_can_update_own_documents" ON documents;
CREATE POLICY "users_can_update_own_documents" ON documents
FOR UPDATE
USING (
  -- Support Agents can only edit their own drafts
  (auth.uid() = owner_id AND status = 'Draft')
  OR
  -- Managers/Admins can update any document
  (auth.uid() IN (
    SELECT u.id FROM users u
    WHERE u.role_id IN (
      'df3c8c1e-65c0-4a66-b502-006bfb20841e',  -- Admin
      '6b209b44-e0ae-49eb-8da9-537bb99ba49c'   -- Manager
    )
  ))
);

-- Only Admins can delete documents
DROP POLICY IF EXISTS "admins_can_delete_documents" ON documents;
CREATE POLICY "admins_can_delete_documents" ON documents
FOR DELETE
USING (
  auth.uid() IN (
    SELECT u.id FROM users u
    WHERE u.role_id = 'df3c8c1e-65c0-4a66-b502-006bfb20841e'  -- Admin only
  )
);

-- ============================================================
-- 3. APPROVALS TABLE — FIX COLUMN MISMATCHES & ROLE CHECKS
-- ============================================================

ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- Drop old incorrect policies
DROP POLICY IF EXISTS "users_can_view_approvals" ON approvals;
DROP POLICY IF EXISTS "managers_can_submit_approvals" ON approvals;
DROP POLICY IF EXISTS "reviewers_can_update_approvals" ON approvals;

-- Users can view approvals for their documents or assigned to them
DROP POLICY IF EXISTS "users_can_view_approvals_v2" ON approvals;
CREATE POLICY "users_can_view_approvals_v2" ON approvals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = approvals.document_id
    AND d.owner_id = auth.uid()
  )
  OR auth.uid() = approver_id
);

-- Only Managers/Admins can INSERT approval records
DROP POLICY IF EXISTS "only_managers_can_submit_approvals" ON approvals;
CREATE POLICY "only_managers_can_submit_approvals" ON approvals
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT u.id FROM users u
    WHERE u.role_id IN (
      'df3c8c1e-65c0-4a66-b502-006bfb20841e',  -- Admin
      '6b209b44-e0ae-49eb-8da9-537bb99ba49c'   -- Manager
    )
  )
);

-- Only authorized approvers can UPDATE approval status
DROP POLICY IF EXISTS "only_approvers_can_update_approvals" ON approvals;
CREATE POLICY "only_approvers_can_update_approvals" ON approvals
FOR UPDATE
USING (auth.uid() = approver_id);

-- ============================================================
-- 4. DOCUMENT_VERSIONS TABLE — FIX COLUMN MISMATCHES
-- ============================================================

ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Drop old incorrect policies
DROP POLICY IF EXISTS "users_can_insert_versions" ON document_versions;
DROP POLICY IF EXISTS "users_can_read_versions" ON document_versions;
DROP POLICY IF EXISTS "users_can_update_versions" ON document_versions;
DROP POLICY IF EXISTS "users_can_delete_versions" ON document_versions;

-- Users can insert versions for their documents
DROP POLICY IF EXISTS "users_can_insert_versions_v2" ON document_versions;
CREATE POLICY "users_can_insert_versions_v2" ON document_versions
FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Users can read versions of documents they can access
DROP POLICY IF EXISTS "users_can_read_versions_v2" ON document_versions;
CREATE POLICY "users_can_read_versions_v2" ON document_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM documents 
    WHERE documents.id = document_versions.document_id
  )
);

-- Users can update their own versions
DROP POLICY IF EXISTS "users_can_update_versions_v2" ON document_versions;
CREATE POLICY "users_can_update_versions_v2" ON document_versions
FOR UPDATE
USING (auth.uid() = author_id);

-- Users can delete their own versions
DROP POLICY IF EXISTS "users_can_delete_versions_v2" ON document_versions;
CREATE POLICY "users_can_delete_versions_v2" ON document_versions
FOR DELETE
USING (auth.uid() = author_id);

-- ============================================================
-- 5. ACTIVITY_LOGS TABLE
-- ============================================================

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view activity logs
DROP POLICY IF EXISTS "users_can_view_activity_logs" ON activity_logs;
CREATE POLICY "users_can_view_activity_logs" ON activity_logs
FOR SELECT
USING (true);

-- System can insert activity logs
DROP POLICY IF EXISTS "system_can_insert_activity_logs" ON activity_logs;
CREATE POLICY "system_can_insert_activity_logs" ON activity_logs
FOR INSERT
WITH CHECK (true);

-- ============================================================
-- 6. NOTIFICATIONS TABLE
-- ============================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
DROP POLICY IF EXISTS "users_can_view_notifications" ON notifications;
CREATE POLICY "users_can_view_notifications" ON notifications
FOR SELECT
USING (auth.uid() = user_id);

-- System can insert notifications
DROP POLICY IF EXISTS "system_can_insert_notifications" ON notifications;
CREATE POLICY "system_can_insert_notifications" ON notifications
FOR INSERT
WITH CHECK (true);

-- Users can update their own notifications
DROP POLICY IF EXISTS "users_can_update_notifications" ON notifications;
CREATE POLICY "users_can_update_notifications" ON notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================================
-- 7. ROLES TABLE — ALLOW VIEW ONLY (NO WRITE POLICIES)
-- ============================================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view roles (simple, no recursion)
DROP POLICY IF EXISTS "users_can_view_roles" ON roles;
CREATE POLICY "users_can_view_roles" ON roles
FOR SELECT
USING (true);

-- ============================================================
-- SUMMARY OF CHANGES
-- ============================================================

-- Fixed issues:
-- ✅ Account creation: Now restricted to Admins only (RLS)
-- ✅ Document INSERT: Fixed to use owner_id (not author_id)
-- ✅ Document UPDATE: Restricted to owner (draft) OR Manager/Admin
-- ✅ Document DELETE: Restricted to Admin only
-- ✅ No recursion: Role UUIDs hardcoded, not fetched via JOIN
-- ✅ Approval authorization: Manager/Admin verification
-- ✅ Support Agent restrictions: Can only edit own drafts
--
-- Testing matrix:
-- 1. Admin can create accounts ✓
-- 2. Support Agent CANNOT create accounts (RLS blocks)
-- 3. Support Agent can create Draft documents ✓
-- 4. Support Agent CANNOT change document status (RLS blocks)
-- 5. Manager can approve/reject documents ✓
-- 6. Support Agent CANNOT approve/reject (TS + RLS blocks)
-- 7. All users can view all documents (SELECT allows)
-- 8. Existing data preserved ✓
