<template>
  <div class="bill-dashboard">
    <div class="content-wrapper">
      <!-- 添加标题区域 -->
      <div class="dashboard-header">
        <div class="title-area">
          <el-icon class="header-icon"><Wallet /></el-icon>
          <h2 class="header-title">账单管理</h2>
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
            @click="handleExportBills"
          >
            <el-icon><Download /></el-icon>导出报表
          </el-button>
        </template>
      </EBFilterBar>

      <!-- 使用新的表格组件 -->
      <div class="table-container">
        <EBTable
          ref="tableRef"
          :columns="tableColumns"
          :data="billList"
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
            <el-button type="primary" link size="small" @click="navigateToDetail(row)">详情</el-button>
          </template>
        </EBTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Wallet, Download } from '@element-plus/icons-vue';
import { getBillList, exportBills } from '@/api/admin/bill.js';
import { EBFilterBar, EBTable } from '@/components';

const router = useRouter();
const searchText = ref('');
const selectedStatus = ref('');
const selectedMethod = ref('');
const dateRange = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const billList = ref([]);
const total = ref(0);

// 筛选条件配置
const filterConfig = [
  {
    type: 'input',
    field: 'searchText',
    label: '账单号',
    placeholder: '搜索账单号'
  },
  {
    type: 'select',
    field: 'selectedStatus',
    label: '支付状态',
    options: [
      { label: '全部', value: '' },
      { label: '已支付', value: '已支付' },
      { label: '支付失败', value: '失败' },
      { label: '未支付', value: '未支付' }
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
  { prop: 'billId', label: '账单号', minWidth: '120' },
  { prop: 'username', label: '用户名', minWidth: '120' },
  { prop: 'userType', label: '用户类型', minWidth: '120' },
  { prop: 'status', label: '支付状态', minWidth: '120' },
  { prop: 'paymentAmount', label: '支付金额', minWidth: '120', sortable: true },
  { prop: 'usageAmount', label: '用电量', minWidth: '120', sortable: true },
  { prop: 'paymentId', label: '支付单号', minWidth: '180', 
    formatter: (row) => {
      return row.paymentId || '未支付';
    }
  },
  { prop: 'paymentTime', label: '支付时间', minWidth: '180',
    formatter: (row) => {
      return row.paymentTime ? formatDateTime(row.paymentTime) : '未支付';
    }
  },

];

const fetchBillList = async (page = currentPage.value, shouldResetPage = false) => {
  loading.value = true;
  if (shouldResetPage) {
    currentPage.value = 1;
  } else {
    currentPage.value = page;
  }
  try {
    const res = await getBillList({
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      billId: searchText.value ? parseInt(searchText.value) : undefined,
      status: selectedStatus.value,
      startDate: dateRange.value && dateRange.value.length === 2 ? dateRange.value[0] : undefined,
      endDate: dateRange.value && dateRange.value.length === 2 ? dateRange.value[1] : undefined,
      isAsc: true,
      sortBy: ''
    });
    billList.value = res.list || [];
    total.value = Number(res.total || 0);
  } catch (err) {
    ElMessage.error('获取账单列表失败');
    console.error('获取账单列表失败', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchBillList(1, true);
});

// 处理筛选搜索
const handleFilterSearch = (filterValues) => {
  // 更新筛选值
  searchText.value = filterValues.searchText || '';
  selectedStatus.value = filterValues.selectedStatus || '';
  selectedMethod.value = filterValues.selectedMethod || '';
  dateRange.value = filterValues.dateRange || [];
  
  // 重新加载数据
  fetchBillList(1, true);
};

// 清空搜索条件
const clearSearch = () => {
  searchText.value = '';
  selectedStatus.value = '';
  selectedMethod.value = '';
  dateRange.value = [];
};

const handlePageChange = (page) => {
  fetchBillList(page);
};

const handleSortChange = ({ prop, order }) => {
  // 根据点击的排序字段和顺序排序
  if (order.includes('ascending')) {
    billList.value.sort((a, b) => {
      const valueA = a[prop];
      const valueB = b[prop];
      return valueA - valueB;
    });
  } else {
    billList.value.sort((a, b) => {
      const valueA = a[prop];
      const valueB = b[prop];
      return valueB - valueA;
    });
  }
};

// 导航到详情页面
const navigateToDetail = (bill) => {
  router.push({
    name: 'BillDetail',
    params: { id: bill.billId }
  });
};

const handleSelectionChange = (selectionRows) => {
  // 实现选择逻辑，仅记录被选中行
  console.log('选中的行：', selectionRows);
};

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

const handleExportBills = async () => {
  try {
    const res = await exportBills({
      status: selectedStatus.value,
      paymentMethod: selectedMethod.value,
      startDate: dateRange.value && dateRange.value.length === 2 ? dateRange.value[0] : undefined,
      endDate: dateRange.value && dateRange.value.length === 2 ? dateRange.value[1] : undefined,
    });
    // 创建 Blob 对象并下载
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bill_details.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
    ElMessage.success('账单报表导出成功');
  } catch (err) {
    ElMessage.error('账单报表导出失败');
    console.error('账单报表导出失败', err);
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
.bill-dashboard {
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