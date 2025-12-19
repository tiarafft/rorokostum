import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [adminData, setAdminData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchAdminData = async (userId) => {
    if (!userId) {
      setAdminData(null)
      return
    }

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle()

      if (error) {
        console.error('Error fetching admin data:', error)
        setAdminData(null)
      } else {
        setAdminData(data)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
      setAdminData(null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchAdminData(session.user.id).then(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchAdminData(session.user.id)
        } else {
          setAdminData(null)
        }
      })()
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    adminData,
    signIn,
    signUp,
    signOut,
    loading,
    isSuperAdmin: adminData?.role === 'super_admin',
    isAdmin: adminData?.role === 'admin' || adminData?.role === 'super_admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
