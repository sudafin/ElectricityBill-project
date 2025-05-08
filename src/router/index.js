import { createRouter, createWebHistory } from 'vue-router';
import { getUserToken, getAdminToken } from '@/utils/auth';
import { ElMessage } from 'element-plus';

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
        meta: { requiresAuth: true, userType: 'user' },
        children: [
          { path: 'dashboard', name: 'UserDashboard', component: () => import('@/views/user/dashboard/EBUserDashboard.vue'), meta: { title: '电费概览', userType: 'user' } },
          { path: 'analysis', name: 'UserAnalysis', component: () => import('@/views/user/analysis/EBUserElectricityAnalysis.vue'), meta: { title: '电费分析', userType: 'user' } },
          {
            path: 'paymentDashboard',
            name: 'PaymentDashboard',
            component: () => import('@/views/user/payment/EBUserBillDashBoard.vue'),
            meta: { title: '账单中心', userType: 'user' },
          },
          { path: 'payment/:id', name: 'UserPayment',component: () => import('@/views/user/payment/EBUserPayment.vue'), meta: { title: '缴纳电费', userType: 'user' } },
          { path: 'bill/detail/:id', name: 'UserPaymentDetail', component: () => import('@/views/user/payment/EBUserBillDetail.vue'), meta: { title: '缴费详情', userType: 'user' } },
          { path: 'notifications', name: 'UserNotifications', component: () => import('@/views/user/notification/EBUserNotifications.vue'), meta: { title: '通知中心', userType: 'user' } },
          { path: 'profile', name: 'UserProfile', component: () => import('@/views/user/profile/EBUserProfile.vue'), meta: { title: '个人信息', userType: 'user' } },
          {
            path: 'help',
            name: 'UserHelp',
            component: () => import('@/views/user/help/EBUserHelp.vue'),
            meta: { title: '帮助中心', userType: 'user' }
          }
        ]
      },

      // 管理员相关路由
      {
        path: 'admin',
        component: () => import('@/layouts/EBAdminLayout.vue'),
        redirect: '/admin/dashboard',
        meta: { requiresAuth: true, userType: 'admin' },
        children: [
          { path: 'dashboard', name: 'AdminDashboard', component: () => import('@/views/admin/dashboard/EBAdminDashboard.vue'), meta: { title: '首页', userType: 'admin' } },
          {
            path: 'user',
            redirect: '/admin/user/dashboard',
            meta: { userType: 'admin' },
            children: [
              { path: 'dashboard', name: 'AdminUserDashboard', component: () => import('@/views/admin/user/EBUserDashBoard.vue'), meta: { title: '用户管理', userType: 'admin' } },
              { path: 'form', name: 'AdminUserForm', component: () => import('@/views/admin/user/EBUserForm.vue'), meta: { title: '新增用户', userType: 'admin' } },
              { path: 'edit/:id', name: 'AdminUserEdit', component: () => import('@/views/admin/user/EBUserForm.vue'), meta: { title: '编辑用户', userType: 'admin' } }
            ]
          },
          { path: 'report', name: 'AdminReport', component: () => import('@/views/admin/report/EBReport.vue'), meta: { title: '数据统计与报表', userType: 'admin' } },
          {
            path: 'reconciliation',
            redirect: '/admin/reconciliation/list',
            meta: { userType: 'admin' },
            children: [
              { path: 'list', name: 'ReconciliationList', component: () => import('@/views/admin/reconciliation/EBReconciliation.vue'), meta: { title: '对账列表', userType: 'admin' } },
              { path: 'approval/:reconciliationNo', name: 'Approval', component: () => import('@/views/admin/reconciliation/EBApproval.vue'), meta: { title: '审批详情', userType: 'admin' } }
            ]
          },
          {
            path: 'notification',
            redirect: '/admin/notification/list',
            meta: { userType: 'admin' },
            children: [
              { path: 'list', name: 'NotificationList', component: () => import('@/views/admin/notification/EBNotificationList.vue'), meta: { title: '通知列表', userType: 'admin' } },
              { path: 'create', name: 'NotificationCreate', component: () => import('@/views/admin/notification/EBNotificationForm.vue'), meta: { title: '新增通知', userType: 'admin' } },
              { path: 'edit/:id', name: 'NotificationEdit', component: () => import('@/views/admin/notification/EBNotificationForm.vue'), meta: { title: '编辑通知', userType: 'admin' } },
            ]
          },
          {
            path: 'bill',
            redirect: '/admin/bill/list',
            meta: { userType: 'admin' },
            children: [
              { path: 'list', name: 'BillList', component: () => import('@/views/admin/bill/EBBillList.vue'), meta: { title: '账单列表', userType: 'admin' } },
              { path: 'detail/:id', name: 'BillDetail', component: () => import('@/views/admin/bill/EBBillDetail.vue'), meta: { title: '账单详情', userType: 'admin' } }
            ]
          },
          {
            path: 'meter',
            redirect: '/admin/meter/list',
            meta: { userType: 'admin' },
            children: [
              { path: 'list', name: 'MeterList', component: () => import('@/views/admin/meter/EBMeterList.vue'), meta: { title: '电表管理', userType: 'admin' } },
              { path: 'form', name: 'MeterForm', component: () => import('@/views/admin/meter/EBMeterForm.vue'), meta: { title: '电表表单', userType: 'admin' } },
              { path: 'repair/:id', name: 'MeterRepair', component: () => import('@/views/admin/meter/EBMeterRepair.vue'), meta: { title: '电表维修', userType: 'admin' } },
            ]
          },
          {
            path: 'setting',
            redirect: '/admin/setting/rate',
            meta: { userType: 'admin' },
            children: [
              { path: 'role', name: 'RoleSetting', component: () => import('@/views/admin/setting/role/EBRoleSetting.vue'), meta: { title: '角色权限管理', userType: 'admin' } },
              { path: 'rate', name: 'RateSetting', component: () => import('@/views/admin/setting/rate/EBRateManagement.vue'), meta: { title: '费率管理', userType: 'admin' } },
              { path: 'rate/create', name: 'RateCreate', component: () => import('@/views/admin/setting/rate/EBRateForm.vue'), meta: { title: '新增费率', userType: 'admin' } },
              { path: 'rate/edit/:id', name: 'RateEdit', component: () => import('@/views/admin/setting/rate/EBRateForm.vue'), meta: { title: '编辑费率', userType: 'admin' } },
              { path: 'rate/detail/:id', name: 'RateDetail', component: () => import('@/views/admin/setting/rate/EBRateForm.vue'), meta: { title: '费率详情', userType: 'admin' } },
              { path: 'log', name: 'LogSetting', component: () => import('@/views/admin/setting/log/EBLogSetting.vue'), meta: { title: '日志管理', userType: 'admin' } }
            ]
          },
          {
            path: 'feedback',
            redirect: '/admin/feedback/list',
            meta: { userType: 'admin' },
            children: [
              { path: 'list', name: 'FeedbackList', component: () => import('@/views/admin/feedback/FeedbackList.vue'), meta: { title: '反馈列表', userType: 'admin' } },
              { path: 'process/:id', name: 'ProcessFeedback', component: () => import('@/views/admin/feedback/ProcessFeedback.vue'), meta: { title: '处理反馈', userType: 'admin' } }
            ]
          }
        ]
      }
    ]
  },

  // 登录页面
  {
    path: '/login/admin',
    name: 'AdminLogin',
    component: () => import('@/views/login/EBAdminLogin.vue'),
    meta: { requiresAuth: false, title: '管理员登录' }
  },

  // 用户登录页面
  {
    path: '/login/user',
    name: 'UserLogin',
    component: () => import('@/views/login/EBUserLogin.vue'),
    meta: { requiresAuth: false, title: '用户登录' }
  },

  // 默认登录路由重定向到用户登录
  {
    path: '/login',
    redirect: '/login/user'
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

// 全局导航守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 电费账单系统`;
  } else {
    document.title = '电费账单系统';
  }

  // 对于需要登录的页面，检查是否已登录
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 获取路由要求的用户类型
    const userType = to.meta.userType || 
                     (to.path.includes('/admin') ? 'admin' : 'user');
    
    // 根据用户类型检查对应的token
    const hasToken = userType === 'admin' ? getAdminToken() : getUserToken();
    
    // 防止缓存导致判断错误，确保每次都检查最新token
    if (!hasToken) {
      console.log(`${userType}需要登录，尚未登录，重定向到登录页面`);
      ElMessage.warning('请先登录');
      // 根据用户类型跳转到对应的登录页面
      next({
        path: userType === 'admin' ? '/login/admin' : '/login/user',
        query: { redirect: to.fullPath } // 保存重定向地址
      });
      return; // 确保导航在这里停止
    } else {
      // 确保用户只能访问对应类型的页面
      if ((userType === 'admin' && to.path.startsWith('/user')) ||
          (userType === 'user' && to.path.startsWith('/admin'))) {
        console.log(`${userType}无权访问${to.path}`);
        ElMessage.error('您没有权限访问该页面');
        next(from.fullPath || (userType === 'admin' ? '/admin/dashboard' : '/user/dashboard'));
        return; // 确保导航在这里停止
      }
    }
  } else if (to.path === '/login/admin' && getAdminToken()) {
    // 管理员已登录时访问登录页面，重定向到管理员首页
    next('/admin/dashboard');
    return; // 确保导航在这里停止
  } else if (to.path === '/login/user' && getUserToken()) {
    // 用户已登录时访问登录页面，重定向到用户首页
    next('/user/dashboard');
    return; // 确保导航在这里停止
  }
  
  // 其他情况允许通过
  next();
});

export default router;
