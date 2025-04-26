<template>
  <div class="notification-page">
    <!-- 头部区域 -->
    <div class="notification-header">
      <div class="header-title">
        <h2>通知中心</h2>
      </div>
    </div>

    <!-- 分类标签栏 -->
    <div class="notification-tabs">
      <div 
        class="tab-item" 
        :class="{ 'active': activeTab === 'all' }" 
        @click="switchTab('all')"
      >
        全部通知
      </div>
      <div 
        class="tab-item" 
        :class="{ 'active': activeTab === 'unread' }" 
        @click="switchTab('unread')"
      >
        未读
      </div>
    </div>

    <!-- 下拉刷新区域 -->
    <div 
      class="pull-refresh"
      :class="{ 'refreshing': isRefreshing }"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
    >
      <div class="pull-indicator" v-show="isPulling">
        <el-icon class="pull-icon" :class="{ 'rotating': isRefreshing }"><Refresh /></el-icon>
        <span>{{ isRefreshing ? '刷新中...' : '下拉刷新' }}</span>
      </div>

      <!-- 通知列表区域 -->
      <div 
        class="notification-list" 
        v-loading="loading && !isRefreshing && !loadingMore"
        @scroll="handleScroll"
        ref="listContainer"
      >
        <template v-if="filteredNotifications.length === 0">
          <div class="empty-state">
            <el-empty :description="activeTab === 'all' ? '暂无通知' : '暂无未读通知'" />
          </div>
        </template>
        
        <template v-else>
          <div 
            v-for="notification in filteredNotifications" 
            :key="notification.id" 
            class="notification-item"
            :class="{ 'unread': !notification.isRead }"
            @click="viewNotification(notification)"
          >
            <div class="notification-status">
              <div class="status-dot" v-if="!notification.isRead"></div>
            </div>
            <div class="notification-icon" :class="getNotificationType(notification.title)">
              <el-icon v-if="getNotificationType(notification.title) === 'warning'"><WarningFilled /></el-icon>
              <el-icon v-else-if="getNotificationType(notification.title) === 'success'"><SuccessFilled /></el-icon>
              <el-icon v-else><Bell /></el-icon>
            </div>
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-text">{{ notification.content }}</div>
              <div class="notification-time">{{ formatTime(notification.createTime) }}</div>
            </div>
          </div>
          
          <!-- 加载更多指示器 -->
          <div class="load-more" v-if="hasMoreData">
            <p v-if="loadingMore">加载中...</p>
            <p v-else @click="loadMore">点击加载更多</p>
          </div>
          
          <!-- 全部加载完毕 -->
          <div class="no-more" v-if="!hasMoreData && filteredNotifications.length > 0">
            — 已经到底了 —
          </div>
        </template>
      </div>
    </div>

    <!-- 通知详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      :title="currentNotification.title || '通知详情'"
      width="90%"
      top="20vh"
      destroy-on-close
      class="notification-dialog"
    >
      <div class="notification-detail">
        <div class="detail-header">
          <div class="detail-time">{{ formatTime(currentNotification.createTime) }}</div>
          <div class="detail-type" :class="getNotificationType(currentNotification.title)">
            {{ getNotificationTypeText(currentNotification.title) }}
          </div>
        </div>
        <div class="detail-content">
          {{ currentNotification.content }}
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailVisible = false" size="small">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh, Bell, Check, WarningFilled, SuccessFilled } from '@element-plus/icons-vue';

// 页面状态
const loading = ref(false);
const activeTab = ref('all');
const detailVisible = ref(false);
const currentNotification = ref({});
const isRefreshing = ref(false);
const isPulling = ref(false);
const loadingMore = ref(false);
const hasMoreData = ref(true);

// 下拉刷新相关
const startY = ref(0);
const pullDistance = ref(0);
const pullThreshold = 60;
const listContainer = ref(null);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

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

// 处理刷新
const handleRefresh = () => {
  if (isRefreshing.value) return;
  
  loading.value = true;
  
  // 模拟请求
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('通知已更新');
  }, 800);
};

// 下拉刷新事件处理
const touchStart = (e) => {
  if (listContainer.value.scrollTop > 0) return;
  startY.value = e.touches[0].clientY;
  isPulling.value = true;
};

const touchMove = (e) => {
  if (!isPulling.value) return;
  const currentY = e.touches[0].clientY;
  pullDistance.value = Math.max(0, currentY - startY.value);
  
  // 添加阻尼效果，实际下拉距离小于手指移动距离
  if (pullDistance.value > 0) {
    listContainer.value.style.transform = `translateY(${Math.min(pullDistance.value * 0.6, pullThreshold)}px)`;
  }
};

const touchEnd = () => {
  if (!isPulling.value) return;
  
  if (pullDistance.value >= pullThreshold) {
    // 触发刷新
    isRefreshing.value = true;
    
    // 模拟请求
    setTimeout(() => {
      isRefreshing.value = false;
      pullDistance.value = 0;
      listContainer.value.style.transform = 'translateY(0)';
      isPulling.value = false;
      ElMessage.success('刷新成功');
    }, 1000);
  } else {
    // 回弹
    pullDistance.value = 0;
    listContainer.value.style.transform = 'translateY(0)';
    isPulling.value = false;
  }
};

// 标记所有通知为已读
const markAllAsRead = () => {
  if (unreadCount.value === 0) return;
  
  notifications.value.forEach(notification => {
    notification.isRead = true;
  });
  ElMessage.success('已将所有通知标记为已读');
};

