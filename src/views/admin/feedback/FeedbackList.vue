<template>
  <div class="feedback-dashboard">
    <div class="content-wrapper">
      <!-- 添加标题区域 -->
      <div class="dashboard-header">
        <div class="title-area">
          <el-icon class="header-icon"><ChatDotSquare /></el-icon>
          <h2 class="header-title">反馈管理</h2>
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
        <!-- 添加批量操作按钮 -->
        <template #append-buttons>
          <el-button 
            type="danger" 
            class="action-button" 
            size="default"
            @click="handleBatchClose" 
            :disabled="!selectedIds.length"
          >
            <el-icon><Close /></el-icon>批量关闭
          </el-button>
        </template>
      </EBFilterBar>

      <!-- 使用新的表格组件 -->
      <div class="table-container">
        <EBTable
          ref="tableRef"
          :columns="tableColumns"
          :data="list"
          :loading="loading"
          :border="false"
          selection
          show-actions
          actions-width="120"
          :auto-height="true"
          pagination
          :current-page="listQuery.page"
          :page-size="listQuery.limit"
          :total="total"
          @selection-change="handleSelectionChange"
          @page-change="handlePageChange"
        >
          <!-- 状态列自定义渲染 -->
          <template #status="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>

          <!-- 操作列 -->
          <template #actions="{ row }">
            <router-link :to="'/feedback/process/'+row.id">
              <el-button type="primary" link size="small">处理</el-button>  
            </router-link>
          </template>
        </EBTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { parseTime } from '@/utils';
import { ChatDotSquare, Search, Calendar, Close } from '@element-plus/icons-vue';
import { EBFilterBar, EBTable } from '@/components';
import { ElMessage, ElMessageBox } from 'element-plus';

// 状态数据
const loading = ref(false);
const list = ref([]);
const total = ref(0);
const selectedIds = ref([]);
const listQuery = reactive({
  page: 1,
  limit: 10,
  feedback_type: '',
  status: '',
  submit_time: ''
});

// 筛选条件配置
const filterConfig = [
  {
    type: 'select',
    field: 'feedback_type',
    label: '反馈类型',
    options: [
      { label: '全部类型', value: '' },
      { label: '投诉', value: 'complaint' },
      { label: '建议', value: 'suggestion' },
      { label: '问题', value: 'question' }
    ]
  },
  {
    type: 'select',
    field: 'status',
    label: '状态',
    options: [
      { label: '全部', value: '' },
      { label: '待处理', value: 'pending' },
      { label: '已处理', value: 'processed' },
      { label: '已关闭', value: 'closed' }
    ]
  },
  {
    type: 'daterange',
    field: 'submit_time',
    label: '提交时间'
  }
];

// 初始值
const initialFilterValues = {
  feedback_type: '',
  status: '',
  submit_time: ''
};

// 表格列配置
const tableColumns = [
  { prop: 'id', label: 'ID', width: '80' },
  { prop: 'user_id', label: '用户ID', width: '80' },
  { prop: 'feedback_type', label: '反馈类型' },
  { prop: 'content', label: '反馈内容', width: '400', showOverflowTooltip: true },
  { 
    prop: 'status', 
    label: '状态',
    type: 'tag',
    tagMap: {
      'pending': 'info',
      'processed': 'success',
      'closed': 'warning'
    }
  },
  { prop: 'submit_time', label: '提交时间', width: '180', formatter: (row) => parseTime(row.submit_time, '{y}-{m}-{d} {h}:{i}') }
];

// 获取标签类型
const getStatusType = (status) => {
  switch (status) {
    case 'pending':
      return 'info';
    case 'processed':
      return 'success';
    case 'closed':
      return 'warning';
    default:
      return '';
  }
};

// 获取列表数据
const getList = () => {
  loading.value = true;
  // 根据筛选条件获取反馈列表数据
  // ... 实际的API调用
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

// 处理筛选搜索
const handleFilterSearch = (filterValues) => {
  // 更新筛选值
  listQuery.feedback_type = filterValues.feedback_type || '';
  listQuery.status = filterValues.status || '';
  listQuery.submit_time = filterValues.submit_time || '';
  
  listQuery.page = 1;
  getList();
};

// 清空搜索条件
const clearSearch = () => {
  Object.assign(listQuery, {
    page: 1,
    feedback_type: '',
    status: '',
    submit_time: ''
  });
};

// 分页处理
const handlePageChange = (page) => {
  listQuery.page = page;
  getList();
};

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id);
};

// 批量关闭反馈
const handleBatchClose = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要关闭的反馈');
    return;
  }
  
  ElMessageBox.confirm(`确定要关闭选中的 ${selectedIds.value.length} 条反馈吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 这里替换为实际的API调用
      // await batchCloseFeedback(selectedIds.value);
      ElMessage.success('批量关闭成功');
      getList();
    } catch (error) {
      ElMessage.error('批量关闭失败');
      console.error('批量关闭反馈失败', error);
    }
  }).catch(() => {});
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.feedback-dashboard {
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
</style> 