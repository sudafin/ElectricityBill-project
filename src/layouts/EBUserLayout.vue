<template>
  <div class="mobile-app-container">
    <!-- 应用头部 -->
    <div class="mobile-app-header">
      <div class="header-logo">
        <img src="@/assets/images/logo.png" alt="Logo" class="app-logo">
      </div>
      <div class="header-actions">
        <div class="action-item">
          <el-badge :value="unreadCount > 0 ? unreadCount : ''" class="notification-badge" type="danger"
            @click="goToNotifications">
            <el-icon>
              <Bell />
            </el-icon>
          </el-badge>
        </div>
        <div class="action-item">
          <el-button class="logout-btn" type="text" @click="confirmLogout">退出</el-button>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="mobile-app-content" ref="contentRef" @scroll="handleScroll">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- 底部导航 -->
    <div class="mobile-app-footer" :class="{ 'footer-hidden': isFooterHidden }">
      <EBUserSidebar />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Bell } from '@element-plus/icons-vue';
import { ElMessageBox, ElButton } from 'element-plus';
import EBUserSidebar from '@/components/EBUserSidebar.vue';
import { getUnreadCount } from '@/api/user/notification';

// 确保组件已正确注册
const components = {
  EBUserSidebar
};

const router = useRouter();
const route = useRoute();
const unreadCount = ref(0);
const contentRef = ref(null); // 内容区域的引用
const isFooterHidden = ref(false); // 底部导航栏是否隐藏
let lastScrollTop = 0; // 上次滚动位置
let scrollTimeout = null; // 滚动延时器

// 处理滚动事件
const handleScroll = (e) => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }

  const currentScrollTop = e.target.scrollTop;

  // 向下滚动超过20px隐藏导航栏，向上滚动显示导航栏
  if (currentScrollTop > lastScrollTop && currentScrollTop > 50) {
    isFooterHidden.value = true;
  } else if (currentScrollTop < lastScrollTop) {
    isFooterHidden.value = false;
  }

  lastScrollTop = currentScrollTop;

  // 滚动停止3秒后显示导航栏
  scrollTimeout = setTimeout(() => {
    isFooterHidden.value = false;
  }, 3000);
};

// 根据当前路由计算页面标题
const currentPageTitle = computed(() => {
  const pathMap = {
    '/user/dashboard': '概览',
    '/user/paymentDashboard': '缴费',
    '/user/notifications': '通知',
    '/user/profile': '我的',
    '/user/help': '帮助'
  };

  // 查找最匹配的路径
  const currentPath = Object.keys(pathMap).find(path =>
    route.path.startsWith(path)
  );

  return currentPath ? pathMap[currentPath] : '电力账单';
});

// 获取未读通知数量
const fetchUnreadCount = async () => {
  try {
    const { data } = await getUnreadCount();
    unreadCount.value = data;
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
  }
};

// 跳转到通知页面
const goToNotifications = () => {
  router.push('/user/notifications');
};

// 退出登录确认
const confirmLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('token');
    router.push('/login');
  }).catch(() => { });
};

onMounted(() => {
  //5秒后再获取未读通知数量
  setTimeout(() => {
    fetchUnreadCount();
  }, 5000);
});

</script>

<style scoped>
.mobile-app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
  background-color: #ffffff;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
}

.mobile-app-header {
  height: 60px;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-logo {
  display: flex;
  align-items: center;
  min-width: 50px;
  margin-right: 8px;
}

.app-logo {
  height: 40px;
  width: auto;
}

.header-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  text-align: center;
  white-space: nowrap;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 120px;
  justify-content: flex-end;
}

.action-item {
  display: flex;
  align-items: center;
  height: 40px;
}

.notification-badge {
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 100%;
}

.notification-badge :deep(.el-icon) {
  font-size: 22px;
  color: #606266;
}

.notification-badge :deep(.el-badge__content) {
  transform: translate(5px, -5px);
}

.logout-btn {
  font-size: 16px;
  color: #f56c6c;
  padding: 0;
  font-weight: 500;
  height: 100%;
  display: flex;
  align-items: center;
}

.logout-btn:hover {
  color: #ff7c7c;
}

.mobile-app-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  padding-bottom: 76px;
  /* 恢复原来的底部填充，因为现在导航栏可以隐藏 */
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.mobile-app-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  max-width: 500px;
  margin: 0 auto;
  background-color: #ffffff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.footer-hidden {
  transform: translateY(100%);
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>