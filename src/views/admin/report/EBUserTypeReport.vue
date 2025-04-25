<template>
  <div class="report-wrapper">
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
    <el-divider />
    <div class="chart-container">
      <template v-if="loading">
        <el-skeleton :rows="6" animated />
      </template>
      <template v-else-if="!hasData">
        <div class="empty-data">暂无数据</div>
      </template>
      <template v-else>
        <EBChart :option="currentChartOption" :loading="loading" ref="chartRef" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import EBChart from '@/components/EBChart.vue';
import { ElMessage } from 'element-plus';
import { formatNumber, formatPercentage, formatUserType } from '@/utils/formatter';

// 定义接收的属性
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
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

// 图表类型
const chartType = ref('pie');
// 本地数据缓存
const localUserData = ref([]);
// 图表组件引用
const chartRef = ref(null);

// 用户类型可能的值（从eb_user_type表中获取）
const userTypes = ['居民用户', '商业用户'];

// 兼容后端出参，distribution为主数据
const distribution = computed(() => Array.isArray(props.data?.distribution) ? props.data.distribution : []);
const hasData = computed(() => distribution.value.length > 0);

// 获取用户类型分布数据
const getUserTypeDistribution = () => {
  const data = localUserData.value;
  const typeCount = {};
  
  // 初始化统计对象
  userTypes.forEach(type => {
    typeCount[type] = 0;
  });
  
  // 统计各类型用户数量
  data.forEach(user => {
    const type = user.user_type;
    if (typeCount[type] !== undefined) {
      typeCount[type]++;
    } else {
      // 处理未在预定义类型中的用户类型
      typeCount[type] = 1;
    }
  });
  
  // 转换为图表需要的数据格式
  return Object.keys(typeCount)
    .filter(type => typeCount[type] > 0)
    .map(type => ({
      value: typeCount[type],
      name: type,
      itemStyle: { 
        color: type === '居民用户' ? '#409EFF' : 
               type === '商业用户' ? '#67C23A' : '#909399'
      }
    }));
};

// 饼图配置
const pieChartOption = computed(() => {
  const typeDistribution = getUserTypeDistribution();
  const typeNames = typeDistribution.map(item => item.name);
  
  return {
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
      data: typeNames
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
        data: typeDistribution
      }
    ]
  };
});

// 生成用户用电量与费用的散点图数据
const generateUserElectricityData = () => {
  const data = [];
  const userTypeIndexMap = {};
  
  // 创建用户类型到索引的映射
  userTypes.forEach((type, index) => {
    userTypeIndexMap[type] = index;
  });
  
  // 从真实数据生成散点图数据
  localUserData.value.forEach(user => {
    if (user.electricity_data && user.bill_data) {
      // 使用从API获取的电量和电费数据
      const electricity = user.electricity_data.total_usage || 0;
      const fee = user.bill_data.total_amount || 0;
      const typeIndex = userTypeIndexMap[user.user_type] || 0;
      
      data.push([
        parseFloat(electricity.toFixed(2)),
        parseFloat(fee.toFixed(2)),
        user.user_type,
        typeIndex
      ]);
    }
  });
  
  // 如果没有数据，生成一些模拟数据
  if (data.length === 0) {
    userTypes.forEach((type, typeIndex) => {
      // 根据用户类型生成不同范围的模拟数据
      const count = type === '居民用户' ? 30 : 20;
      const baseElectricity = type === '居民用户' ? 200 : 1000;
      const electricityRange = type === '居民用户' ? 400 : 2000;
      const rateMultiplier = type === '居民用户' ? 0.6 : 0.7;
      const rateRange = type === '居民用户' ? 0.2 : 0.3;
      
      for (let i = 0; i < count; i++) {
        const electricity = Math.random() * electricityRange + baseElectricity;
        const fee = electricity * (Math.random() * rateRange + rateMultiplier);
        
        data.push([
          parseFloat(electricity.toFixed(2)),
          parseFloat(fee.toFixed(2)),
          type,
          typeIndex
        ]);
      }
    });
  }
  
  return data;
};

