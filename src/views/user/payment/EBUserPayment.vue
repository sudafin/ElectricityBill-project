<template>
  <EBPageLayout>
    <template #header>
      <div class="eb-payment-header">
        <!-- 移除标题元素 -->
      </div>
    </template>

    <div class="payment-container">
      <!-- 电费账单卡片 -->
      <el-card class="bill-card">
        <template #header>
          <div class="card-header">
            <h3>当前电费账单</h3>
            <el-tag v-if="currentBill.status === '待缴费'" type="danger">{{ currentBill.status }}</el-tag>
            <el-tag v-else-if="currentBill.status === '已缴费'" type="success">{{ currentBill.status }}</el-tag>
          </div>
        </template>
        <div class="bill-content">
          <div class="bill-info">
            <div class="info-item">
              <span class="info-label">账单编号:</span>
              <span class="info-value">{{ currentBill.billNo }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">账单周期:</span>
              <span class="info-value">{{ currentBill.billPeriod }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">用电量:</span>
              <span class="info-value">{{ currentBill.usage }} 度</span>
            </div>
            <div class="info-item">
              <span class="info-label">应缴金额:</span>
              <span class="info-value amount">{{ currentBill.amount }} 元</span>
            </div>
            <div class="info-item">
              <span class="info-label">截止日期:</span>
              <span class="info-value" :class="{ 'due-soon': isDueSoon }">{{ currentBill.dueDate }}</span>
            </div>
          </div>
          <div class="bill-details">
            <el-collapse>
              <el-collapse-item title="账单明细">
                <div class="details-content">
                  <div class="details-item" v-for="(item, index) in currentBill.details" :key="index">
                    <span class="details-label">{{ item.label }}:</span>
                    <span class="details-value">{{ item.value }}</span>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </el-card>

      <!-- 缴费方式选择 -->
      <el-card class="payment-method-card" v-if="currentBill.status === '待缴费'">
        <template #header>
          <div class="card-header">
            <h3>选择缴费方式</h3>
          </div>
        </template>
        <div class="payment-method-content">
          <el-tabs v-model="paymentMethod">
            <el-tab-pane label="余额支付" name="balance">
              <div class="balance-payment">
                <div class="balance-info">
                  <span class="balance-label">当前余额:</span>
                  <span class="balance-value" :class="{ 'balance-insufficient': balanceInsufficient }">
                    {{ balance }} 元
                  </span>
                  <span v-if="balanceInsufficient" class="balance-tip">余额不足，请先充值</span>
                </div>
                <EBButton 
                  type="primary" 
                  class="payment-button" 
                  :disabled="balanceInsufficient"
                  @click="handlePayWithBalance"
                >
                  余额支付
                </EBButton>
              </div>
            </el-tab-pane>
            <el-tab-pane label="微信支付" name="wechat">
              <div class="qrcode-payment">
                <div class="qrcode-container">
                  <div class="qrcode-placeholder">
                    <el-icon :size="100"><Money /></el-icon>
                    <p>微信支付二维码</p>
                  </div>
                </div>
                <div class="qrcode-tips">
                  <p>请使用微信扫描二维码完成支付</p>
                  <p>支付金额: <span class="amount">{{ currentBill.amount }} 元</span></p>
                </div>
                <EBButton type="success" class="payment-button" @click="confirmPayment">
                  已完成支付
                </EBButton>
              </div>
            </el-tab-pane>
            <el-tab-pane label="支付宝" name="alipay">
              <div class="qrcode-payment">
                <div class="qrcode-container">
                  <div class="qrcode-placeholder">
                    <el-icon :size="100"><Money /></el-icon>
                    <p>支付宝支付二维码</p>
                  </div>
                </div>
                <div class="qrcode-tips">
                  <p>请使用支付宝扫描二维码完成支付</p>
                  <p>支付金额: <span class="amount">{{ currentBill.amount }} 元</span></p>
                </div>
                <EBButton type="primary" class="payment-button" @click="confirmPayment">
                  已完成支付
                </EBButton>
              </div>
            </el-tab-pane>
            <el-tab-pane label="银行卡支付" name="bank">
              <div class="bank-payment">
                <el-form :model="bankForm" label-width="100px" class="bank-form">
                  <el-form-item label="持卡人姓名">
                    <el-input v-model="bankForm.name" placeholder="请输入持卡人姓名"></el-input>
                  </el-form-item>
                  <el-form-item label="银行卡号">
                    <el-input v-model="bankForm.cardNumber" placeholder="请输入银行卡号"></el-input>
                  </el-form-item>
                  <el-form-item label="有效期">
                    <el-input v-model="bankForm.expiry" placeholder="MM/YY"></el-input>
                  </el-form-item>
                  <el-form-item label="安全码">
                    <el-input v-model="bankForm.cvv" placeholder="CVV" maxlength="3"></el-input>
                  </el-form-item>
                </el-form>
                <EBButton type="primary" class="payment-button" @click="handleBankPayment">
                  确认支付
                </EBButton>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-card>

      <!-- 已缴费状态 -->
      <el-card v-else class="paid-card">
        <div class="paid-content">
          <el-result
            icon="success"
            title="缴费成功"
            sub-title="您的电费已经成功缴纳"
          >
            <template #extra>
              <router-link to="/user/payment/history">
                <EBButton type="primary">查看缴费记录</EBButton>
              </router-link>
              <router-link to="/user/dashboard">
                <EBButton class="capsule-button">返回首页</EBButton>
              </router-link>
            </template>
          </el-result>
        </div>
      </el-card>
    </div>

    <!-- 支付结果对话框 -->
    <el-dialog
      v-model="paymentResultVisible"
      :title="paymentSuccess ? '支付成功' : '支付失败'"
      width="30%"
    >
      <div class="payment-result">
        <el-result
          :icon="paymentSuccess ? 'success' : 'error'"
          :title="paymentSuccess ? '支付成功' : '支付失败'"
          :sub-title="paymentResultMessage"
        >
          <template #extra>
            <EBButton v-if="paymentSuccess" type="primary" @click="goToPaymentHistory">
              查看缴费记录
            </EBButton>
            <EBButton v-else type="primary" @click="paymentResultVisible = false">
              重新支付
            </EBButton>
          </template>
        </el-result>
      </div>
    </el-dialog>
  </EBPageLayout>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { EBPageLayout, EBButton } from '@/components';
import { Money } from '@element-plus/icons-vue';

const router = useRouter();

// 当前账单
const currentBill = reactive({
  billNo: 'EB202303150001',
  billPeriod: '2023-02-01 至 2023-02-28',
  usage: 267,
  amount: 186.9,
  dueDate: '2023-03-25',
  status: '待缴费',
  details: [
    { label: '基本电费', value: '150.40元' },
    { label: '计量表计量', value: '267度' },
    { label: '计费单价', value: '0.562元/度' },
    { label: '峰时电量', value: '102度' },
    { label: '谷时电量', value: '98度' },
    { label: '平时电量', value: '67度' },
    { label: '附加费', value: '28.50元' },
    { label: '增值税', value: '8.00元' }
  ]
});

// 判断是否即将到期
const isDueSoon = computed(() => {
  const today = new Date();
  const dueDate = new Date(currentBill.dueDate);
  const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  return diffDays <= 3 && diffDays >= 0;
});

// 余额支付
const balance = ref(150);
const balanceInsufficient = computed(() => {
  return balance.value < currentBill.amount;
});

// 支付方式
const paymentMethod = ref('balance');

// 银行卡表单
const bankForm = reactive({
  name: '',
  cardNumber: '',
  expiry: '',
  cvv: ''
});

// 支付结果
const paymentResultVisible = ref(false);
const paymentSuccess = ref(false);
const paymentResultMessage = ref('');

// 处理余额支付
const handlePayWithBalance = () => {
  if (balanceInsufficient.value) {
    return;
  }
  
  paymentSuccess.value = true;
  paymentResultMessage.value = `您已成功支付${currentBill.amount}元，交易编号：EB${Date.now()}`;
  paymentResultVisible.value = true;
  
  // 更新账单状态和余额
  setTimeout(() => {
    currentBill.status = '已缴费';
    balance.value -= currentBill.amount;
  }, 1500);
};

// 确认支付
const confirmPayment = () => {
  // 模拟支付过程
  const random = Math.random();
  
  if (random > 0.2) { // 80%概率支付成功
    paymentSuccess.value = true;
    paymentResultMessage.value = `您已成功支付${currentBill.amount}元，交易编号：EB${Date.now()}`;
    
    // 更新账单状态
    setTimeout(() => {
      currentBill.status = '已缴费';
    }, 1500);
  } else {
    paymentSuccess.value = false;
    paymentResultMessage.value = '支付失败，请重新尝试或选择其他支付方式';
  }
  
  paymentResultVisible.value = true;
};

// 处理银行卡支付
const handleBankPayment = () => {
  // 简单的表单验证
  if (!bankForm.name || !bankForm.cardNumber || !bankForm.expiry || !bankForm.cvv) {
    paymentSuccess.value = false;
    paymentResultMessage.value = '请填写完整的银行卡信息';
    paymentResultVisible.value = true;
    return;
  }
  
  paymentSuccess.value = true;
  paymentResultMessage.value = `您已成功支付${currentBill.amount}元，交易编号：EB${Date.now()}`;
  paymentResultVisible.value = true;
  
  // 更新账单状态
  setTimeout(() => {
    currentBill.status = '已缴费';
  }, 1500);
};

// 查看缴费记录
const goToPaymentHistory = () => {
  paymentResultVisible.value = false;
  router.push('/user/payment/history');
};
</script>

<style scoped>
.payment-container {
  max-width: 800px;
  margin: 0 auto;
}

.bill-card,
.payment-method-card,
.paid-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.bill-content {
  padding: 20px 0;
}

.bill-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 15px;
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: #909399;
  width: 100px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
}

.info-value.amount {
  font-size: 18px;
  font-weight: 600;
  color: #F56C6C;
}

.due-soon {
  color: #E6A23C;
}

.details-content {
  padding: 10px 0;
}

.details-item {
  display: flex;
  margin-bottom: 10px;
}

.details-label {
  width: 100px;
  font-size: 14px;
  color: #909399;
}

.details-value {
  font-size: 14px;
}

.payment-method-content {
  padding: 20px 0;
}

.balance-payment,
.qrcode-payment,
.bank-payment {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.balance-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.balance-label {
  font-size: 16px;
  margin-right: 10px;
}

.balance-value {
  font-size: 20px;
  font-weight: 600;
  color: #67C23A;
}

.balance-insufficient {
  color: #F56C6C;
}

.balance-tip {
  margin-left: 10px;
  color: #F56C6C;
  font-size: 14px;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.qrcode-placeholder {
  width: 200px;
  height: 200px;
  border: 1px solid #EBEEF5;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.qrcode-placeholder p {
  margin-top: 20px;
  color: #909399;
}

.qrcode-tips {
  text-align: center;
  margin-bottom: 20px;
}

.qrcode-tips p {
  margin: 5px 0;
}

.bank-form {
  width: 100%;
  max-width: 400px;
  margin-bottom: 20px;
}

.payment-button {
  min-width: 150px;
}

.paid-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px 0;
}

.amount {
  color: #F56C6C;
  font-weight: 600;
}

.eb-payment-header {
  padding: 5px 0;
  min-height: 5px; /* 为了保持最小高度 */
}
</style> 