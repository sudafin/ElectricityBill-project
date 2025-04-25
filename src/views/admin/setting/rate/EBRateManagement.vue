<template>
  <div class="rate-management">
    <div class="content-wrapper">
      <!-- 添加标题区域 -->
      <div class="dashboard-header">
        <div class="title-area">
          <el-icon class="header-icon"><Money /></el-icon>
          <h2 class="header-title">费率管理</h2>
        </div>
      </div>
      
      <!-- 使用筛选栏组件 -->
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
            type="primary" 
            class="action-button" 
            size="default"
            @click="handleAddRate"
          >
            <el-icon><Plus /></el-icon>新增费率
          </el-button>
          <el-button 
            type="danger" 
            class="action-button" 
            size="default"
            @click="handleBatchDelete" 
            :disabled="!selectedRateIds.length"
          >
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
        </template>
      </EBFilterBar>

      <!-- 使用表格组件 -->
      <div class="table-container">
        <EBTable
          ref="tableRef"
          :columns="tableColumns"
          :data="rateList"
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
          :row-style="{ height: '55px' }"
        >
          <!-- 用户类型列自定义渲染 -->
          <template #userType="{ row }">
            <el-tag :type="getUserTypeTagType(row.userType)">
              {{ row.userType }}
            </el-tag>
          </template>

          <!-- 状态列自定义渲染 -->
          <template #status="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>

          <!-- 操作列 -->
          <template #actions="{ row }">
            <el-button type="primary" link size="small" @click="navigateToDetail(row)">
              详情
            </el-button>
            <el-button type="primary" link size="small" @click="navigateToEdit(row)">
              修改
            </el-button>
          </template>
        </EBTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Money, Search, Calendar, View, Edit, Plus, Delete 
} from '@element-plus/icons-vue';
import { EBFilterBar, EBTable } from '@/components';
import { 
  queryRatePage, 
  deleteRate 
} from '@/api/admin/rate';
import { getUserTypeList } from '@/api/admin/user';

const router = useRouter();

// 表格数据
const loading = ref(false);
const rateList = ref([]);
const selectedRateIds = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 搜索条件
const searchRateId = ref('');
const searchUserType = ref('');
const searchStatus = ref('');
const dateRange = ref([]);

// 用户类型列表
const userTypeOptions = ref([
  { label: '全部', value: '' }
]);

// 筛选条件配置
const filterConfig = ref([
  {
    type: 'input',
    field: 'searchRateId',
    label: '费率ID',
    placeholder: '请输入费率ID'
  },
  {
    type: 'select',
    field: 'searchUserType',
    label: '用户类型',
    options: userTypeOptions
  },
  {
    type: 'select',
    field: 'searchStatus',
    label: '状态',
    options: [
      { label: '全部', value: '' },
      { label: '启用', value: '1' },
      { label: '禁用', value: '0' }
    ]
  },
  {
    type: 'daterange',
    field: 'dateRange',
    label: '生效日期'
  }
]);

// 初始值
const initialFilterValues = {
  searchRateId: '',
  searchUserType: '',
  searchStatus: '',
  dateRange: []
};

// 表格列配置
const tableColumns = [
  { prop: 'userType', label: '用户类型', minWidth: '100' },
  { prop: 'peakPrice', label: '峰时电价(元/度)', minWidth: '140' }, 
  { prop: 'flatPrice', label: '平时电价(元/度)', minWidth: '140' },
  { prop: 'valleyPrice', label: '谷时电价(元/度)', minWidth: '140' },
  { prop: 'status', label: '状态', minWidth: '80' },
  { prop: 'effectiveDate', label: '生效日期', minWidth: '120' },
  { prop: 'expireDate', label: '失效日期', minWidth: '120' }
];

