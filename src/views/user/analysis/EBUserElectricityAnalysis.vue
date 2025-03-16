<template>
  <EBPageLayout>
    <template #header>
      <div class="eb-analysis-header">
        <div class="header-spacer"></div>
        <div class="filter-actions">
          <el-select v-model="selectedYear" placeholder="选择年份" style="width: 120px;" @change="fetchAnalysisData">
            <el-option
              v-for="year in availableYears"
              :key="year"
              :label="year + '年'"
              :value="year"
            ></el-option>
          </el-select>
          
          <el-select v-model="chartType" placeholder="分析类型" style="width: 150px;" @change="updateChartType">
            <el-option label="用电量" value="usage"></el-option>
            <el-option label="电费" value="cost"></el-option>
          </el-select>
          
          <el-button type="primary" @click="fetchAnalysisData" :loading="loading" class="eb-button-with-icon">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
    </template>

    <div class="analysis-container" v-loading="loading">
      <!-- 年度用电概览卡片 -->
      <el-row :gutter="20" class="summary-cards">
        <el-col :span="8">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <div class="card-icon electricity">
                <el-icon><Odometer /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">年度总用电量</div>
                <div class="card-value">{{ summaryData.totalUsage || 0 }} 度</div>
                <div class="card-comparison" :class="getComparisonClass(summaryData.usageYoY)">
                  <span>同比</span>
                  <el-icon v-if="summaryData.usageYoY > 0"><CaretTop /></el-icon>
                  <el-icon v-else-if="summaryData.usageYoY < 0"><CaretBottom /></el-icon>
                  <span>{{ Math.abs(summaryData.usageYoY || 0) }}%</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <div class="card-icon cost">
                <el-icon><Money /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">年度总电费</div>
                <div class="card-value">{{ summaryData.totalCost || 0 }} 元</div>
                <div class="card-comparison" :class="getComparisonClass(summaryData.costYoY)">
                  <span>同比</span>
                  <el-icon v-if="summaryData.costYoY > 0"><CaretTop /></el-icon>
                  <el-icon v-else-if="summaryData.costYoY < 0"><CaretBottom /></el-icon>
                  <span>{{ Math.abs(summaryData.costYoY || 0) }}%</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <div class="card-icon average">
                <el-icon><DataLine /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">平均月用电量</div>
                <div class="card-value">{{ summaryData.averageMonthlyUsage || 0 }} 度</div>
                <div class="card-comparison" :class="getComparisonClass(summaryData.avgUsageYoY)">
                  <span>同比</span>
                  <el-icon v-if="summaryData.avgUsageYoY > 0"><CaretTop /></el-icon>
                  <el-icon v-else-if="summaryData.avgUsageYoY < 0"><CaretBottom /></el-icon>
                  <span>{{ Math.abs(summaryData.avgUsageYoY || 0) }}%</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 月度用电趋势图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <h3>月度{{ chartType === 'usage' ? '用电量' : '电费' }}趋势</h3>
            <div class="chart-actions">
              <el-radio-group v-model="comparisonMode" size="small" @change="updateComparisonMode">
                <el-radio-button label="none">当前年度</el-radio-button>
                <el-radio-button label="lastYear">同比对比</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </template>
        <div class="chart-container">
          <div ref="monthlyChartRef" style="width: 100%; height: 400px;"></div>
        </div>
      </el-card>

      <!-- 用电时段分布 -->
      <el-row :gutter="20" class="distribution-section">
        <el-col :span="12">
          <el-card class="distribution-card">
            <template #header>
              <div class="card-header">
                <h3>用电时段分布</h3>
              </div>
            </template>
            <div class="distribution-chart">
              <div ref="timeDistributionChartRef" style="width: 100%; height: 300px;"></div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card class="distribution-card">
            <template #header>
              <div class="card-header">
                <h3>用电类型分布</h3>
              </div>
            </template>
            <div class="distribution-chart">
              <div ref="typeDistributionChartRef" style="width: 100%; height: 300px;"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 用电分析与建议 -->
      <el-card class="suggestions-card">
        <template #header>
          <div class="card-header">
            <h3>用电分析与节电建议</h3>
          </div>
        </template>
        <div class="suggestions-content">
          <div class="analysis-section">
            <h4>用电分析</h4>
            <ul class="analysis-list">
              <li v-for="(analysis, index) in analysisData.analysis" :key="'analysis-' + index">
                {{ analysis.content }}
              </li>
            </ul>
          </div>
          
          <el-divider></el-divider>
          
          <div class="suggestions-section">
            <h4>节电建议</h4>
            <el-collapse accordion>
              <el-collapse-item 
                v-for="(suggestion, index) in analysisData.suggestions" 
                :key="'suggestion-' + index"
                :title="suggestion.title"
              >
                <div class="suggestion-content">
                  <p>{{ suggestion.content }}</p>
                  <div v-if="suggestion.savingPotential" class="saving-potential">
                    <span>预计每月可节省：</span>
                    <span class="amount">{{ suggestion.savingPotential }}</span>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </el-card>

      <!-- 同类型用户比较 -->
      <el-card class="comparison-card">
        <template #header>
          <div class="card-header">
            <h3>与同类型用户比较</h3>
            <el-tooltip content="数据来源于同区域、同类型用户的平均用电量统计" placement="top">
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
        </template>
        <div class="comparison-content">
          <div ref="comparisonChartRef" style="width: 100%; height: 300px;"></div>
        </div>
      </el-card>
    </div>
  </EBPageLayout>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh, Odometer, Money, DataLine, CaretTop, CaretBottom, InfoFilled } from '@element-plus/icons-vue';
