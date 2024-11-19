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
            <el-icon class="card-icon"><Warning /></el-icon>
            <div class="card-detail">
              <p class="card-number">{{ abnormalBills }}</p>
              <p class="card-desc">异常账单</p>
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
import { User, Coin, Wallet, Warning } from '@element-plus/icons-vue'

const totalUsers = ref(1234);
const totalFees = ref(12345.67);
const totalIncome = ref(98765.43);
const abnormalBills = ref(21);

const powerChart = ref(null);
const userTypeChart = ref(null);

const powerData = ref([
  { date: '2023-06-01', power: 150 },
  { date: '2023-06-02', power: 230 },
  { date: '2023-06-03', power: 224 },
  { date: '2023-06-04', power: 218 },
  { date: '2023-06-05', power: 135 },
  { date: '2023-06-06', power: 147 },
  { date: '2023-06-07', power: 260 },
]);

const userTypeData = ref([
  { value: 1048, name: '普通用户' },
  { value: 735, name: '商业用户' },
  { value: 580, name: '工业用户' },
  { value: 484, name: '农业用户' },
  { value: 300, name: '其他用户' },
]);

onMounted(() => {
  // 初始化用电量折线图
  const powerChartInstance = echarts.init(powerChart.value);
  powerChartInstance.setOption({
    xAxis: {
      type: 'category',
      data: powerData.value.map(item => item.date),
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: powerData.value.map(item => item.power),
      type: 'line'
    }]
  });

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