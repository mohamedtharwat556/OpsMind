export type UserRole = 'Admin' | 'Manager' | 'Support Agent'
export type UserStatus = 'Active' | 'Inactive'
export type DocType = 'SOP' | 'Technical Document' | 'Operational Case' | 'Organizational Information'
export type DocStatus = 'Draft' | 'In Review' | 'Approved' | 'Rejected'
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected'

export interface User {
  id: string
  email: string
  name: string
  role_id: string
  department: string
  status: UserStatus
  initials: string
  avatar_color: string
  created_at: string
}

export interface Role {
  id: string
  name: UserRole
  description?: string
}

export interface Document {
  id: string
  title: string
  content: string
  category: DocType
  status: DocStatus
  author_id: string
  version: number
  created_at: string
  updated_at: string
  file_path?: string
  file_name?: string
  // Legacy aliases and additional fields
  code?: string
  type?: DocType
  description?: string
  tags?: string[]
}

export interface DocumentVersion {
  id: string
  document_id: string
  version_number: number
  content: string
  changed_by: string
  change_reason: string
  created_at: string
  file_path?: string
  file_name?: string
}

export interface Approval {
  id: string
  document_id: string
  requester_id: string
  approver_id: string
  status: ApprovalStatus
  request_date: string
  decision_date?: string
  comments?: string
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  details: string
  created_at: string
}

export interface UserWithRole extends User {
  role: Role
}

export interface DocumentWithOwner extends Document {
  owner: User
}

export interface DocumentWithVersions extends Document {
  versions: DocumentVersion[]
}

export interface DocumentWithApprovals extends Document {
  approvals: Approval[]
}
