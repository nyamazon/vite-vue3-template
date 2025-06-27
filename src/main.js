import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import './assets/styles/reset.css';
import 'element-plus/dist/index.css';

createApp(App).use(router).mount('#app');
