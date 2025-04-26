<template>
  <div class="bill-dashboard" :class="{'no-scroll': $route.path === '/user/paymentDashboard'}">
    <!-- 子路由视图 -->
    <router-view v-if="$route.path !== '/user/paymentDashboard'" class="bill-route-view"></router-view>

    <!-- 当不在子路由页面时显示的内容 -->
    <div v-else class="bill-content">
      <!-- 顶部卡片 -->
      <div class="account-summary-card">
        <div class="summary-header">
          <h3>账单概览</h3>
        </div>
        <div class="summary-body">
          <div class="total-amount">
            <div class="label">总支出</div>
            <div class="value">{{ totalPayment }} <span class="unit">元</span></div>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ totalBills }}</div>
              <div class="stat-label">总账单数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ unpaidBills }}</div>
              <div class="stat-label">未缴账单</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ avgMonthlyPayment }}</div>
              <div class="stat-label">月均缴费</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 下拉刷新区域 -->
      <div 
        class="pull-refresh"
        :class="{ 'refreshing': isRefreshing }"
        @touchstart="touchStart"
        @touchmove="touchMove"
        @touchend="touchEnd"
      >
        <div class="pull-indicator" v-show="isPulling">
          <el-icon class="pull-icon" :class="{ 'rotating': isRefreshing }"><Refresh /></el-icon>
          <span>{{ isRefreshing ? '刷新中...' : '下拉刷新' }}</span>
        </div>

        <!-- 账单列表 -->
        <div 
          class="bill-list"
          v-loading="loading && !isRefreshing && !loadingMore"
          @scroll="handleScroll"
          ref="listContainer"
        >
          <div v-if="loading && !isRefreshing && !loadingMore" class="loading-container">
            <el-skeleton :rows="3" animated />
            <el-skeleton :rows="3" animated style="margin-top: 20px" />
          </div>
          
          <template v-else-if="bills.length">
            <div 
              v-for="bill in bills" 
              :key="bill.billId"
              class="bill-card"
              @click="viewBillDetail(bill)"
            >
              <div class="bill-header">
                <div class="bill-date">{{ formatDate(bill.billDate) }}</div>
                <el-tag 
                  :type="getStatusType(bill.status)" 
                  size="small">
                  {{ bill.status }}
                </el-tag>
              </div>
              <div class="bill-body">
                <div class="bill-amount">{{ bill.amount }} <span class="unit">元</span></div>
                <div class="bill-info">
                  <div class="info-item">
                    <span class="label">账单编号:</span>
                    <span class="value">{{ bill.billId }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">用电量:</span>
                    <span class="value">{{ bill.usage }} 度</span>
                  </div>
                  <div class="info-item" v-if="bill.status === '未缴费'">
                    <span class="label">截止日期:</span>
                    <span class="value" :class="{'overdue-soon': isOverdueSoon(bill.dueDate)}">
                      {{ formatDate(bill.dueDate) }}
                    </span>
                  </div>
                  <div class="info-item" v-else>
                    <span class="label">缴费日期:</span>
                    <span class="value">{{ bill.paymentDate ? formatDate(bill.paymentDate) : '--' }}</span>
                  </div>
                </div>
              </div>
              <div class="bill-footer">
                <el-button 
                  v-if="bill.status === '未缴费'" 
                  type="primary" 
                  size="small"
                  @click.stop="payBill(bill)"
                >
                  立即缴费
                </el-button>
                <el-button 
                  type="info" 
                  plain 
                  size="small"
                  @click.stop="viewBillDetail(bill)"
                >
                  查看详情
            </el-button>
              </div>
            </div>
          </template>

          <div v-else class="empty-container">
            <el-empty 
              description="暂无账单记录" 
              :image-size="120">
            </el-empty>
          </div>
          
          <!-- 加载更多提示 -->
          <div class="load-more" v-if="loadingMore">
            <p>加载中...</p>
          </div>
          
          <div v-if="!hasMore && bills.length > 0" class="no-more">
            — 已加载全部账单 —
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';

const router = useRouter();
const loading = ref(true);
const loadingMore = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);

// 下拉刷新相关
const isRefreshing = ref(false);
const isPulling = ref(false);
const startY = ref(0);
const pullDistance = ref(0);
const pullThreshold = 60;
const listContainer = ref(null);

