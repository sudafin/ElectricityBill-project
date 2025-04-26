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

const router = useRouter();

// 模拟用户信息
const userInfo = ref({
  id: 10001,
  username: '张三',
  phone: '13812345678',
  address: '北京市海淀区XXX小区X号楼X单元',
  user_type: '居民用户',
  account_status: '正常',
  meter_id: 'M2023001'
});

// 模拟电表信息
const meterInfo = ref({
  id: 'M2023001',
  model: 'DDS-102',
  install_place: '厨房',
  status: '正常',
  install_date: '2023-01-15',
  start_reading: 3250.5,
  ending_reading: 3402.7,
  last_meter_reading_date: '2023-03-15'
});

// 模拟当前账单
const currentBill = ref({
  id: 'B2023031501',
  user_id: 10001,
  usage_amount: 152.2,
  total_amount: 98.93,
  status: '未支付',
  due_date: '2023-03-25',
  created_at: '2023-03-15',
  meter_id: 'M2023001',
  start_reading: 3250.5,
  ending_reading: 3402.7
});

// 模拟通知数据
const notifications = ref([
  {
    id: 1,
    title: '电费缴纳成功通知',
    content: '您已成功缴纳电费100元，感谢您的使用。',
    type: 'payment',
    created_at: '2023-03-15 09:25:00',
    read: true
  },
  {
    id: 2,
    title: '系统维护通知',
    content: '系统将于2023-03-20 22:00至次日02:00进行升级维护。',
    type: 'system',
    created_at: '2023-03-18 10:00:00',
    read: false
  },
  {
    id: 3,
    title: '电费余额不足提醒',
    content: '您的账户电费余额低于50元，为避免影响正常用电，请及时充值。',
    type: 'alert',
    created_at: '2023-03-20 15:30:00',
    read: false
  }
]);

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
    path: `/user/paymentDashboard/payment/${currentBill.value.id}`
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
  ElMessage.info(`查看通知: ${notice.title}`);
  // 实际项目中跳转到通知详情页
  // router.push({
  //   path: '/user/notifications/detail',
  //   query: { id: notice.id }
  // });
};

// 生命周期钩子
onMounted(() => {
  // 实际项目中这里会请求API获取真实数据
  console.log('用户仪表盘初始化');
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