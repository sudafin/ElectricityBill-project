<template>
  <div class="payment-list">
    <el-card>
      <template #header>
        <div class="header">
          <div class="search-filter">
            <el-input
              v-model="searchText"
              placeholder="搜索订单号、用户名、支付流水号"
              clearable
              @clear="fetchPaymentList"
              @keyup.enter="fetchPaymentList"
            >
              <template #append>
                <el-button icon="Search" @click="fetchPaymentList"></el-button>
              </template>
            </el-input>
            <el-select v-model="selectedStatus" placeholder="支付状态" clearable @change="fetchPaymentList">
              <el-option label="全部" value=""></el-option>
              <el-option label="成功" value="success"></el-option>
              <el-option label="失败" value="failed"></el-option>
              <el-option label="待处理" value="pending"></el-option>
            </el-select>
            <el-select v-model="selectedMethod" placeholder="支付方式" clearable @change="fetchPaymentList">
              <el-option label="全部" value=""></el-option>
              <el-option label="支付宝" value="alipay"></el-option>
              <el-option label="微信" value="wechat"></el-option>
              <el-option label="银行卡" value="bankcard"></el-option>
            </el-select>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="fetchPaymentList"
            ></el-date-picker>
            <el-button type="success" @click="exportPayments">
              <el-icon><Download /></el-icon>
              导出报表
            </el-button>
          </div>
        </div>
      </template>
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="paymentList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="orderNo" label="订单号" sortable></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="amount" label="支付金额" sortable></el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式"></el-table-column>
        <el-table-column label="支付状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paymentDate" label="支付时间" sortable></el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #header>
            <div class="cell">操作</div>
          </template>
          <template #default="{ row }">
            <div class="actions">
              <el-button type="primary" link @click="showDetail(row)">详情</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="batch-actions">
        <el-button type="danger" @click="handleBatchDelete" :disabled="!selectedPayments.length">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>
      <div class="pagination">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          :disabled="loading"
          @current-change="handlePageChange"
          layout="prev, pager, next, jumper"
          prev-text="上一页"
          next-text="下一页"
        ></el-pagination>
        <div class="total">共 {{ total }} 条</div>
      </div>
    </el-card>
    
    <el-drawer v-model="detailVisible" :title="'支付详情 #' + currentPayment.orderNo" size="40%" direction="rtl">
      <!-- :payment="currentPayment" 父组件传递支付信息对象currentPayment给子组件payment对象, 该对象子组件需要通过defineProps定义接收
      @retry="handleRetry" @urge="handleUrge" @refund="handleRefund" ,
      retry,urge,refund是子组件向父组件传递的事件名称, 子组件需要通过defineEmits定义接收,父组件通过函数handleRetry,handleUrge,handleRefund来接收事件传递的信息,如果有数据参数,需要通过函数参数接收数据
      -->
      <EBPaymentDetail :payment="currentPayment" @retry="handleRetry" @urge="handleUrge" @refund="handleRefund"></EBPaymentDetail>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { Download, Delete } from '@element-plus/icons-vue';
import EBPagination from '@/components/EBPagination.vue';
import EBPaymentDetail from './EBPaymentDetail.vue';

const searchText = ref('');
const selectedStatus = ref('');
const selectedMethod = ref('');
const dateRange = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const detailVisible = ref(false);
const currentPayment = ref({});
const selectedPayments = ref([]);

// 假数据
const mockData = [
  { id: 1, orderNo: 'P202306010001', username: '张三', userId: 'U001', amount: 100, paymentMethod: '支付宝', transactionNo: 'T001', status: 'success', paymentDate: '2023-06-01 10:00:00', billNo: 'B001' },
  { id: 2, orderNo: 'P202306020001', username: '李四', userId: 'U002', amount: 200, paymentMethod: '微信', transactionNo: 'T002', status: 'failed', failureReason: '余额不足', paymentDate: '2023-06-02 15:30:00', billNo: 'B002' },
  { id: 3, orderNo: 'P202306030001', username: '王五', userId: 'U003', amount: 150, paymentMethod: '银行卡', transactionNo: 'T003', status: 'pending', paymentDate: '2023-06-03 09:15:00', billNo: 'B003' },
  { id: 4, orderNo: 'P202306040001', username: '赵六', userId: 'U004', amount: 80, paymentMethod: '支付宝', transactionNo: 'T004', status: 'success', paymentDate: '2023-06-04 14:20:00', billNo: 'B004' },
  { id: 5, orderNo: 'P202306050001', username: '钱七', userId: 'U005', amount: 120, paymentMethod: '微信', transactionNo: 'T005', status: 'success', paymentDate: '2023-06-05 11:45:00', billNo: 'B005' },
];

