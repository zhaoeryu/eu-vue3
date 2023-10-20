import {createRouter, createWebHistory} from 'vue-router'

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

const router = createRouter({
    history: createWebHistory(),
    routes: constantRouteList
})

export default router
