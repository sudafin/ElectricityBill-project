<template>
  <div class="bill-detail" v-loading="loading">
    <div class="info-section" v-if="bill">
      <!-- 基本信息部分 -->
      <div class="info-header">
        <div class="title-area">
          <el-icon class="header-icon"><Document /></el-icon>
          <h2 class="header-title">账单详情</h2>
        </div>
        <div class="header-actions">
          <el-button @click="goBack" size="small">
            <el-icon><Back /></el-icon>返回列表
          </el-button>
        </div>
      </div>

      <el-card class="bill-card">
        <div class="card-header">
          <h3>基本信息</h3>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">用户名:</span>
            <span class="value">{{ bill.username }}</span>
          </div>
          <div class="info-item">
            <span class="label">用户类型:</span>
            <span class="value">{{ bill.userType || '普通用户' }}</span>
          </div>
          <div class="info-item">
            <span class="label">账单号:</span>
            <span class="value">{{ bill.billId }}</span>
          </div>
          <div class="info-item">
            <span class="label">电表号:</span>
            <span class="value">{{ bill.meterId }}</span>
          </div>
          <div class="info-item">
            <span class="label">用电量:</span>  
            <span class="value">{{ bill.usageAmount }} 度</span>
          </div>
          <div class="info-item">
            <span class="label">总金额:</span>  
            <span class="value">{{ bill.totalAmount }} 元</span>
          </div>
          <div class="info-item">
            <span class="label">开始读数:</span>  
            <span class="value">{{ bill.startReading !== null ? bill.startReading : '暂无' }}</span>
          </div>
          <div class="info-item">
            <span class="label">结束读数:</span>  
            <span class="value">{{ bill.endReading !== null ? bill.endReading : '暂无' }}</span>
          </div>
          <div class="info-item">
            <span class="label">基础用电量:</span>  
            <span class="value">{{ bill.baseElectricityUsage !== null ? bill.baseElectricityUsage + ' 度' : '暂无' }}</span>
          </div>
          <div class="info-item">
            <span class="label">高峰用电量:</span>  
            <span class="value">{{ bill.hotElectricityUsage !== null ? bill.hotElectricityUsage + ' 度' : '暂无' }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付状态:</span>
            <span class="value">
              <el-tag :type="getStatusType(bill.status)">{{ bill.status }}</el-tag>
            </span>
          </div>
          <div class="info-item">
            <span class="label">创建时间:</span>
            <span class="value">{{ formatDateTime(bill.createdAt) }}</span>
          </div>
          <div class="info-item">
            <span class="label">更新时间:</span>
            <span class="value">{{ formatDateTime(bill.updatedAt) }}</span>
          </div>
          <div class="info-item">
            <span class="label">到期时间:</span>
            <span class="value">{{ formatDateTime(bill.dueDate) }}</span>
          </div>
        </div>
      </el-card>
      
      <!-- 支付详情部分 -->
      <el-card class="payment-card">
        <div class="card-header">
          <h3>支付详情</h3>
          <div class="card-actions" v-if="bill.status === '已支付'">
            <el-button type="danger" size="small" @click="showRefundDialog">
              <el-icon><Back /></el-icon> 申请退款
            </el-button>
          </div>
        </div>

        <div v-if="bill.paymentDetailVOList && bill.paymentDetailVOList.length > 0">
          <el-table 
            :data="bill.paymentDetailVOList" 
            style="width: 100%" 
            border 
            stripe
            :header-cell-style="{ background: '#f8f9fa', color: '#606266' }"
          >
            <el-table-column prop="paymentId" label="支付ID" min-width="150" />
            <el-table-column prop="paymentMethod" label="支付方式" min-width="100">
              <template #default="{ row }">
                {{ row.paymentMethod || '未指定' }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="支付状态" min-width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="paymentTime" label="支付时间" min-width="150">
              <template #default="{ row }">
                {{ formatDateTime(row.paymentTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="isReconciliation" label="对账状态" min-width="120">
              <template #default="{ row }">
                {{ row.isReconciliation ? (row.reconciliationStatus || '已对账') : '未对账' }}
              </template>
            </el-table-column>
            <el-table-column prop="reconciliationComment" label="对账备注" min-width="150">
              <template #default="{ row }">
                {{ row.reconciliationComment || '无' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="120" align="center">
              <template #default="{ row }">
                <el-button 
                  v-if="row.status === '已支付'" 
                  type="danger" 
                  link 
                  size="small" 
                  @click="showPaymentRefundDialog(row)"
                >
                  申请退款
                </el-button>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-empty v-else description="暂无支付记录"></el-empty>
      </el-card>
    </div>
    
    <!-- 退款对话框 -->
    <el-dialog
      v-model="refundDialogVisible"
      title="申请退款"
      width="500px"
    >
      <el-form :model="refundForm" label-width="100px" ref="refundFormRef" :rules="refundRules">
        <el-form-item label="账单号">
          <span>{{ bill?.billId }}</span>
        </el-form-item>
        <el-form-item label="支付金额">
          <span>{{ bill?.totalAmount }} 元</span>
        </el-form-item>
        <el-form-item label="退款原因" prop="reason">
          <el-input 
            v-model="refundForm.reason" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入退款原因"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="refundDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRefund" :loading="refunding">确认退款</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 支付记录退款对话框 -->
    <el-dialog
      v-model="paymentRefundDialogVisible"
      title="申请支付退款"
      width="500px"
    >
      <el-form :model="paymentRefundForm" label-width="100px" ref="paymentRefundFormRef" :rules="paymentRefundRules">
        <el-form-item label="支付ID">
          <span>{{ selectedPayment?.paymentId }}</span>
        </el-form-item>
        <el-form-item label="账单号">
          <span>{{ route.params.id }}</span>
        </el-form-item>
        <el-form-item label="支付方式">
          <span>{{ selectedPayment?.paymentMethod || '未指定' }}</span>
        </el-form-item>
        <el-form-item label="支付时间">
          <span>{{ formatDateTime(selectedPayment?.paymentTime) }}</span>
        </el-form-item>
        <el-form-item label="退款金额" prop="amount">
          <el-input-number 
            v-model="paymentRefundForm.amount" 
            :min="0.01" 
            :max="paymentMaxAmount"
            :precision="2" 
            :step="0.01"
            style="width: 100%;"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="退款原因" prop="reason">
          <el-input 
            v-model="paymentRefundForm.reason" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入退款原因"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="paymentRefundDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPaymentRefund" :loading="paymentRefunding">确认退款</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Back, Document } from '@element-plus/icons-vue';
import { getBillDetail, refundBill, refundPayment } from '@/api/admin/bill.js';

const route = useRoute();
const router = useRouter();

// 定义 props 接收父组件传递的账单ID
const props = defineProps({
  billId: {
    type: [String, Number],
    required: false
  },
  bill: {
    type: Object,
    required: false
  }
});

const emit = defineEmits(['refresh']);

const loading = ref(false);
const refundDialogVisible = ref(false);
const refunding = ref(false);
const billDetail = ref(null);
const refundFormRef = ref(null);

// 支付记录退款相关状态
const paymentRefundDialogVisible = ref(false);
const paymentRefunding = ref(false);
const paymentRefundFormRef = ref(null);
const selectedPayment = ref(null);

const refundForm = ref({
  reason: ''
});

const paymentRefundForm = ref({
  paymentId: '',
  billId: '',
  amount: 0,
  reason: ''
});

const refundRules = {
  reason: [
    { required: true, message: '请输入退款原因', trigger: 'blur' },
    { min: 5, max: 200, message: '长度在 5 到 200 个字符', trigger: 'blur' }
  ]
};

const paymentRefundRules = {
  amount: [
    { required: true, message: '请输入退款金额', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入退款原因', trigger: 'blur' },
    { min: 5, max: 200, message: '长度在 5 到 200 个字符', trigger: 'blur' }
  ]
};

// 计算最大退款金额
const paymentMaxAmount = computed(() => {
  if (!selectedPayment.value) return 0.01;
  // 这里假设支付记录中有paymentAmount字段表示支付金额
  // 如果没有可以根据实际情况修改
  const amount = selectedPayment.value.paymentAmount || 0;
  // 确保最大值至少为0.01，避免min>max错误
  return Math.max(amount, 0.01);
});

// 返回上一页
const goBack = () => {
  router.push('/admin/bill');
};

// 根据billId获取账单详情
const fetchBillDetail = async (id) => {
  if (!id) return;
  
  loading.value = true;
  try {
    const res = await getBillDetail(id);
    billDetail.value = res;
    console.log('获取账单详情成功:', res);
  } catch (err) {
    ElMessage.error('获取账单详情失败');
    console.error('获取账单详情失败:', err);
  } finally {
    loading.value = false;
  }
};

// 显示退款对话框
const showRefundDialog = () => {
  refundForm.value.reason = '';
  refundDialogVisible.value = true;
};

// 显示支付记录退款对话框
const showPaymentRefundDialog = (payment) => {
  selectedPayment.value = payment;
  // 确保支付金额存在且大于0
  const paymentAmount = payment.paymentAmount || 0;
  const safeAmount = Math.max(paymentAmount, 0.01);
  
  paymentRefundForm.value = {
    paymentId: payment.paymentId,
    billId: bill.value.billId,
    // 默认全额退款，但确保金额至少为0.01
    amount: safeAmount,
    reason: ''
  };
  paymentRefundDialogVisible.value = true;
};

// 提交退款申请
const submitRefund = async () => {
  if (!refundFormRef.value) return;
  
  await refundFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    refunding.value = true;
    try {
      const currentBill = props.bill || billDetail.value;
      const res = await refundBill({
        billId: currentBill.billId,
        reason: refundForm.value.reason
      });
      
      if (res.success || res.code === 200) {
        ElMessage.success('退款申请提交成功');
        refundDialogVisible.value = false;
        
        // 通知父组件刷新数据
        emit('refresh');
        
        // 重新获取账单详情
        fetchBillDetail(currentBill.billId);
      } else {
        ElMessage.error(res.msg || '退款申请失败');
      }
    } catch (err) {
      ElMessage.error('退款申请失败');
      console.error('退款申请失败:', err);
    } finally {
      refunding.value = false;
    }
  });
};

// 提交支付记录退款申请
const submitPaymentRefund = async () => {
  if (!paymentRefundFormRef.value) return;
  
  await paymentRefundFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    paymentRefunding.value = true;
    try {
      const res = await refundPayment(paymentRefundForm.value);
      
      if (res.success || res.code === 200) {
        ElMessage.success('支付记录退款申请提交成功');
        paymentRefundDialogVisible.value = false;
        
        // 重新获取账单详情
        const currentBill = props.bill || billDetail.value;
        fetchBillDetail(currentBill.billId);
      } else {
        ElMessage.error(res.msg || '支付记录退款申请失败');
      }
    } catch (err) {
      ElMessage.error('支付记录退款申请失败');
      console.error('支付记录退款申请失败:', err);
    } finally {
      paymentRefunding.value = false;
    }
  });
};

// 计算后的当前账单
const bill = computed(() => {
  return props.bill || billDetail.value;
});

onMounted(() => {
  // 优先从路由参数获取billId (对应路由定义中的 :id)
  const idFromParams = route.params.id;
  // 其次从查询参数获取billId (用于兼容旧的查询方式)
  const idFromQuery = route.query.billId;
  // 最后尝试从props获取
  const billIdToUse = idFromParams || idFromQuery || props.billId;
  
  console.log('获取到的账单ID:', billIdToUse);
  
  if (billIdToUse) {
    fetchBillDetail(billIdToUse);
  } else {
    ElMessage.warning('未找到账单ID，无法加载账单详情');
  }
});

const getStatusType = (status) => {
  switch (status) {
    case '已支付':
      return 'success';
    case '失败':
      return 'danger';
    case '退款':
      return 'warning';
    case '未支付':
      return 'info';
    default:
      return 'info';
  }
};

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '暂无';
  
  // 如果是字符串，先尝试转换为Date对象
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  
  if (!(date instanceof Date) || isNaN(date)) return dateTime; // 如果不是有效日期，返回原始值
  
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

</script>

<style scoped>
.bill-detail {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 20px;
  color: #409EFF;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.bill-card, .payment-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #409EFF;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item .label {
  width: 100px;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.info-item .value {
  color: #303133;
  font-size: 14px;
  flex: 1;
}

/* 表格样式优化 */
:deep(.el-table) {
  margin-top: 10px;
  border-radius: 4px;
  overflow: hidden;
}

:deep(.el-table .cell) {
  line-height: 1.5;
  padding: 8px 12px;
}

:deep(.el-empty) {
  padding: 30px 0;
}
</style> 