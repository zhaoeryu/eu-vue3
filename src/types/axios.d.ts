// 扩展 Axios 请求配置，添加自定义参数
import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    silent?: boolean; // 添加 silent 字段声明
  }
}
