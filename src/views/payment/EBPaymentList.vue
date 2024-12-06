<template>
  <div class="payment-list">
    <el-card>
      <template #header>
        <div class="header">
          <div class="search-filter">
            <el-input
              v-model="searchText"
              placeholder="搜索支付单号"
              clearable
              @clear="fetchPaymentList(1,true)"
              @keyup.enter="fetchPaymentList(1,true)"
              style="width: 300px;"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="selectedStatus" placeholder="支付状态" clearable style="width: 200px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="已支付" value="已支付"></el-option>
              <el-option label="支付失败" value="失败"></el-option>
            </el-select>
            <el-select v-model="selectedMethod" placeholder="支付方式" clearable 
            style="width: 200px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="支付宝" value="支付宝"></el-option>
              <el-option label="微信" value="微信"></el-option>
              <el-option label="银行卡" value="银行卡"></el-option>
            </el-select>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="fetchPaymentList"
            ></el-date-picker>
            <el-button type="primary" @click="handleSearch" >
              <el-icon><Search /></el-icon>搜索
            </el-button>
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
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="paymentId" label="支付单号"  ></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="balance" label="支付金额" sortable sort-by="balance"></el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式"></el-table-column>
        <el-table-column label="支付状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paymentTime" label="支付时间" sortable></el-table-column>
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
        <el-button type="danger" @click="handleBatchDelete" :disabled="!selectedPaymentIds.length">
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
    
    <el-drawer v-model="detailVisible" :title="`支付详情 支付单号: ${currentPayment.paymentId}`" size="40%" direction="rtl">
      <!-- :payment="currentPayment" 父组件传递支付信息对象currentPayment给子组件payment对象, 该对象子组件需要通过defineProps定义接收
      @retry="handleRetry" @urge="handleUrge" @refund="handleRefund" ,
      retry,urge,refund是子组件向父组件传递的事件名称, 子组件需要通过defineEmits定义接收,父组件通过函数handleRetry,handleUrge,handleRefund来接收事件传递的信息,如果有数据参数,需要通过函数参数接收数据
      -->
      <EBPaymentDetail :payment="currentPayment" @refund="handleRefund"></EBPaymentDetail>
    </el-drawer>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { ElMessageBox,ElMessage } from 'element-plus';
import { Download, Delete, Search } from '@element-plus/icons-vue';
import EBPaymentDetail from './EBPaymentDetail.vue';
import { getPaymentList, deletePayment,getPaymentDetail,refundPayment } from '@/api/payment';

const searchText = ref('');
const selectedStatus = ref('');
const selectedMethod = ref('');
const dateRange = ref([]);
const currentPage = ref(1);
const pageSize = ref(5);
const loading = ref(false);
const detailVisible = ref(false);
const currentPayment = ref({});
const selectedPaymentIds = ref([]);
const paymentList = ref([]);
const total = ref(0);

const fetchPaymentList =async (page = currentPage.value,
shouldResetPage =false) => {
  loading.value = true;
  if(shouldResetPage){
    currentPage.value = 1;
  }else{
    currentPage.value = page;
  }
try{
  const res = await  getPaymentList({
    pageNo: currentPage.value,
    pageSize: pageSize.value,
    paymentId: searchText.value,
    status: selectedStatus.value,
    paymentMethod: selectedMethod.value,
    startDate: dateRange.value && dateRange.value.length === 2 ? dateRange.value[0] : undefined,
    endDate: dateRange.value && dateRange.value.length === 2 ? dateRange.value[1] : undefined,
  })
  paymentList.value = res.list;
  total.value = Number(res.total);
} catch (err) {
  ElMessage.error('获取支付列表失败');
} finally {
    loading.value = false;
  } 
};
onMounted(()=>{
  fetchPaymentList(1,true);
})

const handleSearch = () => {
  fetchPaymentList(1,true);
};

const handlePageChange = (page) => {
  fetchPaymentList(page);
}

const handleSortChange = ({ prop, order }) => {
  //根据点击的排序字段和顺序排序
  if(order.includes('ascending')){
    paymentList.value.sort((a, b) => {
      const valueA = a[prop];
      const valueB = b[prop];
      return valueA - valueB;
    });
  } else {
    paymentList.value.sort((a, b) => {
      const valueA = a[prop];
      const valueB = b[prop];
      return valueB - valueA;
    });
  }
};

const showDetail =async (payment) => {
  const detail = await getPaymentDetail(payment.paymentId);
  currentPayment.value = detail;
  detailVisible.value = true;
};


const handleRefund = async() => {
try{
  const res = await refundPayment(currentPayment.value.paymentId);
  if(res.code === 200){
    fetchPaymentList(1,true);
    ElMessage.success("退款成功")
  }else if(res.code === 400){
    ElMessage.error(res.msg);
  }else{
    ElMessage.error('退款失败');
  }
} catch (err) {
  ElMessage.error('网络失败');
}
};

const handleDelete = async (row) => {
  ElMessageBox.confirm('确定删除该支付记录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async() => {
      const res = await deletePayment(row.paymentId)
      if(res.code ===200){
        fetchPaymentList(1,true);
        ElMessage.success("删除成功")
      }else{
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

const handleSelectionChange = (selectionRows) => {
  selectedPaymentIds.value = selectionRows.map(row => row.paymentId);
};

const handleBatchDelete = async () => {
  ElMessageBox.confirm(`确定删除选中的 ${selectedPaymentIds.value.length} 条支付记录吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      selectedPaymentIds.value  = selectedPaymentIds.value.join(',');
      const res = await deletePayment(selectedPaymentIds.value);
      if(res.code ===200){
        fetchPaymentList(1,true);
        ElMessage.success("删除成功")
      }else{
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {
      ElMessage.error('网络错误');
    });
};

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