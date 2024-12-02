<template>
  <div class="report-dashboard">
    <el-card class="filter-card">
      <template #header>
        <div class="header">
          <div class="search-area">
            <div class="search-row">
              <el-date-picker
                v-if="reportType === 'daily'"
                v-model="dateRange"
                type="daterange"
                unlink-panels
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                lang="zh-CN"
                @change="fetchReportData"
                class="filter-date-range"
              >
                <template #prefix>
                  <el-icon><Calendar /></el-icon>
                </template>
              </el-date-picker>
              <el-date-picker
                v-else-if="reportType === 'monthly'"
                v-model="monthRange"
                type="monthrange"
                unlink-panels
                range-separator="至"
                start-placeholder="开始月份"
                end-placeholder="结束月份"
                value-format="YYYY-MM"
                format="YYYY 年 MM 月"
                lang="zh-CN"
                @change="fetchReportData"
                class="filter-date-range"
              >
                <template #prefix>
                  <el-icon><Calendar /></el-icon>
                </template>
              </el-date-picker>
              <el-date-picker
                v-else-if="reportType === 'yearly'"
                v-model="yearRange"
                type="yearrange"
                unlink-panels
                range-separator="至"
                start-placeholder="开始年份"
                end-placeholder="结束年份"
                value-format="YYYY"
                format="YYYY 年"
                lang="zh-CN"
                @change="fetchReportData"
                class="filter-date-range"
              >
                <template #prefix>
                  <el-icon><Calendar /></el-icon>
                </template>
              </el-date-picker>
              <el-radio-group v-model="reportType" @change="handleReportTypeChange">
                <el-radio-button label="daily">日报</el-radio-button>
                <el-radio-button label="monthly">月报</el-radio-button>
                <el-radio-button label="yearly">年报</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="action-buttons">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>搜索
            </el-button>
            <el-button type="success" @click="exportReport">
              <el-icon><Download /></el-icon>导出报表
            </el-button>
            <el-button @click="showDetailTable = !showDetailTable">
              {{ showDetailTable ? '隐藏' : '显示' }}详细数据
            </el-button>
          </div>
        </div>
      </template>

      <!-- 图表区域 -->
      <template v-if="!showDetailTable">
        <el-row :gutter="12" class="chart-container">
          <el-col :span="12">
            <el-card shadow="hover">
              <component 
                :is="currentElectricityUsageComponent" 
                :dailyElectricityUsageOption="dailyElectricityUsageOption"
                :monthlyElectricityUsageOption="monthlyElectricityUsageOption"
                :yearlyElectricityUsageOption="yearlyElectricityUsageOption"
              />
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="hover">
              <component 
                :is="currentFeeAmountComponent" 
                :dailyFeeAmountOption="dailyFeeAmountOption"
                :monthlyFeeAmountOption="monthlyFeeAmountOption"
                :yearlyFeeAmountOption="yearlyFeeAmountOption"
              />
            </el-card>
          </el-col>
        </el-row>
      </template>

      <!-- 详细数据 -->
      <EBReportDetail v-else :reportData="reportData" :loading="loading" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useReportStore } from '@/store/report';
import EBDailyReport from './EBDailyReport.vue';
import EBMonthlyReport from './EBMonthlyReport.vue';
import EBYearlyReport from './EBYearlyReport.vue';
import EBReportDetail from './EBReportDetail.vue';
import { Calendar, Search, Download } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const reportStore = useReportStore();
const loading = ref(false);
const dateRange = ref([]);
const monthRange = ref([]);
const yearRange = ref([]);
const reportType = ref('daily');
const showDetailTable = ref(false);
const reportData = ref([]);

