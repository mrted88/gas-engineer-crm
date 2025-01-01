import { createRouter, createWebHistory } from 'vue-router'
import { authMiddleware } from '@/middleware/auth'
import HomeView from '@/views/HomeView.vue'
import DashboardView from '@/views/DashboardView.vue'
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
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/customers',
      name: 'customers',
      component: CustomersView,
      meta: {
        requiresAuth: true,
        roles: ['admin', 'user']
      }
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: CalendarView,
      meta: {
        requiresAuth: true,
        roles: ['admin', 'user']
      }
    },
    // Add this new route for job details
    {
      path: '/jobs/:id',
      name: 'JobDetails',
      component: () => import('@/views/JobDetailsView.vue'),
      props: true,
      meta: {
        requiresAuth: true,
        roles: ['admin', 'user']
      }
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