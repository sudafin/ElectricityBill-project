<template>
  <div class="report-dashboard">
    <el-card class="admin-card">
      <template #header>
        <div class="header">
          <div class="title-area">
            <h3 class="header-title">
              <el-icon><DataAnalysis /></el-icon>
              数据报表
            </h3>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD HH:mm:ss"
              @change="fetchReportData"
              class="filter-date-range"
            >
              <template #prefix>
                <el-icon><Calendar /></el-icon>
              </template>
            </el-date-picker>
          </div>
          <div class="toolbar-area">
            <el-button type="primary" class="toolbar-button" @click="downloadData">
              <el-icon size="18"><Download /></el-icon>
              <span>下载数据</span>
            </el-button>
            <el-button type="success" class="toolbar-button" @click="exportImage">
              <el-icon size="18"><Picture /></el-icon>
              <span>导出图表</span>
            </el-button>
            <el-button type="warning" class="toolbar-button" @click="refreshChart">
              <el-icon size="18"><Refresh /></el-icon>
              <span>刷新</span>
            </el-button>
          </div>
        </div>
      </template>

      <!-- 选项卡导航 -->
      <el-tabs v-model="activeTabName" type="card" class="demo-tabs">
        <el-tab-pane label="电量统计" name="electricity">
          <EBPeriodReport 
            contentType="electricity"
            :dailyElectricityUsageOption="dailyElectricityUsageOption"
            :loading="loading"
            ref="electricityReportRef"
          />
        </el-tab-pane>
        
        <el-tab-pane label="电费统计" name="fee">
          <EBPeriodReport 
            contentType="fee"
            :dailyFeeAmountOption="dailyFeeAmountOption"
            :loading="loading"
            ref="feeReportRef"
          />
        </el-tab-pane>
        
        <el-tab-pane label="区域统计" name="region">
          <EBRegionReport 
            :loading="loading" 
            ref="regionReportRef" 
          />
        </el-tab-pane>
        
        <el-tab-pane label="反馈信息统计" name="feedback">
          <EBFeedbackReport 
            :feedbackData="feedbackData" 
            ref="feedbackReportRef"
          />
        </el-tab-pane>
        
        <el-tab-pane label="对账审批统计" name="reconciliation">
          <EBReconciliationReport 
            :reconciliationData="reconciliationData" 
            ref="reconciliationReportRef"
          />
        </el-tab-pane>
        
        <el-tab-pane label="用户类型分析" name="userType">
          <EBUserTypeReport 
            :userData="userData" 
            ref="userTypeReportRef"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import EBPeriodReport from './EBPeriodReport.vue';
import EBFeedbackReport from './EBFeedbackReport.vue';
import EBReconciliationReport from './EBReconciliationReport.vue';
import EBUserTypeReport from './EBUserTypeReport.vue';
import EBRegionReport from './EBRegionReport.vue';
import { Calendar, Search, Download, DataAnalysis, Picture, Refresh } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getReportData, getReportExcel } from '@/api/admin/report.js';

const loading = ref(false);
const dateRange = ref([]);
const reportData = ref([]);
const activeTabName = ref('electricity'); // 默认显示电量统计

// 各个报表组件的引用
const electricityReportRef = ref(null);
const feeReportRef = ref(null);
const regionReportRef = ref(null);
const feedbackReportRef = ref(null);
const reconciliationReportRef = ref(null);
const userTypeReportRef = ref(null);

// 记录上一次的日期范围（为了避免重复加载数据）
const prevDateRange = ref(dateRange.value);

// 模拟数据
const feedbackData = ref([]);
const reconciliationData = ref([]);
const userData = ref([]);

// 获取当前活动的图表组件引用
const getActiveChartRef = () => {
  const refMap = {
    'electricity': electricityReportRef,
    'fee': feeReportRef,
    'region': regionReportRef,
    'feedback': feedbackReportRef,
    'reconciliation': reconciliationReportRef,
    'userType': userTypeReportRef
  };
  
  return refMap[activeTabName.value]?.value?.chartRef;
};

// 刷新图表
const refreshChart = () => {
  const chartRef = getActiveChartRef();
  if (chartRef?.value?.refreshChart) {
    chartRef.value.refreshChart();
    ElMessage.success('图表已刷新');
  } else {
    ElMessage.warning('无法刷新当前图表');
  }
};

// 下载数据
const downloadData = () => {
  const chartRef = getActiveChartRef();
  if (chartRef?.value?.downloadData) {
    chartRef.value.downloadData();
  } else {
    ElMessage.warning('无法下载当前数据');
  }
};

// 导出图片
const exportImage = () => {
  const chartRef = getActiveChartRef();
  if (chartRef?.value?.exportImage) {
    chartRef.value.exportImage();
  } else {
    ElMessage.warning('无法导出当前图表');
  }
};

