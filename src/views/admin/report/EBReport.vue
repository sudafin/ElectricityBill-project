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
                value-format="YYYY-MM-DD HH:mm:ss"
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
                value-format="YYYY-MM-DD HH:mm:ss"
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
                value-format="YYYY-MM-DD HH:mm:ss"
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
                <el-radio-button :value="'daily'">日报</el-radio-button>
                <el-radio-button :value="'monthly'">月报</el-radio-button>
                <el-radio-button :value="'yearly'">年报</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="action-buttons">
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
import EBDailyReport from './EBDailyReport.vue';
import EBMonthlyReport from './EBMonthlyReport.vue';
import EBYearlyReport from './EBYearlyReport.vue';
import EBReportDetail from './EBReportDetail.vue';
import { Calendar, Search, Download } from '@element-plus/icons-vue';
import { ElMessage,ElMessageBox } from 'element-plus';
import { getReportData, getReportExcel } from '@/api/report.js';

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
    text: '日费用金额统计',
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

//根据报表类型选择对应的组件
const currentElectricityUsageComponent = computed(() => {
  return reportType.value === 'daily' ? EBDailyReport
    : reportType.value === 'monthly' ? EBMonthlyReport
    : EBYearlyReport;
});

//根据报表类型选择对应的组件
const currentFeeAmountComponent = computed(() => {
  return reportType.value === 'daily' ? EBDailyReport
    : reportType.value === 'monthly' ? EBMonthlyReport
    : EBYearlyReport;
});



// 记录上一次的报表类型和日期范围
const prevReportType = ref(reportType.value);
const prevDateRange = ref(dateRange.value);
const prevMonthRange = ref(monthRange.value);
const prevYearRange = ref(yearRange.value);

//获取报表数据
const fetchReportData = async () => {
  // 如果报表类型为日报且日期范围为空，或者报表类型为月报且月份范围为空，或者报表类型为年报且年份范围为空，则返回
  if (
    (reportType.value === 'daily' && !dateRange.value) ||
    (reportType.value === 'monthly' && !monthRange.value) ||
    (reportType.value === 'yearly' && !yearRange.value)
  ) {
    return;
  }
  
  // 如果报表类型和日期范围与上一次相同，则返回
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
  
  // 加载中
  loading.value = true;
  try {
    // 根据报表类型生成报表数据
    if (reportType.value === 'daily') {
      // 获取日期范围
      const [startDate, endDate] = dateRange.value;
      // 从后端生成报表数据
      const res = await getReportData(reportType.value,startDate, endDate);
      reportData.value = res;
    } else if (reportType.value === 'monthly') {
      const [startMonth, endMonth] = monthRange.value;
      //从后端生成报表数据
      const res = await getReportData(reportType.value,startMonth, endMonth);
      reportData.value = res;
    } else if (reportType.value === 'yearly') {
      const [startYear, endYear] = yearRange.value;
      //从后端生成报表数据
      const res = await getReportData(reportType.value,startYear, endYear);
      reportData.value = res;
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
  //将日期与数据添加到对应的图表中
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
        //前端传过来2024-06-10 将日期设置为YYYY-MM
        data: reportData.value.map(item => item.date.split(' ')[0].split('-')[0]+'-'+item.date.split(' ')[0].split('-')[1])
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
        //将日期设置为YYYY-MM
        data: reportData.value.map(item => item.date.split(' ')[0].split('-')[0]+'-'+item.date.split(' ')[0].split('-')[1])
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
        //后端传过了2024-06-10，将日期设置为YYYY
        data: reportData.value.map(item => item.date.split(' ')[0].split('-')[0])
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
        //将日期设置为YYYY
        data: reportData.value.map(item => item.date.split(' ')[0].split('-')[0])
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

//切换报表类型
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
  // 将日期范围设置为默认值 YYYY-MM-DD HH:mm:ss
  dateRange.value = [
    start.toISOString().split('T')[0] + ' 00:00:00',
    end.toISOString().split('T')[0] + ' 23:59:59'
  ];
  //近三个月
  const startMonth = new Date();
  startMonth.setMonth(startMonth.getMonth() - 2);
  const endMonth = new Date();
  monthRange.value = [
    startMonth.toISOString().split('T')[0] + ' 00:00:00',
    endMonth.toISOString().split('T')[0] + ' 23:59:59'
  ];
  //近三年
  const startYear = new Date();
  startYear.setFullYear(startYear.getFullYear() - 2);
  const endYear = new Date();
  yearRange.value = [
    startYear.toISOString().split('T')[0] + ' 00:00:00',
    endYear.toISOString().split('T')[0] + ' 23:59:59'
  ];
  // 获取报表数据
  fetchReportData();
});

// 导出报表
const exportReport = async () => {
  let res =null
  if (reportType.value === 'daily') {
      // 获取日期范围
      const [startDate, endDate] = dateRange.value;
      // 从后端生成报表数据
      res = await getReportExcel(reportType.value,startDate, endDate);
    } else if (reportType.value === 'monthly') {
      // 获取月份范围
      const [startMonth, endMonth] = monthRange.value;
      //从后端生成报表数据
      res = await getReportExcel(reportType.value,startMonth, endMonth);
    } else if (reportType.value === 'yearly') {
      // 获取年份范围
      const [startYear, endYear] = yearRange.value;
      //从后端生成报表数据
      res = await getReportExcel(reportType.value,startYear, endYear);
    }
  // 创建 Blob 对象并下载
  const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'report.xlsx';
  link.click();
  window.URL.revokeObjectURL(url);
  if(res.size > 0){
    ElMessage.success('报表导出成功');
  }else{
    ElMessage.error('报表导出失败');
  }
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