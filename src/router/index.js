import { createRouter, createWebHistory } from 'vue-router';
import { getToken } from '@/utils/auth';

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard',
    component: () => import('@/views/EBDashboard.vue'),
    meta: { requiresAuth: true, title: '首页' },
  },
  {
    path: '/user',
    meta: { requiresAuth: true, title: '用户管理' },
    children: [
      { path: 'list', component: () => import('@/views/user/EBUserList.vue'), meta: { title: '用户列表' } },
      { path: 'create', component: () => import('@/views/user/EBUserForm.vue'), meta: { title: '创建用户' } },
      { path: 'edit/:id', component: () => import('@/views/user/EBUserForm.vue'), meta: { title: '编辑用户' } },
      { path: 'fee', component: () => import('@/views/user/EBUserFee.vue'), meta: { title: '用户费用' } },
    ],
  },
  {
    path: '/fee',
    meta: { requiresAuth: true },
    children: [
      { path: 'list', component: () => import('@/views/fee/EBFeeList.vue') },
      { path: 'detail/:id', component: () => import('@/views/fee/EBFeeDetail.vue') },
    ],
  },
  {
    path: '/report',
    component: () => import('@/views/report/EBReport.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/reconciliation',
    meta: { requiresAuth: true },
    children: [
      { path: 'list', component: () => import('@/views/reconciliation/EBReconciliationList.vue') },
      { path: 'approve/:id', component: () => import('@/views/reconciliation/EBApprovalForm.vue') },
    ],
  },
  {
    path: '/notification',
    meta: { requiresAuth: true },
    children: [
      { path: 'list', component: () => import('@/views/notification/EBNotificationList.vue') },
      { path: 'create', component: () => import('@/views/notification/EBNotificationForm.vue') },
      { path: 'edit/:id', component: () => import('@/views/notification/EBNotificationForm.vue') },
    ],
  },
  {
    path: '/payment',
    meta: { requiresAuth: true },
    children: [
      { path: 'list', component: () => import('@/views/payment/EBPaymentList.vue') },
      { path: 'detail/:id', component: () => import('@/views/payment/EBPaymentDetail.vue') },
    ],
  },
  {
    path: '/setting',
    meta: { requiresAuth: true },
    children: [
      { path: 'role', component: () => import('@/views/setting/EBRoleSetting.vue') },
      { path: 'fee-rate', component: () => import('@/views/setting/EBFeeRateSetting.vue') },
      { path: 'param', component: () => import('@/views/setting/EBParamSetting.vue') },
      { path: 'log', component: () => import('@/views/setting/EBLogSetting.vue') },
    ],
  },
  {
    path: '/login',
    component: () => import('@/views/login/EBLogin.vue'),
    meta: { layout: 'blank' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/EBNotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = getToken();
  if (to.meta.requiresAuth) {
    if (token) {
      next();
    } else {
      next('/login');
    }
  } else {
    if (to.path === '/login' && token) {
      next('/dashboard');
    } else {
      next();
    }
  }
});

export default router; 