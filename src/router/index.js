import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/pages/Login.vue';
import Dashboard from '@/pages/Dashboard.vue';
import Projects from '@/pages/Projects.vue';
import TasksKanban from '@/pages/tasks/TasksKanban.vue';
import TasksTable from '@/pages/tasks/TasksTable.vue';
import TaskDetail from '@/pages/tasks/TaskDetail.vue';
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
        path: 'table',
        name: 'TasksTable',
        component: TasksTable,
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
