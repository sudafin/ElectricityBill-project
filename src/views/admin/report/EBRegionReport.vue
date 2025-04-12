<template>
  <div class="region-report">
    <div class="report-header">
      <div class="title-section">
        <h3>区域统计报表</h3>
      </div>
      <div class="chart-actions">
        <el-radio-group v-model="chartType" size="small" @change="changeChartType">
          <el-radio-button label="bar">柱状图</el-radio-button>
          <el-radio-button label="map">地图</el-radio-button>
          <el-radio-button label="heat">热力图</el-radio-button>
        </el-radio-group>
        <el-select v-model="dataType" size="small" class="data-type-select" @change="handleDataTypeChange">
          <el-option label="用电量" value="electricity" />
          <el-option label="电费" value="fee" />
          <el-option label="用户数" value="users" />
        </el-select>
      </div>
    </div>
    <div class="chart-container">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>
      <EBChart v-else :option="currentChartOption" />
    </div>
    <div class="table-container" v-if="showTable">
      <el-table :data="tableData" stripe border size="small" height="200">
        <el-table-column prop="region" label="区域名称" width="120" />
        <el-table-column prop="electricity" label="用电量 (kWh)" width="120" />
        <el-table-column prop="fee" label="电费 (元)" width="120" />
        <el-table-column prop="users" label="用户数" width="100" />
        <el-table-column prop="avgElectricity" label="人均用电" width="120" />
        <el-table-column prop="growth" label="同比增长" width="120">
          <template #default="scope">
            <span :class="scope.row.growth >= 0 ? 'growth-up' : 'growth-down'">
              {{ scope.row.growth >= 0 ? '+' : '' }}{{ scope.row.growth }}%
              <el-icon v-if="scope.row.growth >= 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import EBChart from '@/components/EBChart.vue';
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue';
import 'echarts/extension/bmap/bmap';
import * as echarts from 'echarts/core';

