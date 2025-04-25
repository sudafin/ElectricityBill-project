<template>
  <div class="report-section fee-report">
    <el-skeleton :loading="loading" animated :rows="8">
      <template #default>
        <div v-if="!reportData || !reportData.timeSeries || !reportData.timeSeries.dates || reportData.timeSeries.dates.length === 0" class="no-data-placeholder">
          <el-empty description="暂无电费统计数据" />
        </div>
        <div v-else class="report-content">
          <!-- Summary Cards -->
          <el-row :gutter="20" class="summary-cards">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" class="summary-card total-fee-card">
                <div class="card-title">总电费金额</div>
                <div class="card-value">¥ {{ formatNumber(reportData.summary?.total_amount || 0) }}</div>
                <div class="card-trend" :class="getTrendClass(reportData.summary?.revenue_growth_rate)">
                  <el-icon v-if="reportData.summary?.revenue_growth_rate !== undefined"><component :is="getTrendIcon(reportData.summary?.revenue_growth_rate)" /></el-icon>
                  {{ formatPercentage(reportData.summary?.revenue_growth_rate) }}
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" class="summary-card avg-fee-card">
                <div class="card-title">平均电费</div>
                <div class="card-value">¥ {{ formatNumber(reportData.summary?.average_amount || 0) }}</div>
                <div class="card-subtext">({{ granularityText }})</div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" class="summary-card paid-rate-card">
                 <div class="card-title">账单支付率</div>
                 <div class="card-value">{{ formatPercentage(reportData.summary?.payment_rate, 1) }}</div>
                 <div class="card-subtext">{{ reportData.summary?.paid_bills }}/{{ reportData.summary?.total_bills }}</div>
              </el-card>
            </el-col>
             <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" class="summary-card overdue-card">
                 <div class="card-title">逾期账单数</div>
                 <div class="card-value">{{ reportData.summary?.overdue_bills || 0 }}</div>
              </el-card>
            </el-col>
          </el-row>

          <!-- Chart Section -->
           <el-card shadow="never" class="chart-card">
              <template #header>
                 <div class="chart-header">
                    <span>电费趋势 ({{ granularityText }})</span>
                     <el-radio-group v-model="chartType" size="small">
                        <el-radio-button label="line">折线图</el-radio-button>
                        <el-radio-button label="bar">柱状图</el-radio-button>
                    </el-radio-group>
                 </div>
              </template>
            <div class="chart-container">
              <EBChart :option="chartOption" :loading="loading" />
            </div>
           </el-card>

          <!-- Data Table (Optional) -->
          <el-card shadow="never" class="table-card" v-if="reportData.tableData && reportData.tableData.length > 0">
             <template #header>详细数据</template>
              <el-table :data="reportData.tableData" stripe style="width: 100%">
                 <el-table-column prop="date" label="日期" sortable />
                 <el-table-column prop="total_amount" label="总金额 (元)" align="right">
                   <template #default="scope">¥ {{ formatNumber(scope.row.total_amount) }}</template>
                 </el-table-column>
                  <el-table-column prop="paid_amount" label="已支付金额 (元)" align="right">
                   <template #default="scope">¥ {{ formatNumber(scope.row.paid_amount) }}</template>
                 </el-table-column>
                  <el-table-column prop="unpaid_amount" label="未支付金额 (元)" align="right">
                   <template #default="scope">¥ {{ formatNumber(scope.row.unpaid_amount) }}</template>
                 </el-table-column>
                  <el-table-column prop="payment_rate" label="支付率" align="right">
                    <template #default="scope">{{ formatPercentage(scope.row.payment_rate) }}</template>
                 </el-table-column>
                 <!-- Add more columns as needed -->
              </el-table>
           </el-card>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import EBChart from '@/components/EBChart.vue';
import { ArrowUp, ArrowDown, Money } from '@element-plus/icons-vue';
import { formatNumber, formatPercentage } from '@/utils/formatter';

const props = defineProps({
  data: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
   granularity: {
      type: String,
      default: 'daily'
  }
});

const chartType = ref('line'); // line, bar

// --- Computed Properties ---
const reportData = computed(() => props.data);

const granularityText = computed(() => {
    switch (props.granularity) {
        case 'monthly': return '月度';
        case 'yearly': return '年度';
        default: return '每日';
    }
});

