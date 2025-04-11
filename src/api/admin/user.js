import request from '@/utils/request';


export function login(data) {
  return request({
    url: '/admin/login',
    method: 'post',
    data,
  });
}

export function getPublicKey() {
  return request({
    url: '/admin',
    method: 'get',
    responseType: 'text',
  });
}

export function getCaptcha(uuid) {
  return request({
    url: '/admin/captcha',
    method: 'get',
    params: { key: uuid },
    responseType: 'blob',
  });
}

export function logout() {
  return request({
    url: '/admin/logout',
    method: 'post',
  });
} 

export function getDashboardInfo() {
  return request({
    url: '/dashboard',
    method: 'get',
  });
}

/**
 * 获取用户列表
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.pageSize 每页数量
 * @param {string} params.keyword 搜索关键词（可选）
 * @param {string} params.status 用户状态（可选）
 * @returns {Promise} 返回Promise对象，包含用户列表
 */
export function getUserList(params) {
  return request({
    url: '/api/admin/users',
    method: 'get',
    params
  });
}

/**
 * 获取用户详情
 * @param {string} userId 用户ID
 * @returns {Promise} 返回Promise对象，包含用户详情
 */
export function getUserDetail(userId) {
  return request({
    url: `/api/admin/users/${userId}`,
    method: 'get'
  });
}

/**
 * 添加用户
 * @param {Object} data 用户数据
 * @param {string} data.username 用户名
 * @param {string} data.password 密码
 * @param {string} data.name 姓名
 * @param {string} data.phone 手机号
 * @param {string} data.email 邮箱
 * @param {string} data.address 地址
 * @returns {Promise} 返回Promise对象，包含添加结果
 */
export function addUser(data) {
  return request({
    url: '/api/admin/users',
    method: 'post',
    data
  });
}

/**
 * 更新用户信息
 * @param {string} userId 用户ID
 * @param {Object} data 更新数据
 * @param {string} data.name 姓名（可选）
 * @param {string} data.phone 手机号（可选）
 * @param {string} data.email 邮箱（可选）
 * @param {string} data.address 地址（可选）
 * @param {string} data.status 状态（可选）
 * @returns {Promise} 返回Promise对象，包含更新结果
 */
export function updateUser(userId, data) {
  return request({
    url: `/api/admin/users/${userId}`,
    method: 'put',
    data
  });
}

/**
 * 删除用户
 * @param {string} userId 用户ID
 * @returns {Promise} 返回Promise对象，包含删除结果
 */
export function deleteUser(userId) {
  return request({
    url: `/api/admin/users/${userId}`,
    method: 'delete'
  });
}

/**
 * 重置用户密码
 * @param {string} userId 用户ID
 * @returns {Promise} 返回Promise对象，包含重置结果
 */
export function resetUserPassword(userId) {
  return request({
    url: `/api/admin/users/${userId}/reset-password`,
    method: 'post'
  });
}

/**
 * 获取用户统计数据
 * @returns {Promise} 返回Promise对象，包含用户统计数据
 */
export function getUserStatistics() {
  return request({
    url: '/api/admin/users/statistics',
    method: 'get'
  });
}

/**
 * 获取用户账单记录
 * @param {string} userId 用户ID
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.pageSize 每页数量
 * @returns {Promise} 返回Promise对象，包含用户账单记录
 */
export function getUserBillRecords(userId, params) {
  return request({
    url: `/api/admin/users/${userId}/bills`,
    method: 'get',
    params
  });
}

/**
 * 获取用户支付记录
 * @param {string} userId 用户ID
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.pageSize 每页数量
 * @returns {Promise} 返回Promise对象，包含用户支付记录
 */
export function getUserPaymentRecords(userId, params) {
  return request({
    url: `/api/admin/users/${userId}/payments`,
    method: 'get',
    params
  });
}

/**
 * 获取用户用电分析
 * @param {string} userId 用户ID
 * @param {Object} params 查询参数
 * @param {number} params.year 年份
 * @param {string} params.type 数据类型（可选）
 * @returns {Promise} 返回Promise对象，包含用户用电分析数据
 */
// export function getUserElectricityAnalysis(userId, params) {
//   return request({
//     url: `/api/admin/users/${userId}/electricity-analysis`,
//     method: 'get',
//     params
//   });
// }

export function payUser(userId, money, paymentMethod){
  return request({  
    url: '/user/pay',
    method: 'put',
    params: { userId: userId, money: money, paymentMethod: paymentMethod },
  });
}

export function getUserBill(id){
  return request({
    url: `/user/bill/${id}`,
    method: 'get',
  });
}

export function refreshAccessToken() {
  return request({
    url: '/admin/refresh',
    method: 'get',
    withCredentials: true
  });
}

// 模拟获取用户信息
export function getUserInfo() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          balance: 128.56,
          currentMonthUsage: 243,
          lastPaymentTime: '2023-03-15 09:23:45'
        }
      });
    }, 500);
  });
}