import { EBPageLayout, EBButton } from '@/components';
// 假设这些API函数已经在相应的文件中定义
import { getUserElectricityAnalysis } from '@/api/user';
// 假设已经安装并引入了echarts
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import { LineChart, BarChart, PieChart, GaugeChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必需的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  LineChart,
  BarChart,
  PieChart,
  GaugeChart,
  CanvasRenderer
]);

const loading = ref(false);
const selectedYear = ref(new Date().getFullYear());
const chartType = ref('usage');
const comparisonMode = ref('none');
const monthlyChartRef = ref(null);
const timeDistributionChartRef = ref(null);
const typeDistributionChartRef = ref(null);
const comparisonChartRef = ref(null);

let monthlyChart = null;
let timeDistributionChart = null;
let typeDistributionChart = null;
let comparisonChart = null;

// 可选的年份
const availableYears = [
  selectedYear.value,
  selectedYear.value - 1,
  selectedYear.value - 2
];

// 汇总数据
const summaryData = reactive({
  totalUsage: 0,
  totalCost: 0,
  averageMonthlyUsage: 0,
  usageYoY: 0,
  costYoY: 0,
  avgUsageYoY: 0
});

// 分析数据和建议
const analysisData = reactive({
  analysis: [],
  suggestions: []
});

// 获取同比数据样式类
const getComparisonClass = (value) => {
  if (!value) return '';
  return value > 0 ? 'increase' : 'decrease';
};

// 获取分析数据
const fetchAnalysisData = async () => {
  loading.value = true;
  try {
    const res = await getUserElectricityAnalysis({
      year: selectedYear.value,
      type: chartType.value,
      comparisonMode: comparisonMode.value
    });
    
    // 更新汇总数据
    Object.assign(summaryData, res.data.summary);
    
    // 更新分析和建议
    Object.assign(analysisData, res.data.insights);
    
    // 渲染图表
    nextTick(() => {
      renderMonthlyChart(res.data.monthlyData);
      renderTimeDistributionChart(res.data.timeDistribution);
      renderTypeDistributionChart(res.data.typeDistribution);
      renderComparisonChart(res.data.comparison);
    });
  } catch (error) {
    ElMessage.error('获取用电分析数据失败');
  } finally {
    loading.value = false;
  }
};

// 更新图表类型
const updateChartType = () => {
  fetchAnalysisData();
};

// 更新对比模式
const updateComparisonMode = () => {
  fetchAnalysisData();
};

// 渲染月度趋势图
const renderMonthlyChart = (data) => {
  if (!monthlyChartRef.value) return;
  
  if (monthlyChart === null) {
    monthlyChart = echarts.init(monthlyChartRef.value);
  }
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: comparisonMode.value === 'lastYear'
        ? [`${selectedYear.value}年${chartType.value === 'usage' ? '用电量' : '电费'}`, `${selectedYear.value - 1}年${chartType.value === 'usage' ? '用电量' : '电费'}`]
        : [`${chartType.value === 'usage' ? '用电量' : '电费'}`]
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: `{value} ${chartType.value === 'usage' ? '度' : '元'}`
      }
    },
    series: comparisonMode.value === 'lastYear'
      ? [
          {
            name: `${selectedYear.value}年${chartType.value === 'usage' ? '用电量' : '电费'}`,
            type: 'line',
            data: data.current,
            smooth: true,
            lineStyle: {
              width: 3
            },
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: `${selectedYear.value - 1}年${chartType.value === 'usage' ? '用电量' : '电费'}`,
            type: 'line',
            data: data.lastYear,
            smooth: true,
            lineStyle: {
              width: 3,
              type: 'dashed'
            },
            itemStyle: {
              color: '#E6A23C'
            }
          }
        ]
      : [
          {
            name: `${chartType.value === 'usage' ? '用电量' : '电费'}`,
            type: 'line',
            data: data.current,
            smooth: true,
            areaStyle: {},
            lineStyle: {
              width: 3
            },
            itemStyle: {
              color: '#409EFF'
            }
          }
        ]
  };
  
  monthlyChart.setOption(option);
};