const dailyElectricityUsageOption = ref({
  grid: {
    left: '10%',
    right: '10%',
    bottom: '10%',
    containLabel: true
  },
  title: {
    text: '日用电量统计',
    left: 'center',
    top: 0
  },
  xAxis: {
    type: 'category',
    data: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07']
  },
  yAxis: {
    type: 'value',
    name: '用电量(kWh)'
  },
  series: [
    {
      data: [1200, 1350, 980, 1500, 1100, 1600, 1400],
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
    text: '日费用金额统计',
    left: 'center',
    top: 0
  },
  xAxis: {
    type: 'category',
    data: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07']
  },
  yAxis: {
    type: 'value',
    name: '金额(元)'
  },
  series: [
    {
      data: [600, 675, 490, 750, 550, 800, 700],
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

const monthlyElectricityUsageOption = ref({
  grid: {
    left: '10%',
    right: '10%',
    bottom: '10%',
    containLabel: true
  },
  title: {
    text: '月用电量统计',
    left: 'center',
    top: 0
  },
  xAxis: {
    type: 'category',
    data: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06']
  },
  yAxis: {
    type: 'value',
    name: '用电量(kWh)'
  },
  series: [
    {
      data: [12000, 13500, 9800, 15000, 11000, 16000],
      type: 'bar',
      name: '用电量',
      itemStyle: {
        color: '#67C23A'
      }
    }
  ]
});

const monthlyFeeAmountOption = ref({
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  title: {
    text: '月费用金额统计',
    left: 'center',
    top: 0
  },
  xAxis: {
    type: 'category',
    data: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06']
  },
  yAxis: {
    type: 'value',
    name: '金额(元)'
  },
  series: [
    {
      data: [6000, 6750, 4900, 7500, 5500, 8000],
      type: 'line',
      name: '费用金额',
      smooth: true,
      itemStyle: {
        color: '#E6A23C'
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
              color: 'rgba(230, 162, 60, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(230, 162, 60, 0.1)'
            }
          ]
        }
      }
    }
  ]
});

const yearlyElectricityUsageOption = ref({
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  title: {
    text: '年用电量统计',
    left: 'center',
    top: 0
  },
  xAxis: {
    type: 'category',
    data: ['2020', '2021', '2022', '2023', '2024']
  },
  yAxis: {
    type: 'value',
    name: '用电量(kWh)'
  },
  series: [
    {
      data: [120000, 135000, 98000, 150000, 110000],
      type: 'bar',
      name: '用电量',
      itemStyle: {
        color: '#E6A23C'
      }
    }
  ]
});

const yearlyFeeAmountOption = ref({
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  title: {
    text: '年费用金额统计',
    left: 'center',
    top: 0
  },
  xAxis: {
    type: 'category',
    data: ['2020', '2021', '2022', '2023', '2024']
  },
  yAxis: {
    type: 'value',
    name: '金额(元)'
  },
  series: [
    {
      data: [60000, 67500, 49000, 75000, 55000],
      type: 'line',
      name: '费用金额',
      smooth: true,
      itemStyle: {
        color: '#F56C6C'
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
              color: 'rgba(245, 108, 108, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(245, 108, 108, 0.1)'
            }
          ]
        }
      }
    }
  ]
});

const currentElectricityUsageComponent = computed(() => {
  return reportType.value === 'daily' ? EBDailyReport
    : reportType.value === 'monthly' ? EBMonthlyReport
    : EBYearlyReport;
});

const currentFeeAmountComponent = computed(() => {
  return reportType.value === 'daily' ? EBDailyReport
    : reportType.value === 'monthly' ? EBMonthlyReport
    : EBYearlyReport;
});

const handleSearch = () => {
  fetchReportData();
};

const prevReportType = ref(reportType.value);
const prevDateRange = ref(dateRange.value);
const prevMonthRange = ref(monthRange.value);
const prevYearRange = ref(yearRange.value);

const fetchReportData = async () => {
  if (
    (reportType.value === 'daily' && !dateRange.value) ||
    (reportType.value === 'monthly' && !monthRange.value) ||
    (reportType.value === 'yearly' && !yearRange.value)
  ) {
    return;
  }
  
  if (
    reportType.value === prevReportType.value &&
    (
      (reportType.value === 'daily' && dateRange.value === prevDateRange.value) ||
      (reportType.value === 'monthly' && monthRange.value === prevMonthRange.value) ||
      (reportType.value === 'yearly' && yearRange.value === prevYearRange.value)
    )
  ) {
    return;
  }
  
  loading.value = true;
  try {
    if (reportType.value === 'daily') {
      const [startDate, endDate] = dateRange.value;
      const days = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;
      reportData.value = Array.from({ length: days }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        return {
          date: date.toISOString().slice(0, 10),
          electricityUsage: Math.floor(Math.random() * 1000) + 500,
          feeAmount: Math.floor(Math.random() * 500) + 300
        };
      });
      console.log('Generated daily report data:', reportData.value);
    } else if (reportType.value === 'monthly') {
      const [startMonth, endMonth] = monthRange.value;
      const startDate = new Date(`${startMonth}-01`);
      const endDate = new Date(`${endMonth}-01`);
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth() + 1;
      reportData.value = Array.from({ length: months }, (_, i) => {
        const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        return {
          date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          electricityUsage: Math.floor(Math.random() * 10000) + 5000,
          feeAmount: Math.floor(Math.random() * 5000) + 3000
        };
      });
      console.log('Generated monthly report data:', reportData.value);
    } else if (reportType.value === 'yearly') {
      const [startYear, endYear] = yearRange.value;
      const years = Number(endYear) - Number(startYear) + 1;
      reportData.value = Array.from({ length: years }, (_, i) => {
        const date = new Date(Number(startYear) + i, 0, 1);
        return {
          date: date.getFullYear().toString(),
          electricityUsage: Math.floor(Math.random() * 100000) + 50000,
          feeAmount: Math.floor(Math.random() * 50000) + 30000
        };
      });
      console.log('Generated yearly report data:', reportData.value);
    }
    
    // 更新图表配置
    updateChartOptions();
  } catch (error) {
    console.error('获取报表数据失败:', error);
  } finally {
    loading.value = false;
    prevReportType.value = reportType.value;
    prevDateRange.value = dateRange.value;
    prevMonthRange.value = monthRange.value;
    prevYearRange.value = yearRange.value;
  }
};

