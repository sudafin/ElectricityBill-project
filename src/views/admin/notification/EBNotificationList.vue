<template>
  <div class="notification-dashboard">
    <div class="content-wrapper">
      <!-- 添加标题区域 -->
      <div class="dashboard-header">
        <div class="title-area">
          <el-icon class="header-icon"><Bell /></el-icon>
          <h2 class="header-title">通知管理</h2>
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
            <el-icon><Plus /></el-icon>新增通知
          </el-button>
          <el-button 
            type="danger" 
            class="action-button" 
            size="default"
            @click="handleBatchDelete" 
            :disabled="!selectedNotificationIds.length"
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
          :data="notificationList"
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
          <!-- 阅读状态列自定义渲染 -->
          <template #readStatus="{ row }">
            <div class="read-status">
              <span v-if="row.readStatus === 0" class="unread-dot"></span>
              <el-tag :type="row.readStatus === 0 ? 'danger' : 'success'">
                {{ row.readStatus === 0 ? '未读' : '已读' }}
              </el-tag>
            </div>
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
    <el-drawer v-model="detailVisible" size="40%" direction="rtl" :with-header="false">
      <div class="drawer-content">
        <div class="drawer-header">
          <div class="drawer-title">{{ currentNotification.title }}</div>
          <el-button type="text" @click="detailVisible = false">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div class="drawer-body">
          <div class="info-section">
            <div class="info-item">
              <span class="label">发送者:</span>
              <span class="value">{{ currentNotification.senderName }}</span>
            </div>
            <div class="info-item">
              <span class="label">角色名:</span>
              <span class="value">{{ currentNotification.senderRole }}</span>
            </div>
            <el-divider></el-divider>
            <div class="info-item">
              <span class="label">通知类型:</span>
              <span class="value">{{ currentNotification.type }}</span>
            </div>
            <div class="info-item">
              <span class="label">创建时间:</span>
              <span class="value">{{ currentNotification.createTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">过期时间:</span>
              <span class="value">{{ currentNotification.expireTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">阅读状态:</span>
              <span class="value">
                <div class="read-status">
                  <span v-if="currentNotification.readStatus === 0" class="unread-dot"></span>
                  <el-tag :type="currentNotification.readStatus === 0 ? 'danger' : 'success'">
                    {{ currentNotification.readStatus === 0 ? '未读' : '已读' }}
                  </el-tag>
                </div>
              </span>
            </div>
          </div>
          <div class="content-section">
            <div class="label">内容:</div>
            <div class="content">{{ currentNotification.content }}</div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { queryPage, deleteNotification, queryNotificationDetail } from '@/api/admin/notification.js';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Bell, Search, Close, Calendar, Plus, Delete } from '@element-plus/icons-vue';
import { EBFilterBar, EBTable } from '@/components';

const router = useRouter();
const currentPage = ref(1);
const pageSize = ref(5);
const loading = ref(false);
const searchText = ref('');
const selectedType = ref('');
const selectedRows = ref([]);
const detailVisible = ref(false);
const currentNotification = ref({});
const dateRange = ref([]);
const notificationList = ref([]);
const total = ref(0);
const selectedNotificationIds = ref([]);

// 筛选条件配置
const filterConfig = [
  {
    type: 'input',
    field: 'searchText',
    label: '搜索通知',
    placeholder: '请输入通知标题'
  },
  {
    type: 'select',
    field: 'selectedType',
    label: '阅读状态',
    options: [
      { label: '全部', value: '' },
      { label: '未读', value: 0 },
      { label: '已读', value: 1 }
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
  selectedType: '',
  dateRange: []
};

// 表格列配置
const tableColumns = [
  { prop: 'title', label: '标题', minWidth: '150' },
  { prop: 'content', label: '内容', minWidth: '180' },
  { prop: 'type', label: '类型', minWidth: '100' },
  { 
    prop: 'readStatus', 
    label: '阅读状态', 
    minWidth: '100',
    type: 'tag',
    tagMap: {
      0: 'danger',
      1: 'success'
    }
  },
  { prop: 'createTime', label: '创建时间', minWidth: '150' },
  { prop: 'expireTime', label: '过期时间', minWidth: '150' }
];

const fetchNotificationList = async (page = currentPage.value, shouldResetPage = false) => {
  loading.value = true;
  if(shouldResetPage){
    currentPage.value = 1;
  }else {
    currentPage.value = page;
  }
  try{
    // 构建查询参数
    const queryParams = {
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      title: searchText.value || undefined,
      // 特别处理readStatus，确保0值也能正确传递
      readStatus: selectedType.value !== '' ? selectedType.value : undefined,
    };
    
    // 添加日期范围条件
    if (dateRange.value && dateRange.value.length === 2) {
      queryParams.startDate = dateRange.value[0];
      queryParams.endDate = dateRange.value[1];
    }
    
    console.log('发送查询参数:', queryParams);
    const res = await queryPage(queryParams);
    
    console.log('获取通知列表响应:', res);
    if (res && res.list) {
      notificationList.value = res.list;
      total.value = Number(res.total || 0);
    } else {
      notificationList.value = [];
      total.value = 0;
      console.warn('通知列表响应格式异常:', res);
    }
  } catch (err) {
    console.error('获取通知列表失败:', err);
    ElMessage.error('获取通知列表失败');
    notificationList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

onMounted(()=>{
  fetchNotificationList(1,true);
})

// 处理筛选搜索
const handleFilterSearch = (filterValues) => {
  console.log('收到筛选值:', filterValues);
  
  // 更新筛选值
  searchText.value = filterValues.searchText || '';
  // 特别处理selectedType，确保0值不被忽略
  selectedType.value = filterValues.selectedType !== undefined ? filterValues.selectedType : '';
  dateRange.value = filterValues.dateRange || [];
  
  console.log('设置筛选值后:', {
    searchText: searchText.value,
    selectedType: selectedType.value,
    dateRange: dateRange.value
  });
  
  // 重新加载数据
  fetchNotificationList(1, true);
};

// 清空搜索条件
const clearSearch = () => {
  searchText.value = '';
  selectedType.value = ''; // 设置为空字符串，表示不筛选
  dateRange.value = [];
  
  console.log('清空搜索条件后:', {
    searchText: searchText.value,
    selectedType: selectedType.value,
    dateRange: dateRange.value
  });
};

const handlePageChange = (page) => {
  fetchNotificationList(page);
}

const showDetail = async (row) => {
  try {
    loading.value = true;
    const detail = await queryNotificationDetail(row.id);
    currentNotification.value = detail;
    detailVisible.value = true;
  } catch (error) {
    console.error('获取通知详情失败:', error);
    ElMessage.error('获取通知详情失败');
  } finally {
    loading.value = false;
  }
};


const handleDelete = async (row) => {
  ElMessageBox.confirm(`确定删除通知 ${row.title} 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  .then(async () => {
    const res = await deleteNotification(row.id);
    if(res.code === 200){ 
      fetchNotificationList(1,true);
      ElMessage.success('删除成功');
    }else {
      ElMessage.error('删除失败');
    }
  })
  .catch(() => {});
}


const handleSelectionChange = (selectedRows) => {
  selectedNotificationIds.value = selectedRows.map((row) => row.id);
};

const handleBatchDelete = async () => {
  if (selectedNotificationIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的通知');
    return;
  }
  
  ElMessageBox.confirm(`确定删除选中的 ${selectedNotificationIds.value.length} 个通知吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  .then(async () => {
    const ids = selectedNotificationIds.value.join(',');
    const res = await deleteNotification(ids);
    if(res.code === 200){
      fetchNotificationList(1,true);
      ElMessage.success('删除成功');
    }else {
      ElMessage.error('删除失败');
    }
  })
  .catch(() => {});
};

const handleCreate = () => {
  router.push({ name: 'NotificationCreate' });
};


</script>

<style scoped>
.notification-dashboard {
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

.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.drawer-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.drawer-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.info-section {
  margin-bottom: 24px;
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  width: 60px;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.info-item .value {
  color: #303133;
  font-size: 14px;
  margin-left: 10px;
}

.el-divider {
  margin: 16px 0;
}

.content-section 
  .label {
    color: #606266;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .content {
    color: #303133;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
}

/* 修改抽屉的默认样式 */
:deep(.el-drawer) {
  background-color: #fff !important;
}

:deep(.el-drawer__body) {
  padding: 0;
  height: 100%;
}

/* 添加未读红点的样式 */
.read-status {
  display: flex;
  align-items: center;
  gap: 5px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background-color: #F56C6C;
  border-radius: 50%;
  display: inline-block;
}
</style> 
