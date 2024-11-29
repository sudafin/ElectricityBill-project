<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="rounded-card" shadow="hover">
          <div class="card-content">
            <el-icon class="card-icon"><User /></el-icon>
            <div class="card-detail">
              <p class="card-number">{{ totalUsers }}</p>
              <p class="card-desc">用户总数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="rounded-card" shadow="hover">
          <div class="card-content">
            <el-icon class="card-icon"><Coin /></el-icon>
            <div class="card-detail">
              <p class="card-number">￥{{ totalFees }}</p>
              <p class="card-desc">总电费</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="rounded-card" shadow="hover">
          <div class="card-content">
            <el-icon class="card-icon"><Wallet /></el-icon>
            <div class="card-detail">
              <p class="card-number">￥{{ totalIncome }}</p>
              <p class="card-desc">总收入</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="rounded-card" shadow="hover">
          <div class="card-content">
            <el-icon class="card-icon"><Help /></el-icon>
            <div class="card-detail">
              <p class="card-number">{{ abnormalBills }}</p>
              <p class="card-desc">普通账单</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card class="rounded-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近7天用电量</span>
            </div>
          </template>
          <div class="card-chart">
            <div ref="powerChart" style="width: 100%; height: 300px;"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="rounded-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>用户类型分布</span>
            </div>
          </template>
          <div class="card-chart">
            <div ref="userTypeChart" style="width: 100%; height: 300px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import { User, Coin, Wallet, Warning, Help } from '@element-plus/icons-vue'
import { getDashboardInfo } from '@/api/user';


const totalUsers = ref(null);
const totalFees = ref(null);
const totalIncome = ref(null);
const abnormalBills = ref(null);
const electricityWeekUsageList = ref([]);
const userTypeList = ref(null);
const powerChart = ref(null);
const userTypeChart = ref(null);

const powerData = ref([]);
const userTypeData = ref([]);

// 获取仪表盘信息
const fetchDashboardInfo = async()=>{
    try{
      const res = await getDashboardInfo();
      totalUsers.value = res.totalUser;
      totalFees.value = res.totalElectricityUsage;
      totalIncome.value = res.totalAmount;
      abnormalBills.value = res.totalPaymentBill;
      electricityWeekUsageList.value = res.electricityWeekUsageList;
      userTypeList.value = res.userTypeMap;
    } catch (error) {
      console.error('获取仪表盘信息失败:', error);
    }
  }
// 在组件挂载时获取仪表盘信息
onMounted(async () => {
  await fetchDashboardInfo();

    // 处理用电量数据 格式化为{date: '2024-11-29', value: 100}
    powerData.value = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        value: electricityWeekUsageList.value[i] || 0
      };
});
    // 初始化用电量折线图
  const powerChartInstance = echarts.init(powerChart.value);
  powerChartInstance.setOption({
    xAxis: {
      type: 'category',
      data: Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      }),
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: powerData.value.map(item => item.value),
      type: 'line'
    }]
  });
  
    // 处理用户类型数据 格式化为{name: '居民', value: 100}
    userTypeData.value = Object.entries(userTypeList.value).map(([name, value]) => ({
      name,
      value
    }));
console.log("userTypeData", userTypeData.value);
  // 初始化用户类型饼图
  const userTypeChartInstance = echarts.init(userTypeChart.value);
  userTypeChartInstance.setOption({
    series: [{
      name: '用户类型',
      type: 'pie',
      radius: '50%',
      data: userTypeData.value,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  });
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.card-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.card-icon {
  font-size: 48px;
  color: #8ec5fc;
  margin-right: 20px;
}

.card-detail {
  display: flex;
  flex-direction: column;
}

.card-number {
  color: #333;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
}

.card-desc {
  color: #999;
  font-size: 14px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #333;
  font-weight: 600;
}

.card-chart {
  padding: 20px;
}

.rounded-card {
  border-radius: 16px;
}

:deep(.el-card__header) {
  background-color: transparent;
  border-bottom: none;
  padding-bottom: 0;
}

:deep(.el-card__body) {
  padding: 0;
}
</style> 