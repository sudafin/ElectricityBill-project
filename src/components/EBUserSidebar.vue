<template>
  <div class="eb-sidebar" :class="{ 'is-expanded': isExpanded }">
    <div class="sidebar-toggle" @click="toggleSidebar">
      <el-icon v-if="isExpanded"><Fold /></el-icon>
      <el-icon v-else><Expand /></el-icon>
    </div>
    <el-menu 
      :default-active="activeIndex"
      :collapse="!isExpanded"
      :collapse-transition="false"
      class="eb-menu"
      @select="handleSelect"
      background-color="transparent"
      text-color="#333"
      active-text-color="#409EFF"
    >
      <el-menu-item index="/user/dashboard">
        <el-icon><House /></el-icon>
        <template #title>电费概览</template>
      </el-menu-item>
      <el-menu-item index="/user/paymentDashboard">
        <el-icon><Wallet /></el-icon>
        <template #title>缴纳电费</template>
      </el-menu-item>
      <el-menu-item index="/user/analysis">
        <el-icon><DataAnalysis /></el-icon>
        <template #title>用电分析</template>
      </el-menu-item>
      <el-menu-item index="/user/notifications">
        <el-icon><Bell /></el-icon>
        <template #title>通知中心</template>
      </el-menu-item>
      <el-menu-item index="/user/profile">
        <el-icon><User /></el-icon>
        <template #title>个人信息</template>
      </el-menu-item>
      <el-menu-item index="/user/help">
        <el-icon><QuestionFilled /></el-icon>
        <template #title>帮助中心</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  House,
  User,
  DataAnalysis,
  Bell,
  Wallet,
  QuestionFilled,
  Fold,
  Expand
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

// 使用计算属性获取当前路由路径
const activeIndex = computed(() => {
  // 获取当前路由路径
  const currentPath = route.path;
  
  // 检查是否有精确匹配的菜单项
  const menuItems = [
    '/user/dashboard',
    '/user/paymentDashboard',
    '/user/analysis',
    '/user/notifications',
    '/user/profile',
    '/user/help'
  ];
  
  // 如果当前路径精确匹配某个菜单项，直接返回
  if (menuItems.includes(currentPath)) {
    return currentPath;
  }
  
  // 否则返回当前路径的最近匹配项
  return currentPath;
});

// 控制侧边栏展开/收起状态
const isExpanded = ref(false);

// 切换侧边栏展开/收起状态
const toggleSidebar = () => {
  isExpanded.value = !isExpanded.value;
  
  // 触发自定义事件，通知其他组件侧边栏状态已更改
  document.dispatchEvent(new CustomEvent('sidebarToggle', {
    detail: { expanded: isExpanded.value }
  }));
};

const handleSelect = (index) => {
  router.push(index);
};
</script>

<style lang="scss">
.eb-sidebar {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f0f5fa;
  color: #606266;
  transition: width 0.3s ease;
  overflow: hidden;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 0;
  box-shadow: none;
  width: 60px !important;
  padding: 0;
  z-index: 999;
  
  &.is-expanded {
    width: 200px !important;
  }
  
  .sidebar-toggle {
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: #7b8191;
    
    &:hover {
      color: #409EFF;
    }
    
    .el-icon {
      font-size: 20px;
    }
  }
  
  .eb-menu {
    flex: 1;
    border-right: none;
    background-color: transparent;
    width: 100%;
    margin-top: 20px;
    
    .el-menu-item {
      height: 50px;
      line-height: 50px;
      text-align: left;
      margin-bottom: 5px;
      background-color: transparent;
      border-left: 3px solid transparent;
      padding-left: 20px !important;
      font-weight: 500;
      
      &:hover {
        background-color: rgba(64, 158, 255, 0.1) !important;
        color: #409EFF !important;
      }
      
      &.is-active {
        background-color: #e5f1fb !important;
        color: #409EFF !important;
        border-left: 3px solid #409EFF;
        font-weight: 600;
      }
      
      .el-icon {
        margin-right: 0;
        font-size: 18px;
        color: #7b8191;
        font-weight: bold;
      }
      
      &.is-active .el-icon {
        color: #409EFF;
      }
    }
  }
}

// 重写 Element Plus 默认样式
.el-menu {
  border-right: none !important;
  background-color: transparent !important;
}

.el-menu-item {
  color: #7b8191 !important;
  
  &.is-active {
    color: #409EFF !important;
  }
}

.el-menu--collapse {
  width: 60px;
}

.el-menu:not(.el-menu--collapse) {
  width: 200px;
  
  .el-menu-item .el-icon {
    margin-right: 12px !important;
  }
}
</style>