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
        @click="switchTab('全部')"
      >
        全部通知
      </div>
      <div 
        class="tab-item" 
        :class="{ 'active': activeTab === 'unread' }" 
        @click="switchTab('未读')"
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
        <template v-if="notifications.length === 0">
          <div class="empty-state">
            <el-empty :description="activeTab === 'all' ? '暂无通知' : '暂无未读通知'" />
          </div>
        </template>
        
        <template v-else>
          <div 
            v-for="notification in notifications" 
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
          <div class="no-more" v-if="!hasMoreData && notifications.length > 0">
            — 已经到底了 —
          </div>
        </template>
      </div>
    </div>

    <!-- 通知详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      :title="notificationDetail.title || '通知详情'"
      width="90%"
      top="20vh"
      destroy-on-close
      class="notification-dialog"
      @closed="handleDetailDialogClosed"
    >
      <div class="notification-detail" v-loading="detailLoading">
        <div class="detail-header">
          <div class="detail-time">{{ formatTime(notificationDetail.createTime) }}</div>
          <div class="detail-type" :class="getNotificationType(notificationDetail.title)">
            {{ notificationDetail.noticeType || getNotificationTypeText(notificationDetail.title) }}
          </div>
        </div>
        <div class="detail-content">
          {{ notificationDetail.content }}
        </div>
        
        <!-- 反馈回复区域 -->
        <div v-if="notificationDetail.noticeType === '反馈类型'" class="feedback-reply">
          <div class="reply-header">
            <div class="reply-title">回复内容</div>
            <div class="reply-time" v-if="notificationDetail.replyTime">{{ formatTime(notificationDetail.replyTime) }}</div>
          </div>
          <div class="reply-content" v-if="notificationDetail.replyContent">
            {{ notificationDetail.replyContent }}
          </div>
          <div class="no-reply" v-else>
            <el-empty description="暂无回复" :image-size="60">
              <template #description>
                <p>您的反馈正在处理中，请耐心等待</p>
              </template>
            </el-empty>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDetailDialog" size="small">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh, Bell, Check, WarningFilled, SuccessFilled } from '@element-plus/icons-vue';
import { getNotifications, getNotificationDetail } from '@/api/user/notification';

// 页面状态
const loading = ref(false);
const activeTab = ref('all');
const detailVisible = ref(false);
const notificationDetail = ref({});
const detailLoading = ref(false);
const isRefreshing = ref(false);
const isPulling = ref(false);
const loadingMore = ref(false);
const hasMoreData = ref(true);

// 下拉刷新相关
const startY = ref(0);
const pullDistance = ref(0);
const pullThreshold = 60;
const listContainer = ref(null);

// 通知数据
const notifications = ref([]);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const currentStatus = ref('全部');

// 处理刷新
const handleRefresh = () => {
  if (isRefreshing.value) return;
  
  isRefreshing.value = true;
  currentPage.value = 1;
  
  // 请求第一页数据
  fetchNotifications(true).finally(() => {
    isRefreshing.value = false;
  });
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
    handleRefresh();
  }
  
  // 回弹
  pullDistance.value = 0;
  listContainer.value.style.transform = 'translateY(0)';
  isPulling.value = false;
};

// 切换标签
const switchTab = (status) => {
  if (status === '全部') {
    activeTab.value = 'all';
    currentStatus.value = '全部';
  } else {
    activeTab.value = 'unread';
    currentStatus.value = '未读';
  }
  
  currentPage.value = 1;
  hasMoreData.value = true;
  notifications.value = [];
  
  // 重新加载
  fetchNotifications();
};

