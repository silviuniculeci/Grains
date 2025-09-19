import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

interface User {
  id: string
  email: string
  role: 'sales_agent' | 'supplier' | 'back_office' | 'admin'
  language_preference: 'en' | 'ro'
  first_name?: string
  last_name?: string
  phone?: string
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in (e.g., from localStorage or session)
    const checkAuth = async () => {
      try {
        // TODO: Replace with actual auth check
        const storedUser = localStorage.getItem('opengrains_user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      console.log('Login attempt:', email)

      // Mock login for development
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Determine role based on email for demo
      let role: User['role'] = 'supplier'
      if (email.includes('agent')) {
        role = 'sales_agent'
      } else if (email.includes('admin')) {
        role = 'admin'
      } else if (email.includes('backoffice') || email.includes('support')) {
        role = 'back_office'
      }

      const mockUser: User = {
        id: 'user-' + Date.now(),
        email,
        role,
        language_preference: 'ro',
        first_name: email.split('@')[0].split('.')[0],
        last_name: email.split('@')[0].split('.')[1] || '',
        is_active: true
      }

      setUser(mockUser)
      localStorage.setItem('opengrains_user', JSON.stringify(mockUser))
      return mockUser
    } catch (error) {
      throw new Error('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('opengrains_user')
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('opengrains_user', JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}