// 生成模拟数据
const generateMockData = () => {
  // 模拟反馈数据
  feedbackData.value = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    type: ['complaint', 'suggestion', 'question', 'praise', 'other'][Math.floor(Math.random() * 5)],
    status: ['pending', 'processing', 'processed', 'closed'][Math.floor(Math.random() * 4)],
    date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }));
  
  // 模拟对账数据
  reconciliationData.value = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    status: ['待审批', '通过', '拒绝', '退回', '暂缓'][Math.floor(Math.random() * 5)],
    date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }));
  
  // 模拟用户数据
  userData.value = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    type: ['居民用户', '商业用户', '工业用户', '农业用户', '其他用户'][Math.floor(Math.random() * 5)],
    electricityUsage: Math.floor(Math.random() * 5000),
    feeAmount: Math.floor(Math.random() * 2000)
  }));
};

const dailyElectricityUsageOption = ref({
  grid: {
    left: '10%',
    right: '10%',
    bottom: '10%',
    containLabel: true
  },
  title: {
    text: '用电量统计',
    left: 'center',
    top: 0
  },
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value',
    name: '用电量(kWh)'
  },
  series: [
    {
      data: [],
      type: 'bar',
      name: '用电量',
      itemStyle: {
        color: '#409EFF'
      }
    }
  ]
});

const dailyFeeAmountOption = ref({
  grid: {
    left: '10%',
    right: '10%',
    bottom: '10%',
    containLabel: true
  },
  title: {
    text: '电费统计',
    left: 'center',
    top: 0
  },
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value',
    name: '金额(元)'
  },
  series: [
    {
      data: [],
      type: 'line',
      name: '费用金额',
      smooth: true,
      itemStyle: {
        color: '#67C23A'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: 'rgba(103, 194, 58, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(103, 194, 58, 0.1)'
            }
          ]
        }
      }
    }
  ]
});

//获取报表数据
const fetchReportData = async () => {
  // 如果日期范围为空，则返回
  if (!dateRange.value) {
    return;
  }
  
  // 如果日期范围与上一次相同，则返回
  if (dateRange.value === prevDateRange.value) {
    return;
  }
  
  // 加载中
  loading.value = true;
  try {
    // 获取日期范围
    const [startDate, endDate] = dateRange.value;
    // 从后端生成报表数据
    const res = await getReportData('daily', startDate, endDate);
    reportData.value = res;
    
    // 更新图表配置
    updateChartOptions();
    
    // 更新上一次的参数
    prevDateRange.value = dateRange.value;
  } catch (error) {
    console.error('获取报表数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 更新图表配置
const updateChartOptions = () => {
  // 确保有数据
  if (!reportData.value || !reportData.value.length) return;
  
  // 提取日期和值
  const dates = reportData.value.map(item => item.date);
  const usageValues = reportData.value.map(item => item.electricity_usage);
  const feeValues = reportData.value.map(item => item.fee_amount);
  
  // 更新电量图表
  dailyElectricityUsageOption.value.xAxis.data = dates;
  dailyElectricityUsageOption.value.series[0].data = usageValues;
  
  // 更新电费图表
  dailyFeeAmountOption.value.xAxis.data = dates;
  dailyFeeAmountOption.value.series[0].data = feeValues;
};

onMounted(() => {
  // 设置默认日期范围为最近7天
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  // 将日期范围设置为默认值 YYYY-MM-DD HH:mm:ss
  dateRange.value = [
    start.toISOString().split('T')[0] + ' 00:00:00',
    end.toISOString().split('T')[0] + ' 23:59:59'
  ];
  
  // 获取报表数据
  fetchReportData();
  
  // 生成模拟数据供图表使用
  generateMockData();
});
</script>

<style scoped>
@import '@/styles/admin-card.scss';

.report-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.filter-date-range {
  width: 300px;
}

.toolbar-area {
  display: flex;
  gap: 10px;
}

.toolbar-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s;
}

.toolbar-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 选项卡样式 */
.demo-tabs {
  margin-top: 20px;
  width: 100%;
}

:deep(.el-tabs__content) {
  width: 100%;
  overflow: visible;
}

:deep(.el-tab-pane) {
  width: 100%;
  padding: 10px 0;
}

:deep(.el-tabs__header) {
  margin-bottom: 12px;
}

:deep(.el-tabs__item) {
  font-size: 14px;
  color: #606266;
  height: 36px;
  line-height: 36px;
}

:deep(.el-tabs__item.is-active) {
  color: #409EFF;
  font-weight: bold;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .title-area {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }
  
  .filter-date-range {
    width: 100%;
  }
  
  .toolbar-area {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 