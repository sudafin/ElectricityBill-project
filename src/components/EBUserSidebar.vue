<template>
  <div class="eb-sidebar" :class="{ 'is-collapsed': isCollapsed }">
    <div class="eb-sidebar-header">
      <span v-if="!isCollapsed" class="eb-sidebar-title">电费管理系统</span>
      <el-icon v-else class="eb-sidebar-icon" @click="toggleSidebar"><Expand /></el-icon>
    </div>
    <el-menu 
      :default-active="activeIndex"
      :collapse="isCollapsed"
      :collapse-transition="false"
      class="eb-menu"
      @select="handleSelect"
      background-color="transparent"
      text-color="#fff"
      active-text-color="#fff"
    >
      <el-menu-item index="/user/dashboard">
        <el-icon><House /></el-icon>
        <span>电费概览</span>
      </el-menu-item>
      <el-menu-item index="/user/payment/dashboard">
        <el-icon><Wallet /></el-icon>
        <span>缴纳电费</span>
      </el-menu-item>
      <el-menu-item index="/user/analysis">
        <el-icon><DataAnalysis /></el-icon>
        <span>用电分析</span>
      </el-menu-item>
      <el-menu-item index="/user/notifications">
        <el-icon><Bell /></el-icon>
        <span>通知中心</span>
      </el-menu-item>
      <el-menu-item index="/user/profile">
        <el-icon><User /></el-icon>
        <span>个人信息</span>
      </el-menu-item>
      <el-menu-item index="/user/help">
        <el-icon><QuestionFilled /></el-icon>
        <span>帮助中心</span>
      </el-menu-item>
    </el-menu>
    <div class="eb-sidebar-footer" @click="toggleSidebar">
      <el-icon class="eb-sidebar-icon">
        <Fold v-if="!isCollapsed" />
        <Expand v-else />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  House,
  User,
  DataAnalysis,
  DocumentChecked,
  Bell,
  Wallet,
  Fold,
  Expand,
  QuestionFilled
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
    '/user/payment/dashboard',
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

const isCollapsed = ref(false);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
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
  background: linear-gradient(135deg, #8ec5fc 0%, #e0c3fc 100%);
  color: #fff;
  transition: all 0.3s;
  overflow: hidden;
  position: relative;
  
  &.is-collapsed {
    width: 64px;
  }
  
  .eb-sidebar-header {
    padding: 20px 16px;
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .eb-sidebar-title {
      white-space: nowrap;
    }
    
    .eb-sidebar-icon {
      cursor: pointer;
      font-size: 20px;
    }
  }
  
  .eb-menu {
    flex: 1;
    border-right: none;
    background-color: transparent;
    
    .el-menu-item {
      &:hover, &.is-active {
        background-color: rgba(255, 255, 255, 0.2) !important;
      }
      
      &.is-active {
        border-left: 3px solid #fff;
      }
    }
  }
  
  .eb-sidebar-footer {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    background-color: #fff;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
    
    &:hover {
      transform: translateX(-50%) scale(1.1);
      box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
    }
    
    .eb-sidebar-icon {
      color: #8ec5fc;
      font-size: 20px;
    }
  }
}

// 重写 Element Plus 默认样式
.el-menu {
  border-right: none !important;
}

.el-menu-item.is-active {
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
  border-left: 3px solid #fff !important;
}
</style>