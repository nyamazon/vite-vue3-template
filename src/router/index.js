import { createWebHashHistory, createRouter } from 'vue-router';

const routes = [{ path: '/', component: () => import('@/pages/hello.vue') }];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
