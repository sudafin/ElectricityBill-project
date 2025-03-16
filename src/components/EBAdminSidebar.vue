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


.el-menu {
  border-right: none !important;
}

.el-menu-item.is-active {
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
  border-left: 3px solid #fff !important;
}

</style> 