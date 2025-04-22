<template>
  <div class="payment-dashboard">
    <div class="content-wrapper">
      <!-- 添加标题区域 -->
      <div class="dashboard-header">
        <div class="title-area">
          <el-icon class="header-icon"><Wallet /></el-icon>
          <h2 class="header-title">支付管理</h2>
        </div>
      </div>
      
      <!-- 使用新的筛选栏组件 -->
      <EBFilterBar
        :filters="filterConfig"
        :initial-values="initialFilterValues"
        button-size="default"
        @search="handleFilterSearch"
        @reset="clearSearch"
      >
        <!-- 添加额外按钮 -->
        <template #append-buttons>
          <el-button 
            type="success" 
            class="action-button" 
            size="default"
            @click="exportPayments"
          >
            <el-icon><Download /></el-icon>导出报表
          </el-button>
          <el-button 
            type="danger" 
            class="action-button" 
            size="default"
            @click="handleBatchDelete" 
            :disabled="!selectedPaymentIds.length"
          >
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
        </template>
      </EBFilterBar>

      <!-- 使用新的表格组件 -->
      <div class="table-container">
        <EBTable
          ref="tableRef"
          :columns="tableColumns"
          :data="paymentList"
          :loading="loading"
          :border="false"
          selection
          show-actions
          actions-width="120"
          actions-fixed="right"
          :auto-height="true"
          pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          @selection-change="handleSelectionChange"
          @page-change="handlePageChange"
          @sort-change="handleSortChange"
          :row-style="{ height: '55px' }"
        >
          <!-- 状态列自定义渲染 -->
          <template #status="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>

          <!-- 操作列 -->
          <template #actions="{ row }">
            <el-button type="primary" link size="small" @click="showDetail(row)">详情</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </EBTable>
      </div>
    </div>
    
    <!-- 详情抽屉 -->
    <el-drawer 
      v-model="detailVisible" 
      :title="`支付详情 支付单号: ${currentPayment.paymentId}`" 
      size="40%" 
      direction="rtl"
    >
      <EBPaymentDetail :payment="currentPayment" @refund="handleRefund"></EBPaymentDetail>
    </el-drawer>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Wallet, Download, Delete, Search, Calendar } from '@element-plus/icons-vue';
import EBPaymentDetail from './EBPaymentDetail.vue';
import { getPaymentList, deletePayment, getPaymentDetail, refundPayment, getPaymentReport } from '@/api/admin/fee.js';
import { EBFilterBar, EBTable } from '@/components';

const searchText = ref('');
const selectedStatus = ref('');
const selectedMethod = ref('');
const dateRange = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const detailVisible = ref(false);
const currentPayment = ref({});
const selectedPaymentIds = ref([]);
const paymentList = ref([]);
const total = ref(0);

// 筛选条件配置
const filterConfig = [
  {
    type: 'input',
    field: 'searchText',
    label: '支付单号',
    placeholder: '搜索支付单号'
  },
  {
    type: 'select',
    field: 'selectedStatus',
    label: '支付状态',
    options: [
      { label: '全部', value: '' },
      { label: '已支付', value: '已支付' },
      { label: '支付失败', value: '失败' }
    ]
  },
  {
    type: 'select',
    field: 'selectedMethod',
    label: '支付方式',
    options: [
      { label: '全部', value: '' },
      { label: '支付宝', value: '支付宝' },
      { label: '微信', value: '微信' },
      { label: '银行卡', value: '银行卡' }
    ]
  },
  {
    type: 'daterange',
    field: 'dateRange',
    label: '日期范围'
  }
];

// 初始值
const initialFilterValues = {
  searchText: '',
  selectedStatus: '',
  selectedMethod: '',
  dateRange: []
};

// 表格列配置
const tableColumns = [
  { prop: 'paymentId', label: '支付单号', minWidth: '180' },
  { prop: 'username', label: '用户名', minWidth: '120' },
  { prop: 'balance', label: '支付金额', minWidth: '120', sortable: true },
  { prop: 'paymentMethod', label: '支付方式', minWidth: '120' },
  { 
    prop: 'status', 
    label: '支付状态',
    minWidth: '100',
    type: 'tag',
    tagMap: {
      '已支付': 'success',
      '失败': 'danger',
      '退款': 'warning'
    }
  },
  { prop: 'paymentTime', label: '支付时间', minWidth: '180', sortable: true }
];

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

// 处理筛选搜索
const handleFilterSearch = (filterValues) => {
  // 更新筛选值
  searchText.value = filterValues.searchText || '';
  selectedStatus.value = filterValues.selectedStatus || '';
  selectedMethod.value = filterValues.selectedMethod || '';
  dateRange.value = filterValues.dateRange || [];
  
  // 重新加载数据
  fetchPaymentList(1, true);
};

// 清空搜索条件
const clearSearch = () => {
  searchText.value = '';
  selectedStatus.value = '';
  selectedMethod.value = '';
  dateRange.value = [];
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
  if (selectedPaymentIds.value.length === 0) {
    ElMessage.warning('请选择要删除的支付记录');
    return;
  }
  
  ElMessageBox.confirm(`确定删除选中的 ${selectedPaymentIds.value.length} 条支付记录吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const ids = selectedPaymentIds.value.join(',');
      const res = await deletePayment(ids);
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
.payment-dashboard {
  padding: 0px;
  background-color: #f5f7fa;
}

.content-wrapper {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  position: relative;
}

.content-wrapper:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

/* 标题区域样式 */
.dashboard-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff;
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
  line-height: 1.5;
}

.table-container {
  padding: 0 20px 20px 20px;
  background-color: #fff;
  border-radius: 0 0 8px 8px;
}

/* 自定义表头样式 */
:deep(.el-table th.el-table__cell) {
  background-color: #f8f9fb;
  color: #606266;
  font-weight: 500;
  padding: 12px 0;
}

/* 自定义表格单元格样式 */
:deep(.el-table td.el-table__cell) {
  padding: 12px 0;
  height: 55px;
  line-height: 20px;
}

/* 确保表格内容垂直居中 */
:deep(.el-table .cell) {
  display: flex;
  align-items: center;
  height: 100%;
}

/* 标签特殊处理，避免由于flex布局导致的显示问题 */
:deep(.el-table .el-tag) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 操作列的特殊处理 */
:deep(.el-table .cell .el-button) {
  margin: 0 5px;
}

:deep(.el-table .cell .el-button--link) {
  height: auto;
  padding: 4px 0;
}

/* 固定列阴影效果优化 */
:deep(.el-table .is-right-fixed) {
  box-shadow: -5px 0 5px -5px rgba(0, 0, 0, 0.12);
}

:deep(.el-table .is-right-fixed .cell) {
  padding-left: 10px;
  padding-right: 10px;
}

/* 统一移除EBFilterBar和EBTable的边框样式 */
:deep(.eb-filter-bar .filter-container) {
  box-shadow: none;
  border-radius: 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 0;
}

:deep(.eb-table .el-table) {
  border: none;
}

:deep(.eb-pagination) {
  padding-top: 15px;
}

/* 统一操作区按钮样式 */
:deep(.action-button) {
  min-width: 90px;
}

:deep(.el-button--link) {
  min-width: auto;
}
</style> 