// 根据粒度格式化X轴标签
const formatXAxisLabel = (label) => {
  if (!label) return '';
  
  switch (props.granularity) {
    case 'yearly':
      return label.substring(0, 4) + '年';
    case 'monthly':
      return label.substring(0, 7).replace('-', '年') + '月';
    default:
      return label;
  }
};

const chartOption = computed(() => {
  if (!reportData.value || !reportData.value.timeSeries || !reportData.value.timeSeries.dates) {
    return {};
  }

  const timeSeries = reportData.value.timeSeries;
  const dates = Array.isArray(timeSeries.dates) ? timeSeries.dates : [];
  const totalAmount = Array.isArray(timeSeries.total_amount) ? timeSeries.total_amount : [];
  const paidAmount = Array.isArray(timeSeries.paid_amount) ? timeSeries.paid_amount : [];

  // 格式化日期标签以适应不同的粒度
  const formattedDates = dates.map(date => formatXAxisLabel(date));

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
     grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    legend: {
      data: ['总电费', '已支付'], // Example legend
      bottom: 10
    },
    xAxis: {
      type: 'category',
      boundaryGap: chartType.value === 'bar',
      data: formattedDates,
      axisLabel: {
        interval: props.granularity === 'daily' ? 'auto' : 0,
        rotate: props.granularity === 'daily' ? 30 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: '金额 (元)',
      axisLabel: { formatter: '¥{value}' }
    },
    dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        { type: 'slider', start: 0, end: 100, height: 20, bottom: 40 }
    ],
    series: [
      {
        name: '总电费',
        type: chartType.value,
        data: totalAmount,
        smooth: chartType.value === 'line',
        itemStyle: { color: '#E6A23C' }, // Orange for total fee
        areaStyle: chartType.value === 'line' ? { opacity: 0.3 } : undefined
      },
      // Optional: Add another series, e.g., paid amount
      {
        name: '已支付',
        type: chartType.value,
        data: paidAmount,
        smooth: chartType.value === 'line',
        itemStyle: { color: '#67C23A' }, // Green for paid
        areaStyle: chartType.value === 'line' ? { opacity: 0.2 } : undefined
      }
    ]
  };
});

// --- Trend helpers ---
const getTrendIcon = (rate) => {
  if (rate === null || rate === undefined) return null;
  return rate >= 0 ? ArrowUp : ArrowDown;
};

const getTrendClass = (rate) => {
  if (rate === null || rate === undefined) return 'neutral';
  return rate >= 0 ? 'positive' : 'negative';
};

// 监听粒度变化，确保图表更新
watch(() => props.granularity, () => {
  // 如果有需要对不同粒度进行特殊处理的逻辑，可以在这里添加
  console.log(`Fee report granularity changed to: ${props.granularity}`);
});

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData && newData.timeSeries && newData.timeSeries.dates) {
    console.log(`Fee report data updated with ${newData.timeSeries.dates.length} data points`);
  }
}, { deep: true });
</script>

<style scoped>
/* Similar styles to EBElectricityReport, potentially shared */
.report-section {
  padding: 0px;
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-cards {
  margin-bottom: 0px;
}

.summary-card {
  text-align: left;
  border: 1px solid #e4e7ed;
  transition: box-shadow 0.3s;
}

.summary-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.card-title {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.card-value {
  color: #303133;
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 5px;
  line-height: 1.2;
}

.card-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.card-trend.positive { color: #67C23A; }
.card-trend.negative { color: #F56C6C; }
.card-trend.neutral { color: #909399; }

.card-subtext {
    font-size: 12px;
    color: #909399;
    margin-top: -2px;
}

/* Specific card background colors */
.total-fee-card { background-color: #fdf6ec; border-left: 4px solid #E6A23C; }
.avg-fee-card { background-color: #f0f9eb; border-left: 4px solid #67C23A; }
.paid-rate-card { background-color: #ecf5ff; border-left: 4px solid #409EFF; }
.overdue-card { background-color: #fef0f0; border-left: 4px solid #F56C6C; }

.chart-card {
    border: 1px solid #e4e7ed;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
}

.chart-container {
  height: 400px;
}

.table-card {
    margin-top: 0;
    border: 1px solid #e4e7ed;
}

.no-data-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #909399;
}
</style> 