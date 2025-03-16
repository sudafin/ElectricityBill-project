<template>
  <EBPageLayout>
    <template #header>
      <EBSearchFilter
        v-model:searchValue="searchText"
        searchPlaceholder="搜索支付单号"
        @search="handleSearch"
        @clear="fetchPaymentList(1, true)"
      >
        <template #filters>
          <el-select v-model="selectedStatus" placeholder="支付状态" clearable style="width: 200px;">
            <el-option label="全部" value=""></el-option>
            <el-option label="已支付" value="已支付"></el-option>
            <el-option label="支付失败" value="失败"></el-option>
          </el-select>
          <el-select v-model="selectedMethod" placeholder="支付方式" clearable style="width: 200px;">
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
            value-format="YYYY-MM-DD"
            @change="fetchPaymentList"
          ></el-date-picker>
        </template>
        <template #actions>
          <el-button type="success" @click="exportPayments" class="eb-button-with-icon">
            <el-icon><Download /></el-icon>
            导出报表
          </el-button>
        </template>
      </EBSearchFilter>
    </template>

    <EBTable
      :columns="columns"
      :data="paymentList"
      :loading="loading"
      :selection="true"
      :show-actions="true"
      actions-width="120"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <!-- 支付状态插槽 -->
      <template #status="{ row }">
        <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
      </template>
      
      <!-- 操作插槽 -->
      <template #actions="{ row }">
        <div class="eb-actions">
          <el-button type="primary" link @click="showDetail(row)">详情</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </div>
      </template>
    </EBTable>

    <EBBatchActions>
      <el-button type="danger" @click="handleBatchDelete" :disabled="!selectedPaymentIds.length" class="eb-button-with-icon">
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
    </EBBatchActions>

    <EBPagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      :disabled="loading"
      @page-change="handlePageChange"
    />
    
    <template #extra>
      <el-drawer v-model="detailVisible" :title="`支付详情 支付单号: ${currentPayment.paymentId}`" size="40%" direction="rtl">
        <EBPaymentDetail :payment="currentPayment" @refund="handleRefund"></EBPaymentDetail>
      </el-drawer>
    </template>
  </EBPageLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Download, Delete } from '@element-plus/icons-vue';
import EBPaymentDetail from './EBPaymentDetail.vue';
import { getPaymentList, deletePayment, getPaymentDetail, refundPayment, getPaymentReport } from '@/api/payment.js';
import EBTable from '@/components/EBTable.vue';
import EBSearchFilter from '@/components/EBSearchFilter.vue';
import EBPagination from '@/components/EBPagination.vue';
import EBBatchActions from '@/components/EBBatchActions.vue';
import EBPageLayout from '@/components/EBPageLayout.vue';

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

// 定义表格列配置
const columns = ref([
  { prop: 'paymentId', label: '支付单号' },
  { prop: 'username', label: '用户名' },
  { prop: 'balance', label: '支付金额', sortable: true, sortBy: 'balance' },
  { prop: 'paymentMethod', label: '支付方式' },
  { prop: 'status', label: '支付状态' },
  { prop: 'paymentTime', label: '支付时间', sortable: true }
]);

const fetchPaymentList = async (page = currentPage.value, shouldResetPage = false) => {
  loading.value = true;
  if (shouldResetPage) {
    currentPage.value = 1;
  } else {
    currentPage.value = page;
  }
  try {
    const res = await getPaymentList({
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      paymentId: searchText.value,
      status: selectedStatus.value,
      paymentMethod: selectedMethod.value,
      startDate: dateRange.value && dateRange.value.length === 2 ? dateRange.value[0] : undefined,
      endDate: dateRange.value && dateRange.value.length === 2 ? dateRange.value[1] : undefined,
    });
    paymentList.value = res.list;
    total.value = Number(res.total);
  } catch (err) {
    ElMessage.error('获取支付列表失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPaymentList(1, true);
});

const handleSearch = () => {
  fetchPaymentList(1, true);
};

const handlePageChange = (page) => {
  fetchPaymentList(page);
};

const handleSortChange = ({ prop, order }) => {
  // 根据点击的排序字段和顺序排序
  if (order.includes('ascending')) {
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

const showDetail = async (payment) => {
  const detail = await getPaymentDetail(payment.paymentId);
  currentPayment.value = detail;
  detailVisible.value = true;
};

const handleRefund = async () => {
  try {
    const res = await refundPayment(currentPayment.value.paymentId);
    if (res.code === 200) {
      fetchPaymentList(1, true);
      ElMessage.success("退款成功");
    } else if (res.code === 400) {
      ElMessage.error(res.msg);
    } else {
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
    .then(async () => {
      const res = await deletePayment(row.paymentId);
      if (res.code === 200) {
        fetchPaymentList(1, true);
        ElMessage.success("删除成功");
      } else {
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
      selectedPaymentIds.value = selectedPaymentIds.value.join(',');
      const res = await deletePayment(selectedPaymentIds.value);
      if (res.code === 200) {
        fetchPaymentList(1, true);
        ElMessage.success("删除成功");
      } else {
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

const exportPayments = async () => {
  const res = await getPaymentReport();
  // 创建 Blob 对象并下载
  const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'payment_details.xlsx';
  link.click();
  window.URL.revokeObjectURL(url);
  if (res.size > 0) {
    ElMessage.success('支付报表导出成功');
  } else {
    ElMessage.error('支付报表导出失败');
  }
};
</script>

<style scoped>
/* 使用公共样式，移除重复的样式定义 */
</style> 