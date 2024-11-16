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
    name: 'Dashboard',
    component: () => import('@/views/EBDashboard.vue'),
    meta: { requiresAuth: true, title: '首页' },
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('@/layouts/EBTabLayout.vue'),
    redirect: '/user/list',
    meta: { requiresAuth: true, title: '用户管理' },
    children: [
      { path: 'list', name: 'UserList', component: () => import('@/views/user/EBUserList.vue'), meta: { title: '用户列表' } },
      { path: 'create', name: 'UserCreate', component: () => import('@/views/user/EBUserForm.vue'), meta: { title: '添加用户' } },
      { path: 'edit/:id', name: 'UserEdit', component: () => import('@/views/user/EBUserForm.vue'), meta: { title: '编辑用户' } },
      { path: 'fee', name: 'UserFee', component: () => import('@/views/user/EBUserFee.vue'), meta: { title: '费用录入' } },
    ],
  },
  {
    path: '/fee',
    name: 'Fee',
    component: () => import('@/layouts/EBTabLayout.vue'),
    redirect: '/fee/list',
    meta: { requiresAuth: true, title: '费用管理' },
    children: [
      { path: 'list', name: 'FeeList', component: () => import('@/views/fee/EBFeeList.vue'), meta: { title: '费用列表' } },
      { path: 'detail/:id', name: 'FeeDetail', component: () => import('@/views/fee/EBFeeDetail.vue'), meta: { title: '费用详情' } },
    ],
  },
  {
    path: '/report',
    component: () => import('@/views/report/EBReport.vue'),
    meta: { requiresAuth: true, title: '数据统计' },
  },
  {
    path: '/reconciliation',
    meta: { requiresAuth: true, title: '对账审批' },
    children: [
      { path: 'list', component: () => import('@/views/reconciliation/EBReconciliationList.vue'), meta: { title: '对账单列表' } },
      { path: 'approve/:id', component: () => import('@/views/reconciliation/EBApprovalForm.vue'), meta: { title: '审批对账单' } },
    ],
  },
  {
    path: '/notification',
    meta: { requiresAuth: true, title: '通知提醒' },
    children: [
      { path: 'list', component: () => import('@/views/notification/EBNotificationList.vue'), meta: { title: '通知列表' } },
      { path: 'create', component: () => import('@/views/notification/EBNotificationForm.vue'), meta: { title: '创建通知' } },
      { path: 'edit/:id', component: () => import('@/views/notification/EBNotificationForm.vue'), meta: { title: '编辑通知' } },
    ],
  },
  {
    path: '/payment',
    meta: { requiresAuth: true, title: '支付管理' },
    children: [
      { path: 'list', component: () => import('@/views/payment/EBPaymentList.vue'), meta: { title: '支付记录' } },
      { path: 'detail/:id', component: () => import('@/views/payment/EBPaymentDetail.vue'), meta: { title: '支付详情' } },
    ],
  },
  {
    path: '/setting',
    name: 'Setting',
    component: () => import('@/layouts/EBTabLayout.vue'),
    redirect: '/setting/role',
    meta: { requiresAuth: true, title: '系统设置' },
    children: [
      { path: 'role', name: 'RoleSetting', component: () => import('@/views/setting/EBRoleSetting.vue'), meta: { title: '角色管理' } },
      { path: 'fee-rate', name: 'FeeRateSetting', component: () => import('@/views/setting/EBFeeRateSetting.vue'), meta: { title: '费率设置' } },
      { path: 'param', name: 'ParamSetting', component: () => import('@/views/setting/EBParamSetting.vue'), meta: { title: '参数配置' } },
      { path: 'log', name: 'LogSetting', component: () => import('@/views/setting/EBLogSetting.vue'), meta: { title: '日志管理' } },
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