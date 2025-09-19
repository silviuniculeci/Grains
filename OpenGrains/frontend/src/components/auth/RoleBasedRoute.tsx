import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

interface RoleBasedRouteProps {
  children: ReactNode
  allowedRoles: ('sales_agent' | 'supplier' | 'back_office' | 'admin')[]
  fallbackPath?: string
  showAlert?: boolean
}

export const RoleBasedRoute = ({
  children,
  allowedRoles,
  fallbackPath = '/unauthorized',
  showAlert = true
}: RoleBasedRouteProps) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user has required role
  if (!allowedRoles.includes(user.role)) {
    if (showAlert) {
      return (
        <div className="container mx-auto p-6">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Nu aveți permisiunea de a accesa această pagină. Rolul dumneavoastră: {user.role}
            </AlertDescription>
          </Alert>
        </div>
      )
    }
    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}

// Convenience components for specific roles
export const AgentRoute = ({ children }: { children: ReactNode }) => (
  <RoleBasedRoute allowedRoles={['sales_agent', 'admin']}>
    {children}
  </RoleBasedRoute>
)

export const BackOfficeRoute = ({ children }: { children: ReactNode }) => (
  <RoleBasedRoute allowedRoles={['back_office', 'admin']}>
    {children}
  </RoleBasedRoute>
)

export const SupplierRoute = ({ children }: { children: ReactNode }) => (
  <RoleBasedRoute allowedRoles={['supplier', 'admin']}>
    {children}
  </RoleBasedRoute>
)

export const AdminRoute = ({ children }: { children: ReactNode }) => (
  <RoleBasedRoute allowedRoles={['admin']}>
    {children}
  </RoleBasedRoute>
)