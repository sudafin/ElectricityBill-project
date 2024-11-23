<template>
  <div class="log-setting">
    <el-card class="glass-card">
      <template #header>
        <div class="header">
          <div class="search-area">
            <el-input
              v-model="searchText"
              placeholder="搜索用户名/操作描述"
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
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="timestamp" label="操作时间" width="180" sortable>
          <template #default="{ row }">
            {{ formatDate(row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column prop="username" label="操作用户" width="140" />
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
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link
              @click="handleDetail(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="glass-pagination"
        />
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
          {{ formatDate(logDetail.timestamp) }}
        </el-descriptions-item>
        <el-descriptions-item label="操作用户">
          {{ logDetail.username }}
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
        <pre class="param-content">{{ formatJson(logDetail.params) }}</pre>
      </div>
    </el-dialog>

    <!-- 清理日志确认框 -->
    <el-dialog
      v-model="clearDialogVisible"
      title="清理日志"
      width="400px"
      class="glass-dialog"
    >
      <div class="clear-confirm">
        <el-icon class="warning-icon"><Warning /></el-icon>
        <p>确定要清理选中的日志记录吗？此操作不可恢复。</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="clearDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmClear">确定清理</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Search,
  Download,
  Delete,
  Warning
} from '@element-plus/icons-vue';

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
  { label: '新增', value: 'create' },
  { label: '修改', value: 'update' },
  { label: '删除', value: 'delete' },
  { label: '查询', value: 'query' },
  { label: '登录', value: 'login' },
  { label: '导出', value: 'export' }
];

// 模块类型选项
const moduleTypes = [
  { label: '用户管理', value: 'user' },
  { label: '角色权限', value: 'role' },
  { label: '费率管理', value: 'rate' },
  { label: '数据统计', value: 'report' },
  { label: '对账审批', value: 'reconciliation' },
  { label: '通知提醒', value: 'notification' },
  { label: '支付管理', value: 'payment' }
];

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
const pageSize = ref(10);
const total = ref(0);

// 详情弹窗
const dialogVisible = ref(false);
const logDetail = ref({});

// 清理日志
const clearDialogVisible = ref(false);
const handleClearLogs = () => {
  clearDialogVisible.value = true;
};

const confirmClear = async () => {
  try {
    await ElMessageBox.confirm('此操作将永久删除选中的日志记录, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    // 执行清理操作
    ElMessage.success('日志清理成功');
    clearDialogVisible.value = false;
    fetchLogList();
  } catch (error) {
    console.error('清理日志失败:', error);
  }
};

// 获取日志列表
const fetchLogList = async () => {
  loading.value = true;
  try {
    // 模拟API调用
    const mockData = Array(10).fill().map((_, index) => ({
      id: index + 1,
      timestamp: new Date(Date.now() - Math.random() * 10000000000),
      username: `用户${index + 1}`,
      operationType: operationTypes[Math.floor(Math.random() * operationTypes.length)].label,
      module: moduleTypes[Math.floor(Math.random() * moduleTypes.length)].label,
      description: `操作描述${index + 1}`,
      ip: `192.168.1.${index + 1}`,
      status: Math.random() > 0.3 ? 'success' : 'fail',
      params: { key: 'value' },
      beforeData: { id: 1, name: 'old' },
      afterData: { id: 1, name: 'new' },
    }));
    logList.value = mockData;
    total.value = 100;
  } catch (error) {
    ElMessage.error('获取日志列���失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchLogList();
};

// 导出日志
const handleExport = () => {
  ElMessage.success('日志导出成功');
};

// 查看详情
const handleDetail = (row) => {
  logDetail.value = row;
  dialogVisible.value = true;
};

// 分页事件
const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchLogList();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchLogList();
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

// 格式化JSON
const formatJson = (json) => {
  try {
    return JSON.stringify(json, null, 2);
  } catch (e) {
    return json;
  }
};

// 获取操作类型标签样式
const getOperationTypeTag = (type) => {
  const typeMap = {
    '新增': 'success',
    '修改': 'warning',
    '删除': 'danger',
    '查询': 'info',
    '登录': 'primary',
    '导出': ''
  };
  return typeMap[type] || 'info';
};

// 初始化
fetchLogList();
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

/* 分页样式 */
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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
</style> 