// 定义属性
const props = defineProps({
  regionData: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// 状态定义
const chartType = ref('bar');
const dataType = ref('electricity');
const showTable = ref(true);
const timePeriod = ref('daily');

// 模拟数据
const mockRegionData = [
  { 
    region: '东城区', 
    electricity: 5600, 
    fee: 3200, 
    users: 1200, 
    avgElectricity: 4.67,
    growth: 12.5,
    coordinate: [116.418757, 39.917544]
  },
  { 
    region: '西城区', 
    electricity: 4800, 
    fee: 2800, 
    users: 980, 
    avgElectricity: 4.90,
    growth: 8.3,
    coordinate: [116.366794, 39.915309]
  },
  { 
    region: '朝阳区', 
    electricity: 7200, 
    fee: 4300, 
    users: 1650, 
    avgElectricity: 4.36,
    growth: 15.2,
    coordinate: [116.486409, 39.921489]
  },
  { 
    region: '海淀区', 
    electricity: 6500, 
    fee: 3800, 
    users: 1450, 
    avgElectricity: 4.48,
    growth: 10.7,
    coordinate: [116.310316, 39.99302]
  },
  { 
    region: '丰台区', 
    electricity: 4200, 
    fee: 2500, 
    users: 950, 
    avgElectricity: 4.42,
    growth: 7.6,
    coordinate: [116.286968, 39.863642]
  },
  { 
    region: '石景山区', 
    electricity: 3200, 
    fee: 1800, 
    users: 720, 
    avgElectricity: 4.44,
    growth: 5.3,
    coordinate: [116.195445, 39.914601]
  },
  { 
    region: '通州区', 
    electricity: 4100, 
    fee: 2300, 
    users: 860, 
    avgElectricity: 4.77,
    growth: 9.4,
    coordinate: [116.740079, 39.913344]
  },
  { 
    region: '大兴区', 
    electricity: 3800, 
    fee: 2100, 
    users: 780, 
    avgElectricity: 4.87,
    growth: -1.2,
    coordinate: [116.338033, 39.728908]
  },
  { 
    region: '顺义区', 
    electricity: 3500, 
    fee: 1950, 
    users: 690, 
    avgElectricity: 5.07,
    growth: 6.8,
    coordinate: [116.653525, 40.128936]
  },
  { 
    region: '昌平区', 
    electricity: 4300, 
    fee: 2400, 
    users: 920, 
    avgElectricity: 4.67,
    growth: -0.5,
    coordinate: [116.235906, 40.218085]
  }
];

// 表格数据
const tableData = ref(mockRegionData);

// 获取图表标题
const getChartTitle = () => {
  const typeText = {
    'electricity': '用电量统计',
    'fee': '电费统计',
    'users': '用户数统计'
  }[dataType.value] || '区域统计';
  
  return typeText;
};

// 获取值单位
const getValueUnit = () => {
  return {
    'electricity': 'kWh',
    'fee': '元',
    'users': '人'
  }[dataType.value] || '';
};

// 柱状图配置
const barChartOption = computed(() => ({
  title: {
    text: getChartTitle(),
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    formatter: function(params) {
      const data = params[0].data;
      return `${params[0].name}<br/>${params[0].seriesName}: ${data} ${getValueUnit()}<br/>同比增长: ${mockRegionData.find(item => item.region === params[0].name)?.growth}%`;
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '8%',
    top: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: mockRegionData.map(item => item.region),
    axisLabel: {
      interval: 0,
      rotate: 30
    }
  },
  yAxis: {
    type: 'value',
    name: getValueUnit()
  },
  series: [
    {
      name: getChartTitle(),
      type: 'bar',
      barWidth: '40%',
      data: mockRegionData.map(item => item[dataType.value]),
      itemStyle: {
        color: function(params) {
          const growth = mockRegionData.find(item => item.region === params.name)?.growth;
          return growth >= 0 ? '#67C23A' : '#F56C6C';
        }
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}'
      }
    }
  ]
}));

// 地图配置
const mapChartOption = computed(() => ({
  title: {
    text: getChartTitle(),
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: function (params) {
      const data = params.data;
      return `${data.name}<br/>${dataType.value === 'electricity' ? '用电量' : dataType.value === 'fee' ? '电费' : '用户数'}: ${data.value} ${getValueUnit()}<br/>同比增长: ${data.growth}%`;
    }
  },
  visualMap: {
    min: 0,
    max: dataType.value === 'electricity' ? 8000 : dataType.value === 'fee' ? 5000 : 2000,
    text: ['高', '低'],
    inRange: {
      color: ['#DCF1FF', '#60A3D9', '#0074B7']
    },
    calculable: true,
    left: 'left',
    top: 'bottom'
  },
  geo: {
    map: 'china',
    label: {
      emphasis: {
        show: false
      }
    },
    itemStyle: {
      normal: {
        areaColor: '#f3f3f3',
        borderColor: '#999999'
      },
      emphasis: {
        areaColor: '#DCF1FF'
      }
    }
  },
  series: [
    {
      name: getChartTitle(),
      type: 'scatter',
      coordinateSystem: 'geo',
      data: mockRegionData.map(item => ({
        name: item.region,
        value: [...item.coordinate, item[dataType.value]],
        growth: item.growth
      })),
      symbolSize: function (val) {
        return Math.sqrt(val[2]) / 10;
      },
      label: {
        formatter: '{b}',
        position: 'right',
        show: false
      },
      emphasis: {
        label: {
          show: true
        }
      }
    }
  ]
}));

// 热力图配置
const heatChartOption = computed(() => ({
  title: {
    text: getChartTitle() + '热力分布',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: function (params) {
      return `${params.name || '区域'}: ${params.value[2]} ${getValueUnit()}`;
    }
  },
  visualMap: {
    min: 0,
    max: dataType.value === 'electricity' ? 8000 : dataType.value === 'fee' ? 5000 : 2000,
    calculable: true,
    inRange: {
      color: ['blue', 'green', 'yellow', 'red']
    },
    textStyle: {
      color: '#333'
    },
    left: 'left',
    bottom: 0
  },
  geo: {
    map: 'china',
    label: {
      emphasis: {
        show: false
      }
    },
    roam: true,
    itemStyle: {
      normal: {
        areaColor: '#f3f3f3',
        borderColor: '#999999'
      },
      emphasis: {
        areaColor: '#e6e6e6'
      }
    }
  },
  series: [
    {
      name: '热力数据',
      type: 'heatmap',
      coordinateSystem: 'geo',
      data: mockRegionData.map(item => ({
        name: item.region,
        value: [...item.coordinate, item[dataType.value]]
      })),
      pointSize: 5,
      blurSize: 6
    }
  ]
}));

// 当前显示的图表选项
const currentChartOption = computed(() => {
  switch (chartType.value) {
    case 'bar':
      return barChartOption.value;
    case 'map':
      return mapChartOption.value;
    case 'heat':
      return heatChartOption.value;
    default:
      return barChartOption.value;
  }
});

// 切换图表类型
const changeChartType = (type) => {
  chartType.value = type;
};

// 处理数据类型变化
const handleDataTypeChange = (type) => {
  dataType.value = type;
};

// 处理时间粒度变化
const handleTimePeriodChange = (period) => {
  timePeriod.value = period;
  // 可以在这里添加时间粒度变化后的数据加载逻辑
};

// 组件挂载时执行
onMounted(() => {
  // 注册中国地图组件
  if (chartType.value === 'map' || chartType.value === 'heat') {
    // 注意：实际项目中需要从CDN或本地资源加载地图JSON数据
    // echarts.registerMap('china', chinaJSON);
  }
});

// 监听图表类型变化
watch(() => chartType.value, (newVal) => {
  if ((newVal === 'map' || newVal === 'heat') && !echarts.getMap('china')) {
    // 需要注册地图数据
    console.log('需要注册地图数据...');
  }
});
</script>

<style scoped>
.region-report {
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

.report-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.time-period-select {
  width: 100px;
}

.chart-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.data-type-select {
  width: 120px;
  margin-left: 8px;
}

.chart-container {
  width: 100%;
  height: 350px;
  position: relative;
}

.loading-container {
  padding: 20px;
  width: 100%;
  height: 100%;
}

.table-container {
  margin-top: 20px;
  border-radius: 4px;
  overflow: hidden;
}

.growth-up {
  color: #67C23A;
}

.growth-down {
  color: #F56C6C;
}
</style> 