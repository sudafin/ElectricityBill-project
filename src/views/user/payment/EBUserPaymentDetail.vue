<template>
  <EBPageLayout>
    <template #header>
      <div class="eb-payment-detail-header">
        <div class="title-section">
          <EBButton @click="goBack" :icon="ArrowLeft" class="back-button">返回</EBButton>
          <h2 class="eb-section-title">缴费详情</h2>
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

      <!-- 基本信息卡片 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <h3>基本信息</h3>
          </div>
        </template>
        <div class="card-content">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">支付单号：</span>
                <span class="info-value">{{ paymentDetail.paymentId || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">支付方式：</span>
                <span class="info-value">{{ paymentDetail.paymentMethod || '-' }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">缴费金额：</span>
                <span class="info-value amount">{{ paymentDetail.amount || 0 }} 元</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">支付状态：</span>
                <el-tag :type="getStatusType(paymentDetail.status)">{{ paymentDetail.status || '-' }}</el-tag>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">支付时间：</span>
                <span class="info-value">{{ paymentDetail.paymentTime || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">交易流水号：</span>
                <span class="info-value">{{ paymentDetail.transactionId || '-' }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <div class="info-item">
                <span class="info-label">备注信息：</span>
                <span class="info-value">{{ paymentDetail.remark || '无' }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- 支付流程卡片 -->
      <el-card class="process-card">
        <template #header>
          <div class="card-header">
            <h3>支付流程</h3>
          </div>
        </template>
        <div class="process-content">
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in paymentDetail.activities || defaultActivities"
              :key="index"
              :timestamp="activity.timestamp"
              :type="activity.type"
              :color="activity.color"
            >
              {{ activity.content }}
              <div v-if="activity.detail" class="activity-detail">
                {{ activity.detail }}
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>

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
  Clock 
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

// 默认支付流程活动（当API未返回时使用）
const defaultActivities = [
  {
    content: '创建支付订单',
    timestamp: '2023-04-01 14:30:00',
    type: 'primary',
    color: '#409EFF'
  },
  {
    content: '发起支付请求',
    timestamp: '2023-04-01 14:30:05',
    type: 'primary',
    color: '#409EFF'
  },
  {
    content: '支付处理中',
    timestamp: '2023-04-01 14:30:10',
    type: 'primary',
    color: '#E6A23C'
  },
  {
    content: '支付完成',
    timestamp: '2023-04-01 14:30:15',
    type: 'primary',
    color: '#67C23A'
  }
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
  router.back();
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

.info-card,
.process-card,
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

.card-content {
  padding: 10px 0;
}

.info-item {
  margin-bottom: 15px;
}

.info-label {
  color: #909399;
  margin-right: 5px;
}

.info-value {
  color: #303133;
  font-weight: 500;
}

.info-value.amount {
  color: #F56C6C;
  font-weight: 600;
}

.process-content {
  padding: 10px 0;
}

.activity-detail {
  color: #909399;
  font-size: 13px;
  margin-top: 5px;
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