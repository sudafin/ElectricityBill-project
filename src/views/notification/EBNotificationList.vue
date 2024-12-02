<template>
  <div class="notification-list">
    <el-card>
      <template #header>
        <div class="header">
          <el-button type="primary" @click="handleCreate">新增通知</el-button>
          <div class="search-filter">
            <el-input v-model="searchText" placeholder="搜索通知" clearable @clear="fetchNotificationList" @keyup.enter="fetchNotificationList"></el-input>
            <el-select v-model="selectedType" placeholder="通知类型" clearable @change="fetchNotificationList">
              <el-option label="全部" value=""></el-option>
              <el-option label="系统通知" value="system"></el-option>
              <el-option label="审批通知" value="approval"></el-option>
            </el-select>
          </div>
        </div>
      </template>
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="notificationList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="标题" width="150">
          <template #default="{ row }">
            <el-tooltip :content="row.title" placement="top">
              <span class="table-cell" :class="{ 'unread': !row.read }">{{ row.title }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="内容">
          <template #default="{ row }">
            <el-tooltip :content="row.content" placement="top">
              <span class="table-cell">{{ row.content }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <span>{{ getNotificationTypeName(row.type) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            <el-tooltip :content="row.createdAt" placement="top">
              <span class="table-cell">{{ row.createdAt }}</span>
            </el-tooltip>
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
      <div class="batch-actions">
        <el-button type="danger" @click="handleBatchDelete" :disabled="!selectedRows.length">批量删除</el-button>
      </div>
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
              <span class="value">{{ currentNotification.sender?.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">职位:</span>
              <span class="value">{{ currentNotification.sender?.position }}</span>
            </div>
            <el-divider></el-divider>
            <div class="info-item">
              <span class="label">类型:</span>
              <span class="value">{{ getNotificationTypeName(currentNotification.type) }}</span>
            </div>
            <div class="info-item">
              <span class="label">时间:</span>
              <span class="value">{{ currentNotification.createdAt }}</span>
            </div>
            <div class="info-item">
              <span class="label">状态:</span>
              <span class="value">
                <el-tag :type="getStatusType(currentNotification.status)">
                  {{ currentNotification.status }}
                </el-tag>
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import EBTable from '@/components/EBTable.vue';
import EBPagination from '@/components/EBPagination.vue';

const router = useRouter();

const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const searchText = ref('');
const selectedType = ref('');
const selectedRows = ref([]);
const detailVisible = ref(false);
const currentNotification = ref({});

const columns = [
  { type: 'selection', width: '55' },
  { prop: 'title', label: '标题', slotName: 'title', width: '150' },
  { prop: 'content', label: '内容', slotName: 'content' },
  { prop: 'type', label: '类型', width: '120' },
  { prop: 'status', label: '状态', width: '100' },
  { prop: 'createdAt', label: '创建时间', slotName: 'createdAt', width: '180' },
  { prop: 'actions', label: '操作', width: '120', fixed: 'right' },
];

// 假数据
const mockData = [
  { 
    id: 1, 
    title: '系统维护通知', 
    content: '系统将于2023年6月1日凌晨2点至4点进行维护,届时系统将无法访问,请提前做好相关工作安排。', 
    type: 'system', 
    status: '重点', 
    createdAt: '2023-05-28 10:00:00', 
    read: false,
    sender: {
      name: '系统管理员',
      position: '系统运维'
    }
  },
  { 
    id: 2, 
    title: '新功能上线公告', 
    content: '新的用户管理功能已经上线,您可以在用户管理页面中体验新功能。', 
    type: 'system', 
    status: '普通', 
    createdAt: '2023-05-25 15:30:00', 
    read: true,
    sender: {
      name: '张工',
      position: '产品经理'
    }
  },
  { id: 3, title: '关于系统升级的通知', content: '为了提供更好的服务,我们将于2023年7月1日对系统进行升级,升级期间可能会影响部分功能的使用,请您提前做好准备。', type: 'system', status: '过期', createdAt: '2023-05-23 09:15:00', read: false },
  { id: 4, title: '审批结果通知', content: '您提交的采购申请已经通过审批,请及时处理后续事宜。', type: 'approval', status: '普通', createdAt: '2023-05-18 11:45:00', read: true },
];

const notificationList = ref(mockData);
const total = ref(mockData.length);

const unreadCount = computed(() => {
  return notificationList.value.filter(item => !item.read).length;
});

const fetchNotificationList = () => {
  // 根据搜索条件和筛选条件获取通知列表
  let list = mockData;
  if (searchText.value) {
    list = list.filter(item => item.title.includes(searchText.value) || item.content.includes(searchText.value));
  }
  if (selectedType.value) {
    list = list.filter(item => item.type === selectedType.value);
  }
  notificationList.value = list;
  total.value = list.length;
};

const handleCreate = () => {
  router.push({ name: 'NotificationCreate' });
};

const handleRead = (row) => {
  row.read = !row.read;
};

const handleDelete = (row) => {
  notificationList.value = notificationList.value.filter(item => item.id !== row.id);
  total.value = notificationList.value.length;
};

const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

const handleBatchRead = () => {
  selectedRows.value.forEach(row => {
    row.read = true;
  });
};

const handleBatchDelete = () => {
  const ids = selectedRows.value.map(row => row.id);
  notificationList.value = notificationList.value.filter(item => !ids.includes(item.id));
  total.value = notificationList.value.length;
  
  // 更新 selectedRows,只保留还存在于 notificationList 中的行
  selectedRows.value = selectedRows.value.filter(row => notificationList.value.some(item => item.id === row.id));
};

const showDetail = (row) => {
  currentNotification.value = row;
  detailVisible.value = true;
  
  // 将通知标记为已读
  row.read = true;
};

const getNotificationTypeName = (type) => {
  switch (type) {
    case 'system':
      return '系统通知';
    case 'approval':
      return '审批通知';
    default:
      return '';
  }
};

const getStatusType = (status) => {
  switch (status) {
    case '普通':
      return '';
    case '重点':
      return 'warning';
    case '过期':
      return 'danger';
    default:
      return '';
  }
};
</script>

<style scoped>
.notification-list {
  padding: 20px;
  background-color: #f5f7fa;
}

.el-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-filter {
  display: flex;
  gap: 10px;
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

.batch-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
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
