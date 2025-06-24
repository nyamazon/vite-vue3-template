import requests from '@/utils/request';

export const getTargetSelect = () => {
  return requests.get('/asset_classes/target_select');
};

export const getKLineData = (params) => {
  return requests.get('/asset_classes/k_line_data', { params });
};

export const getNameGet = () => {
  return requests.get('/asset_classes/name_get');
};

export const getTargetIndexFactor = (params) => {
  return requests.get('/asset_classes/index_factor', { params });
};
