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
  
  console.log('Auth middleware running for route:', to.path)
  console.log('Auth status:', authStore.isAuthenticated)
  
  try {
    // Always check auth status unless it's a public route
    if (!to.meta.public) {
      console.log('Checking auth status...')
      await authStore.checkAuth()
    }

    // If trying to access login/register while authenticated
    if (authStore.isAuthenticated && ['login', 'register'].includes(to.name as string)) {
      console.log('Already authenticated, redirecting to dashboard')
      next('/dashboard')
      return
    }

    // If trying to access protected route without auth
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      console.log('Auth required but not authenticated')
      // Save the intended destination
      localStorage.setItem('redirectPath', to.fullPath)
      next('/login')
      return
    }

    // Check role-based access
    if (to.meta.roles && authStore.user?.role) {
      const hasRequiredRole = to.meta.roles.includes(authStore.user.role)
      if (!hasRequiredRole) {
        console.log('Unauthorized: missing required role')
        next({ 
          name: 'home', 
          query: { error: 'unauthorized' }
        })
        return
      }
    }

    // Allow navigation
    console.log('Navigation allowed')
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    if (!to.meta.public) {
      next('/login')
      return
    }
    next()
  }
}