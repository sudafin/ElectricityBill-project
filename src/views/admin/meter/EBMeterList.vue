<template>
  <div class="meter-dashboard">
    <div class="content-wrapper">
      <!-- 添加标题区域 -->
      <div class="dashboard-header">
        <div class="title-area">
          <el-icon class="header-icon"><Odometer /></el-icon>
          <h2 class="header-title">电表管理</h2>
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
            type="primary" 
            class="action-button" 
            size="default"
            @click="handleCreate"
          >
            <el-icon><Plus /></el-icon>新增电表
          </el-button>
          <el-button 
            type="danger" 
            class="action-button" 
            size="default"
            @click="handleBatchDelete" 
            :disabled="!selectedMeterIds.length"
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
          :data="meterList"
          :loading="loading"
          :border="false"
          selection
          show-actions
          actions-width="200"
          :auto-height="true"
          pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          @selection-change="handleSelectionChange"
          @page-change="handlePageChange"
        >
          <!-- 状态列自定义渲染 -->
          <template #status="{ row }">
            <el-tag 
              :type="row.status === '正常' ? 'success' : row.status === '故障' ? 'danger' : 'info'"
            >
              {{ row.status }}
            </el-tag>
          </template>

          <!-- 绑定用户列自定义渲染 -->
          <template #username="{ row }">
            <span v-if="row.username">
              {{ row.username }}
              <el-tag size="small" type="success">已绑定</el-tag>
            </span>
            <span v-else class="no-bind">
              未绑定
              <el-button 
                type="primary" 
                link 
                size="small" 
                @click="handleBind(row)"
              >
                绑定用户
              </el-button>
            </span>
          </template>

          <!-- 操作列 -->
          <template #actions="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="primary" link size="small" @click="handleDetail(row)">
              详情
            </el-button>
            <el-button 
              type="danger" 
              link 
              size="small"
              @click="handleDelete(row.id)"
            >
              删除
            </el-button>
          </template>
        </EBTable>
      </div>
    </div>
    
    <!-- 绑定用户弹窗 -->
    <el-dialog
      v-model="bindDialogVisible"
      title="绑定用户"
      width="550px"
      destroy-on-close
    >
      <EBMeterBindUser 
        :meter="currentMeter" 
        @success="handleBindSuccess" 
        @cancel="bindDialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Odometer, Search, Calendar, CircleCheck, Plus, Delete, Edit, Link, View
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import EBMeterBindUser from './EBMeterBindUser.vue';
import { EBFilterBar, EBTable } from '@/components';

const router = useRouter();
const searchText = ref('');
const searchStatus = ref('');
const searchBind = ref('');
const dateRange = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const meterList = ref([]);
const total = ref(0);
const selectedMeterIds = ref([]);
const bindDialogVisible = ref(false);
const currentMeter = ref({});

// 筛选条件配置
const filterConfig = [
  {
    type: 'input',
    field: 'searchText',
    label: '关键词',
    placeholder: '搜索电表编号或型号'
  },
  {
    type: 'select',
    field: 'searchStatus',
    label: '电表状态',
    options: [
      { label: '全部', value: '' },
      { label: '正常', value: '正常' },
      { label: '故障', value: '故障' },
      { label: '停用', value: '停用' }
    ]
  },
  {
    type: 'select',
    field: 'searchBind',
    label: '绑定状态',
    options: [
      { label: '全部', value: '' },
      { label: '已绑定', value: 'bound' },
      { label: '未绑定', value: 'unbound' }
    ]
  },
  {
    type: 'daterange',
    field: 'dateRange',
    label: '安装日期'
  }
];

// 初始值
const initialFilterValues = {
  searchText: '',
  searchStatus: '',
  searchBind: '',
  dateRange: []
};

// 表格列配置
const tableColumns = [
  { prop: 'meterNo', label: '电表编号', width: '180' },
  { prop: 'model', label: '电表型号', minWidth: '160' },
  { prop: 'installDate', label: '安装日期', minWidth: '120' },
  { 
    prop: 'status', 
    label: '状态', 
    width: '100',
    type: 'tag',
    tagMap: {
      '正常': 'success',
      '故障': 'danger',
      '停用': 'info'
    }
  },
  { prop: 'username', label: '绑定用户', minWidth: '180' }
];

// 获取电表列表
const fetchMeterList = async (page = currentPage.value, shouldResetPage = false) => {
  loading.value = true;
  if (shouldResetPage) {
    currentPage.value = 1;
  } else {
    currentPage.value = page;
  }
  
  try {
    // 这里替换为实际的API调用
    const res = await getMeterList({
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchText.value,
      status: searchStatus.value,
      bindStatus: searchBind.value,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    });
    
    meterList.value = res.list;
    total.value = res.total;
  } catch (error) {
    ElMessage.error('获取电表列表失败');
    console.error('获取电表列表失败', error);
  } finally {
    loading.value = false;
  }
};

// 处理筛选搜索
const handleFilterSearch = (filterValues) => {
  // 更新筛选值
  searchText.value = filterValues.searchText || '';
  searchStatus.value = filterValues.searchStatus || '';
  searchBind.value = filterValues.searchBind || '';
  dateRange.value = filterValues.dateRange || [];
  
  // 重新加载数据
  fetchMeterList(1, true);
};

// 清空搜索条件
const clearSearch = () => {
  searchText.value = '';
  searchStatus.value = '';
  searchBind.value = '';
  dateRange.value = [];
};

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedMeterIds.value = selection.map(item => item.id);
};

// 分页处理
const handlePageChange = (page) => {
  fetchMeterList(page);
};

// 创建电表
const handleCreate = () => {
  router.push('/admin/meter/create');
};

// 编辑电表
const handleEdit = (row) => {
  router.push(`/admin/meter/edit/${row.id}`);
};

// 查看电表详情
const handleDetail = (row) => {
  router.push(`/admin/meter/detail/${row.id}`);
};

// 删除电表
const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该电表吗？删除后无法恢复', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 这里替换为实际的API调用
      await deleteMeter(id);
      ElMessage.success('删除成功');
      fetchMeterList(currentPage.value);
    } catch (error) {
      ElMessage.error('删除失败');
      console.error('删除电表失败', error);
    }
  }).catch(() => {});
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedMeterIds.value.length === 0) {
    ElMessage.warning('请选择要删除的电表');
    return;
  }
  
  ElMessageBox.confirm(`确定要删除选中的 ${selectedMeterIds.value.length} 个电表吗？删除后无法恢复`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 这里替换为实际的API调用
      await batchDeleteMeters(selectedMeterIds.value);
      ElMessage.success('批量删除成功');
      fetchMeterList(1, true);
    } catch (error) {
      ElMessage.error('批量删除失败');
      console.error('批量删除电表失败', error);
    }
  }).catch(() => {});
};

// 绑定用户
const handleBind = (row) => {
  currentMeter.value = row;
  bindDialogVisible.value = true;
};

// 绑定成功回调
const handleBindSuccess = () => {
  bindDialogVisible.value = false;
  fetchMeterList(currentPage.value);
  ElMessage.success('绑定用户成功');
};

onMounted(() => {
  fetchMeterList(1, true);
});
</script>

<style scoped>
.meter-dashboard {
  padding: 20px;
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

.no-bind {
  color: #909399;
  display: flex;
  align-items: center;
  gap: 8px;
}

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