<template>
  <div class="report-wrapper">
    <div class="report-header">
      <div class="title-section">
        <h3>{{ getReportTitle() }}</h3>
      </div>
      <div class="chart-actions">
        <el-radio-group v-model="chartType" size="small" @change="changeChartType">
          <el-radio-button label="bar">柱状图</el-radio-button>
          <el-radio-button label="line">折线图</el-radio-button>
          <el-radio-button label="area">面积图</el-radio-button>
          <el-radio-button label="stack">堆叠图</el-radio-button>
        </el-radio-group>
        <div class="data-filter">
          <el-checkbox 
            v-model="showAverage" 
            @change="updateChartOption"
            size="small"
          >
            显示平均值
          </el-checkbox>
        </div>
      </div>
    </div>
    <el-divider />
    <div class="chart-container">
      <template v-if="loading">
        <el-skeleton :rows="6" animated />
      </template>
      <template v-else-if="!hasData">
        <div class="empty-data">暂无数据</div>
      </template>
      <template v-else>
        <EBChart 
          :option="currentChartOption" 
          :loading="loading"
          :showToolbar="false"
          ref="chartRef"
        />
      </template>
    </div>
    <div class="data-summary" v-if="showSummary && hasData">
      <div class="summary-card total">
        <div class="card-title">总{{ contentType === 'electricity' ? '用电量' : '电费' }}</div>
        <div class="card-value">{{ totalValue.toLocaleString() }} {{ contentType === 'electricity' ? 'kWh' : '元' }}</div>
        <div class="card-change" :class="growthRate >= 0 ? 'positive' : 'negative'">
          <el-icon><component :is="growthRate >= 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
          {{ Math.abs(growthRate).toFixed(2) }}%
        </div>
      </div>
      <div class="summary-card average">
        <div class="card-title">平均{{ contentType === 'electricity' ? '用电量' : '电费' }}</div>
        <div class="card-value">{{ averageValue.toLocaleString() }} {{ contentType === 'electricity' ? 'kWh' : '元' }}</div>
      </div>
      <div class="summary-card highest">
        <div class="card-title">最高{{ contentType === 'electricity' ? '用电量' : '电费' }}</div>
        <div class="card-value">{{ highestValue.toLocaleString() }} {{ contentType === 'electricity' ? 'kWh' : '元' }}</div>
        <div class="card-date">{{ highestDate }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, computed, watch, onMounted } from 'vue';
import EBChart from '@/components/EBChart.vue';
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  dailyElectricityUsageOption: {
    type: Object,
    default: () => ({})
  },
  dailyFeeAmountOption: {
    type: Object,
    default: () => ({})
  },
  monthlyElectricityUsageOption: {
    type: Object,
    default: () => ({})
  },
  monthlyFeeAmountOption: {
    type: Object,
    default: () => ({})
  },
  yearlyElectricityUsageOption: {
    type: Object,
    default: () => ({})
  },
  yearlyFeeAmountOption: {
    type: Object,
    default: () => ({})
  },
  contentType: {
    type: String,
    default: 'electricity'
  },
  loading: {
    type: Boolean,
    default: false
  },
  periodData: {
    type: Object,
    default: () => ({
      dates: [],
      electricity: [],
      fee: [],
      peakUsage: [],
      flatUsage: [],
      valleyUsage: []
    })
  },
  growthMetrics: {
    type: Object,
    default: () => ({
      growthRate: 0
    })
  },
  selectedGranularity: {
    type: String,
    default: 'daily'
  }
});

const chartType = ref('bar');
const showAverage = ref(false);
const showSummary = ref(true);
const chartRef = ref(null);
const reportData = ref({
  dates: [],
  electricity: [],
  fee: [],
  peakUsage: [],
  flatUsage: [],
  valleyUsage: []
});

const getReportTitle = () => {
  return props.contentType === 'electricity' ? '电量统计' : '电费统计';
};

const getFormattedDates = (dates, granularity) => {
  if (!dates || dates.length === 0) return [];
  const formatMap = {
    daily: (dateStr) => dateStr,
    monthly: (dateStr) => dateStr,
    yearly: (dateStr) => `${dateStr}年`
  };
  const formatter = formatMap[granularity] || formatMap.daily;
  return dates.map(formatter);
};

const getCurrentData = () => {
  const values = props.contentType === 'electricity' ? reportData.value.electricity : reportData.value.fee;
  const formattedDates = getFormattedDates(reportData.value.dates || [], props.selectedGranularity);
  return {
    dates: formattedDates,
    values: values || []
  };
};

const totalValue = computed(() => {
  const { values } = getCurrentData();
  return values.length ? values.reduce((sum, val) => sum + val, 0) : 0;
});

const averageValue = computed(() => {
  const { values } = getCurrentData();
  return values.length ? Math.round(totalValue.value / values.length) : 0;
});

const highestValue = computed(() => {
  const { values } = getCurrentData();
  return values.length ? Math.max(...values) : 0;
});

const highestDate = computed(() => {
  const { dates, values } = getCurrentData();
  if (!values.length) return '';
  const maxIndex = values.indexOf(Math.max(...values));
  return dates[maxIndex] || '';
});

const growthRate = computed(() => {
  return props.growthMetrics.growthRate || 0;
});

const getPeriodTypeData = () => {
  return {
    peak: reportData.value.peakUsage || [],
    flat: reportData.value.flatUsage || [],
    valley: reportData.value.valleyUsage || []
  };
};

