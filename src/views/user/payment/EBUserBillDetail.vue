<template>
  <div class="bill-detail-page">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="back-button" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <div class="actions">
        <el-button 
          v-if="billDetail.status === '已缴费'" 
          type="primary" 
          size="small" 
          plain 
          @click="downloadReceipt"
          :loading="downloadLoading"
        >
          <el-icon><Download /></el-icon>
          电子收据
        </el-button>
      </div>
    </div>

    <!-- 付款状态卡片 -->
    <div class="status-card" v-loading="loading">
      <div class="status-icon" :class="getStatusClass(billDetail.status)">
        <el-icon v-if="billDetail.status === '已缴费'"><CircleCheckFilled /></el-icon>
        <el-icon v-else-if="billDetail.status === '逾期'"><WarnTriangleFilled /></el-icon>
        <el-icon v-else><Clock /></el-icon>
      </div>
      <div class="status-content">
        <div class="status-title">{{ getStatusTitle(billDetail.status) }}</div>
        <div class="status-message">{{ getStatusMessage(billDetail.status) }}</div>
      </div>
    </div>

    <!-- 账单金额 -->
    <div class="amount-card">
      <div class="amount-title">账单金额</div>
      <div class="amount-value">{{ billDetail.amount }} <span class="unit">元</span></div>
      
      <div class="bill-actions" v-if="billDetail.status === '未缴费'">
        <el-button type="primary" @click="payBill" size="large" block>立即缴费</el-button>
      </div>
    </div>

    <!-- 账单详情 -->
    <div class="detail-card">
      <div class="card-title">账单详情</div>
      <div class="info-list">
        <div class="info-item">
          <span class="label">账单编号</span>
          <span class="value">{{ billDetail.billId }}</span>
        </div>
        <div class="info-item">
          <span class="label">账单周期</span>
          <span class="value">{{ billDetail.billPeriod }}</span>
        </div>
        <div class="info-item">
          <span class="label">用电量</span>
          <span class="value">{{ billDetail.usage }} 度</span>
        </div>
        <div class="info-item">
          <span class="label">电表起数</span>
          <span class="value">{{ billDetail.startReading }} 度</span>
        </div>
        <div class="info-item">
          <span class="label">电表止数</span>
          <span class="value">{{ billDetail.endReading }} 度</span>
        </div>
        <div class="info-item">
          <span class="label">电表编号</span>
          <span class="value">{{ billDetail.meterId }}</span>
        </div>
        <div class="info-item">
          <span class="label">生成日期</span>
          <span class="value">{{ formatDate(billDetail.billDate) }}</span>
        </div>
        <div class="info-item" v-if="billDetail.status === '未缴费'">
          <span class="label">截止日期</span>
          <span class="value" :class="{'overdue-soon': isOverdueSoon(billDetail.dueDate)}">
            {{ formatDate(billDetail.dueDate) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 计费明细 -->
    <div class="detail-card">
      <div class="card-title">计费明细</div>
      <div class="bill-breakdown">
        <div 
          v-for="(item, index) in billDetail.billDetails" 
          :key="index"
          class="breakdown-item"
        >
          <span class="item-name">{{ item.name }}</span>
          <span class="item-value">{{ item.value }}</span>
        </div>
        <div class="breakdown-total">
          <span class="total-label">合计金额</span>
          <span class="total-value">{{ billDetail.amount }} 元</span>
        </div>
      </div>
    </div>

    <!-- 缴费信息 (仅当已缴费时显示) -->
    <div class="detail-card" v-if="billDetail.status === '已缴费'">
      <div class="card-title">缴费信息</div>
      <div class="info-list">
        <div class="info-item">
          <span class="label">缴费日期</span>
          <span class="value">{{ formatDate(billDetail.paymentDate) }}</span>
        </div>
        <div class="info-item">
          <span class="label">缴费方式</span>
          <span class="value">{{ billDetail.paymentMethod }}</span>
        </div>
        <div class="info-item">
          <span class="label">交易流水</span>
          <span class="value">{{ billDetail.transactionId || '--' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { 
  ArrowLeft, 
  Download, 
  CircleCheckFilled, 
  WarnTriangleFilled, 
  Clock
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const downloadLoading = ref(false);
const billId = computed(() => route.params.id);

// 模拟账单详情
const billDetail = ref({
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
  transactionId: null,
  startReading: 3250.5,
  endReading: 3402.7,
  billPeriod: '2023-02-15 至 2023-03-15',
  billDetails: [
    { name: '基本电费', value: '10.00 元' },
    { name: '平段电量', value: '32.5 度' },
    { name: '平段电费', value: '19.50 元' },
    { name: '峰段电量', value: '89.3 度' },
    { name: '峰段电费', value: '62.51 元' },
    { name: '谷段电量', value: '30.4 度' },
    { name: '谷段电费', value: '6.92 元' }
  ]
});

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
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

// 获取状态样式类
const getStatusClass = (status) => {
  switch(status) {
    case '已缴费': return 'status-paid';
    case '未缴费': return 'status-unpaid';
    case '逾期': return 'status-overdue';
    default: return '';
  }
};

// 获取状态标题
const getStatusTitle = (status) => {
  switch(status) {
    case '已缴费': return '已完成缴费';
    case '未缴费': return '等待缴费';
    case '逾期': return '已逾期';
    default: return '未知状态';
  }
};

// 获取状态信息提示
const getStatusMessage = (status) => {
  switch(status) {
    case '已缴费': return '您已成功缴纳电费，感谢您的支付';
    case '未缴费': return '请在截止日期前完成缴费，避免影响用电';
    case '逾期': return '您的账单已逾期，请尽快缴纳';
    default: return '';
  }
};

// 下载电子收据
const downloadReceipt = () => {
  if (billDetail.value.status !== '已缴费') {
    ElMessage.warning('只有已缴费的账单才能下载电子收据');
    return;
  }
  
  downloadLoading.value = true;
  
  // 模拟下载过程
  setTimeout(() => {
    ElMessage.success('电子收据下载成功');
    downloadLoading.value = false;
  }, 1000);
};

// 缴费
const payBill = () => {
  if (billDetail.value.status === '已缴费') {
    ElMessage.warning('该账单已完成缴费');
    return;
  }
  
  router.push(`/user/paymentDashboard/payment/${billDetail.value.billId}`);
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 获取账单详情
const fetchBillDetail = async () => {
  loading.value = true;
  
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 假设我们已经有了账单ID，这里根据ID确定模拟数据的状态
    if (billId.value === 'B20230215002') {
      // 已缴费状态的账单
      billDetail.value = {
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
        transactionId: 'TX20230220125489',
        startReading: 3118.7,
        endReading: 3250.5,
        billPeriod: '2023-01-15 至 2023-02-15',
        billDetails: [
          { name: '基本电费', value: '10.00 元' },
          { name: '平段电量', value: '28.6 度' },
          { name: '平段电费', value: '17.16 元' },
          { name: '峰段电量', value: '76.5 度' },
          { name: '峰段电费', value: '53.55 元' },
          { name: '谷段电量', value: '26.7 度' },
          { name: '谷段电费', value: '4.94 元' }
        ]
      };
    }
    
  } catch (error) {
    console.error('获取账单详情失败:', error);
    ElMessage.error('获取账单详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchBillDetail();
});
</script>

<style scoped>
.bill-detail-page {
  width: 100%;
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #fff;
}

.back-button {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
}

.back-button .el-icon {
  margin-right: 4px;
}

.status-card {
  display: flex;
  padding: 20px 16px;
  background-color: #fff;
  margin-bottom: 12px;
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  font-size: 28px;
}

.status-icon.status-paid {
  background-color: #f0f9eb;
  color: #67C23A;
}

.status-icon.status-unpaid {
  background-color: #f4f4f5;
  color: #909399;
}

.status-icon.status-overdue {
  background-color: #fef0f0;
  color: #F56C6C;
}

.status-content {
  flex: 1;
}

.status-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.status-message {
  font-size: 14px;
  color: #909399;
}

.amount-card {
  padding: 16px;
  background-color: #fff;
  margin-bottom: 12px;
}

.amount-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.amount-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 16px;
}

.unit {
  font-size: 14px;
  font-weight: normal;
  color: #909399;
}

.bill-actions {
  margin-top: 16px;
}

.detail-card {
  background-color: #fff;
  margin-bottom: 12px;
  padding: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f2f5;
  padding-bottom: 12px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
}

.label {
  color: #909399;
  font-size: 14px;
}

.value {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.overdue-soon {
  color: #E6A23C;
}

.bill-breakdown {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.item-name {
  color: #909399;
}

.item-value {
  color: #606266;
  font-weight: 500;
}

.breakdown-total {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #ebeef5;
}

.total-label {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.total-value {
  font-size: 16px;
  font-weight: bold;
  color: #F56C6C;
}
</style> 