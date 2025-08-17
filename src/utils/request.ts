import axios, { type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { ElLoading, ElMessage, ElMessageBox, type MessageParams } from 'element-plus';
import { stringify } from 'qs';
import type { LoadingInstance } from 'element-plus/es/components/loading/src/loading';

import { getToken } from '@/utils/auth';
import { EU_FRONT_KEY, REQUEST_HEADER_TOKEN } from '@/utils/constants';
import { defaultSetting } from '@/settings';
import errorCode from '@/utils/errorCode';
import { useUserStore } from '@/store';
import { downloadBlobFile } from '@/utils/index';

export const commonReqHeaders = {
  'X-Eu-Front': EU_FRONT_KEY,
  'X-Eu-Front-Version': defaultSetting.version,
};

const service = axios.create({
  baseURL: defaultSetting.BASE_API,
  timeout: 20 * 1000,
  // 4种不同形式
  //1.qs.stringify({ids: [1, 2, 3]}, { indices: false }) --形式： ids=1&ids=2&ids=3
  //2.qs.stringify({ids: [1, 2, 3]}, {arrayFormat: 'indices'}) --形式：      ids[0]=1&ids[1]=2&ids[2]=3
  //3.qs.stringify({ids: [1, 2, 3]}, {arrayFormat: 'brackets'})  --形式：ids[]=1&ids[]=2&ids[]=3
  //4.qs.stringify({ids: [1, 2, 3]}, {arrayFormat: 'repeat'})  --形式： ids=1&ids=2&ids=3
  paramsSerializer: (params: AxiosRequestConfig['params']) => stringify(params, { indices: false }),
  headers: { ...commonReqHeaders },
});

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (getToken()) {
      config.headers[REQUEST_HEADER_TOKEN] = getToken();
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

service.interceptors.response.use(
  (res) => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    const message = res.data.msg || errorCode[code] || errorCode['default'];
    // 二进制数据则直接返回
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res.data;
    }
    // 如果是成功状态则直接返回
    if (code === 200) {
      return res.data;
    }
    if (code === 401) {
      doUnauthorized(res, message);
    } else if (code === 600) {
      showMessage(res, { message, type: 'warning' });
    } else if (code === 500) {
      showMessage(res, { message, type: 'error' });
    } else {
      showMessage(res, { message, type: 'error' });
    }
    return Promise.reject(message);
  },
  (error) => {
    let { message } = error;
    if (message === 'Network Error') {
      message = '后端接口连接异常';
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时';
    } else if (message.includes('Request failed with status code')) {
      message = '系统接口' + message.substr(message.length - 3) + '异常';
    }
    ElMessage({ message: message, type: 'error', duration: 5 * 1000 });
    return Promise.reject(error);
  },
);

// 通用下载方法
let downloadLoadingInstance: LoadingInstance;

export async function download(url: string, params: object, filename: string, config?: AxiosRequestConfig) {
  downloadLoadingInstance = ElLoading.service({
    text: '下载中...',
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  });
  return service
    .post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        [REQUEST_HEADER_TOKEN]: getToken(),
      },
      responseType: 'blob',
      ...config,
    })
    .then(async (data) => {
      if (data instanceof Blob) {
        downloadBlobFile(data, filename);
      } else {
        ElMessage.error('文件异常');
      }
      downloadLoadingInstance.close();
    })
    .catch((r) => {
      ElMessage.error(r.message || '下载失败！');
      downloadLoadingInstance.close();
    });
}

function showMessage(res: AxiosResponse, messageOptions: MessageParams) {
  /*
   * 调用的地方可以通过设置 silent 属性来控制是否显示错误消息
   * 例如：
   * request({
   *   url: '/api/system/menu',
   *   method: 'get',
   *   silent: true
   * })
   */
  if (res.config.silent) {
    // 静默不处理
    return;
  }
  ElMessage(messageOptions);
}

function doUnauthorized(res: AxiosResponse, message: string) {
  if (res.config.silent) {
    // 静默不处理
    return;
  }
  // 如果当前页面是登录页，不提示
  if (window.location.pathname === '/login') {
    return;
  }
  ElMessageBox.confirm(message + '，您可以继续留在该页面，或者重新登录', '提示', {
    confirmButtonText: '重新登录',
    cancelButtonText: '留在该页面',
  }).then(() => {
    useUserStore()
      .logout()
      .then(() => {
        location.reload();
      });
  });
}

export default service;
