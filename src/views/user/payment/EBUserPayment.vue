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
          确认支付 (支付宝)
        </el-button>
        <div class="payment-tips">
          点击确认支付，表示您同意 <span class="link">《电费缴纳服务协议》</span>
        </div>
      </div>
    </div>

    <!-- 支付结果对话框 -->
    <el-dialog
      v-model="paymentStatusDialogVisible"
      title="支付宝支付状态"
      width="85%"
      :show-close="paymentStatusState !== 'waiting' && paymentStatusState !== 'loading'" 
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="handleStatusDialogClose" 
    >
      <div class="status-dialog-content">

        <!-- Loading state -->
        <div v-if="paymentStatusState === 'loading'" class="status-icon waiting">
           <el-icon><Loading /></el-icon>
        </div>

        <!-- Waiting for Scan state -->
        <div v-if="paymentStatusState === 'waiting'">
          <div class="qr-code-container">
            <qrcode-vue :value="qrCodeUrl" :size="180" level="H" />
          </div>
        </div>

        <!-- Success state -->
         <div v-if="paymentStatusState === 'success'" class="status-icon success">
           <el-icon><CircleCheckFilled /></el-icon>
         </div>

         <!-- Failed state -->
         <div v-if="paymentStatusState === 'failed'" class="status-icon failed">
           <el-icon><CircleCloseFilled /></el-icon>
         </div>

        <div class="status-message">{{ paymentResultMessage }}</div>

         <!-- Show details only on final success state -->
         <div class="final-result-details" v-if="paymentStatusState === 'success'">
            <div class="final-result-item">
              <span class="label">交易金额</span>
              <span class="value">{{ billInfo.amount }} 元</span>
            </div>
            <div class="final-result-item">
              <span class="label">交易时间</span>
              <span class="value">{{ paymentTimestamp }}</span>
            </div>
            <div class="final-result-item">
              <span class="label">支付方式</span>
              <span class="value">支付宝</span>
            </div>
            <div class="final-result-item">
              <span class="label">交易单号</span>
              <span class="value">{{ currentTransactionId }}</span>
            </div>
         </div>

      </div>
      <template #footer v-if="paymentStatusState === 'failed' || paymentStatusState === 'expired'">
        <span class="dialog-footer">
          <el-button @click="paymentStatusDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="processPayment">重新支付</el-button>
        </span>
      </template>
        <template #footer v-else-if="paymentStatusState === 'success'">
         <span class="dialog-footer">
            <el-button type="primary" @click="handleStatusDialogClose">完成</el-button>
         </span>
      </template>
      <!-- No footer buttons while loading or waiting -->
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElDialog } from 'element-plus';
import { 
  ArrowLeft, 
  CircleCheckFilled, 
  CircleCloseFilled,
  Loading // Import Loading icon
} from '@element-plus/icons-vue';
import QrcodeVue from 'qrcode.vue'; // <-- 1. Import QR Code library
import { getBillDetail, createPayment, queryPaymentStatus } from '@/api/user/bill'; 

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const paymentLoading = ref(false);
const billId = computed(() => route.params.id);

// Initialize billInfo with default structure
const billInfo = ref({
  billId: billId.value,
  amount: 0.00,
  usage: 0,
  billPeriod: '--',
  dueDate: null,
  status: '未知' // Add status to check if payment is possible
});

// Payment methods (Keep as static or fetch from API)
const paymentMethods = ref([
  // Keep only Alipay for testing, or keep others if needed
  { id: 'alipay', name: '支付宝', description: '推荐使用支付宝支付', icon: 'https://img.icons8.com/color/48/000000/alipay.png' }
  // { id: 'wechat', name: '微信支付', description: '便捷、安全的支付方式', icon: 'https://img.icons8.com/color/48/000000/wechat.png' },
  // { id: 'unionpay', name: '银联支付', description: '中国银联官方支付服务', icon: 'https://img.icons8.com/color/48/000000/unionpay.png' }
]);
const selectedMethod = ref('alipay'); // <-- Default to Alipay

// Payment result state
const paymentStatusDialogVisible = ref(false); // Dialog for QR code and status
const paymentStatusState = ref('loading'); // 'loading', 'waiting', 'success', 'failed', 'expired'
const qrCodeUrl = ref('');
const currentTransactionId = ref('');
const paymentResultMessage = ref('');
const paymentTimestamp = ref('');

// Polling and WebSocket state
const pollingIntervalId = ref(null);
const websocket = ref(null);
const webSocketConnected = ref(false);
const pollingInterval = 5000; // Poll every 5 seconds

