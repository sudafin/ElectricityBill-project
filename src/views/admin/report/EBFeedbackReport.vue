<template>
  <div class="report-section feedback-report">
    <el-skeleton :loading="loading" animated :rows="8">
      <template #default>
        <div v-if="!reportData || !reportData.timeSeries || !reportData.timeSeries.dates || reportData.timeSeries.dates.length === 0" class="no-data-placeholder">
          <el-empty description="暂无反馈统计数据" />
        </div>
        <div v-else class="report-content">
          <!-- Summary Cards -->
          <el-row :gutter="20" class="summary-cards">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" class="summary-card total-feedback-card">
                <div class="card-title">反馈总数</div>
                <div class="card-value">{{ formatNumber(reportData.summary?.total_feedback || 0) }}</div>
                 <div class="card-trend" :class="getTrendClass(reportData.summary?.feedback_growth_rate)">
                   <el-icon v-if="reportData.summary?.feedback_growth_rate !== undefined"><component :is="getTrendIcon(reportData.summary?.feedback_growth_rate)" /></el-icon>
                   {{ formatPercentage(reportData.summary?.feedback_growth_rate) }}
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" class="summary-card pending-card">
                <div class="card-title">待处理反馈</div>
                <div class="card-value">{{ formatNumber(reportData.summary?.pending_count || 0) }}</div>
              </el-card>
            </el-col>
             <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" class="summary-card processed-card">
                 <div class="card-title">已处理反馈</div>
                 <div class="card-value">{{ formatNumber(reportData.summary?.processed_count || 0) }}</div>
              </el-card>
            </el-col>
             <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" class="summary-card avg-time-card">
                 <div class="card-title">平均处理时长</div>
                 <div class="card-value">{{ formatDuration(reportData.summary?.average_process_time_hours || 0) }}</div>
              </el-card>
            </el-col>
          </el-row>

          <!-- Chart Section (Pie for type distribution, Bar/Line for trend) -->
           <el-row :gutter="20">
               <el-col :xs="24" :md="12">
                 <el-card shadow="never" class="chart-card">
                    <template #header>
                       <div class="chart-header">
                          <span>反馈类型分布</span>
                           <!-- Add controls if needed -->
                       </div>
                    </template>
                    <div class="chart-container" style="height: 350px;">
                       <EBChart :option="typeDistributionChartOption" :loading="loading" />
      </div>
                 </el-card>
              </el-col>
               <el-col :xs="24" :md="12">
                 <el-card shadow="never" class="chart-card">
                    <template #header>
                       <div class="chart-header">
                          <span>反馈趋势 ({{ granularityText }})</span>
                           <el-radio-group v-model="trendChartType" size="small">
          <el-radio-button label="bar">柱状图</el-radio-button>
                              <el-radio-button label="line">折线图</el-radio-button>
        </el-radio-group>
      </div>
                    </template>
                    <div class="chart-container" style="height: 350px;">
                       <EBChart :option="feedbackTrendChartOption" :loading="loading" />
    </div>
                 </el-card>
              </el-col>
           </el-row>

          <!-- Data Table -->
           <el-card shadow="never" class="table-card" v-if="reportData.tableData && reportData.tableData.length > 0">
             <template #header>最新反馈列表</template>
              <el-table :data="reportData.tableData" stripe style="width: 100%" max-height="400">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="user_id" label="用户ID" width="100" />
                <el-table-column prop="feedback_type" label="反馈类型" width="120">
                  <template #default="scope">
                    <el-tag :type="getFeedbackTypeTag(scope.row.feedback_type)">{{ formatFeedbackType(scope.row.feedback_type) }}</el-tag>
                  </template>
                </el-table-column>
                 <el-table-column prop="content" label="反馈内容" show-overflow-tooltip />
                <el-table-column prop="feedback_status" label="状态" width="100">
                   <template #default="scope">
                    <el-tag :type="getFeedbackStatusTag(scope.row.feedback_status)">{{ formatFeedbackStatus(scope.row.feedback_status) }}</el-tag>
                  </template>
                </el-table-column>
                 <el-table-column prop="submit_time" label="提交时间" width="160" sortable />
                 <el-table-column prop="processor_id" label="处理人ID" width="100" />
                 <el-table-column prop="process_time" label="处理时间" width="160" sortable />
              </el-table>
           </el-card>
    </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import EBChart from '@/components/EBChart.vue';
import { ArrowUp, ArrowDown, ChatDotRound, Clock } from '@element-plus/icons-vue';
import { formatNumber, formatPercentage, formatDuration, formatFeedbackType, formatFeedbackStatus } from '@/utils/formatter'; // Corrected path

