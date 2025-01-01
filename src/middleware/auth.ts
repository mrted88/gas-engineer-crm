import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    public?: boolean
    roles?: string[]
    [key: string]: any
  }
}

export async function authMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore()
  
  try {
    // Special handling for event details pages
    const isEventDetailsPage = to.name === 'job-details' || to.path.includes('/jobs/')
    
    // Check authentication status if not on public route
    if (!to.meta.public && !authStore.isAuthenticated) {
      await authStore.checkAuth()
    }

    // Handle protected routes
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      // Store the intended destination
      const redirect = isEventDetailsPage ? to.fullPath : undefined
      next({
        name: 'login',
        query: redirect ? { redirect } : undefined
      })
      return
    }

    // Handle auth routes when already authenticated
    if (authStore.isAuthenticated && (to.name === 'login' || to.name === 'register')) {
      next({ name: 'dashboard' })
      return
    }

    // Check role-based access
    if (to.meta.roles && authStore.user?.role) {
      const hasRequiredRole = to.meta.roles.includes(authStore.user.role)
      if (!hasRequiredRole) {
        next({ 
          name: 'home', 
          query: { 
            error: 'unauthorized',
            message: 'You do not have permission to access this page'
          }
        })
        return
      }
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    if (!authStore.isAuthenticated) {
      next({ 
        name: 'login',
        query: { 
          redirect: to.fullPath,
          error: 'auth',
          message: 'Please log in to continue'
        }
      })
      return
    }
    next()
  }
}