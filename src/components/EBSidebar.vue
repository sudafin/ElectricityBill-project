<template>
  <div class="eb-sidebar" :class="{ 'is-collapsed': isCollapsed }">
    <div class="eb-sidebar-header">
      <span v-if="!isCollapsed" class="eb-sidebar-title">电费管理系统</span>
      <el-icon v-else class="eb-sidebar-icon" @click="toggleSidebar"><Expand /></el-icon>
    </div>
    <el-menu 
      :default-active="activeIndex"
      :collapse="isCollapsed"
      class="eb-menu"
      @select="handleSelect"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
    >
      <el-menu-item index="/dashboard">
        <el-icon><House /></el-icon>
        <span>首页</span>
      </el-menu-item>
      
      <el-sub-menu index="/user">
        <template #title>
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </template>
        <el-menu-item index="/user/list">用户列表</el-menu-item>
        <el-menu-item index="/user/create">添加用户</el-menu-item>
        <el-menu-item index="/user/fee">费用录入</el-menu-item>
      </el-sub-menu>
      
      <el-sub-menu index="/fee">
        <template #title>
          <el-icon><Coin /></el-icon>
          <span>费用管理</span>
        </template>
        <el-menu-item index="/fee/list">费用列表</el-menu-item>
        <el-menu-item index="/fee/query">费用查询</el-menu-item>
      </el-sub-menu>
      
      <el-menu-item index="/report">
        <el-icon><DataAnalysis /></el-icon>
        <span>数据统计</span>
      </el-menu-item>
      
      <el-menu-item index="/reconciliation">
        <el-icon><DocumentChecked /></el-icon>
        <span>对账审批</span>
      </el-menu-item>
      
      <el-menu-item index="/notification">
        <el-icon><Bell /></el-icon>
        <span>通知提醒</span>
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
    <div class="eb-sidebar-footer">
      <el-icon class="eb-sidebar-icon" @click="toggleSidebar">
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
  Expand,
  Fold,
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const activeIndex = ref(route.path);
const isCollapsed = ref(false);

const handleSelect = (index) => {
  router.push(index);
};

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
.eb-sidebar {
  position: relative;
  z-index: 1;
  height: 100vh;
  overflow-y: auto;
  background-color: #545c64;
  transition: width 0.28s;
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
  background-color: #434a50;
}

.eb-sidebar-title {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
}

.eb-sidebar-icon {
  color: #fff;
  font-size: 24px;
  cursor: pointer;
}

.eb-sidebar-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  background-color: #434a50;
}

.eb-menu {
  border-right: none;
}

:deep(.el-menu-item.is-active) {
  background-color: #ff9900 !important;
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
</style> 