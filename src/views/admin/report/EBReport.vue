<template>
  <div class="report-dashboard">
    <el-card class="admin-card report-card">
      <template #header>
        <div class="report-header-content">
          <div class="header-left">
            <el-icon :size="20" style="margin-right: 8px;"><DataAnalysis /></el-icon>
            <span class="header-title">数据统计报表</span>
          </div>
          <div class="header-right">
            <el-date-picker
              v-model="dateRange"
              :type="pickerType"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD HH:mm:ss"
              @change="handleFilterChange"
              class="filter-date-range"
              :disabled-date="disabledDate"
            >
              <template #prefix>
                <el-icon><Calendar /></el-icon>
              </template>
            </el-date-picker>
            <el-radio-group v-model="selectedGranularity" @change="handleFilterChange" class="granularity-selector">
              <el-radio-button label="daily">日</el-radio-button>
              <el-radio-button label="monthly">月</el-radio-button>
              <el-radio-button label="yearly">年</el-radio-button>
            </el-radio-group>
             <el-button type="primary" @click="downloadData" :loading="exportLoading" class="action-button">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
            <el-button @click="refreshData" :loading="loading" class="action-button">
               <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTabName" @tab-change="handleTabChange" class="report-tabs">
        <el-tab-pane label="电量统计" name="electricity">
          <EBElectricityReport :data="electricityData" :loading="loadingStates.electricity" :granularity="selectedGranularity" />
        </el-tab-pane>
        <el-tab-pane label="电费统计" name="fee">
          <EBFeeReport :data="feeData" :loading="loadingStates.fee" :granularity="selectedGranularity" />
        </el-tab-pane>
        <el-tab-pane label="反馈统计" name="feedback">
          <EBFeedbackReport :data="feedbackData" :loading="loadingStates.feedback" :granularity="selectedGranularity" />
        </el-tab-pane>
        <el-tab-pane label="对账统计" name="reconciliation">
          <EBReconciliationReport :data="reconciliationData" :loading="loadingStates.reconciliation" :granularity="selectedGranularity" />
        </el-tab-pane>
        <el-tab-pane label="用户类型统计" name="userType">
          <EBUserTypeReport :data="userTypeData" :loading="loadingStates.userType" :granularity="selectedGranularity" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed, nextTick } from 'vue';
import EBElectricityReport from './EBElectricityReport.vue';
import EBFeeReport from './EBFeeReport.vue';
import EBFeedbackReport from './EBFeedbackReport.vue';
import EBReconciliationReport from './EBReconciliationReport.vue';
import EBUserTypeReport from './EBUserTypeReport.vue';
import { Calendar, Download, DataAnalysis, Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { exportReport } from '@/api/admin/report.js';
import {
  getElectricityReport,
  getFeeReport,
  getFeedbackReport,
  getReconciliationReport,
  getUserTypeReport
} from '@/api/admin/statistics.js';
import dayjs from 'dayjs';

// --- State ---
const dateRange = ref([]);
const selectedGranularity = ref('daily'); // daily, monthly, yearly
const activeTabName = ref('electricity'); // Corresponds to tab pane names
const exportLoading = ref(false);

// Loading states for each tab
const loadingStates = reactive({
  electricity: false,
  fee: false,
  feedback: false,
  reconciliation: false,
  userType: false
});

// Data storage for each report type
const electricityData = ref(null);
const feeData = ref(null);
const feedbackData = ref(null);
const reconciliationData = ref(null);
const userTypeData = ref(null);

// Global loading state (optional, can use individual states)
const loading = computed(() => Object.values(loadingStates).some(state => state));

// --- Computed ---
const pickerType = computed(() => {
    switch (selectedGranularity.value) {
        case 'monthly': return 'monthrange';
        case 'yearly': return 'yearrange';
        default: return 'daterange';
    }
});

// --- Methods ---

// Map tab name to API function and data ref
const reportMap = {
  electricity: { api: getElectricityReport, dataRef: electricityData, loadingKey: 'electricity' },
  fee: { api: getFeeReport, dataRef: feeData, loadingKey: 'fee' },
  feedback: { api: getFeedbackReport, dataRef: feedbackData, loadingKey: 'feedback' },
  reconciliation: { api: getReconciliationReport, dataRef: reconciliationData, loadingKey: 'reconciliation' },
  userType: { api: getUserTypeReport, dataRef: userTypeData, loadingKey: 'userType' },
};

// Fetch data for the currently active tab
const fetchDataForCurrentTab = async () => {
  const currentReport = reportMap[activeTabName.value];
  if (!currentReport || !dateRange.value || dateRange.value.length !== 2) {
    console.warn('Skipping fetch: Invalid state or date range.');
    return;
  }

  const { api, dataRef, loadingKey } = currentReport;
  loadingStates[loadingKey] = true;

  try {
    // Adjust date format based on granularity if needed by backend
    const params = {
      startDate: dateRange.value[0], // Assume backend handles 'YYYY-MM-DD HH:mm:ss' or adjust here
      endDate: dateRange.value[1],
      granularity: selectedGranularity.value,
    };

    const res = await api(params);
    console.log(`${activeTabName.value} api response:`, res); // 调试输出后端返回
    if (!res || (Object.keys(res).length === 0) ||
        (res.timeSeries && Array.isArray(res.timeSeries.dates) && res.timeSeries.dates.length === 0)) {
      ElMessage.info('暂无数据');
      dataRef.value = null;
    } else {
      dataRef.value = res;
    }
  } catch (error) {
    console.error(`Error fetching ${activeTabName.value}数据:`, error);
    ElMessage.error(`获取${activeTabName.value}数据时发生错误`);
    dataRef.value = null; // Clear data on error
  } finally {
    loadingStates[loadingKey] = false;
  }
};

// Refresh data for the current tab
const refreshData = () => {
  ElMessage.info('正在刷新数据...');
  fetchDataForCurrentTab();
};

// Download report data
const downloadData = async () => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    ElMessage.warning('请先选择日期范围');
    return;
  }
  exportLoading.value = true;
  try {
    const params = {
      reportType: activeTabName.value,
      startDate: dateRange.value[0],
      endDate: dateRange.value[1],
      granularity: selectedGranularity.value,
      format: 'excel' // Or make this selectable
    };
    const res = await exportReport(params);

    // Handle blob response for download
     const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
     const url = window.URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = url;
     const timestamp = dayjs().format('YYYYMMDDHHmmss');
     link.download = `${activeTabName.value}_report_${selectedGranularity.value}_${timestamp}.xlsx`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     window.URL.revokeObjectURL(url);

    ElMessage.success('报表导出成功');
  } catch (error) {
    console.error('Error exporting report:', error);
    ElMessage.error('导出报表失败');
  } finally {
    exportLoading.value = false;
  }
};

