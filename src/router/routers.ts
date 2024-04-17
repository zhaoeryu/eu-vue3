import {createRouter, createWebHistory} from 'vue-router'

import Layout from '@/layout/index.vue'

export const constantRouteList = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/index.vue'),
        hidden: true
    },
    {
        path: '/404',
        name: 'NotFound',
        component: () => import('@/views/404.vue'),
        hidden: true
    },
    {
        path: '/401',
        name: 'Unauthorized',
        component: () => import('@/views/401.vue'),
        hidden: true
    },
    {
        path: '/demo',
        name: 'Demo',
        component: () => import('@/views/demo.vue'),
        hidden: true
    }
]

export const layoutRouteList = [
  {
    path: '/',
    name: 'Home',
    component: Layout,
    meta: {
      title: '工作台',
      icon: 'workbench'
    },
    redirect: '/workbench',
    children: [
      {
        path: '/workbench',
        name: 'Workbench',
        component: () => import('@/views/workbench/index.vue'),
        meta: {
          title: '工作台',
          icon: 'workbench',
          affix: true,
          showHeader: false,
          showFooter: true
        }
      }
    ],
    hidden: false,
  }
]

const router = createRouter({
    history: createWebHistory(),
    routes: constantRouteList
})

export default router