// 模拟获取用户用电历史
export function getUserUsageHistory() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [
          { month: '一月', usage: 180, cost: 90 },
          { month: '二月', usage: 200, cost: 100 },
          { month: '三月', usage: 160, cost: 80 },
          { month: '四月', usage: 220, cost: 110 },
          { month: '五月', usage: 240, cost: 120 },
          { month: '六月', usage: 190, cost: 95 }
        ]
      });
    }, 500);
  });
}

// 模拟获取最近缴费记录
export function getRecentPayments(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [
          {
            paymentId: 'P2023031501',
            amount: 100,
            paymentMethod: '支付宝',
            status: '已支付',
            paymentTime: '2023-03-15 09:23:45'
          },
          {
            paymentId: 'P2023030201',
            amount: 150,
            paymentMethod: '微信支付',
            status: '已支付',
            paymentTime: '2023-03-02 14:35:22'
          }
        ]
      });
    }, 500);
  });
}

// 模拟获取用户通知
export function getUserNotifications(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [
          {
            id: 1,
            title: '电费缴纳成功通知',
            content: '您已成功缴纳电费100元，感谢您的使用。',
            createTime: '2023-03-15 09:25:00',
            isRead: true
          },
          {
            id: 2,
            title: '系统维护通知',
            content: '系统将于2023-03-20进行维护升级，届时可能无法访问系统，敬请谅解。',
            createTime: '2023-03-18 10:00:00',
            isRead: false
          }
        ]
      });
    }, 500);
  });
}

// 用户相关接口

/**
 * 获取用户电费分析数据
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export const getUserElectricityAnalysis = (params) => {
  // 这里返回一个模拟的成功响应，包含假数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '获取成功',
        data: {
          summary: {
            totalUsage: 2560,
            totalCost: 1792.0,
            averageMonthlyUsage: 213.3,
            usageYoY: -3.5,
            costYoY: 2.1,
            avgUsageYoY: -3.2
          },
          monthlyData: {
            current: [210, 185, 190, 175, 160, 220, 280, 295, 240, 230, 205, 190],
            lastYear: [220, 195, 200, 180, 170, 210, 270, 290, 245, 235, 215, 195]
          },
          timeDistribution: {
            night: 15,
            morning: 25,
            afternoon: 30,
            evening: 30
          },
          typeDistribution: {
            '生活用电': 45,
            '照明': 20,
            '厨房电器': 15,
            '电子设备': 10,
            '空调': 10
          },
          comparison: {
            user: [150, 160, 145, 165, 170, 155, 180, 190, 160, 155, 145, 150],
            average: [180, 175, 170, 175, 180, 185, 195, 200, 185, 175, 170, 165]
          },
          insights: {
            analysis: [
              { content: '您的用电量较上月减少了5%，较同期减少了3.5%' },
              { content: '您在夏季空调用电明显高于平均水平，建议注意调节空调温度' },
              { content: '夜间用电比例较低，符合科学用电习惯' }
            ],
            suggestions: [
              { 
                title: '合理调节空调温度', 
                content: '空调温度设定在26℃左右是最为舒适和节能的，每调高1℃可节约6%的用电量',
                savingPotential: '约15元/月'
              },
              { 
                title: '使用节能灯具', 
                content: '将普通灯泡更换为LED节能灯，可节约75%的照明用电',
                savingPotential: '约20元/月'
              },
              { 
                title: '减少待机能耗', 
                content: '电器不使用时及时拔掉插头，避免待机能耗',
                savingPotential: '约10元/月'
              }
            ]
          }
        }
      });
    }, 500);  // 模拟网络延迟
  });
};

/**
 * 获取缴费历史记录
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export const getPaymentHistory = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '获取成功',
        data: {
          list: [
            { 
              paymentId: 'PAY202303150001', 
              amount: 186.9, 
              paymentMethod: '微信支付', 
              status: '已支付', 
              paymentTime: '2023-03-15 14:30:25' 
            },
            { 
              paymentId: 'PAY202302150002', 
              amount: 205.6, 
              paymentMethod: '支付宝', 
              status: '已支付', 
              paymentTime: '2023-02-15 09:45:12' 
            },
            { 
              paymentId: 'PAY202301150003', 
              amount: 189.3, 
              paymentMethod: '银行卡', 
              status: '已支付', 
              paymentTime: '2023-01-15 16:20:35' 
            }
          ],
          total: 3
        }
      });
    }, 500);
  });
};

/**
 * 获取支付详情
 * @param {String} paymentId 支付ID
 * @returns {Promise}
 */
export const getPaymentDetail = (paymentId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '获取成功',
        data: {
          paymentId: paymentId,
          amount: 186.9,
          paymentMethod: '微信支付',
          status: '已支付',
          paymentTime: '2023-03-15 14:30:25',
          transactionId: 'TX' + Date.now(),
          channel: '第三方支付',
          remark: '电费缴纳'
        }
      });
    }, 500);
  });
};

/**
 * 申请退款
 * @param {Object} data 退款信息
 * @returns {Promise}
 */
export const applyRefund = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '申请成功',
        data: null
      });
    }, 500);
  });
};

/**
 * 下载支付收据
 * @param {String} paymentId 支付ID
 * @returns {Promise}
 */
export const downloadPaymentReceipt = (paymentId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '下载成功',
        data: null
      });
    }, 500);
  });
};