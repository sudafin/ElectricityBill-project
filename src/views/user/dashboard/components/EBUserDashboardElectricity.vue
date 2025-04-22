<template>
  <div class="electricity-panel">
    <div class="panel-header">
      <div class="header-spacer"></div>
      <div class="panel-actions">
        <el-select v-model="timeRange" placeholder="查看周期" size="medium" style="width: 140px;">
          <el-option label="最近一周" value="week"></el-option>
          <el-option label="最近一月" value="month"></el-option>
          <el-option label="最近一年" value="year"></el-option>
        </el-select>
        <el-button type="primary" @click="refreshData" :loading="loading" size="medium">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <div class="panel-content" v-loading="loading">
      <!-- 电费概览卡片 -->
      <el-row :gutter="20" class="summary-cards">
        <el-col :span="8">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <div class="card-icon current">
                <el-icon><Odometer /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">当前电费余额</div>
                <div class="card-value">{{ electricityData.currentBalance }} 元</div>
                <div class="card-status" :class="{ 'warning': electricityData.currentBalance < 50 }">
                  {{ electricityData.currentBalance < 50 ? '余额不足' : '余额充足' }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <div class="card-icon usage">
                <el-icon><DataLine /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">本月用电量</div>
                <div class="card-value">{{ electricityData.monthlyUsage }} 度</div>
                <div class="card-comparison">
                  同比
                  <el-icon v-if="electricityData.usageYoY > 0"><CaretTop /></el-icon>
                  <el-icon v-else><CaretBottom /></el-icon>
                  {{ Math.abs(electricityData.usageYoY) }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <div class="card-icon payment">
                <el-icon><Wallet /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">本月电费</div>
                <div class="card-value">{{ electricityData.monthlyCost }} 元</div>
                <div class="card-due">
                  <span>{{ electricityData.isPaid ? '已缴费' : '待缴费' }}</span>
                  <span v-if="!electricityData.isPaid" class="due-date">
                    截止日期: {{ electricityData.dueDate }}
                  </span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 用电趋势图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <h3>用电趋势</h3>
            <el-radio-group v-model="chartType" size="small" @change="updateUsageChart">
              <el-radio-button label="usage">用电量</el-radio-button>
              <el-radio-button label="cost">电费</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div class="chart-container">
          <div ref="usageChartRef" style="width: 100%; height: 300px;"></div>
        </div>
      </el-card>

      <!-- 电费记录列表 -->
      <el-card class="records-card">
        <template #header>
          <div class="card-header">
            <h3>电费结算记录</h3>
            <router-link to="/user/analysis" class="view-detail-link">
              <el-button type="primary" text size="medium">
                查看详细分析
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </router-link>
          </div>
        </template>
        <el-table :data="electricityRecords" style="width: 100%" border stripe>
          <el-table-column prop="billPeriod" label="账单周期" width="180" />
          <el-table-column prop="usage" label="用电量(度)" width="120" />
          <el-table-column prop="amount" label="电费(元)" width="120" />
          <el-table-column prop="unitPrice" label="单价(元/度)" width="120" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="scope.row.status === '已缴费' ? 'success' : 'warning'">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { Refresh, Odometer, DataLine, Wallet, CaretTop, CaretBottom, ArrowRight } from '@element-plus/icons-vue';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

// 注册echarts组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  LineChart,
  CanvasRenderer
]);

const loading = ref(false);
const timeRange = ref('month');
const chartType = ref('usage');
const usageChartRef = ref(null);
let usageChart = null;

// 电费数据 - 使用本地假数据
const electricityData = reactive({
  currentBalance: 293.50,
  monthlyUsage: 267,
  usageYoY: -5,
  monthlyCost: 186.9,
  isPaid: false,
  dueDate: '2023-03-25'
});

// 电费记录 - 使用本地假数据
const electricityRecords = ref([
  { billPeriod: '2023-02-01 至 2023-02-28', usage: 267, amount: 186.9, unitPrice: 0.7, status: '未缴费' },
  { billPeriod: '2023-01-01 至 2023-01-31', usage: 280, amount: 196.0, unitPrice: 0.7, status: '已缴费' },
  { billPeriod: '2022-12-01 至 2022-12-31', usage: 310, amount: 217.0, unitPrice: 0.7, status: '已缴费' },
  { billPeriod: '2022-11-01 至 2022-11-30', usage: 290, amount: 203.0, unitPrice: 0.7, status: '已缴费' },
  { billPeriod: '2022-10-01 至 2022-10-31', usage: 270, amount: 189.0, unitPrice: 0.7, status: '已缴费' }
]);

