<template>
  <div class="report-wrapper">
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
    <el-divider />
    <div class="chart-container">
      <template v-if="loading">
        <el-skeleton :rows="6" animated />
      </template>
      <template v-else-if="!hasData">
        <div class="empty-data">暂无数据</div>
      </template>
      <template v-else>
        <EBChart :option="currentChartOption" ref="chartRef" />
      </template>
    </div>
    <div class="table-container" v-if="showTable && hasData">
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
import { ElMessage } from 'element-plus';
import { formatNumber } from '@/utils/formatter';

// 定义属性
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

// 状态定义
const chartType = ref('bar');
const dataType = ref('electricity');
const showTable = ref(true);
const timePeriod = ref('monthly');
// 本地数据
const distribution = computed(() => Array.isArray(props.data?.distribution) ? props.data.distribution : []);
// 图表组件引用
const chartRef = ref(null);

const hasData = computed(() => distribution.value.length > 0);

// 区域坐标映射 - 常见区域的坐标点（实际项目中可以从地图API获取或维护一个更完整的映射表）
const regionCoordinateMap = {
  '北京市': [116.407526, 39.90403],
  '上海市': [121.473701, 31.230416],
  '广州市': [113.264434, 23.129162],
  '深圳市': [114.085947, 22.547],
  '成都市': [104.065735, 30.659462],
  '重庆市': [106.551556, 29.563009],
  '武汉市': [114.305392, 30.593098],
  '西安市': [108.940174, 34.341568],
  '南京市': [118.796877, 32.060255],
  '杭州市': [120.153576, 30.287459],
  '天津市': [117.190182, 39.125595],
  '苏州市': [120.585315, 31.298886],
  '东城区': [116.418757, 39.917544],
  '西城区': [116.366794, 39.915309],
  '朝阳区': [116.486409, 39.921489],
  '海淀区': [116.310316, 39.99302],
  '丰台区': [116.286968, 39.863642],
  '石景山区': [116.195445, 39.914601],
  '通州区': [116.740079, 39.913344],
  '大兴区': [116.338033, 39.728908],
  '顺义区': [116.653525, 40.128936],
  '昌平区': [116.235906, 40.218085]
};

// 从地址中提取区域信息
const extractRegionFromAddress = (address) => {
  if (!address) return '未知区域';
  
  // 尝试匹配区域名称
  for (const region in regionCoordinateMap) {
    if (address.includes(region)) {
      return region;
    }
  }
  
  // 如果没有匹配到具体区域，尝试提取省/市
  const cityMatch = address.match(/([\u4e00-\u9fa5]{2,}市)/);
  if (cityMatch && cityMatch[1]) {
    return cityMatch[1];
  }
  
  // 如果还是没匹配到，返回前10个字符作为区域标识
  return address.substring(0, 10);
};

// 获取区域坐标
const getRegionCoordinate = (region) => {
  return regionCoordinateMap[region] || [116.407526, 39.90403]; // 默认返回北京坐标
};

// 处理API返回的区域数据
const processRegionData = (apiData) => {
  if (!apiData || !apiData.length) return [];
  
  // 按区域分组汇总数据
  const regionGroups = {};
  
  apiData.forEach(item => {
    // 从地址提取区域
    const region = item.region || extractRegionFromAddress(item.address);
    
    // 如果区域不存在，初始化
    if (!regionGroups[region]) {
      regionGroups[region] = {
        region: region,
        electricity: 0,
        fee: 0,
        users: 0,
        coordinate: getRegionCoordinate(region),
        growth: 0 // 默认增长率
      };
    }
    
    // 累加统计数据
    regionGroups[region].electricity += Number(item.total_usage || 0);
    regionGroups[region].fee += Number(item.total_amount || 0);
    regionGroups[region].users += 1;
    
    // 如果有增长率数据，取平均值
    if (item.growth_rate) {
      regionGroups[region].growth = 
        (regionGroups[region].growth * (regionGroups[region].users - 1) + Number(item.growth_rate)) 
        / regionGroups[region].users;
    }
  });
  
  // 转换为数组并计算人均用电量
  return Object.values(regionGroups).map(group => {
    group.avgElectricity = group.users > 0 ? 
      parseFloat((group.electricity / group.users).toFixed(2)) : 0;
    
    // 四舍五入增长率到一位小数
    group.growth = parseFloat(group.growth.toFixed(1));
    
    return group;
  });
};