// 散点图配置
const scatterChartOption = computed(() => {
  const scatterData = generateUserElectricityData();
  const typeNames = userTypes.filter(type => 
    scatterData.some(item => item[2] === type)
  );
  
  return {
    title: {
      text: '用户用电量与费用分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        return '用户类型: ' + params.data[2] + 
               '<br/>用电量: ' + params.data[0].toLocaleString() + ' kWh' + 
               '<br/>电费: ' + params.data[1].toLocaleString() + ' 元';
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
      max: userTypes.length - 1,
      dimension: 3,
      orient: 'horizontal',
      left: 'center',
      bottom: 10,
      text: [typeNames[typeNames.length-1] || '', typeNames[0] || ''],
      calculable: true,
      inRange: {
        color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'].slice(0, typeNames.length)
      }
    },
    series: [
      {
        name: '用户分布',
        type: 'scatter',
        symbolSize: function (data) {
          return Math.sqrt(data[0]) / 2;
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
        data: scatterData
      }
    ]
  };
});

// 计算各类型用户的平均满意度（模拟数据，实际项目中应从API获取）
const getUserTypeSatisfaction = () => {
  // 默认满意度值
  const defaultSatisfaction = {
    '居民用户': 92,
    '商业用户': 85
  };
  
  // 如果API返回了满意度数据，则使用实际数据
  if (localUserData.value.some(user => user.satisfaction_score)) {
    const satisfactionByType = {};
    const countByType = {};
    
    // 计算各类型的总满意度和数量
    localUserData.value.forEach(user => {
      if (user.satisfaction_score) {
        const type = user.user_type;
        satisfactionByType[type] = (satisfactionByType[type] || 0) + user.satisfaction_score;
        countByType[type] = (countByType[type] || 0) + 1;
      }
    });
    
    // 计算平均值
    const result = {};
    Object.keys(satisfactionByType).forEach(type => {
      result[type] = Math.round(satisfactionByType[type] / countByType[type]);
    });
    
    return result;
  }
  
  return defaultSatisfaction;
};

// 计算总体满意度
const getOverallSatisfaction = () => {
  const typeSatisfaction = getUserTypeSatisfaction();
  const types = Object.keys(typeSatisfaction);
  
  if (types.length === 0) return 85;
  
  // 计算总体满意度（简单平均）
  const totalSatisfaction = types.reduce((sum, type) => sum + typeSatisfaction[type], 0);
  return Math.round(totalSatisfaction / types.length);
};

// 仪表盘配置
const gaugeChartOption = computed(() => {
  const typeSatisfaction = getUserTypeSatisfaction();
  const overallSatisfaction = getOverallSatisfaction();
  const types = Object.keys(typeSatisfaction);
  
  // 仪表盘配置
  const gaugeOption = {
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
              [0.6, '#F56C6C'],
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
            value: overallSatisfaction,
            name: '总体满意度'
          }
        ]
      }
    ]
  };
  
  // 添加各类型用户的仪表盘
  if (types.length > 0) {
    // 针对最多两种类型展示子仪表盘
    const displayTypes = types.slice(0, 2);
    
    displayTypes.forEach((type, index) => {
      const xPosition = displayTypes.length === 1 ? '50%' : (index === 0 ? '25%' : '75%');
      
      gaugeOption.series.push({
        name: '用户类型满意度',
        type: 'gauge',
        min: 0,
        max: 100,
        radius: '40%',
        center: [xPosition, '70%'],
        progress: {
          show: true
        },
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.6, '#F56C6C'],
              [0.8, '#E6A23C'],
              [1, '#67C23A']
            ]
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
          offsetCenter: [0, '60%'],
          formatter: '{value}%'
        },
        title: {
          fontSize: 14
        },
        data: [
          {
            value: typeSatisfaction[type],
            name: type,
            title: {
              offsetCenter: [0, '-40%']
            },
            detail: {
              offsetCenter: [0, '-10%']
            }
          }
        ]
      });
    });
  }
  
  return gaugeOption;
});

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

// 暴露给父组件的刷新图表方法
const refreshChart = () => {
  if (chartRef.value) {
    chartRef.value.refreshChart();
  }
};

// 导出图片方法
const exportImage = () => {
  if (chartRef.value) {
    chartRef.value.exportImage();
  }
};

// 生成模拟用户数据（仅在没有真实数据时使用）
const generateMockUserData = () => {
  const mockData = [];
  
  userTypes.forEach(type => {
    const count = type === '居民用户' ? 80 : 40;
    
    for (let i = 0; i < count; i++) {
      const baseUsage = type === '居民用户' ? 200 : 1000;
      const usageRange = type === '居民用户' ? 300 : 1500;
      const totalUsage = Math.random() * usageRange + baseUsage;
      const rateMultiplier = type === '居民用户' ? 0.58 : 0.68;
      const totalAmount = totalUsage * rateMultiplier;
      
      mockData.push({
        id: mockData.length + 1,
        account: `AC${100000 + mockData.length}`,
        username: `用户${mockData.length + 1}`,
        user_type: type,
        address: type === '居民用户' ? '北京市朝阳区建国路' : '北京市海淀区中关村',
        account_status: 'active',
        meter_id: `M${200000 + mockData.length}`,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        electricity_data: {
          total_usage: totalUsage,
          peak_usage: totalUsage * 0.4,
          flat_usage: totalUsage * 0.3,
          valley_usage: totalUsage * 0.3
        },
        bill_data: {
          total_amount: totalAmount,
          paid_amount: Math.random() > 0.2 ? totalAmount : 0,
          unpaid_amount: Math.random() > 0.2 ? 0 : totalAmount
        },
        satisfaction_score: Math.floor(Math.random() * 30) + 70  // 70-100范围内的满意度
      });
    }
  });
  
  return mockData;
};

// 监听外部传入的userData变化
watch(() => props.data, (newData) => {
  if (newData && newData.distribution && newData.distribution.length > 0) {
    localUserData.value = newData.distribution;
  } else {
    // 如果没有数据，使用模拟数据
    localUserData.value = generateMockUserData();
  }
}, { immediate: true });

// 暴露方法给父组件
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

.empty-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 16px;
  color: #909399;
}
</style>