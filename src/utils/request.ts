import axios, {AxiosResponse} from 'axios'
import { getToken } from "@/utils/auth"
import {EU_FRONT_KEY, REQUEST_HEADER_TOKEN} from '@/utils/constants';
import {defaultSetting} from '@/settings';
import {ElLoading, ElMessage, ElMessageBox} from 'element-plus'
import errorCode from '@/utils/errorCode'
import type {EuAxiosRequestConfig, ResultBody} from "@/api/types";
import {useUserStore} from "@/store";
import {blobValidate} from "@/utils/index";
import { saveAs } from 'file-saver'
import qs from 'qs'

const service = axios.create({
    baseURL: defaultSetting.BASE_API,
    timeout: 20 * 1000,
    // 4种不同形式
    //1.qs.stringify({ids: [1, 2, 3]}, { indices: false }) --形式： ids=1&ids=2&ids=3
    //2.qs.stringify({ids: [1, 2, 3]}, {arrayFormat: ‘indices‘}) --形式：      ids[0]=1&ids[1]=2&ids[2]=3
    //3.qs.stringify({ids: [1, 2, 3]}, {arrayFormat: ‘brackets‘})  --形式：ids[]=1&ids[]=2&ids[]=3
    //4.qs.stringify({ids: [1, 2, 3]}, {arrayFormat: ‘repeat‘})  --形式： ids=1&ids=2&ids=3
    paramsSerializer: params => qs.stringify(params, { indices: false }),
    headers: {
        'X-Eu-Front': EU_FRONT_KEY,
        'X-Eu-Front-Version': defaultSetting.version,
    }
})

service.interceptors.request.use(config  => {
  if (getToken()) {
    config.headers[REQUEST_HEADER_TOKEN] = getToken()
  }
    return config
}, error => {
    return Promise.reject(error)
})

service.interceptors.response.use((res: AxiosResponse<ResultBody, EuAxiosRequestConfig>) => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200
    // 获取错误信息
    const message = res.data.msg || errorCode[code] || errorCode['default']
    // 二进制数据则直接返回
    if (res.request.responseType ===  'blob' || res.request.responseType ===  'arraybuffer') {
        return res.data
    }
    // 如果是成功状态则直接返回
    if (code === 200) {
        return res.data
    }
    if (code === 401) {
        if (!res.config.silent) {
            // showMessage(res, { message, type: 'warning' })
            ElMessageBox.confirm(message + '，您可以继续留在该页面，或者重新登录', '提示', {
                confirmButtonText: '重新登录',
                cancelButtonText: '留在该页面'
            }).then(() => {
                useUserStore().logout().then(() => {
                    location.reload()
                })
            })
        }
    } else if (code === 600) {
        // 警告消息
        showMessage(res, { message, type: 'warning' })
    } else if (code === 500) {
        // 错误消息
        showMessage(res, { message, type: 'error' })
    } else {
        showMessage(res, { message, type: 'error' })
    }
    return Promise.reject(message)
}, error => {
    let { message } = error;
    if (message === 'Network Error') {
        message = '后端接口连接异常';
    } else if (message.includes('timeout')) {
        message = '系统接口请求超时';
    } else if (message.includes('Request failed with status code')) {
        message = '系统接口' + message.substr(message.length - 3) + '异常';
    }
    ElMessage({ message: message, type: 'error', duration: 5 * 1000 })
    return Promise.reject(error)
})

// 通用下载方法
let downloadLoadingInstance;
export async function download(url, params, filename, config = {}) {
    downloadLoadingInstance = ElLoading.service({
        text: '正在下载数据，请稍候',
        background: 'rgba(0, 0, 0, 0.7)'
    })
    return service.post(url, params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            [REQUEST_HEADER_TOKEN]: getToken()
        },
        responseType: 'blob',
        ...config
    }).then(async (data) => {
        const isBlob = blobValidate(data);
        if (isBlob) {
            const blob = new Blob([data])
            saveAs(blob, filename)
        } else {
            const resText = await data.text();
            const rspObj = JSON.parse(resText);
            const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
            if (rspObj.code === 200) {
                ElMessage.success(errMsg || '操作成功！')
            } else {
                ElMessage.error(errMsg);
            }
        }
        downloadLoadingInstance.close();
    }).catch((r) => {
        console.error(r)
        ElMessage.error('下载文件出现错误，请联系管理员！')
        downloadLoadingInstance.close();
    })
}

function showMessage(res, messageOptions) {
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
        return
    }
    ElMessage(messageOptions)
}

export default service