// Handle filter changes (date or granularity)
const handleFilterChange = () => {
  // When granularity changes, adjust date range picker type if necessary
  // For simplicity, we fetch data immediately. Add debouncing if needed.
  fetchDataForCurrentTab();
};

// Handle tab changes
const handleTabChange = (tabName) => {
  // Fetch data only if the tab's data hasn't been loaded yet or needs refresh
  const report = reportMap[tabName];
  if (report && !report.dataRef.value) {
       nextTick(fetchDataForCurrentTab); // Ensure DOM is updated before fetching
  }
};

// Disable dates beyond allowed range based on granularity (optional enhancement)
const disabledDate = (time) => {
  // Add logic here if needed, e.g., prevent selecting future dates
  return false;
};

// --- Lifecycle Hooks ---
onMounted(() => {
  // Set default date range (e.g., last 7 days)
  const end = dayjs().endOf('day'); // End of today
  const start = dayjs().subtract(6, 'day').startOf('day'); // Start of 7 days ago
  dateRange.value = [
      start.format('YYYY-MM-DD HH:mm:ss'),
      end.format('YYYY-MM-DD HH:mm:ss')
  ];

  // Initial data fetch for the default tab
  fetchDataForCurrentTab();
});

// --- Watchers ---
// Watchers automatically trigger fetchDataForCurrentTab via handleFilterChange or handleTabChange

</script>

<style scoped>
@import '@/styles/admin-card.scss'; /* Optional: If you have global card styles */

.report-dashboard {
  padding: 20px;
  background-color: #f7f8fa; /* Light background */
}

.report-card {
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.report-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px; /* Gap between left and right sections */
}

.header-left {
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px; /* Gap between filter elements */
  flex-wrap: wrap;
}

.filter-date-range {
  width: 260px; /* Adjust width as needed */
}

.granularity-selector {
  margin-left: 5px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.report-tabs {
  margin-top: 15px;
}

/* Deep selectors for tab styling if needed */
:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-tabs__item) {
  font-size: 15px;
  height: 45px;
  line-height: 45px;
}

:deep(.el-tabs__item.is-active) {
  font-weight: 600;
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: #e4e7ed; /* Bottom border for tabs */
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .report-header-content {
    flex-direction: column;
    align-items: stretch;
  }
  .header-right {
     margin-top: 10px;
     justify-content: flex-start; /* Align filters to the start */
  }
  .filter-date-range {
     width: 100%; /* Full width on smaller screens */
  }
}

@media (max-width: 768px) {
    .header-right {
        flex-direction: column;
        align-items: stretch;
    }
    .granularity-selector {
       margin-left: 0;
       margin-top: 10px;
       align-self: flex-start;
    }
    .action-button {
       margin-top: 10px;
       width: 100%; /* Full width buttons */
    }
}
</style> 