// 渲染用电时段分布图
const renderTimeDistributionChart = (data) => {
  if (!timeDistributionChartRef.value) return;
  
  if (timeDistributionChart === null) {
    timeDistributionChart = echarts.init(timeDistributionChartRef.value);
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '0%',
      left: 'center',
      data: ['凌晨 (0-6点)', '上午 (6-12点)', '下午 (12-18点)', '晚上 (18-24点)']
    },
    series: [
      {
        name: '用电时段',
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
          { value: data.night || 15, name: '凌晨 (0-6点)' },
          { value: data.morning || 20, name: '上午 (6-12点)' },
          { value: data.afternoon || 30, name: '下午 (12-18点)' },
          { value: data.evening || 35, name: '晚上 (18-24点)' }
        ]
      }
    ]
  };
  
  timeDistributionChart.setOption(option);
};

// 渲染用电类型分布图
const renderTypeDistributionChart = (data) => {
  if (!typeDistributionChartRef.value) return;
  
  if (typeDistributionChart === null) {
    typeDistributionChart = echarts.init(typeDistributionChartRef.value);
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '0%',
      left: 'center'
    },
    series: [
      {
        name: '用电类型',
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
        data: Object.keys(data).map(key => ({
          name: key,
          value: data[key]
        }))
      }
    ]
  };
  
  typeDistributionChart.setOption(option);
};

// 渲染同类型用户比较图
const renderComparisonChart = (data) => {
  if (!comparisonChartRef.value) return;
  
  if (comparisonChart === null) {
    comparisonChart = echarts.init(comparisonChartRef.value);
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['您的用电', '同类用户平均']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: `{value} ${chartType.value === 'usage' ? '度' : '元'}`
      }
    },
    yAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    series: [
      {
        name: '您的用电',
        type: 'bar',
        data: data.user,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '同类用户平均',
        type: 'bar',
        data: data.average,
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  };
  
  comparisonChart.setOption(option);
};

// 窗口大小变化时重置图表大小
const handleResize = () => {
  if (monthlyChart) monthlyChart.resize();
  if (timeDistributionChart) timeDistributionChart.resize();
  if (typeDistributionChart) typeDistributionChart.resize();
  if (comparisonChart) comparisonChart.resize();
};

onMounted(() => {
  fetchAnalysisData();
  window.addEventListener('resize', handleResize);
});
</script>

<style scoped>
.eb-analysis-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 5px 0;
}

.header-spacer {
  flex: 1;
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.summary-cards {
  margin-bottom: 20px;
}

.summary-card {
  height: 120px;
  transition: all 0.3s;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.card-icon .el-icon {
  font-size: 30px;
  color: white;
}

.card-icon.electricity {
  background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
}

.card-icon.cost {
  background: linear-gradient(135deg, #E6A23C 0%, #ebb563 100%);
}

.card-icon.average {
  background: linear-gradient(135deg, #409EFF 0%, #79bbff 100%);
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.card-comparison {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.card-comparison.increase {
  color: #F56C6C;
}

.card-comparison.decrease {
  color: #67C23A;
}

.chart-card,
.distribution-card,
.suggestions-card,
.comparison-card {
  margin-bottom: 20px;
}

.chart-header,
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header h3,
.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.distribution-section {
  margin-bottom: 20px;
}

.suggestions-content {
  padding: 10px 0;
}

.analysis-section {
  margin-bottom: 20px;
}

.analysis-section h4,
.suggestions-section h4 {
  font-size: 16px;
  margin: 0 0 15px 0;
  color: #303133;
}

.analysis-list {
  padding-left: 20px;
  margin: 0;
}

.analysis-list li {
  margin-bottom: 10px;
  color: #606266;
  line-height: 1.6;
}

.suggestion-content {
  padding: 10px 0;
}

.suggestion-content p {
  margin: 0 0 10px 0;
  color: #606266;
  line-height: 1.6;
}

.saving-potential {
  color: #67C23A;
  font-weight: 500;
}

.saving-potential .amount {
  font-size: 16px;
  margin-left: 5px;
}

.comparison-content {
  height: 300px;
}

.filter-btn.active-capsule {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-5);
}
</style> 