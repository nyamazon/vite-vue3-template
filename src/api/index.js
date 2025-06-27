import requests from '@/utils/request';

export const loginReq = (params) => {
  return requests.post('/jg/login', params);
};
