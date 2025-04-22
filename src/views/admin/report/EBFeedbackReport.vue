<template>
  <div class="feedback-report">
    <div class="report-header">
      <div class="title-section">
        <h3>反馈信息统计</h3>
      </div>
      <div class="chart-actions">
        <el-radio-group v-model="chartType" size="small" @change="changeChartType">
          <el-radio-button label="pie">饼图</el-radio-button>
          <el-radio-button label="bar">柱状图</el-radio-button>
          <el-radio-button label="radar">雷达图</el-radio-button>
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
import { getFeedbackReport } from '@/api/admin/report';
import { ElMessage } from 'element-plus';

// 定义接收的属性
const props = defineProps({
  feedbackData: {
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
    text: '反馈类型分布',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'horizontal',
    bottom: 10,
    data: ['投诉', '建议', '问题', '表扬', '其他']
  },
  series: [
    {
      name: '反馈类型',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: props.feedbackData.filter(item => item.type === 'complaint').length, name: '投诉' },
        { value: props.feedbackData.filter(item => item.type === 'suggestion').length, name: '建议' },
        { value: props.feedbackData.filter(item => item.type === 'question').length, name: '问题' },
        { value: props.feedbackData.filter(item => item.type === 'praise').length, name: '表扬' },
        { value: props.feedbackData.filter(item => item.type === 'other').length, name: '其他' }
      ]
    }
  ]
}));

// 柱状图配置
const barChartOption = computed(() => ({
  title: {
    text: '反馈状态统计',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['待处理', '处理中', '已处理', '已关闭'],
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
    data: ['投诉', '建议', '问题', '表扬', '其他']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '待处理',
      type: 'bar',
      stack: '状态',
      emphasis: {
        focus: 'series'
      },
      data: getStackedData('pending')
    },
    {
      name: '处理中',
      type: 'bar',
      stack: '状态',
      emphasis: {
        focus: 'series'
      },
      data: getStackedData('processing')
    },
    {
      name: '已处理',
      type: 'bar',
      stack: '状态',
      emphasis: {
        focus: 'series'
      },
      data: getStackedData('processed')
    },
    {
      name: '已关闭',
      type: 'bar',
      stack: '状态',
      emphasis: {
        focus: 'series'
      },
      data: getStackedData('closed')
    }
  ]
}));

// 雷达图配置
const radarChartOption = computed(() => ({
  title: {
    text: '反馈处理效率',
    left: 'center'
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    data: ['实际处理时间', '目标处理时间'],
    bottom: 10
  },
  radar: {
    indicator: [
      { name: '投诉', max: 100 },
      { name: '建议', max: 100 },
      { name: '问题', max: 100 },
      { name: '表扬', max: 100 },
      { name: '其他', max: 100 }
    ]
  },
  series: [
    {
      name: '反馈处理效率',
      type: 'radar',
      data: [
        {
          value: [85, 70, 90, 95, 80],
          name: '实际处理时间'
        },
        {
          value: [90, 80, 95, 90, 85],
          name: '目标处理时间'
        }
      ]
    }
  ]
}));

// 计算堆叠柱状图的数据
function getStackedData(status) {
  return [
    props.feedbackData.filter(item => item.type === 'complaint' && item.status === status).length,
    props.feedbackData.filter(item => item.type === 'suggestion' && item.status === status).length,
    props.feedbackData.filter(item => item.type === 'question' && item.status === status).length,
    props.feedbackData.filter(item => item.type === 'praise' && item.status === status).length,
    props.feedbackData.filter(item => item.type === 'other' && item.status === status).length
  ];
}

// 当前显示的图表选项
const currentChartOption = computed(() => {
  switch (chartType.value) {
    case 'pie':
      return pieChartOption.value;
    case 'bar':
      return barChartOption.value;
    case 'radar':
      return radarChartOption.value;
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
  loadFeedbackData();
};

// 加载反馈数据
const loadFeedbackData = async () => {
  try {
    const loading = ref(true);
    
    // 获取反馈报表数据
    const params = {
      granularity: timePeriod.value,
      startDate: '', // 可根据实际需求设置日期范围
      endDate: ''
    };
    
    const response = await getFeedbackReport(params);
    
    // 处理返回的数据
    if (response && response.data) {
      // 在实际项目中，这里应该用接口返回的数据更新组件的数据
      // props.feedbackData = response.data;
    }
    
    loading.value = false;
  } catch (error) {
    console.error('加载反馈数据失败:', error);
    ElMessage.error('加载反馈数据失败');
    loading.value = false;
  }
};

// 组件挂载后自动填充模拟数据（实际项目中应替换为真实数据）
onMounted(() => {
  // 初始化处理
  loadFeedbackData();
});

watch(() => props.feedbackData, () => {
  // 当数据变化时的处理
}, { deep: true });
</script>

<style scoped>
.feedback-report {
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