const currentChartOption = computed(() => {
  const { dates, values } = getCurrentData();
  
  const baseOption = {
    title: {
      text: getReportTitle(),
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    toolbox: {
      feature: {
        saveAsImage: {},
        dataZoom: { yAxisIndex: 'none' },
        restore: {},
      },
      right: 20
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: chartType.value === 'bar' || chartType.value === 'stack',
      data: dates
    },
    yAxis: {
      type: 'value',
      name: props.contentType === 'electricity' ? '用电量(kWh)' : '金额(元)'
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        type: 'slider',
        start: 0,
        end: 100,
        bottom: '2%'
      }
    ],
    series: [
      {
        name: props.contentType === 'electricity' ? '用电量' : '电费',
        type: chartType.value === 'area' ? 'line' : chartType.value,
        stack: chartType.value === 'stack' ? '总量' : undefined,
        data: values,
        smooth: chartType.value === 'line' || chartType.value === 'area',
        areaStyle: chartType.value === 'area' ? {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: props.contentType === 'electricity' ? 'rgba(64, 158, 255, 0.7)' : 'rgba(103, 194, 58, 0.7)'
              },
              {
                offset: 1,
                color: props.contentType === 'electricity' ? 'rgba(64, 158, 255, 0.1)' : 'rgba(103, 194, 58, 0.1)'
              }
            ]
          }
        } : undefined,
        itemStyle: {
          color: props.contentType === 'electricity' ? '#409EFF' : '#67C23A'
        },
        markLine: showAverage.value ? {
          data: [
            {
              type: 'average',
              name: '平均值',
              label: {
                position: 'end',
                formatter: '{b}: {c}',
                valueAnimation: true
              }
            }
          ]
        } : undefined
      }
    ]
  };
  
  if (chartType.value === 'stack' && props.contentType === 'electricity') {
    const { peak, flat, valley } = getPeriodTypeData();
    
    if (peak.length && flat.length && valley.length) {
      baseOption.legend = {
        data: ['峰时用电', '平时用电', '谷时用电'],
        bottom: 0
      };
      
      baseOption.series = [
        {
          name: '峰时用电',
          type: 'bar',
          stack: '总量',
          data: peak,
          itemStyle: { color: '#F56C6C' }
        },
        {
          name: '平时用电',
          type: 'bar',
          stack: '总量',
          data: flat,
          itemStyle: { color: '#E6A23C' }
        },
        {
          name: '谷时用电',
          type: 'bar',
          stack: '总量',
          data: valley,
          itemStyle: { color: '#67C23A' }
        }
      ];
    }
  } else if (chartType.value === 'stack' && props.contentType === 'fee') {
    baseOption.legend = {
      data: ['实际电费', '预测电费'],
      bottom: 0
    };
    
    const forecastValues = values.map(val => Math.round(val * 1.1));
    
    baseOption.series = [
      {
        name: '实际电费',
        type: 'bar',
        stack: '总量',
        data: values,
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '预测电费',
        type: 'bar',
        stack: '对比',
        data: forecastValues,
        itemStyle: { color: '#909399' }
      }
    ];
  }
  
  return baseOption;
});

const changeChartType = (type) => {
  chartType.value = type;
};

const updateChartOption = () => {
  // 图表实例已通过computed自动更新
};

const refreshChart = () => {
  if (chartRef.value) {
    chartRef.value.refreshChart();
  }
};

const exportImage = () => {
  if (chartRef.value) {
    chartRef.value.exportImage();
  }
};

const hasData = computed(() => (props.periodData.dates && props.periodData.dates.length > 0));

watch(() => props.contentType, () => {
  if (props.contentType === 'electricity') {
    chartType.value = 'bar';
  } else {
    chartType.value = 'line';
  }
}, { immediate: true });

watch(() => props.periodData, (newData) => {
  if (newData) {
    reportData.value = {
      dates: newData.dates || [],
      electricity: newData.electricity || [],
      fee: newData.fee || [],
      peakUsage: newData.peakUsage || [],
      flatUsage: newData.flatUsage || [],
      valleyUsage: newData.valleyUsage || []
    };
  } else {
    reportData.value = {
      dates: [],
      electricity: [],
      fee: [],
      peakUsage: [],
      flatUsage: [],
      valleyUsage: []
    };
  }
}, { deep: true, immediate: true });

defineExpose({
  refreshChart,
  exportImage,
  chartRef
});
</script>

<style scoped>
.report-wrapper {
  width: 100%;
  margin-bottom: 20px;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
  flex-wrap: wrap;
  gap: 10px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.report-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
}

.chart-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.data-filter {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.chart-container {
  width: 100%;
  height: 380px;
  margin-bottom: 30px;
}

.data-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 25px;
  margin-top: 50px;
}

.summary-card {
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #fff;
  position: relative;
  min-height: 130px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
}

.summary-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 80px;
  height: 80px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(30%, 30%);
}

.summary-card.total {
  background: linear-gradient(135deg, #409EFF, #53a8ff);
}

.summary-card.average {
  background: linear-gradient(135deg, #67C23A, #85ce61);
}

.summary-card.highest {
  background: linear-gradient(135deg, #E6A23C, #ebb563);
}

.card-title {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 12px;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
}

.card-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-change.positive {
  color: #f0f9eb;
}

.card-change.negative {
  color: #fef0f0;
}

.card-date {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 5px;
}

@media (max-width: 768px) {
  .report-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .chart-actions {
    width: 100%;
    justify-content: space-between;
    margin-top: 10px;
  }
  
  .data-summary {
    grid-template-columns: 1fr;
  }
}
</style> 