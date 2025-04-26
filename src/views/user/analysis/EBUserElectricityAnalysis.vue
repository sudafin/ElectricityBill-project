<template>
  <div class="electricity-analysis-page">
    <!-- 标题栏 -->
    <div class="page-header">
      <h2>用电分析</h2>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-card">
      <div class="stats-item">
        <div class="stats-value">{{ totalUsage }} <span class="unit">度</span></div>
        <div class="stats-label">月总用电量</div>
      </div>
      <div class="divider"></div>
      <div class="stats-item">
        <div class="stats-value">{{ totalCost }} <span class="unit">元</span></div>
        <div class="stats-label">月总电费</div>
      </div>
      <div class="divider"></div>
      <div class="stats-item">
        <div class="stats-value">{{ avgDailyUsage }} <span class="unit">度</span></div>
        <div class="stats-label">日均用电量</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-container">
      <div class="chart-title">
        <span>最近30天用电量</span>
        <el-button type="primary" size="small" plain @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
      <div class="chart-content">
        <div ref="chartRef" class="usage-chart"></div>
      </div>
    </div>

    <!-- 数据列表 -->
    <div class="data-list-container">
      <div class="list-title">用电记录</div>
      <div class="list-header">
        <div class="header-item date">日期</div>
        <div class="header-item usage">用电量(度)</div>
        <div class="header-item cost">电费(元)</div>
      </div>
      <div class="list-content" v-loading="loading">
        <template v-if="dailyData.length > 0">
          <div 
            v-for="item in dailyData" 
            :key="item.date" 
            class="list-item"
          >
            <div class="item-date">{{ formatDate(item.date) }}</div>
            <div class="item-usage">{{ item.usage }}</div>
            <div class="item-cost">{{ item.cost }}</div>
          </div>
        </template>
        <div v-else class="empty-data">
          <el-empty description="暂无数据" :image-size="80"></el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  MarkLineComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必需的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  MarkLineComponent,
  LineChart,
  CanvasRenderer
]);

const loading = ref(false);
const chartRef = ref(null);
let usageChart = null;

// 模拟数据 - 最近30天的用电量和电费数据
const dailyData = ref([]);

// 计算总用电量
const totalUsage = computed(() => {
  return dailyData.value.reduce((sum, item) => sum + item.usage, 0).toFixed(1);
});

// 计算总电费
const totalCost = computed(() => {
  return dailyData.value.reduce((sum, item) => sum + item.cost, 0).toFixed(2);
});

// 计算日均用电量
const avgDailyUsage = computed(() => {
  if (dailyData.value.length === 0) return '0.0';
  return (dailyData.value.reduce((sum, item) => sum + item.usage, 0) / dailyData.value.length).toFixed(1);
});

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

// 生成随机示例数据
const generateMockData = () => {
  const result = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // 模拟用电量 - 周末略高于工作日
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseUsage = isWeekend ? 5.5 : 4.5;
    const usage = +(baseUsage + Math.random() * 2).toFixed(1);
    
    // 电费按0.6元/度计算
    const cost = +(usage * 0.6).toFixed(2);
    
    result.push({
      date: date.toISOString().split('T')[0],
      usage,
      cost
    });
  }
  
  // 按日期从旧到新排序
  return result.reverse();
};

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;
  
  if (!usageChart) {
    usageChart = echarts.init(chartRef.value);
  }
  
  const dates = dailyData.value.map(item => formatDate(item.date));
  const usages = dailyData.value.map(item => item.usage);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const data = params[0];
        return `${data.name}<br />用电量: ${data.value} 度`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        fontSize: 10,
        interval: 'auto'
      }
    },
    yAxis: {
      type: 'value',
      name: '用电量(度)',
      nameTextStyle: {
        padding: [0, 0, 0, 0],
        fontSize: 10
      },
      axisLabel: {
        fontSize: 10
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        type: 'slider',
        show: true,
        height: 20,
        bottom: 0,
        start: 0,
        end: 100
      }
    ],
    series: [
      {
        name: '用电量',
        type: 'line',
        sampling: 'average',
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.4)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        },
        data: usages,
        markLine: {
          symbol: 'none',
          lineStyle: {
            color: '#E6A23C',
            type: 'dashed'
          },
          data: [
            {
              name: '日均线',
              type: 'average',
              label: {
                formatter: '日均: {c} 度',
                position: 'end'
              }
            }
          ]
        }
      }
    ]
  };
  
  usageChart.setOption(option);
  
  // 窗口大小改变时重新渲染图表
  window.addEventListener('resize', () => {
    usageChart.resize();
  });
};

// 加载数据
const fetchData = async () => {
  loading.value = true;
  
  try {
    // 实际项目中应该调用API获取数据
    // 这里使用模拟数据进行演示
    await new Promise(resolve => setTimeout(resolve, 800));
    dailyData.value = generateMockData();
    
    // 初始化图表
    initChart();
  } catch (error) {
    console.error('获取用电数据失败:', error);
    ElMessage.error('获取用电数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 刷新数据
const refreshData = () => {
  fetchData();
};

// 组件挂载时初始化
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.electricity-analysis-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  padding-bottom: 20px;
}

.page-header {
  padding: 16px;
  background-color: #fff;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

/* 统计卡片 */
.stats-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-radius: 8px;
  margin: 0 16px 16px;
  padding: 16px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

.stats-item {
  flex: 1;
  text-align: center;
}

.divider {
  width: 1px;
  height: 40px;
  background-color: #ebeef5;
}

.stats-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stats-label {
  font-size: 12px;
  color: #909399;
}

.unit {
  font-size: 12px;
  font-weight: normal;
  color: #909399;
}

/* 图表区域 */
.chart-container {
  background-color: #fff;
  border-radius: 8px;
  margin: 0 16px 16px;
  padding: 16px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

.chart-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.chart-content {
  position: relative;
}

.usage-chart {
  height: 260px;
  width: 100%;
}

/* 数据列表 */
.data-list-container {
  background-color: #fff;
  border-radius: 8px;
  margin: 0 16px;
  padding: 16px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

.list-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
}

.list-header {
  display: flex;
  padding: 10px 0;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
}

.list-item {
  display: flex;
  padding: 12px 0;
  font-size: 14px;
  color: #606266;
  border-bottom: 1px solid #f0f2f5;
}

.list-item:last-child {
  border-bottom: none;
}

.header-item, .item-date, .item-usage, .item-cost {
  flex: 1;
  text-align: center;
}

.header-item.date, .item-date {
  flex: 1.2;
  text-align: left;
}

.empty-data {
  padding: 30px 0;
  display: flex;
  justify-content: center;
}
</style> 