// 获取通知列表
const fetchNotifications = (isRefresh = false) => {
  if (loading.value && !isRefresh) return Promise.reject('正在加载中');
  
  if (!isRefresh) {
    loading.value = true;
  }
  
  return getNotifications({
    status: currentStatus.value,
    pageNo: currentPage.value,
    pageSize: pageSize.value
  })
    .then(response => {
      console.log('获取通知响应:', JSON.stringify(response));
      
      // 直接处理响应，不检查code字段
      let records = [];
      let totalCount = 0;
      
      // 处理分页数据结构
      if (response && response.records) {
        // 标准分页格式 {records: [], total: 10}
        records = response.records;
        totalCount = response.total || 0;
      } else if (response && response.list) {
        // 带list的数据结构 {list: [], total: 10}
        records = response.list;
        totalCount = response.total || 0;
      } else if (Array.isArray(response)) {
        // 直接返回数组的情况
        records = response;
        totalCount = response.length;
      }
      
      // 映射字段
      const mappedRecords = records.map(item => {
        return {
          id: item.id || '',
          title: item.title || '',
          content: item.content || '',
          noticeType: item.type || '',
          createTime: item.createdAt || item.createTime || '',
          isRead: item.readStatus === 1 || item.isRead === true, // 0表示未读，1表示已读
          readTime: item.readTime || null
        };
      });
      
      if (isRefresh || currentPage.value === 1) {
        notifications.value = mappedRecords;
      } else {
        notifications.value = [...notifications.value, ...mappedRecords];
      }
      
      total.value = totalCount;
      hasMoreData.value = notifications.value.length < total.value;
      
      console.log('通知数据加载成功，共 ' + notifications.value.length + ' 条，未读 ' + 
        mappedRecords.filter(item => !item.isRead).length + ' 条');
      return { records: mappedRecords, total: totalCount };
    })
    .catch(error => {
      ElMessage.error('获取通知失败');
      console.error('获取通知失败:', error);
      return Promise.reject(error);
    })
    .finally(() => {
      loading.value = false;
      loadingMore.value = false;
    });
};

// 查看通知详情
const viewNotification = (notification) => {
  detailVisible.value = true;
  detailLoading.value = true;
  
  // 先设置基本信息，以便快速显示
  notificationDetail.value = { ...notification };
  
  // 获取详情
  getNotificationDetail(notification.id)
    .then(response => {
      console.log('获取通知详情响应:', JSON.stringify(response));
      
      // 直接处理响应数据，不检查code
      if (response) {
        // 映射字段
        notificationDetail.value = {
          id: response.id || notification.id || '',
          title: response.title || notification.title || '',
          content: response.content || notification.content || '',
          noticeType: response.type || notification.noticeType || '',
          createTime: response.createdAt || response.createTime || notification.createTime || '',
          isRead: response.readStatus === 1 || response.isRead === true,
          readTime: response.readTime || null,
          replyContent: response.replyContent || null,
          replyTime: response.replyTime || null
        };
      }
    })
    .catch(error => {
      ElMessage.error('获取通知详情失败');
      console.error('获取通知详情失败:', error);
    })
    .finally(() => {
      detailLoading.value = false;
    });
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
  
  fetchNotifications();
};

// 关闭详情对话框
const closeDetailDialog = () => {
  detailVisible.value = false;
};

// 详情对话框关闭后的处理
const handleDetailDialogClosed = () => {
  console.log('通知详情对话框已关闭，刷新列表数据');
  // 刷新当前页的通知列表数据
  fetchNotifications().then(result => {
    console.log('关闭对话框后刷新列表完成，加载通知：', result?.records?.length || 0);
  }).catch(err => {
    console.error('关闭对话框后刷新列表失败:', err);
  });
};

onMounted(() => {
  // 初始加载
  console.log('通知中心初始化');
  fetchNotifications().then(result => {
    console.log('初始通知加载完成，共加载通知:', result?.records?.length || 0);
    
    // 初始数据加载后再执行其他操作（比如设置标签页计数等）
    const unreadCount = result?.records?.filter(item => !item.isRead).length || 0;
    console.log('初始未读通知数量:', unreadCount);
  }).catch(err => {
    console.error('初始加载通知失败:', err);
  });
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

/* 反馈回复区域样式 */
.feedback-reply {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.reply-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.reply-time {
  font-size: 12px;
  color: #909399;
}

.reply-content {
  background-color: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: #606266;
}

.no-reply {
  padding: 15px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.no-reply p {
  margin: 5px 0 0;
  color: #909399;
  font-size: 12px;
}
</style> 