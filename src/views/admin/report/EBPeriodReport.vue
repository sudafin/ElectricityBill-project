<template>
  <div class="period-report">
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
    <div class="chart-container">
      <EBChart 
        :option="currentChartOption" 
        :loading="loading"
        :showToolbar="false"
        ref="chartRef"
      />
    </div>
    <div class="data-summary" v-if="showSummary">
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
import { getElectricityReport, getFeeReport, getReportMetrics } from '@/api/admin/report';
import { ElMessage } from 'element-plus';

const props = defineProps({
  // 支持所有原有组件的属性
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
  // 报表内容类型
  contentType: {
    type: String,
    default: 'electricity' // 'electricity' 或 'fee'
  },
  // 是否显示加载状态
  loading: {
    type: Boolean,
    default: false
  }
});

// 图表类型
const chartType = ref('bar');
// 时间粒度
const timePeriod = ref('daily');
// 显示平均线
const showAverage = ref(false);
// 显示数据摘要
const showSummary = ref(true);
// 图表引用
const chartRef = ref(null);

// 模拟数据 - 实际项目中应从API获取
const mockData = {
  daily: {
    dates: ['2023-05-01', '2023-05-02', '2023-05-03', '2023-05-04', '2023-05-05', '2023-05-06', '2023-05-07'],
    electricity: [320, 332, 301, 334, 390, 330, 320],
    fee: [1200, 1320, 1010, 1340, 1590, 1330, 1320]
  },
  weekly: {
    dates: ['第1周', '第2周', '第3周', '第4周'],
    electricity: [1420, 1532, 1601, 1734],
    fee: [5200, 6320, 6010, 6540]
  },
  monthly: {
    dates: ['1月', '2月', '3月', '4月', '5月', '6月'],
    electricity: [4320, 4532, 5501, 5334, 5990, 5130],
    fee: [15200, 16320, 19010, 18340, 19590, 17330]
  },
  yearly: {
    dates: ['2018', '2019', '2020', '2021', '2022', '2023'],
    electricity: [45320, 48532, 42501, 49334, 52990, 58130],
    fee: [180200, 192320, 170010, 203340, 229590, 231330]
  }
};

// 获取报表标题
const getReportTitle = () => {
  return props.contentType === 'electricity' ? '电量统计' : '电费统计';
};

// 获取当前数据
const getCurrentData = () => {
  const data = mockData[timePeriod.value];
  const values = props.contentType === 'electricity' ? data.electricity : data.fee;
  return {
    dates: data.dates,
    values: values
  };
};

// 计算数据摘要
const totalValue = computed(() => {
  const { values } = getCurrentData();
  return values.reduce((sum, val) => sum + val, 0);
});

const averageValue = computed(() => {
  const { values } = getCurrentData();
  return values.length ? Math.round(totalValue.value / values.length) : 0;
});

const highestValue = computed(() => {
  const { values } = getCurrentData();
  return Math.max(...values);
});

const highestDate = computed(() => {
  const { dates, values } = getCurrentData();
  const maxIndex = values.indexOf(Math.max(...values));
  return dates[maxIndex];
});

// 计算同比增长率（模拟数据）
const growthRate = computed(() => {
  // 实际应从API获取的数据
  return Math.round((Math.random() * 40) - 20);
});

// 当前图表选项
const currentChartOption = computed(() => {
  // 获取当前数据
  const { dates, values } = getCurrentData();
  
  // 基本配置
  const baseOption = {
    title: {
      text: getReportTitle(),
      left: 'center',
      top: 10 // 增加标题顶部间距
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
      show: false
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '5%', // 增加底部间距
      top: '15%',   // 增加顶部间距
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
                formatter: '{b}: {c}'
              }
            }
          ]
        } : undefined
      }
    ]
  };
  
  // 如果是堆叠图，添加额外系列
  if (chartType.value === 'stack') {
    const secondarySeriesName = props.contentType === 'electricity' ? '计划用电量' : '预算费用';
    // 模拟第二个系列数据，略高于原数据
    const secondaryValues = values.map(val => Math.round(val * (1 + Math.random() * 0.3)));
    
    baseOption.legend = {
      data: [props.contentType === 'electricity' ? '实际用电量' : '实际费用', secondarySeriesName],
      bottom: 0
    };
    
    baseOption.series[0].name = props.contentType === 'electricity' ? '实际用电量' : '实际费用';
    
    baseOption.series.push({
      name: secondarySeriesName,
      type: 'bar',
      stack: '总量',
      data: secondaryValues,
      itemStyle: {
        color: props.contentType === 'electricity' ? '#a0cfff' : '#b3e19d'
      }
    });
  }
  
  return baseOption;
});

// 切换图表类型
const changeChartType = (type) => {
  chartType.value = type;
};

// 处理时间粒度变化
const handleTimePeriodChange = (period) => {
  timePeriod.value = period;
  // 加载对应时间粒度的数据
  loadReportData();
};

// 更新图表选项
const updateChartOption = () => {
  // 图表实例已通过computed自动更新
};

// 加载报表数据
const loadReportData = async () => {
  try {
    loading.value = true;
    
    // 根据内容类型和时间粒度获取数据
    const apiMethod = props.contentType === 'electricity' ? getElectricityReport : getFeeReport;
    const params = {
      granularity: timePeriod.value,
      startDate: '', // 这里可以根据实际需求设置日期范围
      endDate: ''
    };
    
    // 获取报表数据
    const reportData = await apiMethod(params);
    
    // 获取报表指标数据
    const metricsParams = {
      type: props.contentType,
      granularity: timePeriod.value,
      startDate: '',
      endDate: ''
    };
    const metricsData = await getReportMetrics(metricsParams);
    
    // 在实际项目中，这里应该用接口返回的数据替换mockData
    // mockData[timePeriod.value] = reportData.data;
    
    // 这里可以处理metricsData，更新总量、平均值等数据
    // 例如：totalValue.value = metricsData.data.total;
    
    loading.value = false;
  } catch (error) {
    console.error('加载报表数据失败:', error);
    ElMessage.error('加载报表数据失败');
    loading.value = false;
  }
};

// 监听内容类型变化
watch(() => props.contentType, () => {
  // 根据内容类型设置默认图表类型
  if (props.contentType === 'electricity') {
    chartType.value = 'bar';  // 电量默认使用柱状图
  } else {
    chartType.value = 'line'; // 电费默认使用折线图
  }
  
  // 重新加载数据
  loadReportData();
}, { immediate: true });

onMounted(() => {
  // 初始化时加载数据
  loadReportData();
});
</script>

<style scoped>
.period-report {
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