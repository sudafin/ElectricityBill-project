import { createRouter, createWebHistory } from 'vue-router';
import { getToken } from '@/utils/auth';

const routes = [
  {
    // 管理主页面
    path: '/',
    redirect: '/dashboard',
    meta: { requiresAuth: true, layout: 'default' },
    children: [
      {
        path: '/dashboard',
        name: 'HomeDashboard',
        component: () => import('@/views/home/EBDashboard.vue'),
        meta: { requiresAuth: true, title: '首页' },
      },
      {
        path: '/user',
        name: 'User',
        component: () => import('@/layouts/EBTabLayout.vue'),
        redirect: '/user/dashboard',
        meta: { requiresAuth: true, title: '用户管理', children: true },
        children: [
          { path: 'dashboard', name: 'UserDashboard', component: () => import('@/views/user/EBUserDashBoard.vue'), meta: { title: '用户费用' } },
          { path: 'payment/:id', name: 'UserPayment', component: () => import('@/views/user/EBUserPayment.vue'), meta: { title: '用户缴费' } },
          { path: 'form', name: 'UserForm', component: () => import('@/views/user/EBUserForm.vue'), meta: { title: '新增用户' } },
        ],
      },
      {
        path: '/report',
        name: 'Report',
        component: () => import('@/views/report/EBReport.vue'),
        meta: { requiresAuth: true, title: '数据统计与报表' },
      },
      {
        path: '/reconciliation',
        name: 'Reconciliation',
        component: () => import('@/layouts/EBTabLayout.vue'),
        redirect: '/reconciliation/list',
        meta: { requiresAuth: true, title: '对账与审批', children: true },
        children: [
          { path: 'list', name: 'ReconciliationList', component: () => import('@/views/reconciliation/EBReconciliation.vue'), meta: { title: '对账列表' } },
          { path: 'approval/:id', name: 'Approval', component: () => import('@/views/reconciliation/EBApproval.vue'), meta: { title: '审批详情' } }
        ]
      },
      {
        path: '/notification',
        name: 'Notification',
        component: () => import('@/layouts/EBTabLayout.vue'),
        redirect: '/notification/list',
        meta: { requiresAuth: true, title: '通知和提醒', children: true },
        children: [
          { 
            path: 'list', 
            name: 'NotificationList', 
            component: () => import('@/views/notification/EBNotificationList.vue'), 
            meta: { title: '通知列表' } 
          },
          {
            path: 'create',
            name: 'NotificationCreate',
            component: () => import('@/views/notification/EBNotificationForm.vue'),
            meta: { title: '新增通知' }
          },
          {
            path: 'edit/:id',
            name: 'NotificationEdit',
            component: () => import('@/views/notification/EBNotificationForm.vue'),
            meta: { title: '编辑通知' }
          },
        ],
      },
      {
        path: '/payment',
        name: 'Payment',
        component: () => import('@/layouts/EBTabLayout.vue'),
        redirect: '/payment/list',
        meta: { requiresAuth: true, title: '支付管理', children: true },
        children: [
          { path: 'list', name: 'PaymentList', component: () => import('@/views/payment/EBPaymentList.vue'), meta: { title: '支付列表' } },
          { path: 'detail/:id', name: 'PaymentDetail', component: () => import('@/views/payment/EBPaymentDetail.vue'), meta: { title: '支付详情' } }
        ],
      },
      {
        path: '/setting',
        name: 'Setting',
        component: () => import('@/layouts/EBTabLayout.vue'),
        redirect: '/setting/rate',
        meta: { requiresAuth: true, title: '系统设置', children: true },
        children: [
          { path: 'role', name: 'RoleSetting', component: () => import('@/views/setting/role/EBRoleSetting.vue'), meta: { title: '角色权限管理' } },
          { path: 'rate', name: 'RateSetting', component: () => import('@/views/setting/rate/EBRateManagement.vue'), meta: { title: '费率管理' } },
          { path: 'log', name: 'LogSetting', component: () => import('@/views/setting/log/EBLogSetting.vue'), meta: { title: '日志管理' } },
        ],
      },
    ],
  },
  // 登录页面单独一个路由
  {
    path: '/login',
    name: 'Login', 
    component: () => import('@/views/login/EBLogin.vue'),
    meta: { requiresAuth: false, title: '登录', layout: 'login' },
  },
  // 404页面单独一个路由
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/EBNotFound.vue'),
    meta: { requiresAuth: false, title: '404未找到', layout: 'blank' },
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