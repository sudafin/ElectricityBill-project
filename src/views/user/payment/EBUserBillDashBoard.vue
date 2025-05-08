<template>
  <div class="bill-dashboard" :class="{'no-scroll': $route.path === '/user/paymentDashboard'}">
    <!-- 子路由视图 -->
    <router-view v-if="$route.path !== '/user/paymentDashboard'" class="bill-route-view"></router-view>

    <!-- 当不在子路由页面时显示的内容 -->
    <div v-else class="bill-content">
      <!-- 顶部卡片 -->
      <div class="account-summary-card" v-loading="overviewLoading">
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
          v-loading="billListLoading || (loading && !isRefreshing && !loadingMore)"
          @scroll="handleScroll"
          ref="listContainer"
        >
          <div v-if="billListLoading || (loading && !isRefreshing && !loadingMore)" class="loading-container">
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
                  <div class="info-item" v-if="bill.status === '未支付'">
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
                  v-if="bill.status === '未支付'" 
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElSkeleton } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import { getBillOverview, getBillList } from '@/api/user/bill';

const router = useRouter();
const loading = ref(true);
const loadingMore = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);
const bills = ref([]);

// 添加独立的加载状态
const overviewLoading = ref(false);
const billListLoading = ref(false);

// Overview data state
const overviewData = reactive({
  totalPayment: '0.00',
  totalBills: 0,
  unpaidBills: 0,
  avgMonthlyPayment: '0.00'
});

// 下拉刷新相关
const isRefreshing = ref(false);
const isPulling = ref(false);
const startY = ref(0);
const pullDistance = ref(0);
const pullThreshold = 60;
const listContainer = ref(null);

// 计算统计数据
const totalBills = computed(() => overviewData.totalBills);
const unpaidBills = computed(() => overviewData.unpaidBills);
const totalPayment = computed(() => overviewData.totalPayment);
const avgMonthlyPayment = computed(() => overviewData.avgMonthlyPayment);

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
    case '已支付':
      return 'success';
    case '未支付':
      return 'warning';
    case '已过期':
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
    // Trigger refresh via resetBillsList
    resetBillsList(); 
    // Resetting animation state is handled within resetBillsList's finally block
  } else {
    // Rebound animation
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
  currentPage.value++; // 增加页码
  console.log(`加载更多账单，当前页码: ${currentPage.value}`);

  try {
    await fetchBillListPage(currentPage.value);
  } catch (error) {
    console.error('加载更多账单失败:', error);
    ElMessage.error('加载更多账单失败，请稍后重试');
    currentPage.value--; // 出错时回退页码
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
const resetBillsList = async () => {
  currentPage.value = 1;
  hasMore.value = true;
  bills.value = []; // Clear existing list
  isRefreshing.value = true;

  try {
    // 分别获取概览和第一页数据
    await fetchOverview();
    await fetchBillListPage(1);
    ElMessage.success('刷新成功');
  } catch (error) {
    console.error('刷新账单数据失败:', error);
    ElMessage.error('刷新失败，请稍后重试');
  } finally {
    loading.value = false;
    isRefreshing.value = false;
    if (listContainer.value) {
      listContainer.value.style.transform = 'translateY(0)';
    }
    isPulling.value = false;
    pullDistance.value = 0;
  }
};

// 获取特定页码的账单列表
const fetchBillListPage = async (page) => {
  if (page === 1) {
    billListLoading.value = true;
  }
  
  try {
    const response = await getBillList({ 
      pageNo: page, 
      pageSize: pageSize.value 
    });

    // 获取账单列表数据
    let billList = [];
    let totalPages = 1;

    if (response?.data?.list) {
      billList = response.data.list;
      totalPages = response.data.pages || 1;
    } else if (response?.list) {
      billList = response.list; 
      totalPages = response.pages || 1;
    } else if (Array.isArray(response)) {
      billList = response;
    }

    // 处理账单数据
    const mappedBills = billList.map(bill => ({
      billId: bill.billId,
      amount: bill.amount || (bill.usage * 0.4).toFixed(2),
      usage: bill.usage || 0,
      status: bill.status || '未支付',
      dueDate: bill.dueDate || null,
      paymentDate: bill.paymentDate || null,
      billDate: bill.createdAt || bill.createTime || bill.dueDate || new Date().toISOString()
    }));
  
    // 更新账单列表
    if (page === 1) {
      bills.value = mappedBills;
    } else {
      bills.value = [...bills.value, ...mappedBills];
    }

    hasMore.value = page < totalPages;

  } catch (error) {
    console.error('加载账单列表失败:', error);
    if (page === 1) bills.value = [];
    hasMore.value = false;
    throw error;
  } finally {
    if (page === 1) {
      billListLoading.value = false;
    }
  }
}

// 获取账单概览
const fetchOverview = async () => {
  overviewLoading.value = true;
  
  try {
    console.log('获取账单概览...');
    const response = await getBillOverview();
    console.log('账单概览响应:', JSON.stringify(response));
    
    // 直接处理响应数据，不检查code字段
    if (response) {
      // 如果响应中有data字段，使用data字段
      const data = response.data || response;
      
      // 更新概览数据
      Object.assign(overviewData, {
        totalPayment: data.totalPayment || '0.00',
        totalBills: data.totalBills || parseInt(data.total) || 0,
        unpaidBills: data.unpaidBills || (bills.value.filter(bill => 
          bill.status === '未支付').length) || 0,
        avgMonthlyPayment: data.avgMonthlyPayment || '0.00'
      });
      
      console.log('账单概览数据加载成功:', JSON.stringify(overviewData));
    } else {
      console.error('获取账单概览响应异常:', response);
      // 重置为默认值
      Object.assign(overviewData, { totalPayment: '0.00', totalBills: 0, unpaidBills: 0, avgMonthlyPayment: '0.00' });
    }
  } catch (error) {
    console.error('获取账单概览失败:', error);
    // 重置为默认值
    Object.assign(overviewData, { totalPayment: '0.00', totalBills: 0, unpaidBills: 0, avgMonthlyPayment: '0.00' });
    throw error; // 重新抛出异常，由Promise.all处理
  } finally {
    overviewLoading.value = false;
  }
};

// 加载初始数据
const loadInitialData = async () => {
  loading.value = true;
  
  try {
    // 顺序加载数据，避免使用Promise.all
    await fetchOverview();
    await fetchBillListPage(1);
    console.log('初始数据加载完成');
  } catch (error) {
    console.error('加载初始数据失败:', error);
    ElMessage.error('加载账单数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 查看账单详情
const viewBillDetail = (bill) => {
  router.push(`/user/bill/detail/${bill.billId}`);
};

// 缴费
const payBill = (bill) => {
  router.push(`/user/payment/${bill.billId}`);
};

onMounted(() => {
  loadInitialData();
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