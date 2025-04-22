<template>
  <div class="dashboard">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="18">
        <el-card class="total-card" shadow="never" v-loading="loading">
          <div class="total-card-inner">
            <div class="total-info">
              <h2 class="total-title">当前用户总数</h2>
              <p class="total-subtitle">TOTAL NUMBER OF CURRENT USERS</p>
            </div>
            <div class="total-number">{{ totalUsers }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="intro-card" shadow="never">
          <div class="intro-content">
            <h3>系统简介</h3>
            <p>电费管理系统主要用于电费收缴管理，可对用户电力使用情况进行统计、分析，提供数据支持与决策依据，最终实现高效率管理。</p>
            <div class="intro-icons">
              <div class="intro-icon-item"><el-icon><Document /></el-icon></div>
              <div class="intro-icon-item"><el-icon><User /></el-icon></div>
              <div class="intro-icon-item"><el-icon><Key /></el-icon></div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分类统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <div class="stat-card" v-loading="loading">
          <div class="stat-card-header">
            <h3>审批统计</h3>
            <p>Approval statistics</p>
          </div>
          <div class="stat-card-body">
            <div class="stat-number">{{ totalUsers }}</div>
            <div class="stat-icon residential-icon">
              <el-icon><User /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" v-loading="loading">
          <div class="stat-card-header">
            <h3>电费统计</h3>
            <p>Electricity fee statistics</p>
          </div>
          <div class="stat-card-body">
            <div class="stat-number">￥{{ totalIncome }}</div>
            <div class="stat-icon social-icon">
              <el-icon><Wallet /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" v-loading="loading">
          <div class="stat-card-header">
            <h3>用电量统计</h3>
            <p>Power consumption statistics</p>
          </div>
          <div class="stat-card-body">
            <div class="stat-number">{{ totalFees }}</div>
            <div class="stat-icon talent-icon">
              <el-icon><Stopwatch /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" v-loading="loading">
          <div class="stat-card-header">
            <h3>支付账单</h3>
            <p>Payment bills</p>
          </div>
          <div class="stat-card-body">
            <div class="stat-number">{{ abnormalBills }}</div>
            <div class="stat-icon labor-icon">
              <el-icon><Document /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-area">
      <el-col :span="16">
        <el-card class="chart-card" shadow="never" v-loading="userTypesLoading">
          <template #header>
            <div class="chart-header">
              <h3>访问数量统计分析</h3>
            </div>
          </template>
          
          <!-- 水平条形图 -->
          <div class="horizontal-chart">
            <div v-for="(item, index) in accessData" :key="index" class="chart-bar-row">
              <div class="chart-bar-label">{{ item.name }}</div>
              <div class="chart-bar-wrapper">
                <div class="chart-bar" :style="{ width: getBarWidth(item.value) }">
                  <span class="chart-bar-value">{{ item.value }}次</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-card class="chart-card stat-elements" shadow="never" v-loading="loading">
              <template #header>
                <div class="chart-header">
                  <h3>反馈数据</h3>
                  <p>Feedback data</p>
                </div>
              </template>
              <div class="stat-big-number">{{ processedOrders }}</div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-card class="chart-card materials-card" shadow="never" v-loading="loading">
              <template #header>
                <div class="chart-header">
                  <h3>待处理反馈数</h3>
                  <p>Pending feedback</p>
                </div>
              </template>
              <div class="stat-big-number">{{ pendingOrders }}</div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="chart-card steps-card" shadow="never" v-loading="loading">
              <template #header>
                <div class="chart-header">
                  <h3>系统操作日志</h3>
                  <p>System logs</p>
                </div>
              </template>
              <div class="stat-big-number">{{ systemLogs }}</div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { 
  User, Document, Plus, Setting, Key, 
  Wallet, Stopwatch, PieChart, Histogram, TrendCharts
} from '@element-plus/icons-vue';
import { getAdminDashboardInfo } from '@/api/admin/dashboard';
import { getUserGrowthStatistics } from '@/api/admin/statistics';
import { getPaymentMethodDistribution } from '@/api/admin/statistics';

// 加载状态
const loading = ref(false);
const userTypesLoading = ref(false); 
const chartLoading = ref(false);

// 基本统计数据
const totalUsers = ref(0);
const totalFees = ref(0);
const totalIncome = ref(0);
const abnormalBills = ref(0);
const processedOrders = ref(0);
const pendingOrders = ref(0);
const systemLogs = ref(0);
const userTypeData = ref([]);
const accessData = ref([]);

// 图表配置
const mainChart = ref(null);
const chartInstance = ref(null);
const selectedChartType = ref('line');
const selectedDataType = ref('userType');

// 图表数据
const chartData = ref({
  userType: {
    labels: [],
    values: []
  },
  powerUsage: {
    labels: [],
    values: []
  },
  payment: {
    labels: [],
    values: []
  }
});

// 计算条形图宽度
const getBarWidth = (value) => {
  const maxValue = Math.max(...accessData.value.map(item => item.value));
  return (value / maxValue * 100) + '%';
};

// 图表类型切换处理
const handleChartTypeChange = () => {
  updateChart();
};

// 数据类型切换处理
const handleDataTypeChange = () => {
  if (selectedDataType.value === 'powerUsage' && chartData.value.powerUsage.values.length === 0) {
    fetchElectricityData();
  } else if (selectedDataType.value === 'payment' && chartData.value.payment.values.length === 0) {
    fetchPaymentData();
  } else {
    updateChart();
  }
};

// 初始化图表
const initChart = () => {
  if (!mainChart.value) return;
  
  chartInstance.value = echarts.init(mainChart.value);
  
  // 设置图表响应式
  window.addEventListener('resize', () => {
    chartInstance.value?.resize();
  });
  
  updateChart();
};

// 更新图表
const updateChart = () => {
  if (!chartInstance.value) return;
  
  const data = chartData.value[selectedDataType.value];
  let option = {};
  
  switch (selectedChartType.value) {
    case 'line':
      option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: data.labels,
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          }
        },
        series: [{
          data: data.values,
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#1890ff'
          },
          itemStyle: {
            color: '#1890ff'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(24, 144, 255, 0.6)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
            ])
          }
        }]
      };
      break;
      
    case 'bar':
      option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: data.labels,
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          }
        },
        series: [{
          data: data.values,
          type: 'bar',
          barWidth: '50%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          }
        }]
      };
      break;
      
    case 'pie':
      option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: data.labels
        },
        series: [{
          name: selectedDataType.value === 'userType' ? '用户类型' : 
                selectedDataType.value === 'powerUsage' ? '用电量' : '缴费情况',
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
              fontSize: '16',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: data.labels.map((label, index) => ({
            value: data.values[index],
            name: label
          }))
        }]
      };
      break;
  }
  
  chartInstance.value.setOption(option);
};

