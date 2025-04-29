<template>
  <div class="user-dashboard-page">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-text">
        <h2>您好，{{ userInfo.username }}</h2>
        <p>{{ getTimeGreeting() }}</p>
      </div>
    </div>

    <!-- 电表信息卡片 -->
    <div class="main-card">
      <div class="card-header">
        <div class="card-title">
          <el-icon><Odometer /></el-icon>
          <span>我的电表</span>
        </div>
        <div class="card-right">
          <span class="meter-id">电表编号：{{ meterInfo.id }}</span>
        </div>
      </div>
      <div class="card-body">
        <div class="meter-reading-box">
          <div class="reading-info">
            <div class="reading-title">当前读数</div>
            <div class="reading-value">{{ meterInfo.ending_reading }}<span class="unit">度</span></div>
          </div>
          <el-button type="primary" @click="viewUsageHistory">查看用电记录</el-button>
        </div>
      </div>
    </div>

    <!-- 账单信息卡片 -->
    <div class="main-card bill-card" :class="{'warning': currentBill.status === '未支付', 'danger': currentBill.status === '逾期'}">
      <div class="card-header">
        <div class="card-title">
          <el-icon><Document /></el-icon>
          <span>电费账单</span>
        </div>
        <div class="card-right" v-if="currentBill.id">
          <el-tag size="small" :type="getBillStatusType(currentBill.status)">{{ currentBill.status }}</el-tag>
        </div>
      </div>
      <div class="card-body" v-if="currentBill.id">
        <div class="bill-info">
          <div class="bill-amount">
            <div class="amount-label">本期电费</div>
            <div class="amount-value">{{ formatMoney(currentBill.total_amount) }}<span class="unit">元</span></div>
            <div class="due-date" v-if="currentBill.status === '未支付'">
              <span>缴费截止日期：{{ formatDate(currentBill.due_date) }}</span>
            </div>
          </div>
          <div class="bill-actions" v-if="currentBill.status === '未支付'">
            <el-button type="primary" @click="payBill">立即缴费</el-button>
          </div>
        </div>
      </div>
      <div class="card-body empty-bill" v-else>
        <el-empty description="暂无未结清账单" :image-size="80">
          <el-button type="primary" @click="viewBillHistory">查看历史账单</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 通知区域 -->
    <div class="main-card">
      <div class="card-header">
        <div class="card-title">
          <el-icon><Bell /></el-icon>
          <span>最新通知</span>
        </div>
        <div class="card-right">
          <el-button link type="primary" @click="viewMoreNotifications">查看更多</el-button>
        </div>
      </div>
      <div class="card-body">
        <div v-if="notifications.length === 0" class="empty-notifications">
          <el-empty description="暂无通知" :image-size="80"></el-empty>
        </div>
        <div v-else class="notification-simple-list">
          <div v-for="(notice, index) in notifications.slice(0, 3)" :key="index" 
               class="notification-item" 
               :class="{'unread': !notice.read}"
               @click="viewNotificationDetail(notice)">
            <div class="notice-title">
              <span class="notice-dot" v-if="!notice.read"></span>
              {{ notice.title }}
            </div>
            <div class="notice-time">{{ formatDateFromNow(notice.created_at) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  Odometer,
  Document,
  Bell
} from '@element-plus/icons-vue';
import { getDashboardData, getLatestNotifications } from '@/api/user/dashboard';

const router = useRouter();

// 定义loading状态
const dashboardLoading = ref(false);
const notificationsLoading = ref(false);

// 初始化用户信息（默认空值）
const userInfo = ref({
  id: '',
  username: '加载中...',
  phone: '',
  address: '',
  user_type: '',
  account_status: '',
  meter_id: ''
});

// 初始化电表信息（默认空值）
const meterInfo = ref({
  id: '加载中...',
  model: '',
  install_place: '',
  status: '',
  install_date: '',
  start_reading: 0,
  ending_reading: 0,
  last_meter_reading_date: ''
});

// 初始化当前账单（默认空值）
const currentBill = ref({
  id: '',
  user_id: '',
  usage_amount: 0,
  total_amount: 0,
  status: '',
  due_date: '',
  created_at: '',
  meter_id: '',
  start_reading: 0,
  ending_reading: 0
});

// 初始化通知数据（默认空数组）
const notifications = ref([]);

// 获取时间问候语
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) {
    return '夜深了，注意休息';
  } else if (hour < 9) {
    return '早上好，祝您一天愉快';
  } else if (hour < 12) {
    return '上午好，祝您工作顺利';
  } else if (hour < 14) {
    return '中午好，别忘记休息一下';
  } else if (hour < 18) {
    return '下午好，工作不要太累';
  } else if (hour < 22) {
    return '晚上好，今天过得如何';
  } else {
    return '夜深了，注意休息';
  }
};

