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
      <el-menu-item index="/dashboard">
        <el-icon><House /></el-icon>
        <span>首页</span>
      </el-menu-item>
      <el-menu-item index="/user">
          <el-icon><User /></el-icon>
          <span>用户费用</span>
      </el-menu-item>
      
      <el-menu-item index="/fee">
        <el-icon><Coin /></el-icon>
        <span>费用管理</span>
      </el-menu-item>
      
      <el-menu-item index="/report">
        <el-icon><DataAnalysis /></el-icon>
        <span>数据统计与报表</span>
      </el-menu-item>
      
      <el-menu-item index="/reconciliation">
        <el-icon><DocumentChecked /></el-icon>
        <span>对账与审批</span>
      </el-menu-item>
      
      <el-menu-item index="/notification">
        <el-icon><Bell /></el-icon>
        <span>通知和提醒</span>
      </el-menu-item>
      
      <el-menu-item index="/payment">
        <el-icon><Wallet /></el-icon>
        <span>支付管理</span>
      </el-menu-item>
      
      <el-sub-menu index="/setting">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </template>
        <el-menu-item index="/setting/role">角色权限</el-menu-item>
        <el-menu-item index="/setting/rate">费率设置</el-menu-item>
        <el-menu-item index="/setting/param">参数配置</el-menu-item>
        <el-menu-item index="/setting/log">日志管理</el-menu-item>
      </el-sub-menu>
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
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  House,
  User,
  Coin,
  DataAnalysis,
  DocumentChecked,
  Bell,
  Wallet,
  Setting,
  Fold,
  Expand,
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const activeIndex = ref(route.path);

const isCollapsed = ref(false);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const handleSelect = (index) => {
  router.push(index);
};
</script>

<style scoped>
.eb-sidebar {
  position: relative;
  z-index: 1;
  height: calc(100vh - 80px);
  overflow-y: auto;
  background: linear-gradient(135deg, #8ec5fc 0%, #e0c3fc 100%);
  transition: width 0.28s;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
}

.eb-sidebar.is-collapsed {
  width: 64px !important;
}

.eb-sidebar:not(.is-collapsed) {
  width: 200px !important;
}

.eb-sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.eb-sidebar-title {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
}

.eb-sidebar-icon {
  color: #fff;
  font-size: 24px;
  cursor: pointer;
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
}

.eb-sidebar-footer:hover {
  transform: translateX(-50%) scale(1.1);
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}

.eb-sidebar-footer .eb-sidebar-icon {
  color: #8ec5fc;
  font-size: 20px;
}

.eb-menu {
  border-right: none;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

:deep(.el-sub-menu__title),
:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
}

:deep(.el-sub-menu__title) i,
:deep(.el-menu-item) i {
  color: #fff;
}

:deep(.el-sub-menu__title) span,
:deep(.el-menu-item) span {
  display: inline-block;
  padding-left: 10px;
  opacity: 1;
  transition: opacity 0.28s;
}

.eb-sidebar.is-collapsed :deep(.el-sub-menu__title) span,
.eb-sidebar.is-collapsed :deep(.el-menu-item) span {
  opacity: 0;
}

.eb-sidebar.is-collapsed :deep(.el-menu--collapse) {
  width: 64px;
}

.eb-sidebar:not(.is-collapsed) :deep(.el-menu--collapse) {
  width: 200px;
}
</style> 