// 获取仪表盘信息
const fetchDashboardInfo = async () => {
  loading.value = true;
  try {
    const res = await getAdminDashboardInfo();
    totalUsers.value = res.totalUser || 0;
    totalFees.value = res.totalElectricityUsage || 0;
    totalIncome.value = res.totalAmount || 0;
    abnormalBills.value = res.totalPaymentBill || 0;
    processedOrders.value = res.processedFeedbackCount || 0;
    pendingOrders.value = res.unprocessedFeedbackCount || 0;
    systemLogs.value = res.systemLogCount || 0;
    
    // 更新用户类型数据
    if (res.userTypeMap) {
      // 处理用户类型数据
      const userTypeMap = res.userTypeMap;
      userTypeData.value = Object.entries(userTypeMap).map(([name, value]) => ({
        name,
        value
      }));
      
      // 更新图表数据
      chartData.value.userType.labels = Object.keys(userTypeMap);
      chartData.value.userType.values = Object.values(userTypeMap);
      
      updateChart();
    }
    
    // 初始化访问数量数据
    initAccessData();
    
    // 如果有电量使用数据
    if (res.electricityWeekUsageList) {
      const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      chartData.value.powerUsage.labels = days;
      chartData.value.powerUsage.values = res.electricityWeekUsageList;
    }
    
  } catch (error) {
    console.error('获取仪表盘信息失败:', error);
    ElMessage.error('获取仪表盘信息失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 获取用电量数据
const fetchElectricityData = async () => {
  chartLoading.value = true;
  try {
    const res = await getUserGrowthStatistics({ period: 'month' });
    if (res.data && res.data.length) {
      chartData.value.powerUsage.labels = res.data.map(item => item.period);
      chartData.value.powerUsage.values = res.data.map(item => item.usage);
      updateChart();
    }
  } catch (error) {
    console.error('获取用电量数据失败:', error);
    ElMessage.error('获取用电量数据失败，请稍后重试');
  } finally {
    chartLoading.value = false;
  }
};

// 获取缴费情况数据
const fetchPaymentData = async () => {
  chartLoading.value = true;
  try {
    const res = await getPaymentMethodDistribution();
    if (res.data) {
      chartData.value.payment.labels = Object.keys(res.data);
      chartData.value.payment.values = Object.values(res.data);
      updateChart();
    }
  } catch (error) {
    console.error('获取缴费情况数据失败:', error);
    ElMessage.error('获取缴费情况数据失败，请稍后重试');
  } finally {
    chartLoading.value = false;
  }
};

// 初始化访问数量数据
const initAccessData = () => {
  userTypesLoading.value = true;
  try {
    // 模拟访问数量数据
    accessData.value = [
      { name: '今日访问', value: Math.floor(Math.random() * 500 + 300) },
      { name: '昨日访问', value: Math.floor(Math.random() * 450 + 250) },
      { name: '本周访问', value: Math.floor(Math.random() * 2000 + 1500) },
      { name: '本月访问', value: Math.floor(Math.random() * 8000 + 5000) },
      { name: '总访问量', value: Math.floor(Math.random() * 50000 + 30000) }
    ];
  } catch (error) {
    console.error('初始化访问数量数据失败:', error);
  } finally {
    userTypesLoading.value = false;
  }
};

// 监听图表配置变化
watch([selectedChartType, selectedDataType], () => {
  nextTick(() => {
    updateChart();
  });
});

onMounted(() => {
  fetchDashboardInfo();
  nextTick(() => {
    initChart();
  });
});
</script>

<style scoped>
.dashboard {
  padding: 0;
}

/* 总数卡片 */
.total-card {
  background-color: #fff;
  border-radius: 8px;
  height: 100%;
  overflow: hidden;
  border: none;
}

.total-card-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 20px;
}

.total-info {
  flex: 1;
}

.total-title {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.total-subtitle {
  margin: 0;
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
}

.total-number {
  font-size: 52px;
  font-weight: 700;
  color: #409EFF;
  margin-left: 30px;
  min-width: 120px;
  text-align: right;
}

/* 简介卡片 */
.intro-card {
  background-color: #1e90ff;
  color: white;
  height: 100%;
  border-radius: 8px;
  border: none;
}

.intro-content {
  padding: 10px;
}

.intro-content h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
}

.intro-content p {
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 15px;
}

.intro-icons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.intro-icon-item {
  width: 32px;
  height: 32px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 统计卡片样式 */
.stat-cards {
  margin-top: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.stat-card-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.stat-card-header p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.stat-card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.stat-number {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
}

.residential-icon {
  background-color: #4e73df;
}

.social-icon {
  background-color: #1cc88a;
}

.talent-icon {
  background-color: #36b9cc;
}

.labor-icon {
  background-color: #f6c23e;
}

/* 图表区域 */
.chart-card {
  border-radius: 8px;
  height: 100%;
  border: none;
}

.chart-header {
  display: flex;
  flex-direction: column;
}

.chart-header h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 500;
}

.chart-header p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.chart-header-with-tools {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header-with-tools h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.chart-tools {
  display: flex;
  gap: 10px;
}

/* 水平条形图 */
.horizontal-chart {
  padding: 15px;
}

.chart-bar-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.chart-bar-label {
  width: 100px;
  text-align: right;
  padding-right: 15px;
  font-size: 14px;
  color: #606266;
}

.chart-bar-wrapper {
  flex: 1;
  background-color: #f0f2f5;
  height: 30px;
  border-radius: 4px;
  overflow: hidden;
}

.chart-bar {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #53a8ff);
  display: flex;
  align-items: center;
  padding-left: 10px;
  transition: width 0.8s ease;
  min-width: 40px;
}

.chart-bar-value {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

/* 统计卡片 */
.stat-elements, .materials-card, .steps-card {
  height: 130px;
}

.stat-big-number {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70px;
}

.stat-elements .stat-big-number {
  color: #4e73df;
}

.materials-card .stat-big-number {
  color: #1cc88a;
}

.steps-card .stat-big-number {
  color: #f6c23e;
}

/* 主图表 */
.main-chart {
  width: 100%;
  height: 400px;
}

:deep(.el-card__header) {
  padding: 10px 15px;
  border-bottom: 1px solid #f0f2f5;
}

:deep(.el-card__body) {
  padding: 0;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .stat-card {
    height: auto;
  }
  
  .chart-bar-label {
    width: 80px;
    font-size: 12px;
  }
  
  .chart-bar {
    padding-left: 5px;
  }
  
  .chart-bar-value {
    font-size: 12px;
  }
  
  .chart-tools {
    flex-direction: column;
    gap: 5px;
  }
}
</style> 