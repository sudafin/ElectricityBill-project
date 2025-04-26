<template>
  <div class="dashboard">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="18">
        <el-card class="total-card" shadow="never" v-loading="loading">
          <div class="total-card-inner">
            <div class="total-info">
              <h2 class="total-title">当月新增用户总数</h2>
              <p class="total-subtitle">MONTHLY NEW USERS</p>
            </div>
            <div class="total-number">{{ dashboardData.currentMonthlyAddingUserTotal || 0 }}</div>
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
            <h3>对账统计</h3>
            <p>Reconciliation Statistics</p>
          </div>
          <div class="stat-card-body">
            <div class="stat-number">{{ dashboardData.totalReconciliation || 0 }}</div>
            <div class="stat-icon residential-icon">
              <el-icon><Document /></el-icon>
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
            <div class="stat-number">￥{{ dashboardData.currentMonthlyAmountTotal || 0 }}</div>
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
            <div class="stat-number">{{ dashboardData.currentMonthlyElectricityUsageTotal || 0 }}</div>
            <div class="stat-icon talent-icon">
              <el-icon><Stopwatch /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" v-loading="loading">
          <div class="stat-card-header">
            <h3>欠费账单</h3>
            <p>Unpaid bills</p>
          </div>
          <div class="stat-card-body">
            <div class="stat-number">{{ dashboardData.currentMonthlyDebtBillTotal || 0 }}</div>
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
        <el-card class="chart-card" shadow="never" v-loading="loading">
          <template #header>
            <div class="chart-header">
              <h3>用户类型分布</h3>
              <div class="chart-tools">
                <el-radio-group v-model="selectedChartType" size="small" @change="updateChart">
                  <el-radio-button label="pie">饼图</el-radio-button>
                  <el-radio-button label="bar">柱状图</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>
          
          <!-- 用户类型分布图表 -->
          <div ref="userTypeChart" class="main-chart"></div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-card class="chart-card stat-elements" shadow="never" v-loading="loading">
              <template #header>
                <div class="chart-header">
                  <h3>已处理反馈</h3>
                  <p>Processed Feedback</p>
                </div>
              </template>
              <div class="stat-big-number">{{ dashboardData.processedFeedbackCount || 0 }}</div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-card class="chart-card materials-card" shadow="never" v-loading="loading">
              <template #header>
                <div class="chart-header">
                  <h3>待处理反馈</h3>
                  <p>Pending feedback</p>
                </div>
              </template>
              <div class="stat-big-number">{{ dashboardData.unprocessedFeedbackCount || 0 }}</div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="chart-card steps-card" shadow="never" v-loading="loading">
              <template #header>
                <div class="chart-header">
                  <h3>系统日志</h3>
                  <p>System logs</p>
                </div>
              </template>
              <div class="stat-big-number">{{ dashboardData.systemLogCount || 0 }}</div>
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

// 加载状态
const loading = ref(false);
const userTypeChart = ref(null);
const chartInstance = ref(null);
const selectedChartType = ref('pie');

// 仪表盘数据
const dashboardData = ref({
  currentMonthlyAddingUserTotal: 0,
  currentMonthlyElectricityUsageTotal: 0,
  currentMonthlyAmountTotal: 0,
  currentMonthlyDebtBillTotal: 0,
  userTypeMap: {},
  processedFeedbackCount: 0,
  unprocessedFeedbackCount: 0,
  systemLogCount: 0,
  totalReconciliation: 0
});

// 更新图表
const updateChart = () => {
  if (!chartInstance.value || !dashboardData.value.userTypeMap) return;
  
  const userTypeMap = dashboardData.value.userTypeMap;
  const labels = Object.keys(userTypeMap);
  const values = Object.values(userTypeMap);
  
  let option = {};
  
  switch (selectedChartType.value) {
    case 'pie':
      option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: labels
        },
        series: [{
          name: '用户类型',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
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
          labelLine: {
            show: true
          },
          data: labels.map((label, index) => ({
            value: values[index],
            name: label
          }))
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
          data: labels,
          axisLabel: {
            interval: 0,
            rotate: labels.length > 5 ? 30 : 0
          },
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
          name: '用户数量',
          data: values,
          type: 'bar',
          barWidth: '50%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}'
          }
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
    // 使用后端返回的 DashboardVO 数据
    dashboardData.value = res;
    
    // 初始化或更新图表
    nextTick(() => {
      initChart();
    });
    
  } catch (error) {
    console.error('获取仪表盘信息失败:', error);
    ElMessage.error('获取仪表盘信息失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 初始化图表
const initChart = () => {
  if (!userTypeChart.value) return;
  
  if (!chartInstance.value) {
    chartInstance.value = echarts.init(userTypeChart.value);
    // 设置图表响应式
    window.addEventListener('resize', () => {
      chartInstance.value?.resize();
    });
  }
  
  updateChart();
};

// 监听图表类型变化
watch(selectedChartType, () => {
  nextTick(() => {
    updateChart();
  });
});

onMounted(() => {
  fetchDashboardInfo();
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
  overflow: hidden;
  position: relative;
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
  padding-right: 10px;
}

.stat-number {
  font-size: 30px;
  font-weight: 600;
  color: #303133;
  margin-right: 70px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  position: absolute;
  right: 20px;
  bottom: 20px;
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
.chart-area {
  margin-top: 20px;
}

.chart-card {
  border-radius: 8px;
  height: 100%;
  border: none;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.chart-tools {
  display: flex;
  gap: 10px;
}

/* 主图表 */
.main-chart {
  width: 100%;
  height: 400px;
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

:deep(.el-card__header) {
  padding: 10px 15px;
  border-bottom: 1px solid #f0f2f5;
}

:deep(.el-card__body) {
  padding: 15px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .stat-card {
    height: auto;
  }
  
  .chart-tools {
    flex-direction: column;
    gap: 5px;
  }
}
</style> 