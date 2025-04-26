<template>
  <div class="payment-page">
    <!-- 顶部导航栏 -->
    <div class="action-header">
      <div class="back-button" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <div class="page-title">缴费支付</div>
      <div class="placeholder"></div>
    </div>

    <!-- 支付主体内容 -->
    <div class="payment-container" v-loading="loading">
      <!-- 支付金额卡片 -->
      <div class="amount-card">
        <div class="amount-label">缴费金额</div>
        <div class="amount-value">{{ billInfo.amount }} <span class="unit">元</span></div>
        <div class="bill-info">
          <div class="bill-item">
            <span class="label">账单编号：</span>
            <span class="value">{{ billInfo.billId }}</span>
          </div>
          <div class="bill-item">
            <span class="label">账单周期：</span>
            <span class="value">{{ billInfo.billPeriod }}</span>
          </div>
          <div class="bill-item">
            <span class="label">用电量：</span>
            <span class="value">{{ billInfo.usage }} 度</span>
          </div>
        </div>
      </div>

      <!-- 支付方式选择 -->
      <div class="payment-method-card">
        <div class="card-title">选择支付方式</div>
        <div class="payment-methods">
          <div 
            v-for="method in paymentMethods" 
            :key="method.id"
            class="method-item"
            :class="{ 'selected': selectedMethod === method.id }"
            @click="selectPaymentMethod(method.id)"
          >
            <div class="method-icon">
              <img :src="method.icon" :alt="method.name">
            </div>
            <div class="method-info">
              <div class="method-name">{{ method.name }}</div>
              <div class="method-desc">{{ method.description }}</div>
            </div>
            <div class="method-select">
              <el-icon v-if="selectedMethod === method.id"><CircleCheckFilled /></el-icon>
              <div v-else class="unchecked-circle"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 应付金额 -->
      <div class="total-amount-card">
        <div class="total-row">
          <span class="total-label">账单金额</span>
          <span class="total-value">{{ billInfo.amount }} 元</span>
        </div>
        <div class="total-divider"></div>
        <div class="total-row final">
          <span class="total-label">应付金额</span>
          <span class="total-value">{{ billInfo.amount }} 元</span>
        </div>
      </div>

      <!-- 支付按钮 -->
      <div class="payment-action">
        <el-button 
          type="primary" 
          size="large" 
          :loading="paymentLoading"
          :disabled="!canPay"
          @click="processPayment"
          block
        >
          确认支付
        </el-button>
        <div class="payment-tips">
          点击确认支付，表示您同意 <span class="link">《电费缴纳服务协议》</span>
        </div>
      </div>
    </div>

    <!-- 支付结果对话框 -->
    <el-dialog
      v-model="paymentResultVisible"
      :title="paymentSuccess ? '支付成功' : '支付失败'"
      width="80%"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="result-content">
        <div class="result-icon" :class="paymentSuccess ? 'success' : 'failed'">
          <el-icon v-if="paymentSuccess"><CircleCheckFilled /></el-icon>
          <el-icon v-else><CircleCloseFilled /></el-icon>
        </div>
        <div class="result-message">
          {{ paymentSuccess ? '电费缴纳成功！' : '支付失败，请重试' }}
        </div>
        <div class="result-details" v-if="paymentSuccess">
          <div class="result-item">
            <span class="label">交易金额</span>
            <span class="value">{{ billInfo.amount }} 元</span>
          </div>
          <div class="result-item">
            <span class="label">交易时间</span>
            <span class="value">{{ new Date().toLocaleString('zh-CN') }}</span>
          </div>
          <div class="result-item">
            <span class="label">支付方式</span>
            <span class="value">{{ getPaymentMethodName(selectedMethod) }}</span>
          </div>
          <div class="result-item">
            <span class="label">交易单号</span>
            <span class="value">{{ transactionId }}</span>
          </div>
        </div>
      </div>
      <div class="result-actions">
        <el-button v-if="!paymentSuccess" @click="paymentResultVisible = false">重新支付</el-button>
        <el-button type="primary" @click="handleResultConfirm">{{ paymentSuccess ? '完成' : '返回' }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { 
  ArrowLeft, 
  CircleCheckFilled, 
  CircleCloseFilled 
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const paymentLoading = ref(false);
const billId = computed(() => route.params.id);

// 账单信息
const billInfo = ref({
  billId: 'B20230315001',
  amount: 98.93,
  usage: 152.2,
  billPeriod: '2023-02-15 至 2023-03-15',
  dueDate: '2023-03-31'
});

// 支付方式
const paymentMethods = ref([
  {
    id: 'wechat',
    name: '微信支付',
    description: '便捷、安全的支付方式',
    icon: 'https://img.icons8.com/color/48/000000/wechat.png'
  },
  {
    id: 'alipay',
    name: '支付宝',
    description: '全球领先的支付宝平台',
    icon: 'https://img.icons8.com/color/48/000000/alipay.png'
  },
  {
    id: 'unionpay',
    name: '银联支付',
    description: '中国银联官方支付服务',
    icon: 'https://img.icons8.com/color/48/000000/unionpay.png'
  }
]);
const selectedMethod = ref('wechat');

// 支付结果
const paymentResultVisible = ref(false);
const paymentSuccess = ref(false);
const transactionId = ref('');

// 是否可以支付
const canPay = computed(() => {
  return selectedMethod.value;
});

// 选择支付方式
const selectPaymentMethod = (methodId) => {
  selectedMethod.value = methodId;
};

// 获取支付方式名称
const getPaymentMethodName = (methodId) => {
  const method = paymentMethods.value.find(m => m.id === methodId);
  return method ? method.name : '';
};

// 处理支付
const processPayment = async () => {
  if (!canPay.value) {
    ElMessage.warning('请选择支付方式');
    return;
  }

  paymentLoading.value = true;

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 生成随机交易号
    transactionId.value = 'TX' + Date.now() + Math.floor(Math.random() * 1000);
    
    // 模拟成功率 90%
    const isSuccess = Math.random() < 0.9;
    
    if (isSuccess) {
      paymentSuccess.value = true;
    } else {
      paymentSuccess.value = false;
    }
    
    paymentResultVisible.value = true;
  } catch (error) {
    console.error('支付处理失败:', error);
    ElMessage.error('支付处理失败，请稍后重试');
    paymentSuccess.value = false;
  } finally {
    paymentLoading.value = false;
  }
};

// 处理结果确认
const handleResultConfirm = () => {
  paymentResultVisible.value = false;
  
  if (paymentSuccess.value) {
    // 支付成功后跳转到账单详情页
    router.push(`/user/paymentDashboard/detail/${billInfo.value.billId}`);
  }
};

// 返回
const goBack = () => {
  router.back();
};

// 获取账单信息
const fetchBillInfo = async () => {
  loading.value = true;
  
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 假数据，实际项目中应该从API获取
    if (billId.value === 'B20230215002') {
      billInfo.value = {
        billId: 'B20230215002',
        amount: 85.65,
        usage: 131.8,
        billPeriod: '2023-01-15 至 2023-02-15',
        dueDate: '2023-02-28'
      };
    }
  } catch (error) {
    console.error('获取账单信息失败:', error);
    ElMessage.error('获取账单信息失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchBillInfo();
});
</script>

<style scoped>
.payment-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  min-height: 100vh;
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

.page-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.placeholder {
  width: 24px;
}

.payment-container {
  padding: 16px;
}

.amount-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  text-align: center;
}

