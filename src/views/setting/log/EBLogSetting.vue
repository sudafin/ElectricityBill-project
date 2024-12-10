<template>
  <div class="log-setting">
    <el-card class="glass-card">
      <template #header>
        <div class="header">
          <div class="search-area">
            <el-input
              v-model="searchText"
              placeholder="搜索用户名"
              clearable
              class="search-input glass-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <el-select
              v-model="filterForm.operationType"
              placeholder="操作类型"
              clearable
              class="filter-select glass-select"
            >
              <el-option 
                v-for="type in operationTypes" 
                :key="type.value" 
                :label="type.label" 
                :value="type.value"
              />
            </el-select>

            <el-select
              v-model="filterForm.module"
              placeholder="模块名称"
              clearable
              class="filter-select glass-select"
            >
              <el-option 
                v-for="module in moduleTypes" 
                :key="module.value" 
                :label="module.label" 
                :value="module.value"
              />
            </el-select>

            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :shortcuts="dateShortcuts"
              value-format="YYYY-MM-DD"
              class="date-picker glass-date-picker"
            />

            <div class="action-buttons">
              <el-button 
                type="primary" 
                class="action-button"
                @click="handleSearch"
              >
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button 
                type="success" 
                class="action-button"
                @click="handleExport"
              >
                <el-icon><Download /></el-icon>
                导出日志
              </el-button>
              <el-button 
                type="danger" 
                class="action-button"
                @click="handleClearLogs"
              >
                <el-icon><Delete /></el-icon>
                清理日志
              </el-button>
            </div>
          </div>
        </div>
      </template>

      <el-table
        :data="logList"
        :loading="loading"
        class="glass-table"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="createTime" label="操作时间" width="180" sortable>
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="operatorName" label="操作用户" width="140" />
        <el-table-column prop="operationType" label="操作类型" width="140">
          <template #default="{ row }">
            <el-tag 
              :type="getOperationTypeTag(row.operationType)"
              class="glass-tag"
            >
              {{ row.operationType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块名称" width="160" />
        <el-table-column prop="description" label="操作描述" width="160" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="status" label="操作状态" width="140">
          <template #default="{ row }">
            <el-tag 
              :type="row.status === 'success' ? 'success' : 'danger'"
              class="glass-tag"
            >
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ row }">
            <div class="operation-buttons">
            <el-button 
              type="primary" 
              link
              @click="handleDetail(row)"
            >
              详情
            </el-button>
            <el-button 
                type="danger" 
                link
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="日志详情"
      width="600px"
      class="glass-dialog"
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
        <div class="param-title">返回参数：</div>
        <pre class="param-content">{{ logDetail.responseData ? JSON.stringify(JSON.parse(logDetail.responseData), null, 2) : '' }}</pre>
        <div class="param-title">错误信息：</div>
        <pre class="param-content">{{ logDetail.errorMsg ? logDetail.errorMsg : '无' }}</pre>
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
  Warning
} from '@element-plus/icons-vue';
import { getLogList, detailLog, deleteLog } from '@/api/log';
// 搜索和筛选条件
const searchText = ref('');
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


// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
];

// 表格数据
const loading = ref(false);
const logList = ref([]);
const currentPage = ref(1);
const pageSize = ref(5);
const total = ref(0);

// 详情弹窗
const dialogVisible = ref(false);
const logDetail = ref({});

// 获取日志列表
const fetchLogList = async (page = currentPage.value,
shouldResetPage = false) => {
  loading.value = true;
  if(shouldResetPage){
    currentPage.value = 1;
  }else{
    currentPage.value = page;
  }
  try {
    // 构建查询参数
    const res = await getLogList({  
      //searchText判断是数字还是中文
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

// 搜索
const handleSearch = () => {
  fetchLogList(1, true);
};

// 导出日志
const handleExport = () => {
  ElMessage.success('日志导出成功');
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
  ElMessageBox.confirm(`确定要清理选中的 ${selectedRows.value.length} 条日志吗？此操作不可恢复。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  .then(async () => {
    selectedRows.value  = selectedRows.value.join(',');
    const res = await deleteLog(selectedRows.value);
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
  background:#f5f7fa
}

/* 玻璃态卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  border-radius: 16px !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.6) !important;
  overflow: hidden;
}

/* 筛选区域 */
.filter-section {
  margin-bottom: 20px;
}

.search-area {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.search-input {
  width: 200px;
}

.filter-select {
  width: 120px;
}

.date-picker {
  width: 260px;
}

/* 按钮区域 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.glass-button,
.glass-button-primary {
  height: 36px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  transition: all 0.3s;
}

.glass-button-primary {
  background: linear-gradient(135deg, #409eff, #36acfe) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.glass-button {
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: #606266;
}

/* 表格样式 */
.glass-table {
  margin-top: 16px;
}

.glass-table :deep(.el-table__header) {
  background: rgba(255, 255, 255, 0.8);
}

.glass-table :deep(.el-table__row) {
  background: rgba(255, 255, 255, 0.6);
}

.glass-tag {
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
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


/* 详情弹窗 */
.glass-dialog :deep(.el-dialog) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 16px;
}

.log-detail {
  margin-top: 20px;
}

.detail-title {
  font-weight: 500;
  margin-bottom: 8px;
  color: #2c3e50;
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

.detail-content {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  margin-bottom: 16px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 选择器选项样式 */
.select-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-option .el-icon {
  font-size: 16px;
  color: #409eff;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .search-input,
  .glass-select,
  .glass-date-picker {
    width: 100%;
  }
  
  .action-buttons {
    justify-content: flex-end;
  }
}

/* 导出按钮样式 */
.action-button[type="success"] {
  background: #67c23a !important;
  color: #ffffff !important;
}

.action-button[type="success"]:hover {
  background: #85ce61 !important;
}

/* 表格列宽调整 */
.glass-table :deep(.el-table__header) {
  table-layout: fixed;
}

.glass-table :deep(.el-table__body) {
  table-layout: fixed;
}

/* 分页样式调整 */
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-start;
  padding: 16px;
}

/* 搜索区域样式优化 */
.header {
  padding: 16px 0;
}

/* 调整各个元素的宽度 */
.search-input {
  width: 200px; /* 减小搜索框宽度 */
}

.filter-select {
  width: 120px; /* 减小选择框宽度 */
}

.date-picker {
  width: 260px; /* 减小日期选择器宽度 */
}

/* 按钮组样式 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto; /* 让按钮组靠右对齐 */
}

.action-button {
  height: 32px;
  padding: 0 12px;
  font-size: 14px;
}

/* 响应式布局优化 */
@media screen and (max-width: 1400px) {
  .search-area {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .search-input,
  .filter-select,
  .date-picker {
    flex: 1;
    min-width: 120px;
  }
  
  .action-buttons {
    margin-left: 0;
    flex-wrap: nowrap;
  }
}
.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}
</style> 