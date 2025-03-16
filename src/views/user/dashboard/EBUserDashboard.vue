<template>
  <EBPageLayout>
    <template #header>
      <div class="eb-dashboard-header">
        <div class="tab-buttons">
          <el-button 
            class="capsule-button"
            :class="{ 'active-capsule': activeTab === 'notifications' }" 
            @click="activeTab = 'notifications'"
          >
            最新通知
          </el-button>
          <el-button 
            class="capsule-button"
            :class="{ 'active-capsule': activeTab === 'electricity' }" 
            @click="activeTab = 'electricity'"
          >
            电费记录
          </el-button>
          <el-button 
            class="capsule-button"
            :class="{ 'active-capsule': activeTab === 'payment' }" 
            @click="activeTab = 'payment'"
          >
            缴费记录
          </el-button>
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
  padding: 5px 0;
}

.tab-buttons {
  display: flex;
  gap: 15px;
  padding: 10px 0;
}

.capsule-button {
  border-radius: 20px;
  background-color: #ffffff;
  color: #606266;
  font-size: 14px;
  height: 40px;
  padding: 0 20px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.capsule-button:hover {
  color: #409EFF;
}

.active-capsule {
  color: #409EFF;
  background-color: #ffffff;
  font-weight: 500;
  border-color: #e6e6e6;
}

.dashboard-container {
  margin-top: 10px;
}
</style> 