.amount-label {
  font-size: 16px;
  color: #606266;
  margin-bottom: 12px;
}

.amount-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 16px;
}

.unit {
  font-size: 16px;
  font-weight: normal;
  color: #909399;
}

.bill-info {
  border-top: 1px dashed #ebeef5;
  padding-top: 16px;
  text-align: left;
}

.bill-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.bill-item .label {
  color: #909399;
}

.bill-item .value {
  color: #606266;
  font-weight: 500;
}

.payment-method-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 16px;
  font-weight: 500;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.method-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s;
}

.method-item:hover {
  border-color: #c6e2ff;
  background-color: #f5faff;
}

.method-item.selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.method-icon {
  width: 36px;
  height: 36px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.method-icon img {
  max-width: 100%;
  max-height: 100%;
}

.method-info {
  flex: 1;
}

.method-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.method-desc {
  font-size: 12px;
  color: #909399;
}

.method-select {
  color: #409eff;
  font-size: 20px;
}

.unchecked-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #dcdfe6;
}

.total-amount-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.total-label {
  color: #606266;
}

.total-value {
  color: #303133;
  font-weight: 500;
}

.total-divider {
  height: 1px;
  background-color: #ebeef5;
  margin: 12px 0;
}

.total-row.final {
  font-size: 16px;
}

.total-row.final .total-value {
  color: #f56c6c;
  font-weight: bold;
}

.payment-action {
  margin-top: 24px;
}

.payment-tips {
  margin-top: 12px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.link {
  color: #409eff;
  cursor: pointer;
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.result-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  margin-bottom: 16px;
}

.result-icon.success {
  background-color: #f0f9eb;
  color: #67c23a;
}

.result-icon.failed {
  background-color: #fef0f0;
  color: #f56c6c;
}

.result-message {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 20px;
}

.result-details {
  width: 100%;
  border-top: 1px dashed #ebeef5;
  padding-top: 16px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}
</style> 