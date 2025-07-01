import { createRouter, createWebHashHistory } from 'vue-router';
import Login from '@/pages/Login.vue';
import Dashboard from '@/pages/Dashboard.vue';
import Projects from '@/pages/Projects.vue';
import TasksKanban from '@/pages/tasks/TasksKanban.vue';
import TaskDetail from '@/pages/tasks/TaskDetail.vue';
import TaskFlow from '@/pages/tasks/TaskFlow.vue';
const routes = [
  {
    path: '/',
    redirect: '/login',
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
    meta: { requiresAuth: true },
    children: [
      {
        path: 'kanban',
        name: 'TasksKanban',
        component: TasksKanban,
        meta: { requiresAuth: true },
      },
      {
        path: 'flow',
        name: 'TaskFlow',
        component: TaskFlow,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/tasksDetail/:id',
    name: 'TaskDetail',
    component: TaskDetail,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
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
