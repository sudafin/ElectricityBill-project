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
            <div class="item-usage">{{ item.consumption }}</div>
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
// 导入电量分析相关API
import { getElectricityStatistics, getDailyElectricityUsage} from '@/api/user/electricity';

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

// 存储用电数据
const dailyData = ref([]);
// 存储统计数据
const statisticsData = ref({
  totalConsumption: 0,
  totalCost: 0,
  dailyAvgConsumption: 0
});

// 独立 loading 状态
const statisticsLoading = ref(false);
const dailyLoading = ref(false);

// 计算总用电量
const totalUsage = computed(() => {
  // 优先使用API返回的统计数据
  if (statisticsData.value.totalConsumption) {
    return statisticsData.value.totalConsumption.toFixed(1);
  }
  // 如果没有统计数据，从每日数据中计算
  return dailyData.value.reduce((sum, item) => sum + (item.consumption || 0), 0).toFixed(1);
});

// 计算总电费
const totalCost = computed(() => {
  // 优先使用API返回的统计数据
  if (statisticsData.value.totalCost) {
    return statisticsData.value.totalCost.toFixed(2);
  }
  // 如果没有统计数据，从每日数据中计算
  return dailyData.value.reduce((sum, item) => sum + (item.cost || 0), 0).toFixed(2);
});

// 计算日均用电量
const avgDailyUsage = computed(() => {
  // 优先使用API返回的统计数据
  if (statisticsData.value.dailyAvgConsumption) {
    return statisticsData.value.dailyAvgConsumption.toFixed(1);
  }
  // 如果没有统计数据，从每日数据中计算
  if (dailyData.value.length === 0) return '0.0';
  return (dailyData.value.reduce((sum, item) => sum + (item.consumption || 0), 0) / dailyData.value.length).toFixed(1);
});
      
// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

// 初始化图表
const initChart = () => {
  console.log('initChart被调用，DOM元素存在:', !!chartRef.value);
  if (!chartRef.value) {
    console.error('图表DOM元素不存在');
    return;
  }
  
  console.log('日期数据:', dailyData.value.map(item => item.date));
  console.log('用电量数据:', dailyData.value.map(item => item.consumption));
  
  if (!usageChart) {
    console.log('创建新的echarts实例');
    usageChart = echarts.init(chartRef.value);
    window.addEventListener('resize', () => {
      if (usageChart) usageChart.resize();
    });
  } else {
    console.log('使用现有echarts实例');
  }
  
  const dates = dailyData.value.map(item => formatDate(item.date));
  const usages = dailyData.value.map(item => item.consumption);
  
  console.log('格式化后的日期:', dates);
  console.log('用电量数据:', usages);
  
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
  
  console.log('设置echarts option');
  usageChart.setOption(option);
  console.log('图表初始化完成');
};

// 优化后的 fetchStatisticsData
const fetchStatisticsData = async (isRetry = false) => {
  const TIMEOUT_DURATION = 12000;
  statisticsLoading.value = true;
  try {
    console.log('开始请求电量统计数据...');
    const statisticsPromise = getElectricityStatistics({
      days: 30
    });
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('请求超时')), TIMEOUT_DURATION);
    });
    const statisticsResponse = await Promise.race([statisticsPromise, timeoutPromise]);
    
    console.log('获取到统计数据响应:', JSON.stringify(statisticsResponse));
    
    // 检查响应是否有效（直接使用后端返回的数据结构）
    if (statisticsResponse && typeof statisticsResponse === 'object') {
      // 根据实际后端返回格式处理数据
      const responseData = statisticsResponse.code === 200 ? statisticsResponse.data : statisticsResponse;
      console.log('解析统计数据:', responseData);
      
      // 更新统计数据，确保每个值都存在，否则默认为0
      statisticsData.value = {
        totalConsumption: responseData.totalConsumption || 0,
        totalCost: responseData.totalCost || 0,
        dailyAvgConsumption: responseData.dailyAvgConsumption || 0
      };
      
      console.log('设置统计数据成功:', statisticsData.value);
    } else {
      console.error('统计数据响应无效:', statisticsResponse);
      ElMessage.error('获取电量统计数据失败');
    }
  } catch (error) {
    console.error('fetchStatisticsData error:', error);
    if (error.message === '请求超时' && !isRetry) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchStatisticsData(true);
    } else {
      ElMessage.error(isRetry ? '获取统计数据重试失败' : '获取统计数据超时，请稍后重试');
    }
  } finally {
    statisticsLoading.value = false;
  }
};

// 优化后的 fetchDailyUsageData
const fetchDailyUsageData = async (isRetry = false) => {
  const TIMEOUT_DURATION = 12000;
  dailyLoading.value = true;
  try {
    console.log('开始请求每日用电记录...');
    const dailyPromise = getDailyElectricityUsage({
      days: 30
    });
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('请求超时')), TIMEOUT_DURATION);
    });
    const dailyResponse = await Promise.race([dailyPromise, timeoutPromise]);
    
    console.log('获取到每日数据响应:', JSON.stringify(dailyResponse));
    
    // 检查响应是否有效（直接使用后端返回的数据结构）
    if (dailyResponse && typeof dailyResponse === 'object') {
      // 根据实际后端返回格式处理数据
      const responseData = dailyResponse.code === 200 ? dailyResponse.data : dailyResponse;
      console.log('解析每日数据:', responseData);
      
      // 判断是否包含dailyUsage数组
      if (responseData.dailyUsage && Array.isArray(responseData.dailyUsage)) {
        console.log('每日用电记录条数:', responseData.dailyUsage.length);
        
        // 确保数据完整
        dailyData.value = responseData.dailyUsage.map(item => ({
          date: item.date,
          consumption: item.consumption || 0,
          cost: item.cost || 0,
          timeSharing: item.timeSharing || {}
        }));
        
        console.log('设置每日数据成功，第一条:', dailyData.value[0]);
        
        // 初始化图表前检查dom元素
        if (chartRef.value) {
          console.log('开始初始化图表...');
          initChart();
        } else {
          console.error('图表DOM元素不存在，无法初始化图表');
        }
      } else {
        console.error('每日用电记录数据格式不正确:', responseData);
        ElMessage.warning('每日用电记录数据格式不正确');
      }
    } else {
      console.error('每日数据响应无效:', dailyResponse);
      ElMessage.error('获取每日用电记录失败');
    }
  } catch (error) {
    console.error('fetchDailyUsageData error:', error);
    if (error.message === '请求超时' && !isRetry) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchDailyUsageData(true);
    } else {
      ElMessage.error(isRetry ? '获取用电记录重试失败' : '获取用电记录超时，请稍后重试');
    }
  } finally {
    dailyLoading.value = false;
  }
};

// 优化 fetchData，顺序 await，增加全局 catch
const fetchData = async () => {
  loading.value = true;
  try {
    await fetchStatisticsData();
    await fetchDailyUsageData();
  } catch (error) {
    console.error('fetchData global error:', error);
    ElMessage.error('获取用电数据失败，请刷新页面重试');
  } finally {
    loading.value = false;
  }
};

// 刷新数据
const refreshData = () => {
  // 使用合并API获取数据
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