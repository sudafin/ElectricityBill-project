<template>
  <EBPageLayout>
    <template #header>
      <div class="eb-payment-detail-header">
        <div class="title-section">
          <EBButton @click="goBack" :icon="ArrowLeft" class="back-button">返回</EBButton>
        </div>
        <div class="actions-section">
          <EBButton @click="downloadReceipt" type="primary" :loading="downloadLoading">
            <el-icon><Download /></el-icon> 下载电子收据
          </EBButton>
          <EBButton v-if="canRefund" @click="showRefundDialog" type="danger">
            申请退款
          </EBButton>
        </div>
      </div>
    </template>

    <div class="detail-container" v-loading="loading">
      <!-- 支付状态卡片 -->
      <el-card class="status-card">
        <div class="status-content">
          <div class="status-icon" :class="{ 'success': paymentDetail.status === '已支付', 'failed': paymentDetail.status === '失败' }">
            <el-icon v-if="paymentDetail.status === '已支付'"><CircleCheckFilled /></el-icon>
            <el-icon v-else-if="paymentDetail.status === '失败'"><CircleCloseFilled /></el-icon>
            <el-icon v-else-if="paymentDetail.status === '退款'"><RefreshLeft /></el-icon>
            <el-icon v-else><Clock /></el-icon>
          </div>
          <div class="status-info">
            <h3 class="status-title">{{ getStatusTitle(paymentDetail.status) }}</h3>
            <p class="status-desc">{{ getStatusDescription(paymentDetail.status) }}</p>
          </div>
        </div>
      </el-card>

      <!-- 基本信息区域 -->
      <div class="bill-section">
        <div class="section-header">
          <h3>账单信息</h3>
          <el-tag v-if="paymentDetail.status === '已支付'" type="success">{{ paymentDetail.status }}</el-tag>
          <el-tag v-else-if="paymentDetail.status === '失败'" type="danger">{{ paymentDetail.status }}</el-tag>
          <el-tag v-else-if="paymentDetail.status === '退款'" type="warning">{{ paymentDetail.status }}</el-tag>
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
              <span>支付日期：{{ paymentDetail.paymentTime || '-' }}</span>
            </el-col>
          </el-row>

          <div class="bill-info-box">
            <div class="bill-info">
              <div class="info-item">
                <span class="info-label">支付单号:</span>
                <span class="info-value">{{ paymentDetail.paymentId || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">账单周期:</span>
                <span class="info-value">{{ paymentDetail.billPeriod || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">用电量:</span>
                <span class="info-value">{{ paymentDetail.usage || '-' }} 度</span>
              </div>
              <div class="info-item">
                <span class="info-label">缴费金额:</span>
                <span class="info-value amount">{{ paymentDetail.amount || 0 }} 元</span>
              </div>
              <div class="info-item">
                <span class="info-label">支付方式:</span>
                <span class="info-value">{{ paymentDetail.paymentMethod || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">用户编号:</span>
                <span class="info-value">{{ paymentDetail.userId || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">用户名称:</span>
                <span class="info-value">{{ paymentDetail.username || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">用电地址:</span>
                <span class="info-value">{{ paymentDetail.address || '-' }}</span>
              </div>
            </div>
            
            <div class="supply-info">
              <div class="info-section">
                <h5>供电信息</h5>
                <div class="info-row">
                  <span class="info-name">供电单位：</span>
                  <span class="info-content">{{ paymentDetail.supplyInfo?.company || '北京市电力公司海淀供电分公司' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-name">供电区域：</span>
                  <span class="info-content">{{ paymentDetail.supplyInfo?.area || '中关村区域' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-name">电表类型：</span>
                  <span class="info-content">{{ paymentDetail.supplyInfo?.meterType || '智能电表' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-name">电表编号：</span>
                  <span class="info-content">{{ paymentDetail.supplyInfo?.meterNo || 'M20210512345' }}</span>
                </div>
              </div>
              
              <div class="info-section">
                <h5>缴费信息</h5>
                <div class="info-row">
                  <span class="info-name">缴费单位：</span>
                  <span class="info-content">{{ paymentDetail.paymentInfo?.company || '北京市电力公司' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-name">缴费渠道：</span>
                  <span class="info-content">{{ paymentDetail.paymentInfo?.channel || '网上电费缴纳系统' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-name">交易流水号：</span>
                  <span class="info-content">{{ paymentDetail.transactionId || '-' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-name">电子发票：</span>
                  <span class="info-content">{{ paymentDetail.paymentInfo?.invoice || '缴费成功后可申请' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bill-details">
            <el-collapse>
              <el-collapse-item title="账单明细">
                <div class="details-content">
                  <div class="details-item" v-for="(item, index) in paymentDetail.details || defaultDetails" :key="index">
                    <span class="details-label">{{ item.label }}:</span>
                    <span class="details-value">{{ item.value }}</span>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
          
          <div class="bill-note">
            <p>注：本收据仅作为电费缴纳凭证，最终以实际缴费为准。如有疑问，请拨打供电客服热线。</p>
          </div>
        </div>
      </div>

      <!-- 电子收据卡片 -->
      <el-card class="receipt-card">
        <template #header>
          <div class="card-header">
            <h3>电子收据</h3>
          </div>
        </template>
        <div class="receipt-content">
          <div class="receipt-preview">
            <div class="receipt-header">
              <h3>电费缴纳电子收据</h3>
              <p>收据编号：{{ paymentDetail.receiptNo || '-' }}</p>
            </div>
            <div class="receipt-body">
              <div class="receipt-row">
                <span class="receipt-label">缴费用户：</span>
                <span class="receipt-value">{{ paymentDetail.username || '-' }}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">用户编号：</span>
                <span class="receipt-value">{{ paymentDetail.userId || '-' }}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">缴费金额：</span>
                <span class="receipt-value highlight">{{ paymentDetail.amount || 0 }} 元</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">支付方式：</span>
                <span class="receipt-value">{{ paymentDetail.paymentMethod || '-' }}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">支付时间：</span>
                <span class="receipt-value">{{ paymentDetail.paymentTime || '-' }}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">交易单号：</span>
                <span class="receipt-value">{{ paymentDetail.paymentId || '-' }}</span>
              </div>
            </div>
            <div class="receipt-footer">
              <p>感谢您使用电费缴纳系统</p>
              <p>本收据为电子凭证，与纸质收据具有同等效力</p>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 操作按钮 -->
      <div class="detail-actions">
        <EBButton @click="goBack">返回</EBButton>
        <EBButton v-if="canRefund" @click="showRefundDialog" type="danger">
          申请退款
        </EBButton>
      </div>
    </div>

    <!-- 退款确认对话框 -->
    <el-dialog
      v-model="refundDialogVisible"
      title="申请退款"
      width="30%"
    >
      <div class="refund-content">
        <p>您确定要申请退款吗？</p>
        <p class="refund-info">支付单号：{{ paymentDetail.paymentId }}</p>
        <p class="refund-info">支付金额：{{ paymentDetail.amount }} 元</p>
        <p class="refund-info">支付时间：{{ paymentDetail.paymentTime }}</p>
        
        <el-form ref="refundFormRef" :model="refundForm" :rules="refundRules" label-width="80px">
          <el-form-item label="退款原因" prop="reason">
            <el-select v-model="refundForm.reason" placeholder="请选择退款原因" style="width: 100%;">
              <el-option label="重复缴费" value="重复缴费"></el-option>
              <el-option label="缴费金额错误" value="缴费金额错误"></el-option>
              <el-option label="其他原因" value="其他原因"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="refundForm.reason === '其他原因'" label="详细说明" prop="description">
            <el-input 
              v-model="refundForm.description" 
              type="textarea" 
              :rows="3" 
              placeholder="请详细说明退款原因"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <EBButton @click="refundDialogVisible = false">取消</EBButton>
          <EBButton type="primary" @click="submitRefund" :loading="refundLoading">
            确认申请
          </EBButton>
        </span>
      </template>
    </el-dialog>
  </EBPageLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { 
  ArrowLeft, 
  Download, 
  CircleCheckFilled, 
  CircleCloseFilled, 
  RefreshLeft, 
  Clock,
  Promotion
} from '@element-plus/icons-vue';
import { EBPageLayout, EBButton } from '@/components';
// 假设这些API函数已经在相应的文件中定义
import { getPaymentDetail, downloadPaymentReceipt, applyRefund } from '@/api/user';

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const downloadLoading = ref(false);
const refundDialogVisible = ref(false);
const refundLoading = ref(false);
const refundFormRef = ref(null);
const paymentDetail = ref({});
const paymentId = computed(() => route.params.id);

// 判断是否可以申请退款
const canRefund = computed(() => {
  return paymentDetail.value.status === '已支付' && 
         isWithinRefundPeriod(paymentDetail.value.paymentTime);
});

// 退款表单
const refundForm = reactive({
  reason: '',
  description: ''
});

// 退款表单验证规则
const refundRules = {
  reason: [
    { required: true, message: '请选择退款原因', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请详细说明退款原因', trigger: 'blur' }
  ]
};

// 默认账单明细
const defaultDetails = [
  { label: '基本电费', value: '150.40元' },
  { label: '计量表计量', value: '267度' },
  { label: '计费单价', value: '0.562元/度' },
  { label: '峰时电量', value: '102度' },
  { label: '谷时电量', value: '98度' },
  { label: '平时电量', value: '67度' },
  { label: '附加费', value: '28.50元' },
  { label: '增值税', value: '8.00元' }
];

// 获取支付详情
const fetchPaymentDetail = async () => {
  loading.value = true;
  try {
    const res = await getPaymentDetail(paymentId.value);
    paymentDetail.value = res.data;
  } catch (error) {
    ElMessage.error('获取支付详情失败');
  } finally {
    loading.value = false;
  }
};

// 返回上一页
const goBack = () => {
  const fromPage = route.query.from;
  if (fromPage === 'paymentDashboard') {
    router.push('/user/paymentDashboard');
  } else {
    router.back();
  }
};

// 下载电子收据
const downloadReceipt = async () => {
  downloadLoading.value = true;
  try {
    await downloadPaymentReceipt(paymentId.value);
    ElMessage.success('收据下载成功');
  } catch (error) {
    ElMessage.error('收据下载失败');
  } finally {
    downloadLoading.value = false;
  }
};

// 判断是否在退款期限内（假设7天内可退款）
const isWithinRefundPeriod = (paymentTime) => {
  if (!paymentTime) return false;
  
  const paymentDate = new Date(paymentTime);
  const now = new Date();
  const diffTime = now - paymentDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 7;
};

// 显示退款对话框
const showRefundDialog = () => {
  refundDialogVisible.value = true;
  refundForm.reason = '';
  refundForm.description = '';
};

// 提交退款申请
const submitRefund = async () => {
  if (!refundFormRef.value) return;
  
  await refundFormRef.value.validate(async (valid) => {
    if (valid) {
      refundLoading.value = true;
      
      try {
        await applyRefund({
          paymentId: paymentId.value,
          reason: refundForm.reason,
          description: refundForm.reason === '其他原因' ? refundForm.description : refundForm.reason
        });
        
        ElMessage.success('退款申请已提交，请等待审核');
        refundDialogVisible.value = false;
        
        // 刷新详情
        fetchPaymentDetail();
      } catch (error) {
        ElMessage.error(error.message || '退款申请失败');
      } finally {
        refundLoading.value = false;
      }
    }
  });
};

// 获取状态对应的类型
const getStatusType = (status) => {
  switch (status) {
    case '已支付':
      return 'success';
    case '失败':
      return 'danger';
    case '退款':
      return 'warning';
    default:
      return 'info';
  }
};

// 获取状态对应的标题
const getStatusTitle = (status) => {
  switch (status) {
    case '已支付':
      return '支付成功';
    case '失败':
      return '支付失败';
    case '退款':
      return '退款成功';
    default:
      return '处理中';
  }
};

// 获取状态对应的描述
const getStatusDescription = (status) => {
  switch (status) {
    case '已支付':
      return '您的电费缴纳已成功，感谢您的使用！';
    case '失败':
      return '支付失败，请检查您的支付方式或稍后重试。';
    case '退款':
      return '退款已处理，款项将在1-3个工作日内原路退回。';
    default:
      return '您的支付正在处理中，请稍后查看结果。';
  }
};

onMounted(() => {
  fetchPaymentDetail();
  
  // 处理面包屑历史
  const breadcrumbHistory = JSON.parse(localStorage.getItem('eb-breadcrumb-history') || '[]');
  if (breadcrumbHistory.length > 0) {
    // 确保缴纳中心存在于面包屑历史中
    const paymentDashboardExists = breadcrumbHistory.some(item => 
      item.path === '/user/paymentDashboard' || item.name === 'UserPaymentDashboard'
    );
    
    if (!paymentDashboardExists) {
      // 添加缴纳中心到面包屑历史
      breadcrumbHistory.push({
        title: '缴纳中心',
        path: '/user/paymentDashboard',
        name: 'UserPaymentDashboard',
        query: {},
        fullPath: '/user/paymentDashboard'
      });
      localStorage.setItem('eb-breadcrumb-history', JSON.stringify(breadcrumbHistory));
    }
  }
});
</script>

<style scoped>
.eb-payment-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-section {
  display: flex;
  align-items: center;
}

.back-button {
  margin-right: 10px;
}

.status-card {
  margin-bottom: 20px;
}

.status-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.status-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  margin-right: 20px;
}

.status-icon.success {
  background-color: #f0f9eb;
  color: #67C23A;
}

.status-icon.failed {
  background-color: #fef0f0;
  color: #F56C6C;
}

.status-info {
  flex: 1;
}

.status-title {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 600;
}

.status-desc {
  margin: 0;
  color: #606266;
}

.bill-section {
  margin-bottom: 20px;
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

/* 账单注释 */
.bill-note {
  font-size: 12px;
  color: #909399;
  text-align: center;
  margin-top: 15px;
}

.receipt-card {
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

.receipt-content {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.receipt-preview {
  width: 100%;
  max-width: 500px;
  border: 1px dashed #dcdfe6;
  padding: 20px;
  background-color: #fafafa;
}

.receipt-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.receipt-header h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.receipt-header p {
  margin: 0;
  color: #606266;
}

.receipt-body {
  margin-bottom: 20px;
}

.receipt-row {
  margin-bottom: 10px;
  display: flex;
}

.receipt-label {
  width: 80px;
  color: #606266;
}

.receipt-value {
  flex: 1;
  color: #303133;
}

.receipt-value.highlight {
  color: #F56C6C;
  font-weight: bold;
}

.receipt-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
  color: #909399;
  font-size: 12px;
}

.receipt-footer p {
  margin: 5px 0;
}

.detail-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.refund-content {
  padding: 10px 0;
}

.refund-info {
  margin: 5px 0;
  color: #606266;
}
</style> 