// 切换标签
const switchTab = (tab) => {
  activeTab.value = tab;
  currentPage.value = 1;
  hasMoreData.value = true;
  
  // 模拟重新加载
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 300);
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
  if (!title) return 'info';
  
  if (title.includes('成功')) {
    return 'success';
  } else if (title.includes('提醒') || title.includes('异常') || title.includes('不足')) {
    return 'warning';
  } else {
    return 'info';
  }
};

// 获取通知类型文本
const getNotificationTypeText = (title) => {
  const type = getNotificationType(title);
  switch (type) {
    case 'success':
      return '成功通知';
    case 'warning':
      return '提醒通知';
    default:
      return '系统通知';
  }
};

// 格式化时间显示
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  
  const now = new Date();
  const notificationTime = new Date(timeStr);
  const timeDiff = now - notificationTime;
  
  // 一小时内
  if (timeDiff < 3600000) {
    const minutes = Math.floor(timeDiff / 60000);
    return `${minutes}分钟前`;
  }
  
  // 当天
  if (notificationTime.toDateString() === now.toDateString()) {
    return `今天 ${notificationTime.getHours()}:${String(notificationTime.getMinutes()).padStart(2, '0')}`;
  }
  
  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (notificationTime.toDateString() === yesterday.toDateString()) {
    return `昨天 ${notificationTime.getHours()}:${String(notificationTime.getMinutes()).padStart(2, '0')}`;
  }
  
  // 一周内
  if (timeDiff < 604800000) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${days[notificationTime.getDay()]} ${notificationTime.getHours()}:${String(notificationTime.getMinutes()).padStart(2, '0')}`;
  }
  
  // 其他情况显示完整日期
  return timeStr.split(' ')[0];
};

// 处理滚动加载更多
const handleScroll = (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target;
  
  // 滚动到底部附近时加载更多
  if (scrollTop + clientHeight >= scrollHeight - 50 && hasMoreData.value && !loadingMore.value) {
    loadMore();
  }
};

// 加载更多数据
const loadMore = () => {
  if (loadingMore.value || !hasMoreData.value) return;
  
  loadingMore.value = true;
  currentPage.value++;
  
  // 模拟加载更多
  setTimeout(() => {
    // 这里应该是实际的API调用
    // 当没有更多数据时，设置hasMoreData为false
    if (currentPage.value >= 3) {
      hasMoreData.value = false;
    }
    
    loadingMore.value = false;
  }, 800);
};

onMounted(() => {
  total.value = notifications.value.length;
  
  // 初始加载
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
});

// 清理事件监听
onUnmounted(() => {
  if (listContainer.value) {
    listContainer.value.style.transform = 'translateY(0)';
  }
});
</script>

<style scoped>
.notification-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fff;
  position: relative;
  overflow: hidden;
}

/* 头部样式 */
.notification-header {
  background-color: #fff;
  padding: 16px 16px 10px;
  z-index: 10;
  border-bottom: none;
}

.header-title {
  display: flex;
  align-items: center;
}

.header-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

/* 标签栏样式 */
.notification-tabs {
  display: flex;
  background-color: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  font-size: 15px;
  position: relative;
  cursor: pointer;
}

.tab-item.active {
  color: #409eff;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 30%;
  right: 30%;
  height: 2px;
  background-color: #409eff;
  border-radius: 2px;
}

/* 下拉刷新区域 */
.pull-refresh {
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: #fff;
}

.pull-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  color: #909399;
  z-index: 1;
}

.pull-icon {
  margin-right: 8px;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 通知列表样式 */
.notification-list {
  height: 100%;
  overflow-y: auto;
  padding: 0 16px;
  background-color: #fff;
  transition: transform 0.3s;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 40px 0;
}

.notification-item {
  display: flex;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 12px;
  padding: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
  position: relative;
  border-left: 3px solid transparent;
}

.notification-item:active {
  transform: scale(0.98);
}

.notification-item.unread {
  border-left-color: #409eff;
}

.notification-status {
  position: absolute;
  top: 14px;
  right: 14px;
}

.status-dot {
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
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.notification-icon .el-icon {
  font-size: 18px;
  color: #606266;
}

.notification-icon.warning .el-icon {
  color: #e6a23c;
}

.notification-icon.success .el-icon {
  color: #67c23a;
}

.notification-icon.info .el-icon {
  color: #909399;
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

/* 加载更多与无更多数据 */
.load-more {
  text-align: center;
  padding: 16px 0;
  color: #909399;
  font-size: 14px;
}

.load-more p {
  margin: 0;
  cursor: pointer;
}

.no-more {
  text-align: center;
  padding: 16px 0;
  color: #c0c4cc;
  font-size: 12px;
}

/* 通知详情弹窗样式 */
.notification-dialog :deep(.el-dialog) {
  border-radius: 10px;
  overflow: hidden;
}

.notification-dialog :deep(.el-dialog__header) {
  padding: 16px;
  margin: 0;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.notification-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 500;
}

.notification-dialog :deep(.el-dialog__body) {
  padding: 16px;
}

.notification-dialog :deep(.el-dialog__footer) {
  padding: 10px 16px;
  border-top: 1px solid #f0f0f0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-time {
  color: #909399;
  font-size: 13px;
}

.detail-type {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  color: #606266;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.detail-type.success {
  color: #67c23a;
  border-color: rgba(103, 194, 58, 0.2);
}

.detail-type.warning {
  color: #e6a23c;
  border-color: rgba(230, 162, 60, 0.2);
}

.detail-type.info {
  color: #909399;
  border-color: rgba(144, 147, 153, 0.2);
}

.detail-content {
  font-size: 14px;
  line-height: 1.5;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: center;
}
</style> 