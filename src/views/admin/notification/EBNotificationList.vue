<template>
  <div class="notification-dashboard">
    <el-card class="admin-card">
      <template #header>
        <div class="header">
          <h3 class="header-title">
            <el-icon><Bell /></el-icon>
            通知管理
          </h3>
          <div class="search-area">
            <el-input v-model="searchText" placeholder="搜索通知" clearable class="search-input"></el-input>
            <el-select v-model="selectedType" placeholder="通知类型" clearable
            class="status-select" >
              <el-option label="全部" value=""></el-option>
              <el-option label="系统通知" value="系统通知"></el-option>
              <el-option label="审批通知" value="审批通知"></el-option>
            </el-select>
            <el-date-picker
                v-model="dateRange"
                type="daterange"
                unlink-panels
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                class="filter-date-range"
              >
                <template #prefix>
                  <el-icon><Calendar /></el-icon>
              </template>
            </el-date-picker>
            <div class="action-buttons">
              <el-button type="primary" class="action-button" @click="handleCreate">
                <el-icon><Plus /></el-icon>新增通知
              </el-button>
            </div>
          </div>
        </div>
      </template>
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="notificationList"
        @selection-change="handleSelectionChange"
        class="admin-table"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="标题" width="150">
          <template #default="{ row }">
              <span class="table-cell" :class="{ 'unread': !row.readStatus }">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="内容">
          <template #default="{ row }">
              <span class="table-cell">{{ row.content }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <span>{{ row.type }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.level === '重点' ? 'warning' : row.level === '过期' ? 'danger' : row.level === '普通' ? 'success' : 'info'">
              {{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
              <span class="table-cell">{{ row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <div class="actions">
              <el-button type="primary" link @click="showDetail(row)">详情</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="admin-pagination">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          @current-change="handlePageChange"
          layout="prev, pager, next, jumper"
        ></el-pagination>
        <div class="total-info">共 {{ total }} 条记录</div>
      </div>
    </el-card>
    
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
              <span class="label">通知状态:</span>
              <span class="value">
                <el-tag :type="currentNotification.level === '重点' ? 'warning' : currentNotification.level === '过期' ? 'danger' : currentNotification.level === '普通' ? 'success' : 'info'">
                  {{ currentNotification.level }}</el-tag>
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
import { getNotificationList, deleteNotification ,fetchNotificationDetail} from '@/api/notification.js';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Download, Search, Close, Calendar, Plus } from '@element-plus/icons-vue';

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


const columns = [
  { type: 'selection', width: '55' },
  { prop: 'title', label: '标题', slotName: 'title', width: '150' },
  { prop: 'content', label: '内容', slotName: 'content' },
  { prop: 'type', label: '类型', width: '120' },
  { prop: 'status', label: '状态', width: '100' },
  { prop: 'createdAt', label: '创建时间', slotName: 'createdAt', width: '180' },
  { prop: 'actions', label: '操作', width: '120', fixed: 'right' },
];

const fetchNotificationList = async (page = currentPage.value,shouldResetPage = false) => {
  loading.value = true;
  if(shouldResetPage){
    currentPage.value = 1;
  }else {
    currentPage.value = page;
  }
  try{
    const res = await getNotificationList({
    pageNo: currentPage.value,
    pageSize: pageSize.value,
    title: searchText.value,
    type: selectedType.value,
    startDate: dateRange.value && dateRange.value.length === 2 ? dateRange.value[0] : undefined,
    endDate: dateRange.value && dateRange.value.length === 2 ? dateRange.value[1] : undefined,
  })
    total.value = Number(res.total);
    notificationList.value = res.list;
  } catch (err) {
    ElMessage.error('获取通知列表失败');
  } finally {
    loading.value = false;
  }
};

onMounted(()=>{
  fetchNotificationList(1,true);
})
const handleSearch = () => {
  fetchNotificationList(1,true);
};
const handlePageChange = (page) => {
  fetchNotificationList(page);
}

const showDetail = async (row) => {
  const detail = await fetchNotificationDetail(row.id);
  currentNotification.value = detail;
  detailVisible.value = true;
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


const selectedNotificationIds = ref([]);
const handleSelectionChange = (selectedRows) => {
  selectedNotificationIds.value = selectedRows.map((row) => row.id);
};
const handleBatchDelete = async () => {
ElMessageBox.confirm(`确定删除选中的 ${selectedNotificationIds.value.length} 个通知吗?`, '提示', {
  confirmButtonText: '确定',
  cancelButtonText: '取消',
    type: 'warning',
  })
  .then(async () => {
    selectedNotificationIds.value = selectedNotificationIds.value.join(',');
    const res = await deleteNotification(selectedNotificationIds.value);
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
@import '@/styles/admin-card.scss';

.notification-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
}

/* 组件特定的样式 */
.search-input {
  width: 200px;
  flex-shrink: 0;
}
.search-filter {
  display: flex;
  gap: 10px;

}
.status-select {
  width: 120px;
  flex-shrink: 0;
}

.filter-date-range {
  width: 300px;
  flex-shrink: 0;
}

.el-button {
  min-width: 88px;
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
}

.el-button .el-icon {
  margin-right: 4px;
}

.actions {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
}

.actions .el-button {
  padding: 4px 8px;
  min-width: 0;
}

:deep(.el-table .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.el-table .el-table__cell) {
  padding: 12px 0;
}

:deep(.el-table .el-table__cell.el-table__cell--right) {
  padding-right: 20px;
}

.table-cell {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.table-cell.unread {
  color: #f56c6c;
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
</style> 
