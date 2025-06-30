import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
// import './assets/styles/reset.css';
import './assets/styles/tailwindcss.css';
import 'element-plus/dist/index.css';
import '@/mock/index.js';

createApp(App).use(router).mount('#app');
