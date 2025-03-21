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
import { getYearlyAnalysis, getElectricityComparison } from '@/api/user/analysis';
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
const summaryData = ref({
  totalUsage: 0,
  totalCost: 0,
  averageMonthlyUsage: 0,
  usageYoY: 0,
  costYoY: 0,
  avgUsageYoY: 0
});

// 分析数据
const analysisData = ref({
  analysis: [],
  suggestions: []
});

// 获取分析数据
const fetchAnalysisData = async () => {
  loading.value = true;
  
  try {
    // 获取年度用电分析数据
    const params = { year: selectedYear.value };
    const response = await getYearlyAnalysis(params);
    
    if (response.data) {
      const data = response.data;
      
      // 更新汇总数据
      summaryData.value = data.summary;
      
      // 更新分析和建议
      analysisData.value = {
        analysis: data.analysis || [],
        suggestions: data.suggestions || []
      };
      
      // 等待DOM更新后初始化图表
      await nextTick();
      
      // 初始化月度趋势图
      initMonthlyChart(data.monthlyData);
      
      // 初始化用电时段分布图
      initTimeDistributionChart(data.timeDistribution);
      
      // 初始化用电类型分布图
      initTypeDistributionChart(data.typeDistribution);
      
      // 初始化用户对比图
      initComparisonChart(data.comparison);
    } else {
      ElMessage.warning('未找到分析数据');
    }
  } catch (error) {
    console.error('获取分析数据失败:', error);
    ElMessage.error('获取分析数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 更新图表类型
const updateChartType = () => {
  if (monthlyChart) {
    const option = monthlyChart.getOption();
    option.series[0].name = chartType.value === 'usage' ? '用电量' : '电费';
    option.yAxis[0].name = chartType.value === 'usage' ? '用电量 (度)' : '电费 (元)';
    
    if (comparisonMode.value === 'lastYear') {
      option.series[1].name = chartType.value === 'usage' ? '去年用电量' : '去年电费';
    }
    
    monthlyChart.setOption(option);
  }
};

// 更新比较模式
const updateComparisonMode = async () => {
  if (comparisonMode.value === 'lastYear' && !monthlyChart) return;
  
  try {
    if (comparisonMode.value === 'lastYear') {
      loading.value = true;
      
      // 获取对比数据
      const params = {
        year: selectedYear.value,
        prevYear: selectedYear.value - 1
      };
      
      const response = await getElectricityComparison(params);
      
      if (response.data && response.data.comparison) {
        const data = response.data.comparison;
        updateMonthlyChartWithComparison(data);
      }
    } else {
      // 移除对比数据
      const option = monthlyChart.getOption();
      option.series = [option.series[0]];
      option.legend.data = [option.legend.data[0]];
      monthlyChart.setOption(option);
    }
  } catch (error) {
    console.error('获取对比数据失败:', error);
    ElMessage.error('获取对比数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 初始化月度趋势图
const initMonthlyChart = (data) => {
  if (!monthlyChartRef.value) return;
  
  if (!monthlyChart) {
    monthlyChart = echarts.init(monthlyChartRef.value);
  }
  
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const currentYearData = data?.current || Array(12).fill(0);
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: [chartType.value === 'usage' ? '用电量' : '电费']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: months
    },
    yAxis: {
      type: 'value',
      name: chartType.value === 'usage' ? '用电量 (度)' : '电费 (元)'
    },
    series: [
      {
        name: chartType.value === 'usage' ? '用电量' : '电费',
        type: 'line',
        data: currentYearData,
        smooth: true,
        lineStyle: {
          width: 3
        },
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        }
      }
    ]
  };
  
  monthlyChart.setOption(option);
  
  // 窗口大小改变时重新渲染图表
  window.addEventListener('resize', () => {
    monthlyChart.resize();
  });
};

// 更新月度趋势图添加对比数据
const updateMonthlyChartWithComparison = (data) => {
  if (!monthlyChart) return;
  
  const lastYearData = data?.lastYear || Array(12).fill(0);
  const option = monthlyChart.getOption();
  
  option.legend.data.push(chartType.value === 'usage' ? '去年用电量' : '去年电费');
  option.series.push({
    name: chartType.value === 'usage' ? '去年用电量' : '去年电费',
    type: 'line',
    data: lastYearData,
    smooth: true,
    lineStyle: {
      width: 3,
      type: 'dashed'
    },
    itemStyle: {
      color: '#909399'
    }
  });
  
  monthlyChart.setOption(option);
};

// 初始化用电时段分布图
const initTimeDistributionChart = (data) => {
  if (!timeDistributionChartRef.value) return;
  
  if (!timeDistributionChart) {
    timeDistributionChart = echarts.init(timeDistributionChartRef.value);
  }
  
  const formattedData = [];
  for (const [key, value] of Object.entries(data)) {
    let name = key;
    switch (key) {
      case 'peak':
        name = '峰时';
        break;
      case 'valley':
        name = '谷时';
        break;
      case 'flat':
        name = '平时';
        break;
      default:
        name = key;
    }
    
    formattedData.push({
      name,
      value
    });
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: formattedData.map(item => item.name)
    },
    series: [
      {
        name: '用电时段',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
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
        data: formattedData,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        }
      }
    ]
  };
  
  timeDistributionChart.setOption(option);
  
  window.addEventListener('resize', () => {
    timeDistributionChart.resize();
  });
};

// 初始化用电类型分布图
const initTypeDistributionChart = (data) => {
  if (!typeDistributionChartRef.value) return;
  
  if (!typeDistributionChart) {
    typeDistributionChart = echarts.init(typeDistributionChartRef.value);
  }
  
  const formattedData = [];
  for (const [key, value] of Object.entries(data)) {
    formattedData.push({
      name: key,
      value
    });
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: formattedData.map(item => item.name)
    },
    series: [
      {
        name: '用电类型',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: formattedData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  
  typeDistributionChart.setOption(option);
  
  window.addEventListener('resize', () => {
    typeDistributionChart.resize();
  });
};

// 初始化用户对比图
const initComparisonChart = (data) => {
  if (!comparisonChartRef.value) return;
  
  if (!comparisonChart) {
    comparisonChart = echarts.init(comparisonChartRef.value);
  }
  
  const userUsage = data?.userUsage || 0;
  const averageUsage = data?.averageUsage || 0;
  const percentile = data?.percentile || 50;
  
  const option = {
    tooltip: {
      formatter: '{a} <br/>{b} : {c}度'
    },
    series: [
      {
        name: '用电对比',
        type: 'gauge',
        detail: { formatter: '{value}%' },
        data: [{ value: percentile, name: '百分位数' }],
        axisLine: {
          lineStyle: {
            width: 30,
            color: [
              [0.3, '#67C23A'],
              [0.7, '#E6A23C'],
              [1, '#F56C6C']
            ]
          }
        },
        pointer: {
          itemStyle: {
            color: 'auto'
          }
        },
        title: {
          fontSize: 14
        },
        detail: {
          fontSize: 20,
          formatter: '{value}%',
          offsetCenter: [0, '60%']
        }
      }
    ]
  };
  
  comparisonChart.setOption(option);
  
  window.addEventListener('resize', () => {
    comparisonChart.resize();
  });
};

// 获取同比变化率的样式类
const getComparisonClass = (yoyValue) => {
  if (!yoyValue) return '';
  
  // 根据不同的指标，判断增加是好还是坏
  if (chartType.value === 'usage') {
    // 用电量减少为好
    return yoyValue < 0 ? 'comparison-good' : 'comparison-bad';
  } else {
    // 电费减少为好
    return yoyValue < 0 ? 'comparison-good' : 'comparison-bad';
  }
};

// 初始化
onMounted(() => {
  fetchAnalysisData();
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