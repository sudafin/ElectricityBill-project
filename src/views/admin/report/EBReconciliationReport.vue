<template>
  <div class="reconciliation-report">
    <div class="report-header">
      <div class="title-section">
        <h3>对账审批统计</h3>
      </div>
      <div class="chart-actions">
        <el-radio-group v-model="chartType" size="small" @change="changeChartType">
          <el-radio-button label="pie">饼图</el-radio-button>
          <el-radio-button label="line">折线图</el-radio-button>
          <el-radio-button label="funnel">漏斗图</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div class="chart-container">
      <EBChart :option="currentChartOption" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import EBChart from '@/components/EBChart.vue';
import { getReconciliationReport } from '@/api/admin/report';
import { ElMessage } from 'element-plus';

// 定义接收的属性
const props = defineProps({
  reconciliationData: {
    type: Array,
    default: () => []
  }
});

// 图表类型
const chartType = ref('pie');
// 时间粒度
const timePeriod = ref('daily');

// 饼图配置
const pieChartOption = computed(() => ({
  title: {
    text: '对账审批状态分布',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'horizontal',
    bottom: 10,
    data: ['待审批', '通过', '拒绝', '退回', '暂缓']
  },
  series: [
    {
      name: '审批状态',
      type: 'pie',
      radius: '55%',
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: {c} ({d}%)'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '16',
          fontWeight: 'bold'
        }
      },
      data: [
        { 
          value: props.reconciliationData.filter(item => item.status === '待审批').length, 
          name: '待审批',
          itemStyle: { color: '#909399' }
        },
        { 
          value: props.reconciliationData.filter(item => item.status === '通过').length, 
          name: '通过',
          itemStyle: { color: '#67C23A' }
        },
        { 
          value: props.reconciliationData.filter(item => item.status === '拒绝').length, 
          name: '拒绝',
          itemStyle: { color: '#F56C6C' }
        },
        { 
          value: props.reconciliationData.filter(item => item.status === '退回').length, 
          name: '退回',
          itemStyle: { color: '#E6A23C' }
        },
        { 
          value: props.reconciliationData.filter(item => item.status === '暂缓').length, 
          name: '暂缓',
          itemStyle: { color: '#409EFF' }
        }
      ]
    }
  ]
}));

// 折线图配置
const lineChartOption = computed(() => {
  // 获取时间范围内的所有日期
  const dates = getDateRange();
  
  // 处理每个审批状态的趋势数据
  const pendingData = getStatusTrendData(dates, '待审批');
  const approvedData = getStatusTrendData(dates, '通过');
  const rejectedData = getStatusTrendData(dates, '拒绝');
  const returnedData = getStatusTrendData(dates, '退回');
  const delayedData = getStatusTrendData(dates, '暂缓');
  
  return {
    title: {
      text: '对账审批状态趋势',
      left: 'center'
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
    legend: {
      data: ['待审批', '通过', '拒绝', '退回', '暂缓'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '待审批',
        type: 'line',
        stack: '总量',
        emphasis: {
          focus: 'series'
        },
        data: pendingData
      },
      {
        name: '通过',
        type: 'line',
        stack: '总量',
        emphasis: {
          focus: 'series'
        },
        data: approvedData
      },
      {
        name: '拒绝',
        type: 'line',
        stack: '总量',
        emphasis: {
          focus: 'series'
        },
        data: rejectedData
      },
      {
        name: '退回',
        type: 'line',
        stack: '总量',
        emphasis: {
          focus: 'series'
        },
        data: returnedData
      },
      {
        name: '暂缓',
        type: 'line',
        stack: '总量',
        emphasis: {
          focus: 'series'
        },
        data: delayedData
      }
    ]
  };
});

// 漏斗图配置
const funnelChartOption = computed(() => ({
  title: {
    text: '对账审批流程漏斗',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c}'
  },
  legend: {
    data: ['提交对账', '待审批', '审批通过', '支付完成'],
    bottom: 10
  },
  series: [
    {
      name: '对账流程',
      type: 'funnel',
      left: '10%',
      top: 60,
      bottom: 60,
      width: '80%',
      min: 0,
      max: 100,
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        position: 'inside'
      },
      labelLine: {
        length: 10,
        lineStyle: {
          width: 1,
          type: 'solid'
        }
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1
      },
      emphasis: {
        label: {
          fontSize: 20
        }
      },
      data: [
        { value: 100, name: '提交对账' },
        { value: 80, name: '待审批' },
        { value: 60, name: '审批通过' },
        { value: 40, name: '支付完成' }
      ]
    }
  ]
}));

// 获取日期范围
function getDateRange() {
  // 这里应该根据实际数据动态生成日期范围
  // 目前使用模拟数据
  const dates = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dates.push(`${date.getMonth() + 1}-${date.getDate()}`);
  }
  return dates;
}

// 获取某个状态的趋势数据
function getStatusTrendData(dates, status) {
  // 这里应该根据实际数据计算每天的状态数量
  // 目前使用随机数据模拟
  return dates.map(() => Math.floor(Math.random() * 10));
}

// 当前显示的图表选项
const currentChartOption = computed(() => {
  switch (chartType.value) {
    case 'pie':
      return pieChartOption.value;
    case 'line':
      return lineChartOption.value;
    case 'funnel':
      return funnelChartOption.value;
    default:
      return pieChartOption.value;
  }
});

// 切换图表类型
const changeChartType = (type) => {
  chartType.value = type;
};

// 处理时间粒度变化
const handleTimePeriodChange = (period) => {
  timePeriod.value = period;
  // 加载数据
  loadReconciliationData();
};

// 加载对账审批数据
const loadReconciliationData = async () => {
  try {
    const loading = ref(true);
    
    // 获取对账审批报表数据
    const params = {
      granularity: timePeriod.value,
      startDate: '', // 可根据实际需求设置日期范围
      endDate: ''
    };
    
    const response = await getReconciliationReport(params);
    
    // 处理返回的数据
    if (response && response.data) {
      // 在实际项目中，这里应该用接口返回的数据更新组件的数据
      // props.reconciliationData = response.data;
    }
    
    loading.value = false;
  } catch (error) {
    console.error('加载对账审批数据失败:', error);
    ElMessage.error('加载对账审批数据失败');
    loading.value = false;
  }
};

// 组件挂载后自动填充模拟数据（实际项目中应替换为真实数据）
onMounted(() => {
  // 初始化处理
  loadReconciliationData();
});

watch(() => props.reconciliationData, () => {
  // 当数据变化时的处理
}, { deep: true });
</script>

<style scoped>
.reconciliation-report {
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

.time-period-select {
  width: 100px;
}

.chart-actions {
  display: flex;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 350px;
}
</style> 