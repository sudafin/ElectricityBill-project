<template>
  <EBPageLayout>
    <template #header>
      <div class="eb-dashboard-header">
        <div class="tab-buttons">
          <div 
            class="tab-item"
            :class="{ 'active-tab': activeTab === 'notifications' }" 
            @click="activeTab = 'notifications'"
          >
            <el-icon><Bell /></el-icon>
            <span>最新通知</span>
          </div>
          <div 
            class="tab-item"
            :class="{ 'active-tab': activeTab === 'electricity' }" 
            @click="activeTab = 'electricity'"
          >
            <el-icon><Lightning /></el-icon>
            <span>电费记录</span>
          </div>
          <div 
            class="tab-item"
            :class="{ 'active-tab': activeTab === 'payment' }" 
            @click="activeTab = 'payment'"
          >
            <el-icon><Wallet /></el-icon>
            <span>缴费记录</span>
          </div>
        </div>
      </div>
    </template>

    <div class="dashboard-container">
      <!-- 动态组件切换 -->
      <component :is="currentComponent"></component>
    </div>
  </EBPageLayout>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue';
import { EBPageLayout } from '@/components';
import { Bell, Lightning, Wallet } from '@element-plus/icons-vue';

// 使用异步组件加载子组件
const EBUserNotifications = defineAsyncComponent(() => 
  import('./components/EBUserDashboardNotifications.vue')
);
const EBUserElectricityRecord = defineAsyncComponent(() => 
  import('./components/EBUserDashboardElectricity.vue')
);
const EBUserPaymentRecord = defineAsyncComponent(() => 
  import('./components/EBUserDashboardPayment.vue')
);

// 当前活动标签
const activeTab = ref('notifications'); // 默认显示最新通知

// 根据当前活动标签返回对应组件
const currentComponent = computed(() => {
  switch(activeTab.value) {
    case 'electricity':
      return EBUserElectricityRecord;
    case 'payment':
      return EBUserPaymentRecord;
    case 'notifications':
    default:
      return EBUserNotifications;
  }
});
</script>

<style scoped>
.eb-dashboard-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0 15px 0;
}

.tab-buttons {
  display: flex;
  padding: 0;
  width: 100%;
  justify-content: center;
  border: none;
}

.tab-item {
  display: flex;
  align-items: center;
  padding: 0 30px;
  height: 40px;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  margin-right: 20px;
  position: relative;
  font-weight: normal;
}

.tab-item:last-child {
  margin-right: 0;
}

.tab-item:hover {
  color: #409EFF;
}

.tab-item .el-icon {
  margin-right: 6px;
  font-size: 16px;
}

.active-tab {
  color: #409EFF;
  font-weight: 500;
}

.active-tab .el-icon {
  color: #409EFF;
}

.dashboard-container {
  margin-top: 15px;
  padding: 0;
}
</style> 