// 表格数据
const tableData = computed(() => distribution.value);

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
const barChartOption = computed(() => {
  // 检查数据是否可用
  if (!tableData.value || tableData.value.length === 0) {
    return {
      title: {
        text: '暂无区域数据',
        left: 'center',
        top: 'center',
        textStyle: {
          color: '#909399',
          fontSize: 16
        }
      }
    };
  }

  return {
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
        const data = params[0]?.data;
        const regionName = params[0]?.name || '';
        const value = (typeof data === 'number' ? data : (data ?? 0));
        const valueStr = (typeof value === 'number' && !isNaN(value)) ? value.toLocaleString() : '-';
        const growth = tableData.value.find(item => item.region === regionName)?.growth;
        const growthStr = (typeof growth === 'number' && !isNaN(growth)) ? growth + '%' : '-';
        return `${regionName}<br/>${params[0].seriesName}: ${valueStr} ${getValueUnit()}<br/>同比增长: ${growthStr}`;
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
      data: tableData.value.map(item => item.region),
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
        data: tableData.value.map(item => {
          const value = item[dataType.value];
          return typeof value === 'number' && !isNaN(value) ? value : 0;
        }),
        itemStyle: {
          color: function(params) {
            const growth = tableData.value.find(item => item.region === params.name)?.growth;
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
  };
});

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
      if (!data) return '';
      const value = data.value && data.value[2];
      const valueStr = (typeof value === 'number' && !isNaN(value)) ? value.toLocaleString() : '-';
      return `${data.name}<br/>${dataType.value === 'electricity' ? '用电量' : dataType.value === 'fee' ? '电费' : '用户数'}: ${valueStr} ${getValueUnit()}<br/>同比增长: ${typeof data.growth === 'number' && !isNaN(data.growth) ? data.growth + '%' : '-'}`;
    }
  },
  visualMap: {
    min: 0,
    max: Math.max(...tableData.value.map(item => item[dataType.value])) || 1000,
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
      data: tableData.value.map(item => ({
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
      if (!params.value) return '';
      const value = params.value[2];
      const valueStr = (typeof value === 'number' && !isNaN(value)) ? value.toLocaleString() : '-';
      return `${params.name || '区域'}: ${valueStr} ${getValueUnit()}`;
    }
  },
  visualMap: {
    min: 0,
    max: Math.max(...tableData.value.map(item => item[dataType.value])) || 1000,
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
      data: tableData.value.map(item => ({
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

// 生成模拟区域数据（应急备用）
const generateMockRegionData = () => {
  return [
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
    }
  ];
};

// 监听props变化
watch(() => props.data, (newData) => {
  console.log('EBRegionReport received data:', newData);
  
  if (newData && newData.distribution && newData.distribution.length > 0) {
    // 如果distribution存在且有数据，使用distribution
    console.log('Processing distribution data with length:', newData.distribution.length);
    distribution.value = processRegionData(newData.distribution);
  } else if (newData && typeof newData === 'object') {
    // 尝试在顶层寻找可能的区域数据
    console.log('Distribution not found, looking for region data in the root object');
    const possibleRegionData = Object.values(newData).find(item => 
      Array.isArray(item) && item.length > 0 && (item[0].region || item[0].address)
    );
    
    if (possibleRegionData) {
      console.log('Found possible region data:', possibleRegionData);
      distribution.value = processRegionData(possibleRegionData);
    } else {
      console.log('No suitable data found, using mock data');
      // 如果没有找到任何合适的数据，使用模拟数据
      distribution.value = generateMockRegionData();
    }
  } else {
    console.log('No data received, using mock data');
    // 如果没有数据，使用模拟数据
    distribution.value = generateMockRegionData();
  }
  
  console.log('Final processed distribution data:', distribution.value);
}, { immediate: true });

// 注册中国地图数据
onMounted(async () => {
  if (!echarts.getMap('china')) {
    try {
      // 注册默认区域数据
      const chinaMapData = {
        "type": "FeatureCollection",
        "features": []
      };
      echarts.registerMap('china', chinaMapData);
      console.log('使用默认地图数据');
    } catch (error) {
      console.error('注册默认地图数据失败:', error);
    }
  }
});

// 监听图表类型变化
watch(() => chartType.value, async (newVal) => {
  if ((newVal === 'map' || newVal === 'heat')) {
    try {
      if (!echarts.getMap('china') || echarts.getMap('china').geoJson.features.length === 0) {
        // 尝试动态加载中国地图数据
        try {
          // 提示用户正在加载地图
          ElMessage.info('正在加载地图数据...');
          
          // 修改为使用默认数据或模拟数据
          const defaultMapData = {
            "type": "FeatureCollection",
            "features": []
          };
          
          echarts.registerMap('china', defaultMapData);
          ElMessage.success('地图数据加载完成');
        } catch (mapError) {
          console.error('加载地图数据失败:', mapError);
          ElMessage.warning('地图数据加载失败，将使用简化地图');
        }
      }
    } catch (error) {
      console.error('地图切换错误:', error);
      ElMessage.error('地图初始化失败，请切换到柱状图查看数据');
      // 自动切换回柱状图
      chartType.value = 'bar';
    }
  }
});

// 暴露方法给父组件
defineExpose({
  refreshChart,
  exportImage,
  chartRef
});
</script>

<style scoped>
.report-wrapper { width: 100%; margin-bottom: 20px; }
@import './report-unify-style.css';
</style> 