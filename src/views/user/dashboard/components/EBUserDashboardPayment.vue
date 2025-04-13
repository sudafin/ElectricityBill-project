<template>
  <div class="payment-panel">
    <div class="panel-header">
      <div class="header-spacer"></div>
      <div class="panel-actions">
        <el-button type="primary" @click="refreshData" :loading="loading" size="medium">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <div class="panel-content" v-loading="loading">
      <!-- 缴费统计卡片 -->
      <el-row :gutter="20" class="summary-cards">
        <el-col :span="8">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <div class="card-icon total">
                <el-icon><Money /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">总缴费金额</div>
                <div class="card-value">{{ paymentStats.totalAmount }} 元</div>
                <div class="card-description">
                  本年度累计
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <div class="card-icon count">
                <el-icon><Document /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">缴费次数</div>
                <div class="card-value">{{ paymentStats.totalCount }} 次</div>
                <div class="card-description">
                  本年度累计
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
                <div class="card-title">当前待缴费</div>
                <div class="card-value">{{ currentBill.amount || '0.00' }} 元</div>
                <div class="card-description">
                  <router-link to="/user/paymentDashboard/payment/new" class="pay-now-link" v-if="currentBill.amount > 0">
                    <el-button type="danger" size="small" plain>立即缴费</el-button>
                  </router-link>
                  <span v-else>无待缴费账单</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 缴费趋势图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <h3>缴费趋势</h3>
            <div class="header-actions">
              <el-radio-group v-model="chartTimeRange" size="small" @change="updatePaymentChart">
                <el-radio-button label="halfYear">近半年</el-radio-button>
                <el-radio-button label="year">全年</el-radio-button>
              </el-radio-group>
              <router-link to="/user/paymentDashboard" class="view-detail-link">
                <el-button type="primary" text size="medium">
                  缴费中心
                  <el-icon><Right /></el-icon>
                </el-button>
              </router-link>
            </div>
          </div>
        </template>
        <div class="chart-container">
          <div ref="paymentChartRef" style="width: 100%; height: 300px;"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh, Money, Document, Wallet, ArrowRight, Right } from '@element-plus/icons-vue';
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
const chartTimeRange = ref('halfYear');
const paymentChartRef = ref(null);
let paymentChart = null;

// 电费统计数据
const paymentStats = reactive({
  totalAmount: 2350.50,
  totalCount: 12,
  averageMonthly: 195.88
});

// 当前账单信息
const currentBill = reactive({
  amount: 186.90,
  dueDate: '2023-03-25'
});

// 按月缴费数据 - 使用本地假数据
const monthlyPaymentData = reactive({
  months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  amounts: [210.5, 185.3, 196.7, 175.2, 188.6, 220.3, 235.8, 245.2, 228.6, 205.4, 192.7, 186.9],
  counts: [1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1]
});

// 刷新数据
const refreshData = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('缴费记录已更新');
    updatePaymentChart();
  }, 800);
};

// 更新缴费趋势图
const updatePaymentChart = () => {
  if (!paymentChartRef.value) return;
  
  if (paymentChart === null) {
    paymentChart = echarts.init(paymentChartRef.value);
  }
  
  // 根据选择的时间范围确定显示数据
  let months, amounts;
  if (chartTimeRange.value === 'halfYear') {
    // 显示最近6个月的数据
    months = monthlyPaymentData.months.slice(-6);
    amounts = monthlyPaymentData.amounts.slice(-6);
  } else {
    // 显示全年数据
    months = monthlyPaymentData.months;
    amounts = monthlyPaymentData.amounts;
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `${params[0].name}<br/>${params[0].marker}缴费金额: ${params[0].value} 元`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: months,
      axisLine: {
        lineStyle: {
          color: '#909399'
        }
      },
      axisLabel: {
        color: '#606266'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} 元',
        color: '#606266'
      },
      splitLine: {
        lineStyle: {
          color: '#EBEEF5'
        }
      }
    },
    series: [
      {
        name: '缴费金额',
        type: 'line',
        stack: 'Total',
        data: amounts,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#409EFF'
        },
        lineStyle: {
          width: 3,
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64, 158, 255, 0.5)'
            },
            {
              offset: 1,
              color: 'rgba(64, 158, 255, 0.1)'
            }
          ])
        }
      }
    ]
  };
  
  paymentChart.setOption(option);
};

// 窗口大小变化时重置图表大小
const handleResize = () => {
  if (paymentChart) paymentChart.resize();
};

onMounted(() => {
  // 初始加载
  refreshData();
  nextTick(() => {
    updatePaymentChart();
  });
  window.addEventListener('resize', handleResize);
});
</script>

<style scoped>
.payment-panel {
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

.card-icon.total {
  background-color: #409EFF;
}

.card-icon.count {
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

.card-description {
  font-size: 12px;
  color: #909399;
}

.pay-now-link {
  text-decoration: none;
}

/* 图表卡片样式 */
.chart-card {
  margin-bottom: 20px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  box-shadow: none !important;
}

.chart-card:hover {
  border-color: #e4e7ed;
  background-color: #fafafa;
}

.chart-card :deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  background-color: #ffffff;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.chart-container {
  padding: 20px 0;
}

/* 卡片头部按钮样式 */
.chart-header .el-button--text {
  padding: 8px 15px;
  color: #409EFF;
  height: 36px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.chart-header .el-button--text .el-icon {
  font-size: 14px;
  margin-left: 4px;
}

/* 去除链接下划线 */
.view-detail-link {
  text-decoration: none;
}
</style> 