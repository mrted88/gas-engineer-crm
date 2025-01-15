// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import CalendarView from '@/views/CalendarView.vue';
import CustomersView from '@/views/customers/CustomersView.vue';
import QuotesView from '@/views/QuotesView.vue';
import InventoryView from '@/views/InventoryView.vue';
import ReportsView from '@/views/ReportsView.vue';
import AccountsView from '@/views/AccountsView.vue';
import SettingsView from '@/views/SettingsView.vue';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/auth/LoginView.vue';
import RegisterView from '@/views/auth/RegisterView.vue';
import { authMiddleware } from '@/middleware/auth';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { public: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true }
  },
  {
    path: '/dashboard/register',
    name: 'register',
    component: RegisterView,
    meta: { public: true }
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard/diary' },
      {
        path: 'diary',
        name: 'diary',
        component: CalendarView,
        meta: { roles: ['admin', 'user'] }
      },
      {
        path: 'customers',
        name: 'customers',
        component: CustomersView,
        meta: { roles: ['admin', 'user'] }
      },
      {
        path: 'quotes',
        name: 'quotes',
        component: QuotesView,
        meta: { roles: ['admin', 'user'] }
      },
      {
        path: 'customers/:id',
        name: 'CustomerProfile',
        component: () => import('@/views/customers/CustomerProfileView.vue'),
        props: true,
        meta: { roles: ['admin', 'user'] }
      },
      {
        path: 'jobs/:id',
        name: 'JobDetails',
        component: () => import('@/views/JobDetailsView.vue'),
        props: true,
        meta: { roles: ['admin', 'user'] }
      },
      {
        path: 'reminders',
        name: 'reminders',
        component: () => import('@/views/RemindersView.vue'),
        meta: { roles: ['admin', 'user'] }
      },
      {
        path: 'inventory',
        name: 'inventory',
        component: InventoryView,
        meta: { roles: ['admin', 'user'] }
      },
      {
        path: 'reports',
        name: 'reports',
        component: ReportsView,
        meta: { roles: ['admin', 'user'] }
      },
      {
        path: 'accounts',
        name: 'accounts',
        component: AccountsView,
        meta: { roles: ['admin', 'user'] }
      },
      {
        path: 'settings',
        name: 'settings',
        component: SettingsView,
        meta: { roles: ['admin', 'user'] }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Handle unauthorized access
router.beforeEach((to, from, next) => {
  if (to.name === 'unauthorized') {
    next({
      name: 'home',
      query: { error: 'unauthorized' }
    });
  } else {
    next();
  }
});

// Apply auth middleware
router.beforeEach(authMiddleware);

export default router;