const paymentList = ref(mockData);
const total = ref(mockData.length);

const fetchPaymentList = () => {
  // 根据搜索条件和筛选条件获取支付记录
  let list = mockData;
  if (searchText.value) {
    const searchRegex = new RegExp(searchText.value, 'i');
    list = list.filter(item => searchRegex.test(item.orderNo) || searchRegex.test(item.username) || searchRegex.test(item.transactionNo));
  }
  if (selectedStatus.value) {
    list = list.filter(item => item.status === selectedStatus.value);
  }
  if (selectedMethod.value) {
    list = list.filter(item => item.paymentMethod === selectedMethod.value);
  }
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value;
    list = list.filter(item => {
      const paymentDate = new Date(item.paymentDate);
      return paymentDate >= startDate && paymentDate <= endDate;
    });
  }
  paymentList.value = list;
  total.value = list.length;
};

const handleSortChange = ({ prop, order }) => {
  if (order) {
    paymentList.value.sort((a, b) => {
      const valueA = a[prop];
      const valueB = b[prop];
      return order === 'ascending' ? valueA - valueB : valueB - valueA;
    });
  } else {
    fetchPaymentList();
  }
};

const showDetail = (payment) => {
  currentPayment.value = payment;
  detailVisible.value = true;
};

const handleRetry = () => {
  // 重新支付
  console.log('重新支付:', currentPayment.value);
};

const handleUrge = () => {
  // 催促处理
  console.log('催促处理:', currentPayment.value);
};

const handleRefund = () => {
  // 退款
  ElMessageBox.prompt('请输入退款理由', '退款', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^.{1,100}$/,
    inputErrorMessage: '退款理由不能为空且不超过100个字符',
  })
    .then(({ value }) => {
      console.log('退款:', currentPayment.value, '退款理由:', value);
    })
    .catch(() => {});
};

const handleDelete = (payment) => {
  ElMessageBox.confirm('确定删除该支付记录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 模拟删除支付记录
      console.log('删除支付记录:', payment);
      paymentList.value = paymentList.value.filter(item => item.id !== payment.id);
      total.value = paymentList.value.length;
      ElMessage.success('删除成功');
    })
    .catch(() => {});
};

const handleSelectionChange = (selection) => {
  selectedPayments.value = selection;
};

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定删除选中的 ${selectedPayments.value.length} 条支付记录吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 模拟批量删除支付记录
      console.log('批量删除支付记录:', selectedPayments.value);
      const ids = selectedPayments.value.map(item => item.id);
      paymentList.value = paymentList.value.filter(item => !ids.includes(item.id));
      total.value = paymentList.value.length;
      selectedPayments.value = [];
      ElMessage.success('删除成功');
    })
    .catch(() => {});
};

const getStatusType = (status) => {
  switch (status) {
    case 'success':
      return 'success';
    case 'failed':
      return 'danger';
    case 'pending':
      return 'warning';
    default:
      return 'info';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'success':
      return '成功';
    case 'failed':
      return '失败';
    case 'pending':
      return '待处理';
    default:
      return '';
  }
};

const exportPayments = () => {
  // 导出支付报表
  console.log('导出支付报表');
};
</script>

<style scoped>
.payment-list {
  padding: 20px;
  background-color: #f5f7fa;
}

.el-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.header {
  margin-bottom: 20px;
}

.search-filter {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-filter .el-input {
  width: 240px;
}

.search-filter .el-select {
  width: 120px;
}

.search-filter .el-date-picker {
  width: 220px;
}

.search-filter .el-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
}

.search-filter .el-button .el-icon {
  margin-right: 4px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.total {
  color: #999;
  font-size: 14px;
}


.actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.drawer-content {
  padding: 20px;
}

.info-section {
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
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
}

.el-divider {
  margin: 16px 0;
}

.batch-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 