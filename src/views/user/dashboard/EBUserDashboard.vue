<template>
  <EBPageLayout>
    <template #header>
      <div class="eb-dashboard-header">
        <div class="tab-buttons">
          <div 
            class="tab-item"
            :class="{ 'active-tab': activeTab === 'notifications' }" 
            @click="activeTab = 'notifications'"
          >
            <el-icon><Bell /></el-icon>
            <span>最新通知</span>
          </div>
          <div 
            class="tab-item"
            :class="{ 'active-tab': activeTab === 'electricity' }" 
            @click="activeTab = 'electricity'"
          >
            <el-icon><Lightning /></el-icon>
            <span>电费记录</span>
          </div>
          <div 
            class="tab-item"
            :class="{ 'active-tab': activeTab === 'payment' }" 
            @click="activeTab = 'payment'"
          >
            <el-icon><Wallet /></el-icon>
            <span>缴费记录</span>
          </div>
        </div>
      </div>
    </template>

    <div class="dashboard-container">
      <!-- 动态组件切换 -->
      <component :is="currentComponent"></component>
    </div>
  </EBPageLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { EBPageLayout, EBCard } from '@/components';
import { formatMoney, formatNumber } from '@/utils/formatter';
import { getCurrentBill } from '@/api/user/bill';
import { getAccountBalance, getAccountInfo } from '@/api/user/account';
import { getUnreadCount } from '@/api/user/notification';
import { getElectricityTrend, getEnergySavingTips } from '@/api/user/analysis';
import EBUserDashboardNotifications from './components/EBUserDashboardNotifications.vue';
import EBUserDashboardElectricity from './components/EBUserDashboardElectricity.vue';
import EBUserDashboardPayment from './components/EBUserDashboardPayment.vue';

const router = useRouter();

// 页面状态
const loading = ref(false);

// 用户信息
const userInfo = ref({
  name: '',
  address: '',
  meterNumber: ''
});

// 账户余额
const accountBalance = ref(0);

// 当前账单
const currentBill = ref({
  billId: '',
  billMonth: '',
  dueDate: '',
  amount: 0,
  status: 'unpaid', // unpaid, overdue, paid
  usageAmount: 0,
  paidAmount: 0,
  remainAmount: 0
});

// 近期用电趋势
const electricityTrend = ref([]);

// 未读通知数量
const unreadNotifications = ref(0);

// 节能小贴士
const energySavingTips = ref([]);

// 当前活动标签
const activeTab = ref('notifications'); // 默认显示最新通知

// 根据当前活动标签返回对应组件
const currentComponent = computed(() => {
  switch(activeTab.value) {
    case 'electricity':
      return EBUserDashboardElectricity;
    case 'payment':
      return EBUserDashboardPayment;
    case 'notifications':
    default:
      return EBUserDashboardNotifications;
  }
});

// 计算属性：账单状态文本
const billStatusText = computed(() => {
  const status = currentBill.value.status;
  if (status === 'paid') return '已支付';
  if (status === 'overdue') return '已逾期';
  return '待支付';
});

// 计算属性：账单状态样式
const billStatusType = computed(() => {
  const status = currentBill.value.status;
  if (status === 'paid') return 'success';
  if (status === 'overdue') return 'danger';
  return 'warning';
});

// 初始化页面数据
const initPageData = async () => {
  loading.value = true;
  
  try {
    // 获取用户信息
    const accountInfoResponse = await getAccountInfo();
    if (accountInfoResponse.code === 200) {
      userInfo.value = accountInfoResponse.data || {};
    }
    
    // 获取账户余额
    const balanceResponse = await getAccountBalance();
    if (balanceResponse.code === 200) {
      accountBalance.value = balanceResponse.data.balance || 0;
    }
    
    // 获取当前账单
    await fetchCurrentBill();
    
    // 获取用电趋势
    await fetchElectricityTrend();
    
    // 获取未读通知数量
    await fetchUnreadNotifications();
    
    // 获取节能小贴士
    await fetchEnergySavingTips();
  } catch (error) {
    console.error('初始化仪表盘数据失败:', error);
    ElMessage.error('加载仪表盘数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 获取当前账单
const fetchCurrentBill = async () => {
  try {
    const response = await getCurrentBill();
    if (response.code === 200) {
      currentBill.value = response.data || {};
    }
  } catch (error) {
    console.error('获取当前账单失败:', error);
  }
};

// 获取用电趋势
const fetchElectricityTrend = async () => {
  try {
    // 获取最近30天的用电趋势
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const formattedToday = today.toISOString().split('T')[0];
    const formattedThirtyDaysAgo = thirtyDaysAgo.toISOString().split('T')[0];
    
    const response = await getElectricityTrend({
      startDate: formattedThirtyDaysAgo,
      endDate: formattedToday,
      type: 'daily'
    });
    
    if (response.code === 200) {
      electricityTrend.value = response.data || [];
    }
  } catch (error) {
    console.error('获取用电趋势失败:', error);
  }
};

// 获取未读通知
const fetchUnreadNotifications = async () => {
  try {
    const response = await getUnreadCount();
    if (response.code === 200) {
      unreadNotifications.value = response.data.count || 0;
    }
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
  }
};

// 获取节能小贴士
const fetchEnergySavingTips = async () => {
  try {
    const response = await getEnergySavingTips({ limit: 3 });
    if (response.code === 200) {
      energySavingTips.value = response.data || [];
    }
  } catch (error) {
    console.error('获取节能小贴士失败:', error);
  }
};

// 路由跳转
const goToPage = (path) => {
  router.push(path);
};

// 支付账单
const payBill = () => {
  router.push({
    path: '/user/payment',
    query: { billId: currentBill.value.billId }
  });
};

// 查看更多用电分析
const viewMoreAnalysis = () => {
  router.push('/user/analysis');
};

// 查看更多通知
const viewMoreNotifications = () => {
  router.push('/user/notifications');
};

// 初始化
onMounted(() => {
  initPageData();
});
</script>

<style scoped>
.eb-dashboard-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0 15px 0;
}

.tab-buttons {
  display: flex;
  padding: 0;
  width: 100%;
  justify-content: center;
  border: none;
}

.tab-item {
  display: flex;
  align-items: center;
  padding: 0 30px;
  height: 40px;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  margin-right: 20px;
  position: relative;
  font-weight: normal;
}

.tab-item:last-child {
  margin-right: 0;
}

.tab-item:hover {
  color: #409EFF;
}

.tab-item .el-icon {
  margin-right: 6px;
  font-size: 16px;
}

.active-tab {
  color: #409EFF;
  font-weight: 500;
}

.active-tab .el-icon {
  color: #409EFF;
}

.dashboard-container {
  margin-top: 15px;
  padding: 0;
}
</style> 