import { createRouter, createWebHistory } from 'vue-router'
import { authMiddleware } from '@/middleware/auth'
import HomeView from '@/views/HomeView.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import CustomersView from '@/views/customers/CustomersView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import CalendarView from '@/views/CalendarView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        public: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        public: true
      }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: {
        public: true
      }
    },
    // Dashboard and authenticated routes
    {
      path: '/dashboard',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard/diary'
        },
        {
          path: 'diary',
          name: 'diary',
          component: CalendarView,
          meta: {
            roles: ['admin', 'user']
          }
        },
        {
          path: 'customers',
          name: 'customers',
          component: CustomersView,
          meta: {
            roles: ['admin', 'user']
          }
        },
        {
          path: 'quotes',
          name: 'quotes',
          component: () => import('@/views/QuotesView.vue'),
          meta: {
            roles: ['admin', 'user']
          }
        },
        {
          path: 'jobs/:id',
          name: 'JobDetails',
          component: () => import('@/views/JobDetailsView.vue'),
          props: true,
          meta: {
            roles: ['admin', 'user']
          }
        },
        {
          path: 'reminders',
          name: 'reminders',
          component: () => import('@/views/RemindersView.vue'),
          meta: {
            roles: ['admin', 'user']
          }
        },
        {
          path: 'inventory',
          name: 'inventory',
          component: () => import('@/views/InventoryView.vue'),
          meta: {
            roles: ['admin', 'user']
          }
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('@/views/ReportsView.vue'),
          meta: {
            roles: ['admin', 'user']
          }
        },
        {
          path: 'accounts',
          name: 'accounts',
          component: () => import('@/views/AccountsView.vue'),
          meta: {
            roles: ['admin', 'user']
          }
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/SettingsView.vue'),
          meta: {
            roles: ['admin', 'user']
          }
        }
      ]
    }
  ]
})

// Handle unauthorized access
router.beforeEach((to, from, next) => {
  if (to.name === 'unauthorized') {
    next({ 
      name: 'home', 
      query: { error: 'unauthorized' }
    })
  } else {
    next()
  }
})

// Apply auth middleware
router.beforeEach(authMiddleware)

export default router