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
      <el-menu-item index="/admin/dashboard">
        <el-icon><House /></el-icon>
        <span>首页</span>
      </el-menu-item>
      <el-menu-item index="/admin/fee">
          <el-icon><User /></el-icon>
          <span>用户费用</span>
      </el-menu-item>
      
      <el-menu-item index="/admin/report">
        <el-icon><DataAnalysis /></el-icon>
        <span>数据统计与报表</span>
      </el-menu-item>
      
      <el-menu-item index="/admin/reconciliation">  
          <el-icon><DocumentChecked /></el-icon>
          <span>对账与审批</span>
      </el-menu-item>
    
      
      <el-menu-item index="/admin/notification">
        <el-icon><Bell /></el-icon>
        <span>通知和提醒</span>
      </el-menu-item>
      
      <el-menu-item index="/admin/payment">
        <el-icon><Wallet /></el-icon>
        <span>支付管理</span>
      </el-menu-item>
      
      <el-sub-menu index="/admin/setting">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </template>
        <el-menu-item index="/admin/setting/role">角色权限</el-menu-item>
        <el-menu-item index="/admin/setting/rate">费率管理</el-menu-item>
        <el-menu-item index="/admin/setting/log">日志管理</el-menu-item>
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
import { ref, computed, onMounted } from 'vue';
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

// 使用计算属性获取当前路由路径，确保高亮正确显示
const activeIndex = computed(() => {
  // 获取当前路由路径
  const currentPath = route.path;
  
  // 检查是否有精确匹配的菜单项
  const menuItems = [
    '/admin/dashboard',
    '/admin/fee',
    '/admin/report',
    '/admin/reconciliation',
    '/admin/notification',
    '/admin/payment',
    '/admin/setting/role',
    '/admin/setting/rate',
    '/admin/setting/log'
  ];
  
  // 如果当前路径精确匹配某个菜单项，直接返回
  if (menuItems.includes(currentPath)) {
    return currentPath;
  }
  
  // 检查/admin/setting子菜单的特殊情况
  if (currentPath.startsWith('/admin/setting')) {
    return '/admin/setting';
  }
  
  // 如果不完全匹配，查找最接近的匹配项
  for (const item of menuItems) {
    if (currentPath.startsWith(item)) {
      return item;
    }
  }
  
  // 默认返回当前路径
  return currentPath;
});

// 在组件挂载时确保高亮正确初始化
onMounted(() => {
  // 强制更新菜单活动项
  const activeEl = document.querySelector('.el-menu-item.is-active');
  if (activeEl) {
    activeEl.classList.remove('is-active');
    setTimeout(() => {
      const newActiveEl = document.querySelector(`[index="${activeIndex.value}"]`);
      if (newActiveEl) {
        newActiveEl.classList.add('is-active');
      }
    }, 0);
  }
});

const isCollapsed = ref(false);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const handleSelect = (index) => {
  router.push(index);
};
</script>

<!-- 这里需要修改element-plus的样式,所以不能加scoped,因为scoped只对当前组件的样式生效 -->
<style lang="scss">
.eb-sidebar {
  position: fixed;
  z-index: 10;
  height: auto;
  top: 20px;
  bottom: 20px;
  left: 20px;
  overflow-y: auto;
  background: #ffffff;
  transition: width 0.28s;
  border-radius: 16px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  width: 80px !important;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.eb-sidebar.is-collapsed {
  width: 80px !important;
}

.eb-sidebar:not(.is-collapsed) {
  width: 80px !important;
}

.eb-sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  height: auto;
  background-color: transparent;
  border-bottom: 1px solid #f0f0f0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  width: 100%;
  padding: 10px 0;
  margin-bottom: 15px;
}

.eb-sidebar-title {
  display: none;
}

.eb-sidebar-icon {
  color: #1890ff;
  font-size: 20px;
  cursor: pointer;
}

.eb-sidebar-footer {
  position: relative;
  bottom: auto;
  left: auto;
  transform: none;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background-color: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 20px;
}

.eb-sidebar-footer:hover {
  transform: none;
  background-color: #e6f7ff;
}

.eb-sidebar-footer .eb-sidebar-icon {
  color: #1890ff;
  font-size: 18px;
}

.el-menu {
  border-right: none !important;
  width: 100%;
}

.el-menu-item {
  height: 60px;
  line-height: 60px;
  text-align: center;
  margin-bottom: 5px;
}

.el-menu-item .el-icon,
.el-sub-menu__title .el-icon {
  margin-right: 0;
  font-size: 20px;
}

.el-menu-item span,
.el-sub-menu__title span {
  display: none;
}

.el-menu-item:hover, 
.el-menu-item.is-active,
.el-sub-menu.is-active .el-sub-menu__title {
  background-color: #f0f7ff !important;
  color: #1890ff !important;
}

.el-menu-item.is-active {
  background-color: #f0f7ff !important;
  color: #1890ff !important;
  border-left: none !important;
}

.el-sub-menu__title {
  height: 60px;
  line-height: 60px;
  text-align: center;
}

.el-sub-menu__title:hover {
  background-color: #f0f7ff !important;
}

.el-menu--collapse {
  width: 80px;
}

/* 处理子菜单弹出样式 */
.el-menu--popup {
  min-width: 120px;
}

.el-menu--popup .el-menu-item span {
  display: inline-block;
}
</style> 