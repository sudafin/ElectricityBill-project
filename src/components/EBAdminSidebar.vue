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
      unique-opened
      class="eb-menu"
      @select="handleSelect"
      background-color="#f0f5fa"
      text-color="#333"
      active-text-color="#409EFF"
    >
      <el-menu-item index="/admin/dashboard">
        <el-icon><House /></el-icon>
        <template #title>管理首页</template>
      </el-menu-item>
      <el-menu-item index="/admin/user">
        <el-icon><User /></el-icon>
        <template #title>用户管理</template>
      </el-menu-item>
      <el-menu-item index="/admin/report">
        <el-icon><DataAnalysis /></el-icon>
        <template #title>数据统计</template>
      </el-menu-item>
      <el-menu-item index="/admin/reconciliation">  
        <el-icon><DocumentChecked /></el-icon>
        <template #title>对账审批</template>
      </el-menu-item>
      <el-menu-item index="/admin/notification">
        <el-icon><Bell /></el-icon>
        <template #title>通知管理</template>
      </el-menu-item>
      <el-menu-item index="/admin/payment">
        <el-icon><Wallet /></el-icon>
        <template #title>支付管理</template>
      </el-menu-item>
      <el-menu-item index="/admin/meter">
        <el-icon><Odometer /></el-icon>
        <template #title>电表管理</template>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  House,
  User,
  DataAnalysis,
  DocumentChecked,
  Bell,
  Wallet,
  Setting,
  Fold,
  Expand,
  Odometer,
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

// 使用计算属性获取当前路由路径
const activeIndex = computed(() => {
  // 获取当前路由路径
  const currentPath = route.path;
  
  // 检查是否有精确匹配的菜单项
  const menuItems = [
    '/admin/dashboard',
    '/admin/user',
    '/admin/report',
    '/admin/reconciliation',
    '/admin/notification',
    '/admin/payment',
    '/admin/setting/role',
    '/admin/setting/rate',
    '/admin/setting/log',
    '/admin/meter',
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
  
  // 默认返回dashboard页面
  return '/admin/dashboard';
});

// 控制侧边栏展开/收起状态
const isExpanded = ref(false);

// 切换侧边栏展开/收起状态
const toggleSidebar = () => {
  isExpanded.value = !isExpanded.value;
  
  // 触发自定义事件，通知其他组件侧边栏状态已更改
  document.dispatchEvent(new CustomEvent('adminSidebarToggle', {
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
    margin-right: 6px !important;
  }
}

// 子菜单样式
.el-sub-menu {
  .el-sub-menu__title {
    height: 50px;
    line-height: 50px;
    text-align: left;
    margin-bottom: 5px;
    background-color: transparent;
    border-left: 3px solid transparent;
    padding-left: 20px !important;
    color: #7b8191;
    font-weight: 500;
    
    &:hover {
      background-color: rgba(64, 158, 255, 0.1) !important;
      color: #409EFF !important;
    }
    
  }

  &.is-active {
    > .el-sub-menu__title {
      color: #409EFF !important;
      
      .el-icon {
        color: #409EFF;
      }
    }
  }
  
  // 子菜单项样式调整
  .el-menu-item {
    padding-left: 45px !important;  // 增加子菜单项的缩进
    
    &.is-active {
      background-color: #e5f1fb !important;
      color: #409EFF !important;
      border-left: 3px solid #409EFF;
    }
  }
}


/* 子菜单弹出样式 */
.admin-submenu-popper {
  background-color: #e7edf5 !important;
  border: none !important;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1) !important;
  min-width: 170px !important;
  
  .el-menu {
    background-color: #e7edf5 !important;
  }
  
  .el-menu-item {
    background-color: #e7edf5 !important;
    height: 40px !important;
    line-height: 40px !important;
    font-size: 14px !important;
    padding-left: 20px !important;  // 确保弹出子菜单中的项目有一致的左内边距
    
    &:hover {
      background-color: #d8e6f6 !important;
    }

    
    &.is-active {
      background-color: #d8e6f6 !important;
      color: #409EFF !important;
      border-left: 3px solid #409EFF !important;
    }
  }
}

/* 子菜单箭头样式调整 */
.el-sub-menu__icon-arrow {
  right: 15px !important;
  font-size: 14px !important;
}

/* 确保子菜单展开时内容正确对齐 */
.el-menu:not(.el-menu--collapse) {
  .el-sub-menu .el-menu .el-menu-item {
    padding-left: 45px !important;
  }
}
</style>