// 获取用户类型列表
const fetchUserTypes = async () => {
  try {
    const res = await getUserTypeList();
    console.log('获取到的用户类型:', res);
    
    if (res && Array.isArray(res)) {
      // 直接处理字符串数组
      const types = res
        .filter(type => type && type.trim() !== '')
        .map(type => ({ label: type, value: type }));
      
      userTypeOptions.value = [{ label: '全部', value: '' }, ...types];
      
      // 动态更新filterConfig中的options
      const userTypeFilterIndex = filterConfig.value.findIndex(item => item.field === 'searchUserType');
      if (userTypeFilterIndex !== -1) {
        filterConfig.value[userTypeFilterIndex].options = userTypeOptions.value;
      }
    }
  } catch (error) {
    console.error('获取用户类型列表失败:', error);
    // 出错时使用默认用户类型
    userTypeOptions.value = [
      { label: '全部', value: '' },
      { label: '居民用户', value: '居民用户' },
      { label: '商业用户', value: '商业用户' }
    ];
  }
};

// 获取费率列表
const fetchRateList = async (page = currentPage.value, shouldResetPage = false) => {
  loading.value = true;
  
  if (shouldResetPage) {
    currentPage.value = 1;
  } else {
    currentPage.value = page;
  }
  
  try {
    const res = await queryRatePage({
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      rateId: searchRateId.value,
      userType: searchUserType.value,
      status: searchStatus.value,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    });
    
    // 直接从响应中获取list和total，不进行字段映射转换
    rateList.value = res.list || [];
    total.value = Number(res.total || 0);
  } catch (error) {
    ElMessage.error('获取费率列表失败');
    console.error('获取费率列表失败', error);
    rateList.value = [];
  } finally {
    loading.value = false;
  }
};

// 处理筛选搜索
const handleFilterSearch = (filterValues) => {
  // 更新筛选值
  searchRateId.value = filterValues.searchRateId || '';
  searchUserType.value = filterValues.searchUserType || '';
  searchStatus.value = filterValues.searchStatus || '';
  dateRange.value = filterValues.dateRange || [];
  
  // 重新加载数据
  fetchRateList(1, true);
};

// 清空搜索条件
const clearSearch = () => {
  searchRateId.value = '';
  searchUserType.value = '';
  searchStatus.value = '';
  dateRange.value = [];
};

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedRateIds.value = selection.map(item => item.id);
};

// 分页处理
const handlePageChange = (page) => {
  fetchRateList(page);
};

// 新增费率 - 跳转到新增页面
const handleAddRate = () => {
  router.push({ name: 'RateCreate' });
};

// 查看费率详情 - 跳转到详情页面
const navigateToDetail = (row) => {
  router.push({ 
    name: 'RateDetail',
    params: { id: row.id }
  });
};

// 编辑费率 - 跳转到编辑页面
const navigateToEdit = (row) => {
  router.push({ 
    name: 'RateEdit',
    params: { id: row.id }
  });
};

// 批量删除费率
const handleBatchDelete = () => {
  if (selectedRateIds.value.length === 0) {
    ElMessage.warning('请选择要删除的费率');
    return;
  }
  
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRateIds.value.length} 个费率吗？删除后无法恢复`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      selectedRateIds.value = selectedRateIds.value.join(',');
      await deleteRate(selectedRateIds.value);
      ElMessage.success('批量删除成功');
      fetchRateList(1, true);
    } catch (error) {
      ElMessage.error('批量删除失败');
      console.error('批量删除费率失败', error);
    }
  }).catch(() => {});
};

// 添加一个函数来确定用户类型的标签颜色
const getUserTypeTagType = (userType) => {
  switch(userType) {
    case '居民用户':
      return 'success';
    case '商业用户':
      return 'primary';
    case '工业用户':
      return 'warning';
    case '农业用户':
      return 'info';
    default:
      return 'default';
  }
};

onMounted(async () => {
  await fetchUserTypes(); // 先获取用户类型
  fetchRateList(1, true); // 然后获取费率列表
});
</script>

<style scoped>
.rate-management {
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

/* 对话框内容样式 */
:deep(.el-dialog__body) {
  padding-top: 10px;
}

/* 确保表格撑满容器 */
:deep(.eb-table) {
  width: 100%;
}

:deep(.el-table) {
  width: 100%;
}

/* 表格行悬停效果 */
:deep(.el-table__row) {
  transition: all 0.3s ease;
}

:deep(.el-table__row:hover) {
  background-color: #f8faff !important;
}
</style> 