const updateChartOptions = () => {
  if (reportType.value === 'daily') {
    dailyElectricityUsageOption.value = {
      ...dailyElectricityUsageOption.value,
      xAxis: {
        type: 'category',
        data: reportData.value.map(item => item.date)
      },
      series: [
        {
          data: reportData.value.map(item => item.electricityUsage),
          type: 'bar'
        }
      ]
    };
    
    dailyFeeAmountOption.value = {
      ...dailyFeeAmountOption.value,
      xAxis: {
        type: 'category',
        data: reportData.value.map(item => item.date)
      },
      series: [
        {
          data: reportData.value.map(item => item.feeAmount),
          type: 'line'
        }
      ]
    };
  } else if (reportType.value === 'monthly') {
    monthlyElectricityUsageOption.value = {
      ...monthlyElectricityUsageOption.value,
      xAxis: {
        type: 'category',
        data: reportData.value.map(item => item.date)
      },
      series: [
        {
          data: reportData.value.map(item => item.electricityUsage),
          type: 'bar'
        }
      ]
    };
    
    monthlyFeeAmountOption.value = {
      ...monthlyFeeAmountOption.value,
      xAxis: {
        type: 'category',
        data: reportData.value.map(item => item.date)
      },
      series: [
        {
          data: reportData.value.map(item => item.feeAmount),
          type: 'line'
        }
      ]
    };
  } else if (reportType.value === 'yearly') {
    yearlyElectricityUsageOption.value = {
      ...yearlyElectricityUsageOption.value,
      xAxis: {
        type: 'category',
        data: reportData.value.map(item => item.date)
      },
      series: [
        {
          data: reportData.value.map(item => item.electricityUsage),
          type: 'bar'
        }
      ]
    };
    
    yearlyFeeAmountOption.value = {
      ...yearlyFeeAmountOption.value,
      xAxis: {
        type: 'category',
        data: reportData.value.map(item => item.date)
      },
      series: [
        {
          data: reportData.value.map(item => item.feeAmount),
          type: 'line'
        }
      ]
    };
  }
};

const handleReportTypeChange = (type) => {
  reportType.value = type;
  fetchReportData();
};

// 初始化数据
onMounted(() => {
  // 设置默认日期范围为最近7天
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  dateRange.value = [
    start.toISOString().split('T')[0],
    end.toISOString().split('T')[0]
  ];
  fetchReportData();
});

// 导出报表
const exportReport = () => {
  // 这里可以实现导出逻辑，比如导出 Excel
  ElMessage.success('报表导出成功');
};
</script>

<style scoped>
.report-dashboard {
  margin: 20px 0px 0 20px;
  padding: 20px;
  background-color: #f5f7fa;
}

.filter-card {
  
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.search-area {
  flex: 1;
  background: transparent;
  padding: 12px 0;
  border-radius: 8px;
  min-width: 0;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  width: 100%;
}

.filter-date-range {
  width: 240px;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  gap: 8px;
  padding: 12px 0;
  flex-shrink: 0;
}

.action-buttons .el-button {
  min-width: 88px;
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
}

.chart-container {
  height: 100%;
  margin: 12px 0;
  display: flex;

}

.chart-card {
  height: 100%;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-bottom: 12px;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chart-header,
.table-header {
  padding: 0;
}

.chart-header h3,
.table-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.table-card {
  margin-top: 12px;
  border-radius: 8px;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: var(--el-fill-color-light);
  font-weight: 600;
  padding: 6px;
}

:deep(.el-table td) {
  padding: 4px 6px;
}

:deep(.el-table__row) {
  transition: all 0.3s ease;
}

:deep(.el-table__row:hover) {
  background-color: var(--el-fill-color-lighter) !important;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .header {
    flex-direction: column;
  }
  
  .filter-date-range {
    width: 100%;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: flex-end;
  }
  
  .el-row {
    margin: 0 !important;
  }
  
  .el-col {
    padding: 0 !important;
    margin-bottom: 20px;
  }
}

/* 调整卡片内边距 */
:deep(.el-card__header) {
  padding: 8px 12px;
  min-height: 40px;
}

:deep(.el-card__body) {
  padding: 12px;
  height: calc(100% - 40px); /* 减去header高度 */
  display: flex;
  flex-direction: column;
}

/* 确保图表容器高度一致 */
:deep(.echarts) {
  width: 100% !important;
  height: 100% !important;
  min-height: 300px;
}

.el-radio-group {
  margin-left: 12px;
}
</style> 