// 模拟账单数据的生成函数
const generateMockBill = (index) => {
  const baseDate = new Date('2023-03-15');
  baseDate.setMonth(baseDate.getMonth() - index);
  
  const billDate = new Date(baseDate);
  const dueDate = new Date(billDate);
  dueDate.setDate(dueDate.getDate() + 15);
  
  const isPaid = index > 1 && Math.random() > 0.3;
  const usageAmount = 100 + Math.floor(Math.random() * 100);
  const amount = (usageAmount * 0.65).toFixed(2);
  
  const paymentMethods = ['微信支付', '支付宝', '银行卡支付'];
  const paymentDate = isPaid ? new Date(billDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000) : null;
  
  const prevReading = 3000 + index * 100;
  const currentReading = prevReading + usageAmount;
  
  const billId = `B${billDate.getFullYear()}${String(billDate.getMonth() + 1).padStart(2, '0')}${String(1000 + index).slice(1)}`;
  
  return {
    billId,
    meterId: 'M2023001',
    userId: 10001,
    amount: parseFloat(amount),
    usage: usageAmount,
    billDate: billDate.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    status: isPaid ? '已缴费' : '未缴费',
    paymentDate: isPaid ? paymentDate.toISOString().split('T')[0] : null,
    paymentMethod: isPaid ? paymentMethods[Math.floor(Math.random() * paymentMethods.length)] : null,
    startReading: prevReading,
    endReading: currentReading,
    billPeriod: `${new Date(billDate.getFullYear(), billDate.getMonth() - 1, 15).toISOString().split('T')[0]} 至 ${billDate.toISOString().split('T')[0]}`
  };
};

// 初始账单数据 (前4项保持原样，便于测试)
const bills = ref([
  {
    billId: 'B20230315001',
    meterId: 'M2023001',
    userId: 10001,
    amount: 98.93,
    usage: 152.2,
    billDate: '2023-03-15',
    dueDate: '2023-03-31',
    status: '未缴费',
    paymentDate: null,
    paymentMethod: null,
    startReading: 3250.5,
    endReading: 3402.7,
    billPeriod: '2023-02-15 至 2023-03-15'
  },
  {
    billId: 'B20230215002',
    meterId: 'M2023001',
    userId: 10001,
    amount: 85.65,
    usage: 131.8,
    billDate: '2023-02-15',
    dueDate: '2023-02-28',
    status: '已缴费',
    paymentDate: '2023-02-20',
    paymentMethod: '微信支付',
    startReading: 3118.7,
    endReading: 3250.5,
    billPeriod: '2023-01-15 至 2023-02-15'
  },
  {
    billId: 'B20230115003',
    meterId: 'M2023001',
    userId: 10001,
    amount: 102.38,
    usage: 157.5,
    billDate: '2023-01-15',
    dueDate: '2023-01-31',
    status: '已缴费',
    paymentDate: '2023-01-25',
    paymentMethod: '支付宝',
    startReading: 2961.2,
    endReading: 3118.7,
    billPeriod: '2022-12-15 至 2023-01-15'
  },
  {
    billId: 'B20221215004',
    meterId: 'M2023001',
    userId: 10001,
    amount: 118.72,
    usage: 182.6,
    billDate: '2022-12-15',
    dueDate: '2022-12-31',
    status: '已缴费',
    paymentDate: '2022-12-18',
    paymentMethod: '银行卡支付',
    startReading: 2778.6,
    endReading: 2961.2,
    billPeriod: '2022-11-15 至 2022-12-15'
  }
]);

// 计算统计数据
const totalBills = computed(() => bills.value.length);
const unpaidBills = computed(() => bills.value.filter(b => b.status === '未缴费').length);

const totalPayment = computed(() => {
  return bills.value
    .filter(b => b.status === '已缴费')
    .reduce((sum, bill) => sum + bill.amount, 0)
    .toFixed(2);
});

const avgMonthlyPayment = computed(() => {
  const paidBills = bills.value.filter(b => b.status === '已缴费');
  if (paidBills.length === 0) return '0.00';
  return (paidBills.reduce((sum, bill) => sum + bill.amount, 0) / paidBills.length).toFixed(2);
});

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '--';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 判断是否即将逾期（7天内）
const isOverdueSoon = (dueDate) => {
  if (!dueDate) return false;
  
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 7 && diffDays > 0;
};

// 获取状态对应的样式类型
const getStatusType = (status) => {
  switch (status) {
    case '已缴费':
      return 'success';
    case '未缴费':
      return 'warning';
    case '逾期':
      return 'danger';
    default:
      return 'info';
  }
};

// 下拉刷新事件处理
const touchStart = (e) => {
  if (listContainer.value && listContainer.value.scrollTop > 0) return;
  startY.value = e.touches[0].clientY;
  isPulling.value = true;
};

const touchMove = (e) => {
  if (!isPulling.value) return;
  const currentY = e.touches[0].clientY;
  pullDistance.value = Math.max(0, currentY - startY.value);
  
  // 添加阻尼效果，实际下拉距离小于手指移动距离
  if (pullDistance.value > 0 && listContainer.value) {
    listContainer.value.style.transform = `translateY(${Math.min(pullDistance.value * 0.6, pullThreshold)}px)`;
  }
};

