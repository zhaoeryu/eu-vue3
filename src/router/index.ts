import router from './routers'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import {useRouteStore, useUserStore} from '@/store'
import {getToken} from '@/utils/auth'
import {defaultSetting} from '@/settings'
import {isExternal} from "@/utils";

NProgress.configure({showSpinner: false})

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (to.meta && to.meta.title) {
    document.title = to.meta.title + ' | ' + defaultSetting.title
  }

  // 检查是否登录
  if (getToken()) {
    // 如果已登录，访问登录页面，直接跳转到首页
    if (to.path === '/login') {
      next({path: '/'})
    } else {
      // 为了避免重复设置路由
      if (useUserStore().roles?.length < 1) {
        useUserStore().getInfo().then(() => {
          useRouteStore().generateRoutes().then(res => {
            res.forEach(route => {
              if (!isExternal(route.path)) {
                router.addRoute(route)
              }
            })
            next({...to, replace: true})
          }).catch(err => {
            console.error(err);
            next()
          })
        }).catch(err => {
          // logout
          console.error(err);
          next()
        })
      } else {
        next()
      }
    }
  } else {
    // 未登录，检查访问的路径是否在白名单中，如果是，直接访问，否则跳转到登录页面
    if (defaultSetting.anonymousAccessWhiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`)
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