const props = defineProps({
  data: {
    type: Object, // Expected structure: { summary: {...}, timeSeries: [...], tableData: [...] }
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  granularity: {
      type: String,
      default: 'daily'
  }
});

const trendChartType = ref('bar'); // bar, line

// --- Computed Properties ---
const reportData = computed(() => props.data);

const granularityText = computed(() => {
    switch (props.granularity) {
        case 'monthly': return '月度';
        case 'yearly': return '年度';
        default: return '每日';
    }
});

// Pie chart for feedback type distribution
const typeDistributionChartOption = computed(() => {
    if (!reportData.value?.summary?.type_distribution) {
        return {};
    }
    const distribution = reportData.value.summary.type_distribution;
    // Expecting format: { complaint: 10, suggestion: 20, question: 5 }
    const chartData = Object.entries(distribution).map(([type, count]) => ({
        name: formatFeedbackType(type), // Format 'complaint' to '投诉'
        value: count
    }));

    return {
        tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', left: 'left', data: chartData.map(item => item.name) },
        series: [{
            name: '反馈类型',
            type: 'pie',
            radius: '70%',
            center: ['50%', '60%'],
            data: chartData,
            emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
            label: { formatter: '{b}: {c}' }
        }]
    };
});

// Bar/Line chart for feedback trend
const feedbackTrendChartOption = computed(() => {
    if (!reportData.value?.timeSeries) {
        return {};
    }
    const timeSeries = reportData.value.timeSeries;
    const dates = Array.isArray(timeSeries.dates) ? timeSeries.dates : [];
    const totalFeedback = Array.isArray(timeSeries.total_feedback) ? timeSeries.total_feedback : [];
    const pendingFeedback = Array.isArray(timeSeries.pending_count) ? timeSeries.pending_count : [];
    const processedFeedback = Array.isArray(timeSeries.processed_count) ? timeSeries.processed_count : [];

    return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        legend: { data: ['总反馈数', '待处理', '已处理'], bottom: 10 },
        xAxis: { type: 'category', boundaryGap: trendChartType.value === 'bar', data: dates },
        yAxis: { type: 'value', name: '数量' },
        dataZoom: [
            { type: 'inside', start: 0, end: 100 },
            { type: 'slider', start: 0, end: 100, height: 20, bottom: 40 }
        ],
  series: [
    {
                name: '总反馈数',
                type: trendChartType.value,
                data: totalFeedback,
                smooth: trendChartType.value === 'line',
                itemStyle: { color: '#409EFF' },
                areaStyle: trendChartType.value === 'line' ? { opacity: 0.3 } : undefined
            },
            {
                name: '待处理',
                type: trendChartType.value,
                data: pendingFeedback,
                smooth: trendChartType.value === 'line',
                itemStyle: { color: '#E6A23C' },
                 areaStyle: trendChartType.value === 'line' ? { opacity: 0.2 } : undefined
    },
    {
      name: '已处理',
                type: trendChartType.value,
                data: processedFeedback,
                smooth: trendChartType.value === 'line',
                itemStyle: { color: '#67C23A' },
                 areaStyle: trendChartType.value === 'line' ? { opacity: 0.1 } : undefined
            }
        ]
    };
});

// --- Tag Type Helpers ---
const getFeedbackTypeTag = (type) => {
    switch (type?.toLowerCase()) {
        case 'complaint': return 'danger';
        case 'suggestion': return 'warning';
        case 'question': return 'info';
        default: return 'primary';
    }
};

const getFeedbackStatusTag = (status) => {
    switch (status?.toLowerCase()) {
        case 'pending': return 'warning';
        case 'processed': return 'success';
        case 'closed': return 'info';
        default: return 'primary';
    }
};

// --- Trend helpers ---
const getTrendIcon = (rate) => {
  if (rate === null || rate === undefined) return null;
  return rate >= 0 ? ArrowUp : ArrowDown;
};

const getTrendClass = (rate) => {
  if (rate === null || rate === undefined) return 'neutral';
  return rate >= 0 ? 'positive' : 'negative';
};

</script>

<style scoped>
/* Using shared styles */
.report-section { padding: 0px; }
.report-content { display: flex; flex-direction: column; gap: 20px; }
.summary-cards { margin-bottom: 0px; }
.summary-card { text-align: left; border: 1px solid #e4e7ed; transition: box-shadow 0.3s; }
.summary-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.card-title { color: #606266; font-size: 14px; margin-bottom: 8px; }
.card-value { color: #303133; font-size: 22px; font-weight: bold; margin-bottom: 5px; line-height: 1.2; }
.card-trend { font-size: 12px; display: flex; align-items: center; gap: 3px; }
.card-trend.positive { color: #67C23A; }
.card-trend.negative { color: #F56C6C; }
.card-trend.neutral { color: #909399; }
.card-subtext { font-size: 12px; color: #909399; margin-top: -2px; }
.chart-card { border: 1px solid #e4e7ed; }
.chart-header { display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: 500; }
.chart-container { height: 350px; }
.table-card { margin-top: 0; border: 1px solid #e4e7ed; }
.no-data-placeholder { display: flex; justify-content: center; align-items: center; min-height: 400px; color: #909399; }

/* Specific card background colors */
.total-feedback-card { background-color: #ecf5ff; border-left: 4px solid #409EFF; }
.pending-card { background-color: #fdf6ec; border-left: 4px solid #E6A23C; }
.processed-card { background-color: #f0f9eb; border-left: 4px solid #67C23A; }
.avg-time-card { background-color: #f4f4f5; border-left: 4px solid #909399; }
</style> 