# OpsMind - Enterprise Knowledge and Operations Platform

A web-based Knowledge Management System (KMS) designed for the Technical Support Department to streamline document management, approval workflows, and AI-assisted knowledge retrieval.

## Problem Statement

Technical support teams face challenges in:
- Managing Standard Operating Procedures (SOPs) and technical documentation
- Ensuring document quality through proper approval workflows
- Quickly retrieving relevant information during critical incidents
- Tracking document versions and changes
- Maintaining audit trails for compliance

OpsMind addresses these challenges by providing a centralized, secure, and intelligent knowledge management platform.

## Main Features

### Core Functionality
- **Document Management**: Create, edit, view, and organize documents
- **Version Control**: Track document history with automatic versioning
- **Approval Workflow**: Multi-stage approval process (Draft → In Review → Approved/Rejected)
- **Role-Based Access Control**: Admin, Manager, and Support Agent roles with specific permissions
- **Search**: Full-text search across all documents
- **AI Knowledge Retrieval**: AI-powered question answering grounded in actual document content
- **Activity Logs**: Comprehensive audit trail of all system activities
- **Reports**: Analytics and insights on document status and user activity
- **File Storage**: Secure attachment management for documents
- **Notifications**: Real-time alerts for approvals and document updates

### Security Features
- Authentication via Supabase Auth
- Row-Level Security (RLS) policies in PostgreSQL
- Protected routes based on user roles
- Secure file storage with access controls
- Audit logging for all critical operations

## Technology Stack

### Frontend
- **React 19.2.8**: UI framework
- **TypeScript 6.0.2**: Type-safe development
- **React Router 7.18.3**: Client-side routing
- **Tailwind CSS 3.4.17**: Utility-first styling
- **shadcn/ui**: Reusable UI components
- **Lucide React**: Icon library
- **Vite 5.4.11**: Build tool and dev server

### Backend & Infrastructure
- **Supabase**: Backend-as-a-Service platform
  - PostgreSQL: Relational database
  - Supabase Auth: Authentication service
  - Supabase Storage: File storage
  - Row-Level Security (RLS): Database security
- **Google Gemini AI**: AI-powered knowledge retrieval

## System Architecture

```
Frontend (React + TypeScript)
    ↓
Application Services (Supabase Client)
    ↓
Supabase Platform
    ↓
PostgreSQL / Auth / Storage
    ↓
RLS / Security Layer
```

### Key Modules
- **Authentication**: User signup, login, and session management
- **Document Service**: CRUD operations for documents
- **Approval Service**: Manage approval workflows
- **Storage Service**: File upload/download management
- **Activity Logs Service**: Track system events
- **Users Service**: User and role management

## Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Google Gemini API key

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/mohamedtharwat556/OpsMind.git
   cd OpsMind
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Set up Supabase database**
   - Run the migration script in `migrations/add_version_file_fields.sql`
   - Create the required tables: `users`, `roles`, `documents`, `document_versions`, `approvals`, `activity_logs`
   - Configure RLS policies for security

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `VITE_GEMINI_API_KEY` | Google Gemini API key for AI features |

## Running the Project

### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## Supabase Configuration

### Database Schema
The application uses the following main tables:
- `users`: User profiles and role assignments
- `roles`: System roles (Admin, Manager, Support Agent)
- `documents`: Document metadata and content
- `document_versions`: Version history for documents
- `approvals`: Approval workflow records
- `activity_logs`: System audit trail

### RLS Policies
- Documents: Users can only view documents they have access to
- Approvals: Only Managers can approve/reject documents
- Administration: Only Admins can access user management
- Storage: File access controlled by document ownership

## Authentication

OpsMind uses Supabase Auth for:
- Email/password authentication
- Session management
- Protected routes
- Role-based access control

### Roles
- **Admin**: Full system access, user management, administration
- **Manager**: Document approval, reporting, analytics
- **Support Agent**: Document creation, search, AI knowledge retrieval

## Running Migrations

Apply database migrations:
```sql
-- Run the migration file
-- migrations/add_version_file_fields.sql
```

## Important Project Scope Limitations

### Not Included
- Multi-tenant support (single organization only)
- Email notifications (notifications are in-app only)
- Advanced document formatting (basic text editor)
- Real-time collaboration
- Mobile app (web-only)
- Bulk document operations
- Document templates
- Integration with external ticketing systems

### Known Limitations
- AI knowledge retrieval depends on document quality and completeness
- File upload size limited by Supabase Storage (default 50MB)
- Search is basic full-text search (no advanced ranking)
- No automated document expiration
- No document archiving/purging system

## Future Improvements

- Enhanced AI with document categorization
- Advanced search with relevance ranking
- Email notification system
- Document templates library
- Real-time collaborative editing
- Mobile application
- Integration with external systems (ticketing, CRM)
- Advanced analytics dashboard
- Document lifecycle management
- Bulk operations for administrators
