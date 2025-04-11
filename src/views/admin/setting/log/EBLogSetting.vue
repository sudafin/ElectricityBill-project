<template>
  <div class="log-setting">
    <div class="content-wrapper">
      <!-- 添加标题区域 -->
      <div class="dashboard-header">
        <div class="title-area">
          <el-icon class="header-icon"><Document /></el-icon>
          <h2 class="header-title">系统日志</h2>
        </div>
      </div>
      
      <!-- 使用新的筛选栏组件 -->
      <EBFilterBar
        :filters="filterConfig"
        :initial-values="initialFilterValues"
        button-size="default"
        @search="handleSearch"
        @reset="clearSearch"
      >
        <!-- 添加额外按钮 -->
        <template #append-buttons>
          <el-button 
            type="success" 
            class="action-button" 
            size="default"
            @click="handleExport"
          >
            <el-icon><Download /></el-icon>导出日志
          </el-button>
          <el-button 
            type="danger" 
            class="action-button" 
            size="default"
            @click="handleClearLogs"
            :disabled="!selectedRows.length"
          >
            <el-icon><Delete /></el-icon>清理日志
          </el-button>
        </template>
      </EBFilterBar>

      <!-- 使用新的表格组件 -->
      <div class="table-container">
        <EBTable
          ref="tableRef"
          :columns="tableColumns"
          :data="logList"
          :loading="loading"
          :border="false"
          selection
          show-actions
          actions-width="120"
          :auto-height="true"
          pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          @selection-change="handleSelectionChange"
          @page-change="handlePageChange"
        >
          <!-- 操作类型列自定义渲染 -->
          <template #operationType="{ row }">
            <el-tag 
              :type="getOperationTypeTag(row.operationType)"
            >
              {{ row.operationType }}
            </el-tag>
          </template>

          <!-- 操作状态列自定义渲染 -->
          <template #status="{ row }">
            <el-tag 
              :type="row.status === 'success' ? 'success' : 'danger'"
            >
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>

          <!-- 操作列 -->
          <template #actions="{ row }">
            <el-button type="primary" link size="small" @click="handleDetail(row)">详情</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </EBTable>
      </div>
    </div>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="日志详情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="操作时间" :span="2">
          {{ formatDate(logDetail.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="操作用户">
          {{ logDetail.operatorName }}
        </el-descriptions-item>
        <el-descriptions-item label="IP地址">
          {{ logDetail.ip }}
        </el-descriptions-item>
        <el-descriptions-item label="操作类型">
          {{ logDetail.operationType }}
        </el-descriptions-item>
        <el-descriptions-item label="模块名称">
          {{ logDetail.module }}
        </el-descriptions-item>
        <el-descriptions-item label="操作状态">
          <el-tag 
            :type="logDetail.status === 'success' ? 'success' : 'danger'"
          >
            {{ logDetail.status === 'success' ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作描述" :span="2">
          {{ logDetail.description }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="log-params">
        <div class="param-title">请求参数：</div>
        <pre class="param-content">{{ logDetail.requestParams ? JSON.stringify(JSON.parse(logDetail.requestParams), null, 2) : '' }}</pre>
        <!-- 请求体 -->
        <div class="param-title">请求体：</div>
        <pre class="param-content">{{ logDetail.requestBody ? JSON.stringify(JSON.parse(logDetail.requestBody), null, 2) : '' }}</pre>
        <!-- 返回参数 -->
        <div class="param-title">返回参数：</div>
        <pre class="param-content">{{ logDetail.responseData ? JSON.stringify(JSON.parse(logDetail.responseData), null, 2) : '' }}</pre>
        <!-- 错误信息 -->
        <div class="param-title">错误信息：</div>
        <pre class="param-content">{{ logDetail.errorMsg ? logDetail.errorMsg : '无' }}</pre>
      </div>
    </el-dialog>
    
    <!-- 导出时页面等待 -->
    <el-dialog
      v-model="isExport"
      title="导出中"
      width="300px"
    >
      <!-- 设置旋转css -->
      <div class="spin-container">
        <el-icon><Loading /></el-icon>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Search,
  Download,
  Delete,
  Loading,
  Document,
  Warning,
  Calendar
} from '@element-plus/icons-vue';
import { getLogList, detailLog, deleteLog, getLogReport } from '@/api/admin/log.js';
import { EBFilterBar, EBTable } from '@/components';

// 搜索和筛选条件
const searchText = ref('');
const isExport = ref(false);
const filterForm = reactive({
  operationType: '',
  module: '',
  status: '',
  dateRange: [],
});

// 操作类型选项
const operationTypes = [
  { label: '新增', value: '新增' },
  { label: '修改', value: '修改' },
  { label: '删除', value: '删除' },
  { label: '查询', value: '查询' },
  { label: '登录', value: '登录' },
  { label: '导出', value: '导出' },
  { label: '审批', value: '审批' }
];

// 模块类型选项
const moduleTypes = [
  { label: '用户管理', value: '用户管理' },
  { label: '角色权限', value: '角色权限' },
  { label: '费率管理', value: '费率管理' },
  { label: '数据统计', value: '数据统计' },
  { label: '对账审批', value: '对账审批' },
  { label: '通知提醒', value: '通知提醒' },
  { label: '支付管理', value: '支付管理' }
];

// 筛选条件配置
const filterConfig = [
  {
    type: 'input',
    field: 'searchText',
    label: '操作用户',
    placeholder: '请输入用户名'
  },
  {
    type: 'select',
    field: 'operationType',
    label: '操作类型',
    options: [
      { label: '全部', value: '' },
      ...operationTypes
    ]
  },
  {
    type: 'select',
    field: 'module',
    label: '模块名称',
    options: [
      { label: '全部', value: '' },
      ...moduleTypes
    ]
  },
  {
    type: 'daterange',
    field: 'dateRange',
    label: '操作时间'
  }
];

// 初始值
const initialFilterValues = {
  searchText: '',
  operationType: '',
  module: '',
  dateRange: []
};

// 表格列配置
const tableColumns = [
  { prop: 'createTime', label: '操作时间', width: '180', sortable: true, formatter: row => formatDate(row.createTime) },
  { prop: 'operatorName', label: '操作用户', width: '140' },
  { prop: 'operationType', label: '操作类型', width: '140' },
  { prop: 'module', label: '模块名称', width: '160' },
  { prop: 'description', label: '操作描述', width: '160', showOverflowTooltip: true },
  { prop: 'ip', label: 'IP地址', width: '140' },
  { prop: 'status', label: '操作状态', width: '140' }
];

// 获取操作类型标签样式
const getOperationTypeTag = (type) => {
  const typeMap = {
    '新增': 'success',
    '修改': 'warning',
    '删除': 'danger',
    '查询': 'info',
    '登录': 'primary',
    '导出': 'success',
    '审批': 'warning'
  };
  return typeMap[type] || 'info';
};

// 表格数据
const loading = ref(false);
const logList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 详情弹窗
const dialogVisible = ref(false);
const logDetail = ref({});

// 获取日志列表
const fetchLogList = async (page = currentPage.value, shouldResetPage = false) => {
  loading.value = true;
  if(shouldResetPage){
    currentPage.value = 1;
  }else{
    currentPage.value = page;
  }
  try {
    // 构建查询参数
    const res = await getLogList({  
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      operatorName: searchText.value,
      operationType: filterForm.operationType,
      module: filterForm.module,
      startDate: filterForm.dateRange && filterForm.dateRange.length === 2 ? filterForm.dateRange[0] : undefined,
      endDate: filterForm.dateRange && filterForm.dateRange.length === 2 ? filterForm.dateRange[1] : undefined,
    });
    logList.value = res.list;
    total.value = Number(res.total);
  } catch (error) {
    ElMessage.error('获取日志列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理筛选搜索
const handleSearch = (filterValues) => {
  // 更新筛选值
  searchText.value = filterValues.searchText || '';
  filterForm.operationType = filterValues.operationType || '';
  filterForm.module = filterValues.module || '';
  filterForm.dateRange = filterValues.dateRange || [];
  
  // 重新加载数据
  fetchLogList(1, true);
};

// 清空搜索条件
const clearSearch = () => {
  searchText.value = '';
  filterForm.operationType = '';
  filterForm.module = '';
  filterForm.dateRange = [];
};

// 导出日志
const handleExport = async () => {
  isExport.value = true;
  const res = await getLogReport();
  // 创建 Blob 对象并下载
  const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'system_logs.xlsx';
  link.click();
  window.URL.revokeObjectURL(url);
  if(res.size > 0){
    isExport.value = false;
    ElMessage.success('日志导出成功');
  }else{
    ElMessage.error('日志导出失败');
  }
};

// 查看详情
const handleDetail = async (row) => {
  const res = await detailLog(row.id);
  logDetail.value = res;
  dialogVisible.value = true;
};

// 分页事件
const handlePageChange = (page) => {
  fetchLogList(page);
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

// 删除日志
const handleDelete = async (row) => {
  ElMessageBox.confirm(`确定要删除这条日志吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  .then(async () => {
    const res = await deleteLog(row.id);
    if(res.code === 200){
      ElMessage.success('删除日志成功');
      fetchLogList();
    }else{
      ElMessage.error('删除日志失败');
    }
  })
  .catch(() => {});
};

const selectedRows = ref([]);
const handleSelectionChange = (selectionRows) => {
  selectedRows.value = selectionRows.map(row => row.id);
};
// 清理日志
const handleClearLogs = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要清理的日志');
    return;
  }
  
  ElMessageBox.confirm(`确定要清理选中的 ${selectedRows.value.length} 条日志吗？此操作不可恢复。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  .then(async () => {
    const ids = selectedRows.value.join(',');
    const res = await deleteLog(ids);
    if(res.code === 200){
      ElMessage.success('清理日志成功');
      fetchLogList();
    }else{
      ElMessage.error('清理日志失败');
    }
  })
  .catch(() => {});
};

// 初始化
onMounted(() => {
  fetchLogList();
});
</script>

<style scoped>
.log-setting {
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

/* 日志详情样式 */
.log-params {
  margin-top: 20px;
}

.param-title {
  font-weight: 500;
  margin-bottom: 8px;
  color: #2c3e50;
}

.param-content {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  margin-bottom: 16px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 导出加载动画 */
.spin-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  font-size: 24px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 
