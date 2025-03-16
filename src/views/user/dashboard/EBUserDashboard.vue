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
  padding: 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #eaedf2;
}

.capsule-button {
  border-radius: 0;
  background-color: transparent;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  height: 40px;
  padding: 0 20px;
  border: none;
  margin-right: 30px;
  box-shadow: none !important;
  transition: all 0.3s;
  position: relative;
}

.capsule-button:hover {
  color: #409EFF;
  background-color: transparent;
}

.active-capsule {
  color: #409EFF;
  font-weight: 500;
  background-color: transparent;
  box-shadow: none !important;
}

/* 活动标签下的下划线 */
.active-capsule::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 20%;
  right: 20%;
  height: 2px;
  background-color: #409EFF;
}

.dashboard-container {
  margin-top: 10px;
}
</style> 