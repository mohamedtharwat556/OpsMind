import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase, supabaseError } from '../lib/supabase'
import { ConfigurationError } from '../components/ConfigurationError'

interface User {
  id: string
  email: string
  name: string
  role: string
  initials: string
  avatar_color: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
  configError: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [configError] = useState<string | null>(supabaseError || null)

  // If Supabase is not configured, show error UI
  if (configError) {
    return <ConfigurationError message={configError} />
  }

  // If supabase client is not available, show error
  if (!supabase) {
    return <ConfigurationError message="Failed to initialize Supabase client." />
  }

  useEffect(() => {
    // Check for existing Supabase session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          roles:role_id (
            name,
            permissions
          )
        `)
        .eq('id', userId)
        .single()

      if (error) throw error

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.roles?.name || 'Support Agent',
          initials: data.initials || data.name.split(' ').map(n => n[0]).join(''),
          avatar_color: data.avatar_color || 'bg-slate-100 text-slate-600',
        })
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    // Session change will trigger fetchUserProfile via onAuthStateChange
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()

    // Always clear local state
    setUser(null)

    // If signOut failed, throw error so caller knows
    if (error) {
      throw error
    }
  }

  const hasRole = (role: string): boolean => {
    return user?.role === role || user?.role === 'Admin'
  }

  const hasPermission = (permission: string): boolean => {
    const rolePermissions: Record<string, string[]> = {
      Admin: ['all'],
      Manager: ['documents', 'approvals', 'users'],
      'Support Agent': ['documents', 'search'],
    }
    
    const userPermissions = rolePermissions[user?.role || 'Support Agent'] || []
    return userPermissions.includes('all') || userPermissions.includes(permission)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
        hasPermission,
        configError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
