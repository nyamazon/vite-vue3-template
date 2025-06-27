import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/pages/Login.vue';
import Dashboard from '@/pages/Dashboard.vue';
import Projects from '@/pages/Projects.vue';
import Tasks from '@/pages/Tasks.vue';
import TaskDetail from '@/pages/TaskDetail.vue';
const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/projects',
    name: 'Projects',
    component: Projects,
    meta: { requiresAuth: true },
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: Tasks,
    meta: { requiresAuth: true },
  },
  {
    path: '/tasksDetail/:id',
    name: 'TaskDetail',
    component: TaskDetail,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const userInfo = localStorage.getItem('userInfo');
  if (to.meta.requiresAuth && !userInfo) {
    // 需要登录但未登录，跳转到登录页
    next('/login');
  } else {
    next();
  }
});

export default router;