// 刷新数据
const refreshData = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    updateUsageChart();
  }, 800);
};

// 更新用电趋势图
const updateUsageChart = () => {
  if (!usageChartRef.value) return;
  
  if (usageChart === null) {
    usageChart = echarts.init(usageChartRef.value);
  }
  
  let categories, usageData, costData;
  
  if (timeRange.value === 'week') {
    categories = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    usageData = [8.5, 9.2, 10.3, 7.8, 9.5, 12.2, 11.5];
    costData = usageData.map(item => (item * 0.7).toFixed(1));
  } else if (timeRange.value === 'month') {
    categories = Array.from({length: 30}, (_, i) => `${i+1}日`);
    usageData = Array.from({length: 30}, () => Math.floor(Math.random() * 15) + 5);
    costData = usageData.map(item => (item * 0.7).toFixed(1));
  } else {
    categories = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    usageData = [210, 185, 190, 175, 160, 220, 280, 295, 240, 230, 205, 190];
    costData = usageData.map(item => (item * 0.7).toFixed(1));
  }
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: categories
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: chartType.value === 'usage' ? '{value} 度' : '{value} 元'
      }
    },
    series: [
      {
        name: chartType.value === 'usage' ? '用电量' : '电费',
        type: 'line',
        data: chartType.value === 'usage' ? usageData : costData,
        smooth: true,
        areaStyle: {
          opacity: 0.3
        },
        lineStyle: {
          width: 3
        },
        itemStyle: {
          color: chartType.value === 'usage' ? '#67C23A' : '#E6A23C'
        }
      }
    ]
  };
  
  usageChart.setOption(option);
};

// 窗口大小变化时重置图表大小
const handleResize = () => {
  if (usageChart) usageChart.resize();
};

onMounted(() => {
  refreshData();
  nextTick(() => {
    updateUsageChart();
  });
  window.addEventListener('resize', handleResize);
});
</script>

<style scoped>
.electricity-panel {
  width: 100%;
}

.panel-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 15px;
}

.header-spacer {
  flex: 1;
}

.panel-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* 统一按钮样式 */
.panel-actions .el-button {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  border-radius: 4px;
  height: 36px;
}

.panel-actions .el-button--text {
  padding: 8px 15px;
  color: #409EFF;
}

.panel-actions .el-button--text .el-icon {
  font-size: 14px;
}

.summary-cards {
  margin-bottom: 20px;
}

.summary-card {
  height: 100%;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  box-shadow: none !important;
  transition: all 0.2s;
}

.summary-card:hover {
  border-color: #e4e7ed;
  background-color: #f5f7fa;
}

.card-content {
  display: flex;
  align-items: center;
  padding: 5px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.card-icon .el-icon {
  font-size: 24px;
  color: white;
}

.card-icon.current {
  background-color: #409EFF;
}

.card-icon.usage {
  background-color: #67C23A;
}

.card-icon.payment {
  background-color: #E6A23C;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.card-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.card-status, .card-comparison, .card-due {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
}

.card-status.warning {
  color: #E6A23C;
}

.card-comparison .el-icon, .card-due .el-icon {
  margin: 0 4px;
  font-size: 12px;
}

.due-date {
  margin-left: 5px;
  color: #F56C6C;
}

.chart-card, .records-card {
  margin-bottom: 20px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  box-shadow: none !important;
}

.chart-card:hover, .records-card:hover {
  border-color: #e4e7ed;
  background-color: #fafafa;
}

.chart-card :deep(.el-card__header), .records-card :deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  background-color: #ffffff;
}

.chart-header, .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header h3, .card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.chart-container {
  padding: 10px 0;
}

/* 表格样式 */
.records-card :deep(.el-table) {
  border: none;
  --el-table-border-color: #f0f0f0;
}

.records-card :deep(.el-table--border) {
  border: none;
  box-shadow: none;
}

.records-card :deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 500;
  color: #606266;
}

.records-card :deep(.el-table td), .records-card :deep(.el-table th) {
  padding: 10px 0;
}

.records-card :deep(.el-button.is-text) {
  color: #409EFF;
}

.records-card :deep(.el-tag) {
  border-radius: 2px;
}

/* 卡片头部按钮样式 */
.card-header .el-button--text {
  padding: 8px 15px;
  color: #409EFF;
  height: 36px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.card-header .el-button--text .el-icon {
  font-size: 14px;
  margin-left: 4px;
}

/* 去除链接下划线 */
.view-detail-link {
  text-decoration: none;
}
</style> 