<template>
  <div class="notifications-panel">
    <div class="panel-header">
      <div class="header-spacer"></div>
      <div class="panel-actions">
        <el-button type="primary" @click="refreshData" :loading="loading" size="medium">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <router-link to="/user/notifications" class="view-all-link">
          <el-button type="primary" text size="medium">
            查看全部
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </router-link>
      </div>
    </div>

    <div class="panel-content" v-loading="loading">
      <el-empty v-if="notifications.length === 0" description="暂无通知"></el-empty>
      <div v-else class="notification-list">
        <div v-for="notification in notifications" :key="notification.id" 
             class="notification-item" 
             :class="{ 'unread': !notification.isRead }">
          <div class="notification-dot" v-if="!notification.isRead"></div>
          <div class="notification-icon" :class="getNotificationType(notification.title)">
            <el-icon v-if="getNotificationType(notification.title) === 'warning'"><Warning /></el-icon>
            <el-icon v-else-if="getNotificationType(notification.title) === 'success'"><SuccessFilled /></el-icon>
            <el-icon v-else-if="getNotificationType(notification.title) === 'info'"><InfoFilled /></el-icon>
            <el-icon v-else><Bell /></el-icon>
          </div>
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-text">{{ notification.content }}</div>
            <div class="notification-time">{{ notification.createTime }}</div>
          </div>
        </div>
      </div>

      <!-- 查看更多按钮 -->
      <div class="view-more-container" v-if="notifications.length > 0">
        <router-link to="/user/notifications" class="view-more-link">
          <span>查看更多通知</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh, ArrowRight, Warning, InfoFilled, Bell, SuccessFilled } from '@element-plus/icons-vue';

const loading = ref(false);

// 通知列表 - 使用本地假数据
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
    content: '系统将于2023-03-20 22:00至次日02:00进行维护升级，届时可能无法访问系统，敬请谅解。',
    createTime: '2023-03-18 10:00:00',
    isRead: false
  },
  {
    id: 3,
    title: '电费余额不足提醒',
    content: '您的账户电费余额已不足50元，为避免影响正常用电，请及时充值。',
    createTime: '2023-03-10 15:30:00',
    isRead: true
  }
]);

// 刷新数据
const refreshData = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('通知数据已更新');
  }, 800);
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

onMounted(() => {
  // 初始加载
  refreshData();
});
</script>

<style scoped>
.notifications-panel {
  width: 100%;
}

.panel-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 15px;
}

.header-spacer {
  flex: 1;
}

.panel-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* 统一按钮样式 */
.panel-actions .el-button {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  border-radius: 4px;
  height: 36px;
}

.panel-actions .el-button--text {
  padding: 8px 15px;
  color: #409EFF;
}

.panel-actions .el-button--text .el-icon {
  font-size: 14px;
}

/* 查看全部按钮样式 */
.view-all-link {
  text-decoration: none;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-item {
  position: relative;
  display: flex;
  padding: 16px;
  border-radius: 4px;
  background-color: #ffffff;
  transition: all 0.2s;
  border: 1px solid #ebeef5 !important;
  box-shadow: none;
}

.notification-item:hover {
  background-color: #f5f7fa;
  box-shadow: none;
  border-color: #e4e7ed;
}

.notification-item.unread {
  background-color: #f0f7ff;
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
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.notification-icon .el-icon {
  font-size: 20px;
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
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #303133;
}

.notification-text {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.view-more-container {
  margin-top: 16px;
  text-align: center;
  padding: 10px 0;
  background-color: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.view-more-link {
  color: #409EFF;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
}

.view-more-link:hover {
  color: #66b1ff;
}

.view-more-link span {
  border-bottom: 1px solid transparent;
}

.view-more-link:hover span {
  border-bottom: 1px solid #66b1ff;
}
</style> 