<template>
  <EBPageLayout>
    <template #header>
      <div class="eb-payment-history-header">
        <h2 class="eb-section-title">缴费记录</h2>
        <EBSearchFilter
          v-model:searchValue="searchText"
          searchPlaceholder="搜索支付单号"
          @search="handleSearch"
          @clear="fetchPaymentHistory(1, true)"
        >
          <template #filters>
            <el-select v-model="selectedStatus" placeholder="支付状态" clearable style="width: 150px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="已支付" value="已支付"></el-option>
              <el-option label="支付失败" value="失败"></el-option>
              <el-option label="退款" value="退款"></el-option>
            </el-select>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              @change="handleDateChange"
            ></el-date-picker>
          </template>
        </EBSearchFilter>
      </div>
    </template>

    <!-- 缴费记录表格 -->
    <EBTable
      :columns="columns"
      :data="paymentList"
      :loading="loading"
      :show-actions="true"
      actions-width="150"
      @sort-change="handleSortChange"
    >
      <!-- 金额列 -->
      <template #amount="{ row }">
        <span class="amount">{{ row.amount }} 元</span>
      </template>
      
      <!-- 状态列 -->
      <template #status="{ row }">
        <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
      </template>
      
      <!-- 操作列 -->
      <template #actions="{ row }">
        <div class="eb-actions">
          <EBButton type="primary" link @click="viewDetail(row)">详情</EBButton>
          <EBButton 
            v-if="row.status === '已支付' && isWithinRefundPeriod(row.paymentTime)" 
            type="danger" 
            link 
            @click="handleRefund(row)"
          >
            申请退款
          </EBButton>
        </div>
      </template>
    </EBTable>

    <!-- 分页 -->
    <EBPagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      :disabled="loading"
      @page-change="handlePageChange"
    />

    <!-- 支付详情抽屉 -->
    <el-drawer
      v-model="detailVisible"
      :title="`支付详情 - ${currentPayment.paymentId || ''}`"
      size="40%"
      direction="rtl"
    >
      <div v-if="detailLoading" class="detail-loading">
        <el-skeleton :rows="10" animated />
      </div>
      <div v-else class="payment-detail">
        <div class="detail-section">
          <h3 class="detail-title">基本信息</h3>
          <div class="detail-item">
            <span class="detail-label">支付单号：</span>
            <span class="detail-value">{{ currentPayment.paymentId }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">支付金额：</span>
            <span class="detail-value">{{ currentPayment.amount }} 元</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">支付方式：</span>
            <span class="detail-value">{{ currentPayment.paymentMethod }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">支付状态：</span>
            <span class="detail-value">
              <el-tag :type="getStatusType(currentPayment.status)">{{ currentPayment.status }}</el-tag>
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">支付时间：</span>
            <span class="detail-value">{{ currentPayment.paymentTime }}</span>
          </div>
        </div>
        
        <div class="detail-section">
          <h3 class="detail-title">交易详情</h3>
          <div class="detail-item">
            <span class="detail-label">交易流水号：</span>
            <span class="detail-value">{{ currentPayment.transactionId || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">交易渠道：</span>
            <span class="detail-value">{{ currentPayment.channel || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">交易备注：</span>
            <span class="detail-value">{{ currentPayment.remark || '无' }}</span>
          </div>
        </div>
        
        <div class="detail-actions">
          <EBButton @click="downloadReceipt(currentPayment)" type="primary">
            <el-icon><Download /></el-icon> 下载电子收据
          </EBButton>
          <EBButton 
            v-if="currentPayment.status === '已支付' && isWithinRefundPeriod(currentPayment.paymentTime)" 
            @click="handleRefund(currentPayment)" 
            type="danger"
          >
            申请退款
          </EBButton>
        </div>
      </div>
    </el-drawer>

    <!-- 退款确认对话框 -->
    <el-dialog
      v-model="refundDialogVisible"
      title="申请退款"
      width="30%"
    >
      <div class="refund-content">
        <p>您确定要申请退款吗？</p>
        <p class="refund-info">支付单号：{{ refundPayment.paymentId }}</p>
        <p class="refund-info">支付金额：{{ refundPayment.amount }} 元</p>
        <p class="refund-info">支付时间：{{ refundPayment.paymentTime }}</p>
        
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
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Download } from '@element-plus/icons-vue';
import { EBPageLayout, EBTable, EBSearchFilter, EBPagination, EBButton } from '@/components';

const searchText = ref('');
const selectedStatus = ref('');
const dateRange = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const detailVisible = ref(false);
const detailLoading = ref(false);
const currentPayment = ref({});
const refundDialogVisible = ref(false);
const refundLoading = ref(false);
const refundPayment = ref({});
const refundFormRef = ref(null);

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

// 定义表格列
const columns = ref([
  { prop: 'paymentId', label: '支付单号' },
  { prop: 'amount', label: '金额', sortable: true },
  { prop: 'paymentMethod', label: '支付方式' },
  { prop: 'status', label: '状态' },
  { prop: 'paymentTime', label: '支付时间', sortable: true }
]);

// 支付统计数据 - 使用本地假数据
const statistics = reactive({
  totalAmount: 581.8,
  count: 3,
  averageMonthly: 193.9
});

// 支付记录 - 使用本地假数据
const paymentList = ref([
  { 
    paymentId: 'PAY202303150001', 
    amount: 186.9, 
    paymentMethod: '微信支付', 
    status: '已支付', 
    paymentTime: '2023-03-15 14:30:25' 
  },
  { 
    paymentId: 'PAY202302150002', 
    amount: 205.6, 
    paymentMethod: '支付宝', 
    status: '已支付', 
    paymentTime: '2023-02-15 09:45:12' 
  },
  { 
    paymentId: 'PAY202301150003', 
    amount: 189.3, 
    paymentMethod: '银行卡', 
    status: '已支付', 
    paymentTime: '2023-01-15 16:20:35' 
  }
]);

// 过滤后的支付记录
const filteredPayments = ref([...paymentList.value]);
const total = ref(paymentList.value.length);

// 获取缴费历史 - 使用本地模拟方法
const fetchPaymentHistory = async (page = currentPage.value, shouldResetPage = false) => {
  loading.value = true;
  if (shouldResetPage) {
    currentPage.value = 1;
  } else {
    currentPage.value = page;
  }
  
  setTimeout(() => {
    // 模拟筛选处理
    filteredPayments.value = paymentList.value.filter(item => {
      // 按支付单号筛选
      const matchPaymentId = !searchText.value || item.paymentId.includes(searchText.value);
      
      // 按状态筛选
      const matchStatus = !selectedStatus.value || item.status === selectedStatus.value;
      
      // 按日期筛选
      let matchDate = true;
      if (dateRange.value && dateRange.value.length === 2) {
        const paymentDate = new Date(item.paymentTime).getTime();
        const startDate = new Date(dateRange.value[0]).getTime();
        const endDate = new Date(dateRange.value[1]).getTime();
        matchDate = paymentDate >= startDate && paymentDate <= endDate;
      }
      
      return matchPaymentId && matchStatus && matchDate;
    });
    
    total.value = filteredPayments.value.length;
    loading.value = false;
  }, 500);
};

// 查看支付详情
const viewDetail = async (payment) => {
  detailVisible.value = true;
  detailLoading.value = true;
  
  // 模拟API调用
  setTimeout(() => {
    currentPayment.value = {
      ...payment,
      transactionId: 'TX' + Date.now(),
      channel: '第三方支付',
      remark: '电费缴纳'
    };
    detailLoading.value = false;
  }, 500);
};

// 处理搜索
const handleSearch = () => {
  fetchPaymentHistory(1, true);
};

// 处理日期变化
const handleDateChange = () => {
  fetchPaymentHistory(1, true);
};

// 处理分页
const handlePageChange = (page) => {
  fetchPaymentHistory(page);
};

// 处理排序
const handleSortChange = ({ prop, order }) => {
  if (order.includes('ascending')) {
    filteredPayments.value.sort((a, b) => a[prop] > b[prop] ? 1 : -1);
  } else {
    filteredPayments.value.sort((a, b) => a[prop] < b[prop] ? 1 : -1);
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

// 处理退款
const handleRefund = (payment) => {
  refundPayment.value = payment;
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
      
      // 模拟API调用
      setTimeout(() => {
        ElMessage.success('退款申请已提交，请等待审核');
        refundDialogVisible.value = false;
        refundLoading.value = false;
        
        // 更新支付记录状态
        const index = paymentList.value.findIndex(item => item.paymentId === refundPayment.value.paymentId);
        if (index !== -1) {
          paymentList.value[index].status = '退款中';
          filteredPayments.value = [...paymentList.value];
        }
      }, 1000);
    }
  });
};

// 下载电子收据
const downloadReceipt = async (payment) => {
  // 模拟下载过程
  setTimeout(() => {
    ElMessage.success('收据下载成功');
  }, 500);
};

// 获取状态对应的类型
const getStatusType = (status) => {
  switch (status) {
    case '已支付':
      return 'success';
    case '失败':
      return 'danger';
    case '退款中':
    case '退款':
      return 'warning';
    default:
      return 'info';
  }
};

onMounted(() => {
  fetchPaymentHistory(1, true);
});
</script>

<style scoped>
.eb-payment-history-header {
  margin-bottom: 20px;
}

.amount {
  font-weight: 500;
}

.detail-loading {
  padding: 20px;
}

.payment-detail {
  padding: 20px;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.detail-item {
  display: flex;
  margin-bottom: 15px;
}

.detail-label {
  width: 100px;
  color: #606266;
  font-weight: 500;
}

.detail-value {
  flex: 1;
  color: #303133;
}

.detail-actions {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
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