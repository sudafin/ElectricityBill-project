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
          actions-fixed="right"
          :auto-height="true"
          pagination
          :current-page="listQuery.pageNo"
          :page-size="listQuery.pageSize"
          :total="total"
          @selection-change="handleSelectionChange"
          @page-change="handlePageChange"
          :row-style="{ height: '55px' }"
        >
          <!-- 状态列自定义渲染 -->
          <template #status="{ row }">
            <el-tag :type="getStatusType(row.feedbackStatus)">{{ row.feedbackStatus }}</el-tag>
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
import { queryFeedBackPage, processFeedBack, getFeedbackType } from '@/api/admin/feedback';

// 状态数据
const loading = ref(false);
const list = ref([]);
const total = ref(0);
const selectedIds = ref([]);
const listQuery = reactive({
  pageNo: 1,
  pageSize: 10,
  feedbackType: '',
  feedbackStatus: '',
  feedbackId: '',
  startDate: '',
  endDate: '',
  isAsc: false
});

// 获取反馈类型列表
const feedbackTypes = ref([]);

// 筛选条件配置
const filterConfig = [
  {
    type: 'input',
    field: 'feedbackId',
    label: '反馈ID',
    placeholder: '请输入反馈ID'
  },
  {
    type: 'select',
    field: 'feedbackType',
    label: '反馈类型',
    options: [
      { label: '全部类型', value: '' },
      // 动态生成的选项
    ]
  },
  {
    type: 'select',
    field: 'feedbackStatus',
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
    field: 'dateRange',
    label: '提交时间'
  }
];

// 初始值
const initialFilterValues = {
  feedbackId: '',
  feedbackType: '',
  feedbackStatus: '',
  dateRange: []
};

// 表格列配置
const tableColumns = [
  { prop: 'id', label: 'ID', minWidth: '80' },
  { prop: 'userName', label: '用户名', minWidth: '100' },
  { prop: 'feedbackType', label: '反馈类型', minWidth: '120' },
  { prop: 'content', label: '反馈内容', minWidth: '400', showOverflowTooltip: true },
  { 
    prop: 'feedbackStatus', 
    label: '状态',
    minWidth: '100',
    type: 'tag',
    tagMap: {
      'pending': 'info',
      'processed': 'success',
      'closed': 'warning'
    }
  },
  { prop: 'submitTime', label: '提交时间', minWidth: '180' }
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

// 获取反馈类型列表
const fetchFeedbackTypes = async () => {
  try {
    const res = await getFeedbackType();
    if (res && typeof res === 'object') {
      // 转换成选项格式
      const types = [];
      for (const [key, values] of Object.entries(res)) {
        values.forEach(value => {
          types.push({ label: value, value });
        });
      }
      feedbackTypes.value = types;
      // 更新过滤器配置
      const typeFilterIndex = filterConfig.findIndex(f => f.field === 'feedbackType');
      if (typeFilterIndex > -1) {
        filterConfig[typeFilterIndex].options = [
          { label: '全部类型', value: '' },
          ...types
        ];
      }
    }
  } catch (error) {
    console.error('获取反馈类型失败', error);
  }
};

// 获取列表数据
const getList = async () => {
  loading.value = true;
  try {
    const res = await queryFeedBackPage(listQuery);
    list.value = res.list || [];
    total.value = res.total || 0;
  } catch (error) {
    console.error('获取反馈列表失败', error);
    ElMessage.error('获取反馈列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理筛选搜索
const handleFilterSearch = (filterValues) => {
  // 更新筛选值
  listQuery.feedbackId = filterValues.feedbackId || '';
  listQuery.feedbackType = filterValues.feedbackType || '';
  listQuery.feedbackStatus = filterValues.feedbackStatus || '';
  
  if (filterValues.dateRange && filterValues.dateRange.length === 2) {
    listQuery.startDate = filterValues.dateRange[0];
    listQuery.endDate = filterValues.dateRange[1];
  } else {
    listQuery.startDate = '';
    listQuery.endDate = '';
  }
  
  listQuery.pageNo = 1;
  getList();
};

// 清空搜索条件
const clearSearch = () => {
  Object.assign(listQuery, {
    pageNo: 1,
    feedbackId: '',
    feedbackType: '',
    feedbackStatus: '',
    startDate: '',
    endDate: ''
  });
};

// 分页处理
const handlePageChange = (page) => {
  listQuery.pageNo = page;
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
      // 逐个处理关闭操作
      for (const id of selectedIds.value) {
        await processFeedBack({
          feedbackId: id,
          feedbackStatus: 'closed',
          response: '批量关闭'
        });
      }
      ElMessage.success('批量关闭成功');
      getList();
    } catch (error) {
      ElMessage.error('批量关闭失败');
      console.error('批量关闭反馈失败', error);
    }
  }).catch(() => {});
};

onMounted(() => {
  fetchFeedbackTypes();
  getList();
});
</script>

<style scoped>
.feedback-dashboard {
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
</style> 