<template>
  <div class="user-type-report">
    <div class="report-header">
      <div class="title-section">
        <h3>用户类型分析</h3>
      </div>
      <div class="chart-actions">
        <el-radio-group v-model="chartType" size="small" @change="changeChartType">
          <el-radio-button label="pie">饼图</el-radio-button>
          <el-radio-button label="scatter">散点图</el-radio-button>
          <el-radio-button label="gauge">仪表盘</el-radio-button>
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

// 定义接收的属性
const props = defineProps({
  userData: {
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
    text: '用户类型分布',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'horizontal',
    bottom: 10,
    data: ['居民用户', '商业用户', '工业用户', '农业用户', '其他用户']
  },
  series: [
    {
      name: '用户类型',
      type: 'pie',
      radius: ['30%', '60%'],
      center: ['50%', '45%'],
      roseType: 'radius',
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: {d}%'
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
          value: 60, 
          name: '居民用户',
          itemStyle: { color: '#409EFF' }
        },
        { 
          value: 25, 
          name: '商业用户',
          itemStyle: { color: '#67C23A' }
        },
        { 
          value: 10, 
          name: '工业用户',
          itemStyle: { color: '#E6A23C' }
        },
        { 
          value: 3, 
          name: '农业用户',
          itemStyle: { color: '#F56C6C' }
        },
        { 
          value: 2, 
          name: '其他用户',
          itemStyle: { color: '#909399' }
        }
      ]
    }
  ]
}));

// 散点图配置
const scatterChartOption = computed(() => ({
  title: {
    text: '用户用电量与费用分布',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: function (params) {
      return '用户: ' + params.data[2] + '<br/>用电量: ' + params.data[0] + ' kWh<br/>电费: ' + params.data[1] + ' 元';
    }
  },
  grid: {
    left: '8%',
    right: '8%',
    bottom: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    name: '用电量(kWh)',
    axisLabel: {
      formatter: '{value}'
    }
  },
  yAxis: {
    type: 'value',
    name: '电费(元)',
    axisLabel: {
      formatter: '{value}'
    }
  },
  visualMap: {
    min: 0,
    max: 4,
    dimension: 3,
    orient: 'horizontal',
    left: 'center',
    bottom: 10,
    text: ['其他用户', '居民用户'],
    calculable: true,
    inRange: {
      color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
    }
  },
  series: [
    {
      name: '用户分布',
      type: 'scatter',
      symbolSize: function (data) {
        return Math.sqrt(data[0]) / 1.5;
      },
      emphasis: {
        focus: 'series',
        label: {
          show: true,
          formatter: function (param) {
            return param.data[2];
          },
          position: 'top'
        }
      },
      data: generateScatterData()
    }
  ]
}));

// 仪表盘配置
const gaugeChartOption = computed(() => ({
  title: {
    text: '用户满意度',
    left: 'center'
  },
  tooltip: {
    formatter: '{b}: {c}%'
  },
  series: [
    {
      name: '用户满意度',
      type: 'gauge',
      detail: {
        formatter: '{value}%',
        fontSize: 16
      },
      progress: {
        show: true
      },
      min: 0,
      max: 100,
      radius: '80%',
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          width: 30,
          color: [
            [0.2, '#F56C6C'],
            [0.8, '#E6A23C'],
            [1, '#67C23A']
          ]
        }
      },
      pointer: {
        itemStyle: {
          color: 'auto'
        }
      },
      axisTick: {
        distance: -30,
        length: 8,
        lineStyle: {
          color: '#fff',
          width: 2
        }
      },
      splitLine: {
        distance: -30,
        length: 30,
        lineStyle: {
          color: '#fff',
          width: 4
        }
      },
      axisLabel: {
        color: 'auto',
        distance: 40,
        fontSize: 12
      },
      data: [
        {
          value: 87,
          name: '总体满意度'
        }
      ]
    },
    {
      name: '用户类型满意度',
      type: 'gauge',
      min: 0,
      max: 100,
      radius: '40%',
      center: ['25%', '70%'],
      progress: {
        show: true
      },
      axisLine: {
        lineStyle: {
          width: 10
        }
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        show: false
      },
      detail: {
        fontSize: 14,
        offsetCenter: [0, '60%']
      },
      title: {
        fontSize: 14
      },
      data: [
        {
          value: 92,
          name: '居民用户',
          title: {
            offsetCenter: [0, '-40%']
          },
          detail: {
            offsetCenter: [0, '-10%']
          }
        }
      ]
    },
    {
      name: '用户类型满意度',
      type: 'gauge',
      min: 0,
      max: 100,
      radius: '40%',
      center: ['75%', '70%'],
      progress: {
        show: true
      },
      axisLine: {
        lineStyle: {
          width: 10
        }
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        show: false
      },
      detail: {
        fontSize: 14,
        offsetCenter: [0, '60%']
      },
      title: {
        fontSize: 14
      },
      data: [
        {
          value: 82,
          name: '商业用户',
          title: {
            offsetCenter: [0, '-40%']
          },
          detail: {
            offsetCenter: [0, '-10%']
          }
        }
      ]
    }
  ]
}));

// 生成散点图数据
function generateScatterData() {
  // 这里应该根据实际数据生成
  // 目前使用模拟数据
  const data = [];
  const userTypes = ['居民用户', '商业用户', '工业用户', '农业用户', '其他用户'];
  const typeIndexes = {
    '居民用户': 0,
    '商业用户': 1,
    '工业用户': 2,
    '农业用户': 3,
    '其他用户': 4
  };
  
  for (let i = 0; i < 50; i++) {
    const userType = userTypes[Math.floor(Math.random() * userTypes.length)];
    const typeIndex = typeIndexes[userType];
    
    // 根据用户类型设置不同范围的用电量和费用
    let electricity, fee;
    
    switch (userType) {
      case '居民用户':
        electricity = Math.random() * 500 + 100;
        fee = electricity * (Math.random() * 0.2 + 0.5);
        break;
      case '商业用户':
        electricity = Math.random() * 2000 + 500;
        fee = electricity * (Math.random() * 0.3 + 0.6);
        break;
      case '工业用户':
        electricity = Math.random() * 5000 + 2000;
        fee = electricity * (Math.random() * 0.4 + 0.7);
        break;
      case '农业用户':
        electricity = Math.random() * 1000 + 300;
        fee = electricity * (Math.random() * 0.2 + 0.4);
        break;
      default:
        electricity = Math.random() * 800 + 200;
        fee = electricity * (Math.random() * 0.3 + 0.5);
    }
    
    data.push([
      parseFloat(electricity.toFixed(2)),
      parseFloat(fee.toFixed(2)),
      userType,
      typeIndex
    ]);
  }
  
  return data;
}

// 当前显示的图表选项
const currentChartOption = computed(() => {
  switch (chartType.value) {
    case 'pie':
      return pieChartOption.value;
    case 'scatter':
      return scatterChartOption.value;
    case 'gauge':
      return gaugeChartOption.value;
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
  // 在这里可以添加时间粒度变化后的数据加载逻辑
};

// 组件挂载后自动填充模拟数据（实际项目中应替换为真实数据）
onMounted(() => {
  // 初始化处理
});

watch(() => props.userData, () => {
  // 当数据变化时的处理
}, { deep: true });
</script>

<style scoped>
.user-type-report {
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