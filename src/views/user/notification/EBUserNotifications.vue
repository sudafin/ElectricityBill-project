<template>
  <EBPageLayout>
    <template #header>
      <div class="eb-notification-header">
        <div class="header-spacer"></div>
        <div class="action-buttons">
          <el-button type="primary" @click="markAllAsRead" :disabled="unreadCount === 0">
            全部已读
          </el-button>
          <el-button @click="refreshNotifications" :loading="loading">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
        </div>
      </div>
    </template>

    <div class="notifications-container" v-loading="loading">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部通知" name="all">
          <div class="notification-list">
            <el-empty v-if="filteredNotifications.length === 0" description="暂无通知"></el-empty>
            <div v-else>
              <div 
                v-for="notification in filteredNotifications" 
                :key="notification.id" 
                class="notification-item"
                :class="{ 'unread': !notification.isRead }"
                @click="viewNotification(notification)"
              >
                <div class="notification-dot" v-if="!notification.isRead"></div>
                <div class="notification-icon" :class="getNotificationType(notification.title)">
                  <el-icon v-if="getNotificationType(notification.title) === 'warning'"><Warning /></el-icon>
                  <el-icon v-else-if="getNotificationType(notification.title) === 'success'"><SuccessFilled /></el-icon>
                  <el-icon v-else><Bell /></el-icon>
                </div>
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-text">{{ notification.content }}</div>
                  <div class="notification-time">{{ notification.createTime }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="`未读(${unreadCount})`" name="unread">
          <div class="notification-list">
            <el-empty v-if="unreadNotifications.length === 0" description="暂无未读通知"></el-empty>
            <div v-else>
              <div 
                v-for="notification in unreadNotifications" 
                :key="notification.id" 
                class="notification-item unread"
                @click="viewNotification(notification)"
              >
                <div class="notification-dot"></div>
                <div class="notification-icon" :class="getNotificationType(notification.title)">
                  <el-icon v-if="getNotificationType(notification.title) === 'warning'"><Warning /></el-icon>
                  <el-icon v-else-if="getNotificationType(notification.title) === 'success'"><SuccessFilled /></el-icon>
                  <el-icon v-else><Bell /></el-icon>
                </div>
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-text">{{ notification.content }}</div>
                  <div class="notification-time">{{ notification.createTime }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :current-page="currentPage"
          :page-size="pageSize"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 通知详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      :title="currentNotification.title || '通知详情'"
      width="30%"
    >
      <div class="notification-detail">
        <p class="notification-detail-time">{{ currentNotification.createTime }}</p>
        <div class="notification-detail-content">
          {{ currentNotification.content }}
        </div>
      </div>
    </el-dialog>
  </EBPageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh, Bell, Warning, SuccessFilled } from '@element-plus/icons-vue';
import { EBPageLayout } from '@/components';

const loading = ref(false);
const activeTab = ref('all');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const detailVisible = ref(false);
const currentNotification = ref({});

// 本地假数据
const notifications = ref([
  {
    id: 1,
    title: '电费缴纳成功通知',
    content: '您已成功缴纳电费100元，感谢您的使用。交易单号：PAY202303150001，如有疑问请联系客服。',
    createTime: '2023-03-15 09:25:00',
    isRead: false
  },
  {
    id: 2,
    title: '系统维护通知',
    content: '系统将于2023-03-20 22:00至次日02:00进行维护升级，届时可能无法访问系统，敬请谅解。维护完成后，系统将会有更好的用户体验和性能提升。',
    createTime: '2023-03-18 10:00:00',
    isRead: false
  },
  {
    id: 3,
    title: '电费余额不足提醒',
    content: '您的账户电费余额已不足50元，为避免影响正常用电，请及时充值。您可以通过网站、APP或前往营业厅进行充值。',
    createTime: '2023-03-10 15:30:00',
    isRead: true
  },
  {
    id: 4,
    title: '用电量异常提醒',
    content: '系统检测到您近期用电量明显高于平均水平，建议检查家中电器是否存在异常。如有需要，可联系客服安排专业人员上门检查。',
    createTime: '2023-03-05 08:15:00',
    isRead: true
  },
  {
    id: 5,
    title: '节能建议提醒',
    content: '根据您的用电习惯分析，建议您调整空调温度，减少待机设备能耗，预计可节省电费约30元/月。更多节能建议请查看用电分析页面。',
    createTime: '2023-02-28 14:20:00',
    isRead: true
  }
]);

// 未读通知计数
const unreadCount = computed(() => {
  return notifications.value.filter(item => !item.isRead).length;
});

// 未读通知列表
const unreadNotifications = computed(() => {
  return notifications.value.filter(item => !item.isRead);
});

// 根据当前标签过滤通知
const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') {
    return notifications.value;
  } else {
    return unreadNotifications.value;
  }
});

// 刷新通知列表
const refreshNotifications = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('通知已更新');
  }, 800);
};

// 标记所有通知为已读
const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.isRead = true;
  });
  ElMessage.success('已将所有通知标记为已读');
};

// 查看通知详情
const viewNotification = (notification) => {
  currentNotification.value = notification;
  detailVisible.value = true;
  
  // 标记为已读
  if (!notification.isRead) {
    const index = notifications.value.findIndex(item => item.id === notification.id);
    if (index !== -1) {
      notifications.value[index].isRead = true;
    }
  }
};

// 根据通知标题获取通知类型
const getNotificationType = (title) => {
  if (title.includes('成功')) {
    return 'success';
  } else if (title.includes('提醒') || title.includes('异常')) {
    return 'warning';
  } else {
    return 'info';
  }
};

// 分页处理
const handleCurrentChange = (page) => {
  currentPage.value = page;
  // 模拟分页，实际情况应该是请求后端数据
};

// 标签切换处理
const handleTabChange = (tab) => {
  currentPage.value = 1;
};

onMounted(() => {
  total.value = notifications.value.length;
});
</script>

<style scoped>
.eb-notification-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 5px 0;
}

.header-spacer {
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.notification-list {
  margin-bottom: 20px;
}

.notification-item {
  position: relative;
  display: flex;
  padding: 15px;
  border-radius: 8px;
  background-color: #f5f7fa;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.notification-item:hover {
  background-color: #ecf5ff;
  transform: translateY(-2px);
}

.notification-item.unread {
  background-color: #ecf5ff;
}

.notification-dot {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #f56c6c;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.notification-icon .el-icon {
  font-size: 24px;
  color: white;
}

.notification-icon.warning {
  background-color: #e6a23c;
}

.notification-icon.success {
  background-color: #67c23a;
}

.notification-icon.info {
  background-color: #409eff;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5px;
}

.notification-text {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.notification-detail-time {
  color: #909399;
  font-size: 14px;
  text-align: right;
  margin-bottom: 15px;
}

.notification-detail-content {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}
</style> 