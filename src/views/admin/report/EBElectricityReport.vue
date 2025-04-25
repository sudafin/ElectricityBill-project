<template>
  <div class="report-section electricity-report">
    <el-skeleton :loading="loading" animated :rows="8">
      <template #default>
        <div v-if="!reportData || !reportData.timeSeries || reportData.timeSeries.length === 0" class="no-data-placeholder">
          <el-empty description="暂无电量统计数据" />
        </div>
        <div v-else class="report-content">
          <!-- Summary Cards -->
          <el-row :gutter="20" class="summary-cards">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" class="summary-card total-usage-card">
                <div class="card-title">总用电量</div>
                <div class="card-value">{{ formatNumber(reportData.summary?.total_usage || 0) }} kWh</div>
                <div class="card-trend" :class="getTrendClass(reportData.summary?.usage_growth_rate)">
                   <el-icon v-if="reportData.summary?.usage_growth_rate !== undefined"><component :is="getTrendIcon(reportData.summary?.usage_growth_rate)" /></el-icon>
                   {{ formatPercentage(reportData.summary?.usage_growth_rate) }}
                </div>
              </el-card>
            </el-col>
             <el-col :xs="24" :sm="12" :md="8" :lg="6">
               <el-card shadow="hover" class="summary-card avg-usage-card">
                <div class="card-title">平均用电量</div>
                <div class="card-value">{{ formatNumber(reportData.summary?.average_usage || 0) }} kWh</div>
                <div class="card-subtext">({{ granularityText }})</div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" class="summary-card peak-usage-card">
                 <div class="card-title">峰时总用电</div>
                 <div class="card-value">{{ formatNumber(reportData.summary?.peak_usage || 0) }} kWh</div>
              </el-card>
            </el-col>
             <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" class="summary-card valley-usage-card">
                 <div class="card-title">谷时总用电</div>
                 <div class="card-value">{{ formatNumber(reportData.summary?.valley_usage || 0) }} kWh</div>
              </el-card>
            </el-col>
          </el-row>

          <!-- Chart Section -->
          <el-card shadow="never" class="chart-card">
              <template #header>
                 <div class="chart-header">
                    <span>用电量趋势 ({{ granularityText }})</span>
                      <el-radio-group v-model="chartType" size="small">
                        <el-radio-button label="bar">柱状图</el-radio-button>
                        <el-radio-button label="line">折线图</el-radio-button>
                         <el-radio-button label="stack">堆叠图</el-radio-button>
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
                <el-table-column prop="total_usage" label="总用电量 (kWh)" align="right">
                  <template #default="scope">{{ formatNumber(scope.row.total_usage) }}</template>
                </el-table-column>
                 <el-table-column prop="peak_usage" label="峰时 (kWh)" align="right">
                   <template #default="scope">{{ formatNumber(scope.row.peak_usage) }}</template>
                 </el-table-column>
                 <el-table-column prop="flat_usage" label="平时 (kWh)" align="right">
                    <template #default="scope">{{ formatNumber(scope.row.flat_usage) }}</template>
                 </el-table-column>
                 <el-table-column prop="valley_usage" label="谷时 (kWh)" align="right">
                    <template #default="scope">{{ formatNumber(scope.row.valley_usage) }}</template>
                 </el-table-column>
                 <!-- Add more columns as needed based on backend data -->
              </el-table>
           </el-card>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import EBChart from '@/components/EBChart.vue'; // Assuming you have a chart component
import { ArrowUp, ArrowDown, TrendCharts } from '@element-plus/icons-vue';
import { formatNumber, formatPercentage } from '@/utils/formatter'; // Corrected path

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

const chartType = ref('bar'); // bar, line, stack

// --- Computed Properties ---
const reportData = computed(() => props.data);

const granularityText = computed(() => {
    switch (props.granularity) {
        case 'monthly': return '月度';
        case 'yearly': return '年度';
        default: return '每日';
    }
});

const chartOption = computed(() => {
  if (!reportData.value || !reportData.value.timeSeries) {
    return {}; // Return empty option if no data
  }

  const timeSeries = reportData.value.timeSeries;
  const dates = Array.isArray(timeSeries.dates) ? timeSeries.dates : [];
  const totalUsage = Array.isArray(timeSeries.total_usage) ? timeSeries.total_usage : [];
  const peakUsage = Array.isArray(timeSeries.peak_usage) ? timeSeries.peak_usage : [];
  const flatUsage = Array.isArray(timeSeries.flat_usage) ? timeSeries.flat_usage : [];
  const valleyUsage = Array.isArray(timeSeries.valley_usage) ? timeSeries.valley_usage : [];

  const baseOption = {
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
        data: chartType.value === 'stack' ? ['峰时', '平时', '谷时'] : ['总用电量'],
         bottom: 10
    },
    xAxis: {
      type: 'category',
      boundaryGap: chartType.value === 'bar' || chartType.value === 'stack',
      data: dates
    },
    yAxis: {
      type: 'value',
      name: '用电量 (kWh)',
      axisLabel: { formatter: '{value} kWh' }
    },
     dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        { type: 'slider', start: 0, end: 100, height: 20, bottom: 40 }
    ],
    series: []
  };

  if (chartType.value === 'stack') {
     baseOption.legend.data = ['峰时', '平时', '谷时'];
    baseOption.series = [
      {
        name: '峰时',
        type: 'bar',
        stack: 'total',
        data: peakUsage,
        itemStyle: { color: '#F56C6C' } // Red for peak
      },
      {
        name: '平时',
        type: 'bar',
        stack: 'total',
        data: flatUsage,
        itemStyle: { color: '#E6A23C' } // Orange for flat
      },
      {
        name: '谷时',
        type: 'bar',
        stack: 'total',
        data: valleyUsage,
        itemStyle: { color: '#67C23A' } // Green for valley
      }
    ];
  } else {
    baseOption.series = [
      {
        name: '总用电量',
        type: chartType.value, // 'bar' or 'line'
        data: totalUsage,
        smooth: chartType.value === 'line',
        itemStyle: { color: '#409EFF' }, // Blue for total
        areaStyle: chartType.value === 'line' ? { opacity: 0.3 } : undefined
      }
    ];
  }

  return baseOption;
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

</script>

<style scoped>
.report-section {
  padding: 0px; /* No padding needed if parent tab pane handles it */
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: 20px; /* Space between cards */
}

.summary-cards {
  margin-bottom: 0px; /* Consistent spacing */
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

.card-trend.positive {
  color: #67C23A;
}

.card-trend.negative {
  color: #F56C6C;
}

.card-trend.neutral {
  color: #909399;
}

.card-subtext {
    font-size: 12px;
    color: #909399;
    margin-top: -2px;
}

/* Specific card background colors */
.total-usage-card { background-color: #ecf5ff; border-left: 4px solid #409EFF; }
.avg-usage-card { background-color: #f0f9eb; border-left: 4px solid #67C23A; }
.peak-usage-card { background-color: #fef0f0; border-left: 4px solid #F56C6C; }
.valley-usage-card { background-color: #fdf6ec; border-left: 4px solid #E6A23C; }


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
  height: 400px; /* Fixed height for the chart */
}

.table-card {
    margin-top: 0; /* Table directly follows chart card */
     border: 1px solid #e4e7ed;
}

.no-data-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px; /* Ensure placeholder takes space */
  color: #909399;
}
</style> 