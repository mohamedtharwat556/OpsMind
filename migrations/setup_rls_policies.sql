-- OpsMind RLS (Row-Level Security) Policies Setup
-- This script configures security policies for all tables

-- ============================================
-- Document Versions RLS Policies
-- ============================================

-- Enable RLS on document_versions if not already enabled
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own document versions
CREATE POLICY IF NOT EXISTS "users_can_insert_versions" ON document_versions
FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Allow users to read versions of documents they can access
CREATE POLICY IF NOT EXISTS "users_can_read_versions" ON document_versions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM documents 
  WHERE documents.id = document_versions.document_id
));

-- Allow users to update their own versions
CREATE POLICY IF NOT EXISTS "users_can_update_versions" ON document_versions
FOR UPDATE
USING (auth.uid() = author_id);

-- Allow users to delete their own versions
CREATE POLICY IF NOT EXISTS "users_can_delete_versions" ON document_versions
FOR DELETE
USING (auth.uid() = author_id);

-- ============================================
-- Documents RLS Policies
-- ============================================

-- Enable RLS on documents if not already enabled
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Allow users to view all documents (read-only for non-owners)
CREATE POLICY IF NOT EXISTS "users_can_view_documents" ON documents
FOR SELECT
USING (true);

-- Allow users to insert their own documents
CREATE POLICY IF NOT EXISTS "users_can_insert_documents" ON documents
FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Allow users to update their own documents
CREATE POLICY IF NOT EXISTS "users_can_update_documents" ON documents
FOR UPDATE
USING (auth.uid() = author_id);

-- Allow admins to delete documents
CREATE POLICY IF NOT EXISTS "admins_can_delete_documents" ON documents
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() 
  AND users.role = 'Admin'
));

-- ============================================
-- Approvals RLS Policies
-- ============================================

-- Enable RLS on approvals if not already enabled
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- Allow users to view approvals for their documents
CREATE POLICY IF NOT EXISTS "users_can_view_approvals" ON approvals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM documents 
    WHERE documents.id = approvals.document_id 
    AND documents.author_id = auth.uid()
  )
  OR auth.uid() = reviewer_id
);

-- Allow managers/admins to submit approvals
CREATE POLICY IF NOT EXISTS "managers_can_submit_approvals" ON approvals
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('Manager', 'Admin')
  )
);

-- Allow reviewers to update approval status
CREATE POLICY IF NOT EXISTS "reviewers_can_update_approvals" ON approvals
FOR UPDATE
USING (auth.uid() = reviewer_id);

-- ============================================
-- Activity Logs RLS Policies
-- ============================================

-- Enable RLS on activity_logs if not already enabled
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view activity logs
CREATE POLICY IF NOT EXISTS "users_can_view_activity_logs" ON activity_logs
FOR SELECT
USING (true);

-- Allow system to insert activity logs
CREATE POLICY IF NOT EXISTS "system_can_insert_activity_logs" ON activity_logs
FOR INSERT
WITH CHECK (true);

-- ============================================
-- Notifications RLS Policies
-- ============================================

-- Enable RLS on notifications if not already enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own notifications
CREATE POLICY IF NOT EXISTS "users_can_view_notifications" ON notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Allow system to insert notifications
CREATE POLICY IF NOT EXISTS "system_can_insert_notifications" ON notifications
FOR INSERT
WITH CHECK (true);

-- Allow users to update their own notifications
CREATE POLICY IF NOT EXISTS "users_can_update_notifications" ON notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- Users RLS Policies
-- ============================================

-- Enable RLS on users if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view all users
CREATE POLICY IF NOT EXISTS "users_can_view_users" ON users
FOR SELECT
USING (true);

-- Allow users to update their own profile
CREATE POLICY IF NOT EXISTS "users_can_update_own_profile" ON users
FOR UPDATE
USING (auth.uid() = id);

-- Allow admins to update any user
CREATE POLICY IF NOT EXISTS "admins_can_update_users" ON users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() AND u.role = 'Admin'
  )
);

-- ============================================
-- Roles RLS Policies
-- ============================================

-- Enable RLS on roles if not already enabled
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view roles
CREATE POLICY IF NOT EXISTS "users_can_view_roles" ON roles
FOR SELECT
USING (true);

-- Allow only admins to manage roles
CREATE POLICY IF NOT EXISTS "admins_can_manage_roles" ON roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'Admin'
  )
);

-- ============================================
-- Storage RLS Policies (if using Storage bucket)
-- ============================================

-- Create storage policies for documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY IF NOT EXISTS "Users can upload documents" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to download their documents
CREATE POLICY IF NOT EXISTS "Users can download documents" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their documents
CREATE POLICY IF NOT EXISTS "Users can delete documents" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
