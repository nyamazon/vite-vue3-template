export const numberToChinese = (num) => {
  const map = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

  if (num === 0) {
    return '零'; // 特殊处理0
  }

  let result = '';

  const hundreds = Math.floor(num / 100); // 百位数
  const tens = Math.floor((num % 100) / 10); // 十位数
  const ones = num % 10; // 个位数

  // 处理百位
  if (hundreds > 0) {
    result += map[hundreds] + '百';
  }

  // 处理十位
  if (tens > 0) {
    if (tens === 1 && hundreds === 0) {
      result += '十'; // 特殊处理10-19，没有百位时去掉“一”
    } else {
      result += map[tens] + '十';
    }
  } else if (hundreds > 0 && ones > 0) {
    result += '零'; // 处理百位与个位之间的零
  }

  // 处理个位
  if (ones > 0) {
    result += map[ones];
  }

  return result;
};

export const dateFormat = (date, format = 'y/m/d') => {
  const d = new Date(date * 1000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需要加 1
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');

  // 根据传入的格式化参数返回日期字符串
  const formatMap = {
    y: year,
    m: month,
    d: day,
    h: hour,
    i: minute,
    s: second,
  };

  // 替换format中各部分
  return format.replace(/y|m|d|h|i|s/g, (match) => formatMap[match]);
};

export const numberFormat = (value, reserve = 2) => {
  return parseFloat(parseFloat(value).toFixed(reserve));
};

export const nullFormat = (data) => (data ? data : '/');

export const base64ToFile = (base64String, filename) => {
  let arr = base64String.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

export const urlToFile = async (url, filename, mimeType) => {
  const response = await fetch(url);
  const buf = await response.arrayBuffer();
  return new File([buf], filename, { type: mimeType });
};
