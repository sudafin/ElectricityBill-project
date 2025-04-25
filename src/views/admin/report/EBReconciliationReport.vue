<template>
  <div class="report-section reconciliation-report">
    <el-skeleton :loading="loading" animated :rows="8">
      <template #default>
        <div v-if="!reportData || (!reportData.summary && !reportData.tableData)" class="no-data-placeholder">
          <el-empty description="暂无对账统计数据" />
        </div>
        <div v-else class="report-content">
          <!-- Summary Cards -->
          <el-row :gutter="20" class="summary-cards">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" class="summary-card total-reconciliation-card">
                <div class="card-title">对账总数</div>
                <div class="card-value">{{ formatNumber(reportData.summary?.total_reconciliations || 0) }}</div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" class="summary-card pending-reconciliation-card">
                <div class="card-title">待处理对账</div>
                <div class="card-value">{{ formatNumber(reportData.summary?.pending_count || 0) }}</div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" class="summary-card completed-reconciliation-card">
                 <div class="card-title">已完成对账</div>
                 <div class="card-value">{{ formatNumber(reportData.summary?.completed_count || 0) }}</div>
              </el-card>
            </el-col>
             <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card shadow="hover" class="summary-card total-amount-card">
                 <div class="card-title">对账总金额</div>
                 <div class="card-value">¥ {{ formatNumber(reportData.summary?.total_reconciliation_amount || 0) }}</div>
              </el-card>
            </el-col>
          </el-row>

          <!-- Chart Section (e.g., Pie for status distribution, Bar/Line for trend) -->
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-card shadow="never" class="chart-card">
                <template #header>
                  <div class="chart-header"><span>对账状态分布</span></div>
                </template>
                <div class="chart-container" style="height: 350px;">
                  <EBChart :option="statusDistributionChartOption" :loading="loading" />
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-card shadow="never" class="chart-card">
                <template #header>
                  <div class="chart-header">
                    <span>对账趋势 ({{ granularityText }})</span>
                    <el-radio-group v-model="trendChartType" size="small">
                      <el-radio-button label="bar">柱状图</el-radio-button>
                      <el-radio-button label="line">折线图</el-radio-button>
                    </el-radio-group>
                  </div>
                </template>
                <div class="chart-container" style="height: 350px;">
                  <EBChart :option="reconciliationTrendChartOption" :loading="loading" />
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- Data Table -->
          <el-card shadow="never" class="table-card" v-if="reportData.tableData && reportData.tableData.length > 0">
            <template #header>最新对账记录</template>
            <el-table :data="reportData.tableData" stripe style="width: 100%" max-height="400">
              <el-table-column prop="id" label="对账单ID" width="100" />
              <el-table-column prop="user_id" label="用户ID" width="100" />
              <el-table-column prop="start_date" label="开始日期" width="120" sortable />
              <el-table-column prop="end_date" label="结束日期" width="120" sortable />
              <el-table-column prop="total_amount" label="总金额 (元)" align="right">
                <template #default="scope">¥ {{ formatNumber(scope.row.total_amount) }}</template>
              </el-table-column>
              <el-table-column prop="status" label="审批状态" width="100">
                <template #default="scope">
                  <el-tag :type="getReconciliationStatusTag(scope.row.status)">{{ formatReconciliationStatus(scope.row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="payment_status" label="支付状态" width="100">
                 <template #default="scope">
                  <el-tag :type="getPaymentStatusTag(scope.row.payment_status)">{{ formatPaymentStatus(scope.row.payment_status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="approver_id" label="审批人ID" width="100" />
              <el-table-column prop="created_at" label="创建时间" width="160" sortable />
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
import { DocumentChecked, Wallet } from '@element-plus/icons-vue';
import { formatNumber, formatReconciliationStatus, formatPaymentStatus } from '@/utils/formatter'; // Corrected path

const props = defineProps({
  data: {
    type: Object,
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

// Pie chart for status distribution
const statusDistributionChartOption = computed(() => {
    if (!reportData.value?.summary?.status_distribution) {
        return {};
    }
    const distribution = reportData.value.summary.status_distribution;
    const chartData = Object.entries(distribution).map(([status, count]) => ({
        name: formatReconciliationStatus(status),
        value: count
    }));
    return {
        tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', left: 'left', data: chartData.map(item => item.name) },
        series: [{
            name: '对账状态',
            type: 'pie',
            radius: '70%',
            center: ['50%', '60%'],
            data: chartData,
            emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
            label: { formatter: '{b}: {c}' }
        }]
    };
});

// Bar/Line chart for reconciliation trend
const reconciliationTrendChartOption = computed(() => {
    if (!reportData.value?.timeSeries) {
        return {};
    }
    const timeSeries = reportData.value.timeSeries;
    const dates = Array.isArray(timeSeries.dates) ? timeSeries.dates : [];
    const totalCount = Array.isArray(timeSeries.total_count) ? timeSeries.total_count : [];
    const pendingCount = Array.isArray(timeSeries.pending_count) ? timeSeries.pending_count : [];
    const completedCount = Array.isArray(timeSeries.completed_count) ? timeSeries.completed_count : [];
    return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        legend: { data: ['总对账数', '待处理', '已完成'], bottom: 10 },
        xAxis: { type: 'category', boundaryGap: trendChartType.value === 'bar', data: dates },
        yAxis: { type: 'value', name: '数量' },
        dataZoom: [
            { type: 'inside', start: 0, end: 100 },
            { type: 'slider', start: 0, end: 100, height: 20, bottom: 40 }
        ],
        series: [
            {
                name: '总对账数',
                type: trendChartType.value,
                data: totalCount,
                smooth: trendChartType.value === 'line',
                itemStyle: { color: '#409EFF' },
                areaStyle: trendChartType.value === 'line' ? { opacity: 0.3 } : undefined
            },
            {
                name: '待处理',
                type: trendChartType.value,
                data: pendingCount,
                smooth: trendChartType.value === 'line',
                itemStyle: { color: '#E6A23C' },
                 areaStyle: trendChartType.value === 'line' ? { opacity: 0.2 } : undefined
            },
             {
                name: '已完成',
                type: trendChartType.value,
                data: completedCount,
                smooth: trendChartType.value === 'line',
                itemStyle: { color: '#67C23A' },
                 areaStyle: trendChartType.value === 'line' ? { opacity: 0.1 } : undefined
            }
        ]
    };
});

// --- Tag Type Helpers ---
const getReconciliationStatusTag = (status) => {
    switch (status?.toLowerCase()) {
        case 'pending': return 'warning';
        case 'completed': return 'success';
        default: return 'info';
    }
};

const getPaymentStatusTag = (status) => {
    switch (status?.toLowerCase()) {
        case 'unpaid': return 'danger';
        case 'paid': return 'success';
        default: return 'info';
    }
};

</script>

<style scoped>
/* Shared styles */
.report-section { padding: 0px; }
.report-content { display: flex; flex-direction: column; gap: 20px; }
.summary-cards { margin-bottom: 0px; }
.summary-card { text-align: left; border: 1px solid #e4e7ed; transition: box-shadow 0.3s; }
.summary-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.card-title { color: #606266; font-size: 14px; margin-bottom: 8px; }
.card-value { color: #303133; font-size: 22px; font-weight: bold; margin-bottom: 5px; line-height: 1.2; }
.card-subtext { font-size: 12px; color: #909399; margin-top: -2px; }
.chart-card { border: 1px solid #e4e7ed; }
.chart-header { display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: 500; }
.chart-container { height: 350px; }
.table-card { margin-top: 0; border: 1px solid #e4e7ed; }
.no-data-placeholder { display: flex; justify-content: center; align-items: center; min-height: 400px; color: #909399; }

/* Specific card background colors */
.total-reconciliation-card { background-color: #ecf5ff; border-left: 4px solid #409EFF; }
.pending-reconciliation-card { background-color: #fdf6ec; border-left: 4px solid #E6A23C; }
.completed-reconciliation-card { background-color: #f0f9eb; border-left: 4px solid #67C23A; }
.total-amount-card { background-color: #f4f4f5; border-left: 4px solid #909399; }
</style> 