// Computed property to check if payment can be initiated
const canPay = computed(() => {
  return selectedMethod.value === 'alipay' && billInfo.value.status === '未支付' && !paymentLoading.value;
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
  //查询账单是否可以支付
  if (!canPay.value) {
    if (!selectedMethod.value) {
       ElMessage.warning('请选择支付方式');
    } else if (billInfo.value.status !== '未支付') {
       ElMessage.warning('该账单无法支付');
    }
    return;
  }
  // 创建支付订单
  paymentLoading.value = true;
  paymentStatusState.value = 'loading';
  paymentResultMessage.value = '正在创建支付订单...';
  qrCodeUrl.value = '';
  currentTransactionId.value = '';
  paymentStatusDialogVisible.value = true; 
  clearStatusCheckers(); 

  try {
    console.log(`Creating payment for billId: ${route.params.id}`);
    const response = await createPayment(route.params.id);

      
    if (response) {
      qrCodeUrl.value = response.qrCode;
      currentTransactionId.value = response.orderNo;
      paymentStatusState.value = 'waiting'; 
      paymentResultMessage.value = '请使用支付宝扫描二维码完成支付';
      
      startPollingPaymentStatus(currentTransactionId.value); 
      connectWebSocket(currentTransactionId.value); 
    }  else {
      paymentStatusState.value = 'failed';
      paymentResultMessage.value = response?.message || '创建支付订单失败，请重试';
      console.error('Create payment failed:', response);
    }

  } catch (error) {
    console.error('支付处理失败:', error);
    paymentStatusState.value = 'failed';
    paymentResultMessage.value = error.message || '支付处理异常，请稍后重试';
  } finally {
    paymentLoading.value = false; 
  }
};

const startPollingPaymentStatus = (txId) => {
  if (pollingIntervalId.value) {
    clearInterval(pollingIntervalId.value);
  }

  pollingIntervalId.value = setInterval(async () => {
    if (!currentTransactionId.value || paymentStatusState.value === 'success' || paymentStatusState.value === 'failed') {
      clearStatusCheckers(); 
      return;
    }
    try {
      console.log(`Polling status for ${txId}...`);
      const response = await queryPaymentStatus(txId);
      if (response.data) {
        handlePaymentStatusUpdate(response.data);
      }
    } catch (error) {
      console.error('轮询支付状态失败:', error);
    }
  }, pollingInterval);
};

const connectWebSocket = (txId) => {
  if (websocket.value || !txId) {
    return; 
  }
  
  const wsUrl = `ws://${window.location.host}/ws/payStatus`; 
  console.log(`Connecting to WebSocket: ${wsUrl}`);

  try {
    websocket.value = new WebSocket(wsUrl);

    websocket.value.onopen = () => {
      console.log('WebSocket connected');
      webSocketConnected.value = true;
      websocket.value.send(JSON.stringify({ transactionId: txId }));
    };

    websocket.value.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);
        console.log('WebSocket message received:', messageData);
        if (messageData.transactionId === currentTransactionId.value) {
             handlePaymentStatusUpdate(messageData); 
        }
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
      }
    };

    websocket.value.onerror = (error) => {
      console.error('WebSocket error:', error);
      webSocketConnected.value = false;
    };

    websocket.value.onclose = () => {
      console.log('WebSocket disconnected');
      webSocketConnected.value = false;
      websocket.value = null;
    };
  } catch (error) {
     console.error('Failed to create WebSocket:', error);
  }
};

const handlePaymentStatusUpdate = (statusData) => {
    if (statusData.status === 'PAID') {
        paymentStatusState.value = 'success';
        paymentResultMessage.value = statusData.message || '支付成功！';
        paymentTimestamp.value = statusData.timestamp ? new Date(statusData.timestamp).toLocaleString('zh-CN') : new Date().toLocaleString('zh-CN');
        clearStatusCheckers(); 
    } else if (statusData.status === 'FAILED' || statusData.status === 'EXPIRED') {
        paymentStatusState.value = 'failed';
        paymentResultMessage.value = statusData.message || '支付失败或已过期';
        clearStatusCheckers(); 
    } else {
        // Still pending, do nothing, let polling/WS continue
    }
}

const clearStatusCheckers = () => {
  if (pollingIntervalId.value) {
    clearInterval(pollingIntervalId.value);
    pollingIntervalId.value = null;
  }
  if (websocket.value) {
    websocket.value.close();
    websocket.value = null; 
  }
};

const handleStatusDialogClose = (done) => {
    clearStatusCheckers();
    if (paymentStatusState.value === 'success') {
        router.push(`/user/paymentDashboard/detail/${route.params.id}`);
    }
     paymentStatusDialogVisible.value = false; 
};

// 返回
const goBack = () => {
  router.back();
};

// 获取账单信息
const fetchBillInfo = async () => {
  if (!billId.value) {
    ElMessage.error('无效的账单 ID');
    loading.value = false;
    return;
  }
  loading.value = true;
  
  try {
    const response = await getBillDetail(route.params.id); 
    
    if (response) {
      billInfo.value = {
        billId: route.params.id,
        amount: response.amount,
        usage: response.usage,
        billPeriod: response.billPeriod,
        dueDate: response.dueDate,
        status: response.status // Important to get current status
      };
      
      if (billInfo.value.status !== '未支付') {
          ElMessage.warning('该账单当前状态无法支付');
      }
    } else {
      ElMessage.error('获取账单信息失败，请稍后重试');
      router.back();
    }
  } catch (error) {
    console.error('获取账单信息失败:', error);
    ElMessage.error('获取账单信息失败，请稍后重试');
     // Handle error, maybe navigate back
     // router.back();
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  //查询支付状态
  const paymentStatus = await queryPaymentStatus(route.params.id);
  console.log(`paymentStatus: ${paymentStatus}`);
  if (paymentStatus === 'TRADE_SUCCESS') {
    ElMessage.warning('该账单已支付');
    //跳转账单主页
    router.push('/user/paymentDashboard');
    return;
  }
  await fetchBillInfo();

});

onUnmounted(() => {
  clearStatusCheckers(); // Clean up on component destroy
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

/* Styles for QR Code Dialog */
.status-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.qr-code-container {
  margin: 15px 0;
  padding: 10px;
  border: 1px solid #eee;
  display: inline-block;
}

.status-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
.status-icon.success { color: #67C23A; }
.status-icon.failed { color: #F56C6C; }
.status-icon.waiting .el-icon {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.status-message {
  font-size: 16px;
  color: #606266;
  margin-top: 10px;
}

.final-result-details {
  margin-top: 20px;
  width: 100%;
  text-align: left;
  font-size: 14px;
}
.final-result-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.final-result-item .label { color: #909399; }
.final-result-item .value { color: #606266; font-weight: 500; }

</style> 