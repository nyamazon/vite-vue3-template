import axios from 'axios';
import router from '@/router';
import { NO_PERMISSION, OK_CODE } from '@/app/keys';

import { ElNotification } from 'element-plus';

const requests = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 90000,
});

//拦截器
requests.interceptors.request.use((config) => {
  config = config || {};
  //pinia
  // try {
  //   const user = JSON.parse(localStorage.getItem(USER_KEY) || '');
  //   if (user.token) {
  //     config.headers!['Authorization'] = `Bearer ${user.token}`;
  //   }
  // } catch (e) {}
  return config;
});

requests.interceptors.response.use(
  (resp) => {
    const { code, msg } = resp.data || {};
    if (code !== OK_CODE) {
      // return Promise.resolve(resp);
      return Promise.reject(msg);
    }
    if (code === NO_PERMISSION) {
      router.push({ name: 'Login' });
      // 提示错误消息
      ElNotification.warning(msg);
      return Promise.reject(msg);
    }
    return Promise.resolve(resp.data);
  },
  (error) => {
    // 提示错误消息
    ElNotification.warning(error);
    return Promise.reject(error);
  }
);

export default requests;
