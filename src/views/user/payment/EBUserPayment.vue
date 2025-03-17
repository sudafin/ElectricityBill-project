<template>
  <EBPageLayout>
    <div class="payment-container">
      <!-- 电费账单部分 -->
      <div class="bill-section">
        <div class="section-header">
          <h3>当前电费账单</h3>
          <el-tag v-if="currentBill.status === '待缴费'" type="danger">{{ currentBill.status }}</el-tag>
          <el-tag v-else-if="currentBill.status === '已缴费'" type="success">{{ currentBill.status }}</el-tag>
        </div>
        <div class="bill-content">
          <!-- 供电局信息 -->
          <div class="power-company-info">
            <div class="company-logo">
              <el-icon :size="30"><Promotion /></el-icon>
            </div>
            <div class="company-details">
              <h4>国家电网有限公司</h4>
              <p>服务热线：95598</p>
              <p>网址：www.sgcc.com.cn</p>
            </div>
          </div>

          <!-- 账单信息表格 -->
          <el-row class="bill-header">
            <el-col :span="12">
              <h4>电费账单收据</h4>
            </el-col>
            <el-col :span="12" class="text-right">
              <span>打印日期：{{ currentDate }}</span>
            </el-col>
          </el-row>

          <div class="bill-info-box">
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
              <div class="info-item">
                <span class="info-label">用户编号:</span>
                <span class="info-value">{{ currentBill.userCode }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">用户名称:</span>
                <span class="info-value">{{ currentBill.userName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">用电地址:</span>
                <span class="info-value">{{ currentBill.address }}</span>
              </div>
            </div>
            
            <div class="supply-info">
              <div class="info-section">
                <h5>供电信息</h5>
                <div class="info-row">
                  <span class="info-name">供电单位：</span>
                  <span class="info-content">{{ currentBill.supplyInfo.company }}</span>
                </div>
                <div class="info-row">
                  <span class="info-name">供电区域：</span>
                  <span class="info-content">{{ currentBill.supplyInfo.area }}</span>
                </div>
                <div class="info-row">
                  <span class="info-name">电表类型：</span>
                  <span class="info-content">{{ currentBill.supplyInfo.meterType }}</span>
                </div>
                <div class="info-row">
                  <span class="info-name">电表编号：</span>
                  <span class="info-content">{{ currentBill.supplyInfo.meterNo }}</span>
                </div>
              </div>
              
              <div class="info-section">
                <h5>缴费信息</h5>
                <div class="info-row">
                  <span class="info-name">缴费单位：</span>
                  <span class="info-content">{{ currentBill.paymentInfo.company }}</span>
                </div>
                <div class="info-row">
                  <span class="info-name">缴费渠道：</span>
                  <span class="info-content">{{ currentBill.paymentInfo.channel }}</span>
                </div>
                <div class="info-row">
                  <span class="info-name">电子发票：</span>
                  <span class="info-content">{{ currentBill.paymentInfo.invoice }}</span>
                </div>
              </div>
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
          
          <!-- 缴费按钮区域 -->
          <div class="payment-action" v-if="currentBill.status === '待缴费'">
            <el-button type="primary" @click="openPaymentDialog" size="large">
              确认缴费
            </el-button>
          </div>
          
          <div class="bill-note">
            <p>注：本账单仅作为用电参考，最终以实际缴费为准。如有疑问，请拨打供电客服热线。</p>
          </div>
        </div>
      </div>

      <!-- 已缴费状态 -->
      <div class="paid-section" v-if="currentBill.status === '已缴费'">
        <div class="paid-content">
          <el-result
            icon="success"
            title="缴费成功"
            sub-title="您的电费已经成功缴纳"
          >
            <template #extra>
              <router-link to="/user/paymentDashboard">
                <EBButton type="primary">查看缴费记录</EBButton>
              </router-link>
              <router-link to="/user/dashboard">
                <EBButton class="capsule-button">返回首页</EBButton>
              </router-link>
            </template>
          </el-result>
        </div>
      </div>
    </div>

    <!-- 支付方式选择对话框 -->
    <el-dialog
      v-model="paymentMethodDialogVisible"
      title="选择支付方式"
      width="40%"
    >
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
    </el-dialog>

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
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { EBPageLayout, EBButton } from '@/components';
import { Money, Promotion } from '@element-plus/icons-vue';

const router = useRouter();

// 当前日期
const currentDate = ref(new Date().toLocaleDateString('zh-CN', {
  year: 'numeric', 
  month: '2-digit', 
  day: '2-digit'
}).replace(/\//g, '-'));

// 当前账单
const currentBill = reactive({
  billNo: 'EB202303150001',
  billPeriod: '2023-02-01 至 2023-02-28',
  usage: 267,
  amount: 186.9,
  dueDate: '2023-03-25',
  status: '待缴费',
  userCode: 'U0012345678',
  userName: '张三',
  address: '北京市海淀区中关村南大街5号',
  supplyInfo: {
    company: '北京市电力公司海淀供电分公司',
    area: '中关村区域',
    meterType: '智能电表',
    meterNo: 'M20210512345'
  },
  paymentInfo: {
    company: '北京市电力公司',
    channel: '网上电费缴纳系统',
    invoice: '缴费成功后可申请'
  },
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

// 支付方式对话框
const paymentMethodDialogVisible = ref(false);
const paymentMethod = ref('balance');

// 打开支付方式对话框
const openPaymentDialog = () => {
  paymentMethodDialogVisible.value = true;
};

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
  
  paymentMethodDialogVisible.value = false;
  
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
  
  paymentMethodDialogVisible.value = false;
  
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
  
  paymentMethodDialogVisible.value = false;
  
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
  router.push('/user/paymentDashboard');
};
</script>

<style scoped>
.payment-container {
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bill-section {
  width: 80%;
  margin: 0 auto 15px auto;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.paid-section {
  width: 80%;
  margin: 0 auto 15px auto;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f8f9fa;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.bill-content {
  padding: 20px;
}

/* 供电局信息样式 */
.power-company-info {
  display: flex;
  padding-bottom: 20px;
  margin-bottom: 15px;
  border-bottom: 1px dashed #ebeef5;
}

.company-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-right: 15px;
  color: #409EFF;
}

.company-details h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.company-details p {
  margin: 4px 0;
  font-size: 13px;
  color: #606266;
}

/* 账单头部 */
.bill-header {
  margin-bottom: 20px;
}

.bill-header h4 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.text-right {
  text-align: right;
}

/* 账单信息 */
.bill-info-box {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fafafa;
}

.bill-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 15px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: #909399;
  width: 85px;
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

/* 供电信息 */
.supply-info {
  border-top: 1px dashed #ebeef5;
  padding-top: 15px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 20px;
}

.info-section h5 {
  margin: 0 0 10px 0;
  font-size: 15px;
  color: #303133;
}

.info-row {
  margin-bottom: 8px;
}

.info-name {
  font-size: 13px;
  color: #909399;
}

.info-content {
  font-size: 13px;
  color: #606266;
}

/* 账单明细 */
.bill-details {
  margin-bottom: 20px;
}

.details-content {
  padding: 10px 0;
}

.details-item {
  display: flex;
  margin-bottom: 8px;
}

.details-label {
  width: 100px;
  font-size: 14px;
  color: #909399;
}

.details-value {
  font-size: 14px;
}

/* 支付按钮 */
.payment-action {
  text-align: center;
  padding: 20px 0;
  border-top: 1px dashed #ebeef5;
  margin-top: 10px;
}

/* 账单注释 */
.bill-note {
  font-size: 12px;
  color: #909399;
  text-align: center;
  margin-top: 15px;
}

/* 支付方式对话框 */
.payment-method-content {
  padding: 15px;
}

.balance-payment,
.qrcode-payment,
.bank-payment {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 0;
}

.balance-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.balance-label {
  font-size: 15px;
  margin-right: 8px;
}

.balance-value {
  font-size: 18px;
  font-weight: 600;
  color: #67C23A;
}

.balance-insufficient {
  color: #F56C6C;
}

.balance-tip {
  margin-left: 8px;
  color: #F56C6C;
  font-size: 13px;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.qrcode-placeholder {
  width: 180px;
  height: 180px;
  border: 1px solid #EBEEF5;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.qrcode-placeholder p {
  margin-top: 15px;
  color: #909399;
}

.qrcode-tips {
  text-align: center;
  margin-bottom: 15px;
}

.qrcode-tips p {
  margin: 4px 0;
}

.bank-form {
  width: 100%;
  max-width: 400px;
  margin-bottom: 15px;
}

.payment-button {
  min-width: 150px;
}

.paid-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.amount {
  color: #F56C6C;
  font-weight: 600;
}

/* 调整tabs样式 */
:deep(.el-tabs__nav-wrap) {
  padding: 0;
}

:deep(.el-tabs__item) {
  height: 40px;
  line-height: 40px;
}

:deep(.el-tabs__header) {
  margin-bottom: 15px;
}

/* 调整折叠面板样式 */
:deep(.el-collapse-item__header) {
  padding: 0;
  height: 40px;
}

:deep(.el-collapse-item__content) {
  padding: 10px 0;
}
</style> 