const touchEnd = () => {
  if (!isPulling.value) return;
  
  if (pullDistance.value >= pullThreshold) {
    // 触发刷新
    isRefreshing.value = true;
    
    // 模拟请求刷新数据
    setTimeout(() => {
      resetBillsList();
      isRefreshing.value = false;
      pullDistance.value = 0;
      if (listContainer.value) {
        listContainer.value.style.transform = 'translateY(0)';
      }
      isPulling.value = false;
      ElMessage.success('刷新成功');
    }, 1000);
  } else {
    // 回弹
    pullDistance.value = 0;
    if (listContainer.value) {
      listContainer.value.style.transform = 'translateY(0)';
    }
    isPulling.value = false;
  }
};

// 处理加载更多数据
const loadMoreBills = async () => {
  if (loadingMore.value || !hasMore.value) return;

  loadingMore.value = true;
  
  try {
    // 模拟API请求加载更多数据
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const nextPage = currentPage.value + 1;
    const startIndex = bills.value.length;
    const newBills = [];
    
    // 生成新的假数据
    for (let i = 0; i < pageSize.value; i++) {
      newBills.push(generateMockBill(startIndex + i + 1));
    }
    
    // 添加到现有数据中
    bills.value = [...bills.value, ...newBills];
    currentPage.value = nextPage;
    
    // 模拟数据上限，当加载到30条数据时，设置没有更多数据
    if (bills.value.length >= 30) {
      hasMore.value = false;
    }
  } catch (error) {
    console.error('加载更多账单失败:', error);
    ElMessage.error('加载更多账单失败，请稍后重试');
  } finally {
    loadingMore.value = false;
  }
};

// 监听滚动事件
const handleScroll = (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target;
  
  // 滚动到底部区域时加载更多
  if (scrollTop + clientHeight >= scrollHeight - 50 && hasMore.value && !loadingMore.value) {
    loadMoreBills();
  }
};

// 重置账单列表
const resetBillsList = () => {
  // 保留初始的4条数据
  const initialBills = bills.value.slice(0, 4);
  bills.value = initialBills;
  hasMore.value = true;
  currentPage.value = 1;
};

// 加载初始数据
const loadInitialBills = async () => {
  loading.value = true;
  
  try {
    // 模拟请求延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    loading.value = false;
  } catch (error) {
    console.error('加载账单列表失败:', error);
    ElMessage.error('加载账单列表失败，请稍后重试');
    loading.value = false;
  }
};

// 查看账单详情
const viewBillDetail = (bill) => {
  router.push(`/user/paymentDashboard/detail/${bill.billId}`);
};

// 缴费
const payBill = (bill) => {
  router.push(`/user/paymentDashboard/payment/${bill.billId}`);
};

onMounted(() => {
  loadInitialBills();
});

onUnmounted(() => {
  // 重置状态
  if (listContainer.value) {
    listContainer.value.style.transform = 'translateY(0)';
  }
});
</script>

<style scoped>
.bill-dashboard {
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.bill-dashboard.no-scroll {
  height: 100vh;
  overflow: hidden;
}

.bill-route-view {
  flex: 1;
  height: 100vh;
  overflow-y: auto;
}

.bill-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.account-summary-card {
  background-color: #fff;
  border-radius: 8px;
  margin: 0 16px 16px;
  overflow: hidden;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.summary-header {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.summary-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.summary-body {
  padding: 16px;
}

.total-amount {
  text-align: center;
  margin-bottom: 16px;
}

.total-amount .label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.total-amount .value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.unit {
  font-size: 14px;
  font-weight: normal;
  color: #909399;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat-item {
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 12px 8px;
  text-align: center;
}

.stat-value {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

/* 下拉刷新区域 */
.pull-refresh {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.pull-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  color: #909399;
  z-index: 1;
}

.pull-icon {
  margin-right: 8px;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.bill-list {
  height: 100%;
  overflow-y: auto;
  padding: 0 16px 16px;
  transition: transform 0.3s;
  background-color: #fff;
}

.bill-card {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  transition: transform 0.2s;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.bill-card:active {
  transform: scale(0.98);
}

.bill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
}

.bill-date {
  font-size: 14px;
  color: #606266;
}

.bill-body {
  padding: 16px;
}

.bill-amount {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
}

.bill-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
}

.info-item .label {
  width: 80px;
  color: #909399;
  font-size: 14px;
}

.info-item .value {
  flex: 1;
  color: #606266;
  font-size: 14px;
}

.overdue-soon {
  color: #E6A23C;
}

.bill-footer {
  padding: 0 16px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.loading-container,
.empty-container {
  padding: 20px 0;
  display: flex;
  justify-content: center;
}

.load-more {
  text-align: center;
  padding: 16px 0;
  color: #909399;
  font-size: 14px;
}

.load-more p {
  margin: 0;
}

.no-more {
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 16px 0;
}
</style> 