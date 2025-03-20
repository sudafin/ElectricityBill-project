import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'), // 可以是一个通用的布局
    redirect: '/user/dashboard',
    children: [
      // 用户相关路由
      {
        path: 'user',
        component: () => import('@/layouts/EBUserLayout.vue'),
        redirect: '/user/dashboard',
        meta: { requiresAuth: true },
        children: [
          { path: 'dashboard', name: 'UserDashboard', component: () => import('@/views/user/dashboard/EBUserDashboard.vue'), meta: { title: '电费概览' } },
          { path: 'paymentDashboard', name: 'UserPaymentDashboard', component: () => import('@/views/user/payment/EBUserBillDashBoard.vue'), meta: { title: '缴纳中心' } },
          { path: 'paymentDashboard/payment/:id', name: 'UserPayment', component: () => import('@/views/user/payment/EBUserPayment.vue'), meta: { title: '缴纳电费' } },
          { path: 'paymentDashboard/detail/:id', name: 'UserPaymentDetail', component: () => import('@/views/user/payment/EBUserBillDetail.vue'), meta: { title: '缴费详情' } },
          { path: 'analysis', name: 'UserElectricityAnalysis', component: () => import('@/views/user/analysis/EBUserElectricityAnalysis.vue'), meta: { title: '用电分析' } },
          { path: 'notifications', name: 'UserNotifications', component: () => import('@/views/user/notification/EBUserNotifications.vue'), meta: { title: '通知中心' } },
          { path: 'profile', name: 'UserProfile', component: () => import('@/views/user/profile/EBUserProfile.vue'), meta: { title: '个人信息' } },
          { path: 'help', name: 'UserHelp', component: () => import('@/views/user/help/EBUserHelp.vue'), meta: { title: '帮助中心' } }
        ]
      },

      // 管理员相关路由
      {
        path: 'admin',
        component: () => import('@/layouts/EBAdminLayout.vue'),
        redirect: '/admin/dashboard',
        meta: { requiresAuth: true },
        children: [
          { path: 'dashboard', name: 'AdminDashboard', component: () => import('@/views/admin/dashboard/EBAdminDashboard.vue'), meta: { title: '首页' } },
          {
            path: 'user',
            redirect: '/admin/user/dashboard',
            children: [
              { path: 'dashboard', name: 'AdminUserDashboard', component: () => import('@/views/admin/user/EBUserDashBoard.vue'), meta: { title: '用户管理' } },
              { path: 'form', name: 'AdminUserForm', component: () => import('@/views/admin/user/EBUserForm.vue'), meta: { title: '新增用户' } },
              { path: 'edit/:id', name: 'AdminUserEdit', component: () => import('@/views/admin/user/EBUserForm.vue'), meta: { title: '编辑用户' } }
            ]
          },
          { path: 'report', name: 'AdminReport', component: () => import('@/views/admin/report/EBReport.vue'), meta: { title: '数据统计与报表' } },
          {
            path: 'reconciliation',
            redirect: '/admin/reconciliation/list',
            children: [
              { path: 'list', name: 'ReconciliationList', component: () => import('@/views/admin/reconciliation/EBReconciliation.vue'), meta: { title: '对账列表' } },
              { path: 'approval/:reconciliationNo', name: 'Approval', component: () => import('@/views/admin/reconciliation/EBApproval.vue'), meta: { title: '审批详情' } }
            ]
          },
          {
            path: 'notification',
            redirect: '/admin/notification/list',
            children: [
              { path: 'list', name: 'NotificationList', component: () => import('@/views/admin/notification/EBNotificationList.vue'), meta: { title: '通知列表' } },
              { path: 'create', name: 'NotificationCreate', component: () => import('@/views/admin/notification/EBNotificationForm.vue'), meta: { title: '新增通知' } },
              { path: 'edit/:id', name: 'NotificationEdit', component: () => import('@/views/admin/notification/EBNotificationForm.vue'), meta: { title: '编辑通知' } }
            ]
          },
          {
            path: 'payment',
            redirect: '/admin/payment/list',
            children: [
              { path: 'list', name: 'PaymentList', component: () => import('@/views/admin/payment/EBPaymentList.vue'), meta: { title: '支付列表' } },
              { path: 'detail/:id', name: 'PaymentDetail', component: () => import('@/views/admin/payment/EBPaymentDetail.vue'), meta: { title: '支付详情' } }
            ]
          },
          {
            path: 'meter',
            component: () => import('@/views/admin/meter/EBMeterList.vue'),
            children: [
              { path: 'create', name: 'MeterCreate', component: () => import('@/views/admin/meter/EBMeterForm.vue'), meta: { title: '新增电表' } },
              { path: 'edit/:id', name: 'MeterEdit', component: () => import('@/views/admin/meter/EBMeterForm.vue'), meta: { title: '编辑电表' } },
              { path: 'detail/:id', name: 'MeterDetail', component: () => import('@/views/admin/meter/EBMeterDetail.vue'), meta: { title: '电表详情' } },
              { path: 'data/:id', name: 'MeterData', component: () => import('@/views/admin/meter/EBMeterData.vue'), meta: { title: '电表数据' } }
            ]
          },
          {
            path: 'setting',
            redirect: '/admin/setting/rate',
            children: [
              { path: 'role', name: 'RoleSetting', component: () => import('@/views/admin/setting/role/EBRoleSetting.vue'), meta: { title: '角色权限管理' } },
              { path: 'rate', name: 'RateSetting', component: () => import('@/views/admin/setting/rate/EBRateManagement.vue'), meta: { title: '费率管理' } },
              { path: 'log', name: 'LogSetting', component: () => import('@/views/admin/setting/log/EBLogSetting.vue'), meta: { title: '日志管理' } }
            ]
          }
        ]
      }
    ]
  },

  // 登录页面
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/EBLogin.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },

  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/EBNotFound.vue'),
    meta: { requiresAuth: false, title: '404未找到' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
