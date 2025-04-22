<template>
  <div class="eb-app-container">
    <el-container class="eb-app-main-container">
      <!-- 侧边栏放在最左侧 -->
      <el-aside width="auto" class="eb-app-aside">
        <EBAdminSidebar />
      </el-aside>
      
      <!-- 右侧内容区域 -->
      <el-container class="eb-app-right-container">
        <!-- 头部放在侧边栏右侧 -->
        <el-header class="eb-app-header">
          <EBHeader />
        </el-header>
        
        <!-- 主内容区域 -->
        <el-main class="eb-app-main">
          <EBBreadcrumb />
          <router-view />
        </el-main>
        
        <!-- 底部 -->
        <el-footer class="eb-app-footer">
          <EBFooter />
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import EBHeader from '@/components/EBHeader.vue';
import EBAdminSidebar from '@/components/EBAdminSidebar.vue';
import EBFooter from '@/components/EBFooter.vue';
import EBBreadcrumb from '@/components/EBBreadcrumb.vue';

// 侧边栏切换处理
const handleSidebarToggle = (e) => {
  const rightContainer = document.querySelector('.eb-app-right-container');
  if (e.detail.expanded) {
    rightContainer.style.marginLeft = '180px'; // 从200px减小到180px
  } else {
    rightContainer.style.marginLeft = '50px'; // 从60px减小到50px
  }
};

onMounted(() => {
  // 添加全局事件监听，检测侧边栏状态变化
  document.addEventListener('adminSidebarToggle', handleSidebarToggle);
});

onBeforeUnmount(() => {
  // 移除事件监听
  document.removeEventListener('adminSidebarToggle', handleSidebarToggle);
});
</script>

<style scoped>
.eb-app-container {
  min-height: 100vh;
  display: flex;
  background-color: #f5f7fa;
}

.eb-app-main-container {
  flex: 1;
  display: flex;
  min-height: 100vh;
}

.eb-app-aside {
  background-color: transparent;
  color: #333;
  text-align: center;
  padding: 0;
  margin: 0;
  width: 50px !important; /* 从60px减小到50px */
  min-width: 50px !important; /* 从60px减小到50px */
  z-index: 1000;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
}

.eb-app-right-container {
  flex: 1;
  flex-direction: column;
  margin-left: 50px; /* 从60px减小到50px */
  transition: margin-left 0.3s ease;
}

.eb-app-header {
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  height: 50px; /* 从60px减小到50px */
  padding: 0;
}

.eb-app-main {
  flex: 1;
  padding: 15px; /* 从20px减小到15px */
  min-height: calc(100vh - 50px - 30px); /* 调整计算，减去头部和底部的高度 */
}

.eb-app-footer {
  width: 100%;
  background-color: #fff;
  height: 30px; /* 从40px减小到30px */
  padding: 0;
}
</style> 