// 工具方法
const formatMoney = (value) => {
  if (!value && value !== 0) return '--';
  return value.toFixed(2);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const formatDateFromNow = (dateTimeStr) => {
  if (!dateTimeStr) return '--';
  
  const now = new Date();
  const date = new Date(dateTimeStr);
  const diffMs = now - date;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  
  if (diffSec < 60) {
    return '刚刚';
  } else if (diffMin < 60) {
    return `${diffMin}分钟前`;
  } else if (diffHour < 24) {
    return `${diffHour}小时前`;
  } else if (diffDay < 30) {
    return `${diffDay}天前`;
  } else {
    return formatDate(date);
  }
};

const getBillStatusType = (status) => {
  switch (status) {
    case '已支付':
      return 'success';
    case '逾期':
      return 'danger';
    case '未支付':
      return 'warning';
    default:
      return 'info';
  }
};

// 页面功能方法
const payBill = () => {
  router.push({
    path: `/user/payment/${currentBill.value.id}`
  });
};

const viewUsageHistory = () => {
  router.push('/user/analysis');
};

const viewBillHistory = () => {
  router.push('/user/payment');
};

const viewMoreNotifications = () => {
  router.push('/user/notifications');
};

const viewNotificationDetail = (notice) => {
  // 跳转到通知中心页面，不再跳转详情页
  router.push('/user/notifications');
};

// 获取仪表盘数据
const fetchDashboardData = async () => {
  dashboardLoading.value = true;
  try {
    console.log('正在获取仪表盘数据...');
    const response = await getDashboardData();
    console.log('仪表盘数据响应:', JSON.stringify(response));
    
    // 直接使用响应数据
    if (response) {
      // 处理用户信息，映射字段名
      if (response.userInfo) {
        userInfo.value = {
          id: response.userInfo.userId || '',
          username: response.userInfo.username || '未知用户',
          phone: response.userInfo.phone || '',
          address: response.userInfo.address || '',
          user_type: response.userInfo.userType || '',
          account_status: response.userInfo.accountStatus || '',
          meter_id: response.meterInfo?.meterId || ''
        };
        console.log('用户信息更新成功:', userInfo.value);
      }
      
      // 处理电表信息，映射字段名
      if (response.meterInfo) {
        meterInfo.value = {
          id: response.meterInfo.meterId || '未绑定',
          status: response.meterInfo.status || '未知',
          model: response.meterInfo.model || '',
          install_place: response.meterInfo.installPlace || '',
          install_date: response.meterInfo.installDate || '',
          start_reading: response.meterInfo.startReading || 0,
          ending_reading: response.meterInfo.currentReading || 0,
          last_meter_reading_date: response.meterInfo.lastReadingDate || ''
        };
        console.log('电表信息更新成功:', meterInfo.value);
      }
      
      // 处理账单信息，映射字段名
      if (response.billInfo && response.billInfo.unpaidBill) {
        currentBill.value = {
          id: response.billInfo.unpaidBill.billId || '',
          user_id: response.userInfo?.userId || '',
          usage_amount: response.billInfo.unpaidBill.usageAmount || 0,
          total_amount: response.billInfo.unpaidBill.amount || 0,
          status: '未支付', // 假设这是一个未支付账单
          due_date: response.billInfo.unpaidBill.dueDate || '',
          created_at: response.billInfo.unpaidBill.createdAt || '',
          meter_id: response.meterInfo?.meterId || '',
          start_reading: 0, // 数据中未提供
          ending_reading: 0  // 数据中未提供
        };
        console.log('账单信息更新成功:', currentBill.value);
      } else {
        // 没有未支付账单，清空当前账单
        currentBill.value = {
          id: '',
          user_id: '',
          usage_amount: 0,
          total_amount: 0,
          status: '',
          due_date: '',
          created_at: '',
          meter_id: '',
          start_reading: 0,
          ending_reading: 0
        };
      }
    }
    
    console.log('仪表盘数据加载成功');
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
    ElMessage.error('获取仪表盘数据失败，请稍后重试');
  } finally {
    dashboardLoading.value = false;
  }
};

// 获取最新通知
const fetchLatestNotifications = async () => {
  notificationsLoading.value = true;
  try {
    console.log('正在获取最新通知...');
    const response = await getLatestNotifications({ limit: 3 });
    console.log('最新通知响应:', JSON.stringify(response));
    
    // 处理通知数据
    if (response) {
      // 检查是否存在列表数据
      if (response.list && Array.isArray(response.list)) {
        // 映射字段名
        notifications.value = response.list.map(item => ({
          id: item.id || '',
          title: item.title || '',
          content: item.content || '',
          type: item.type || '',
          created_at: item.createdAt || '',
          read: item.readStatus === 1, // 0表示未读，1表示已读
          readTime: item.readTime || null
        }));
      } else if (Array.isArray(response)) {
        // 兼容直接返回数组的情况
        notifications.value = response.map(item => ({
          id: item.id || '',
          title: item.title || '',
          content: item.content || '',
          type: item.type || '',
          created_at: item.createdAt || item.created_at || '',
          read: item.readStatus === 1 || !!item.read,
          readTime: item.readTime || null
        }));
      } else if (response.notifications && Array.isArray(response.notifications)) {
        // 兼容 notifications 字段的情况
        notifications.value = response.notifications.map(item => ({
          id: item.id || '',
          title: item.title || '',
          content: item.content || '',
          type: item.type || '',
          created_at: item.createdAt || item.created_at || '',
          read: item.readStatus === 1 || !!item.read,
          readTime: item.readTime || null
        }));
      }
      
      console.log('通知数据处理成功:', notifications.value);
    }
    
    console.log('最新通知加载成功，共 ' + notifications.value.length + ' 条');
  } catch (error) {
    console.error('获取最新通知失败:', error);
    ElMessage.error('获取最新通知失败，请稍后重试');
  } finally {
    notificationsLoading.value = false;
  }
};

// 生命周期钩子
onMounted(async () => {
  console.log('用户仪表盘初始化');
  // 分别获取数据，不等待通知数据加载完成
  //promise.all
  await fetchDashboardData();
  await fetchLatestNotifications();
});
</script>

<style scoped>
.user-dashboard-page {
  width: 100%;
  max-width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #fff;
}

/* 欢迎区域 */
.welcome-section {
  padding: 16px;
  background-color: #fff;
  border-radius: 0;
  margin-bottom: 0;
}

.welcome-text h2 {
  font-size: 22px;
  font-weight: bold;
  margin: 0;
  color: #303133;
  margin-bottom: 4px;
}

.welcome-text p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

/* 卡片通用样式 */
.main-card {
  background-color: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-left: 16px;
  margin-right: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f0f2f5;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.card-title .el-icon {
  font-size: 18px;
  color: #409EFF;
}

.card-body {
  padding: 16px;
}

/* 电表读数 */
.meter-reading-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reading-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.reading-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.unit {
  font-size: 14px;
  color: #909399;
  margin-left: 4px;
  font-weight: normal;
}

.meter-id {
  font-size: 13px;
  color: #909399;
}

/* 账单卡片 */
.bill-card {
  position: relative;
}

.bill-card.warning {
  border-left: 4px solid #E6A23C;
}

.bill-card.danger {
  border-left: 4px solid #F56C6C;
}

.bill-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.amount-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.due-date {
  margin-top: 8px;
  font-size: 13px;
  color: #F56C6C;
}

.bill-actions {
  display: flex;
  gap: 10px;
}

.empty-bill {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px 0;
}

/* 通知区域 */
.notification-simple-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-item:hover {
  background-color: #f0f2f5;
}

.notification-item.unread {
  background-color: #ecf5ff;
}

.notice-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.notice-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #409EFF;
}

.notice-time {
  font-size: 12px;
  color: #909399;
}

.empty-notifications {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

/* 移动端适配 */
@media screen and (max-width: 767px) {
  .meter-reading-box, .bill-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .bill-actions {
    width: 100%;
  }

  .bill-actions .el-button {
    width: 100%;
  }
}
</style> 