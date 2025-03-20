<template>
  <div class="meter-data-container">
    <el-card class="admin-card">
      <template #header>
        <div class="header">
          <h3 class="header-title">
            <el-icon><DataAnalysis /></el-icon>
            电表数据分析
          </h3>
          <div class="header-actions">
            <el-button @click="goBack">返回详情</el-button>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              @change="loadData"
            ></el-date-picker>
            <el-button type="primary" @click="loadData">查询</el-button>
            <el-button type="success" @click="exportData">
              <el-icon><Download /></el-icon>导出数据
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="meter-data-content" v-loading="loading">
        <div class="meter-info">
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="电表编号">{{ meterInfo.meterNo }}</el-descriptions-item>
            <el-descriptions-item label="电表型号">{{ meterInfo.model }}</el-descriptions-item>
            <el-descriptions-item label="绑定用户">{{ meterInfo.username || '未绑定' }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <el-divider content-position="left">用电数据</el-divider>
        
        <div class="charts-container">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-card class="chart-card">
                <template #header>
                  <div class="chart-header">
                    <span>用电量趋势图</span>
                    <el-radio-group v-model="chartTimeType" size="small" @change="switchChartType">
                      <el-radio-button label="day">日视图</el-radio-button>
                      <el-radio-button label="month">月视图</el-radio-button>
                    </el-radio-group>
                  </div>
                </template>
                <div class="chart-content" ref="usageChartRef"></div>
              </el-card>
            </el-col>
          </el-row>
          
          <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="12">
              <el-card class="chart-card">
                <template #header>
                  <div class="chart-header">
                    <span>用电量统计</span>
                  </div>
                </template>
                <div class="chart-content" ref="usageStatChartRef"></div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="chart-card">
                <template #header>
                  <div class="chart-header">
                    <span>电费统计</span>
                  </div>
                </template>
                <div class="chart-content" ref="costChartRef"></div>
              </el-card>
            </el-col>
          </el-row>
        </div>
        
        <el-divider content-position="left">数据记录</el-divider>
        
        <el-table :data="usageRecords" class="admin-table">
          <el-table-column prop="date" label="日期" width="120"></el-table-column>
          <el-table-column prop="usage" label="用电量(度)" width="120"></el-table-column>
          <el-table-column prop="cost" label="电费(元)" width="120"></el-table-column>
          <el-table-column prop="peakUsage" label="峰时用电(度)" width="120"></el-table-column>
          <el-table-column prop="valleyUsage" label="谷时用电(度)" width="120"></el-table-column>
          <el-table-column prop="avgUsage" label="平均日用电(度)" width="120"></el-table-column>
          <el-table-column prop="maxUsage" label="最大日用电(度)" width="120"></el-table-column>
        </el-table>
        
        <div class="admin-pagination">
          <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            @current-change="handlePageChange"
            layout="prev, pager, next, jumper"
          ></el-pagination>
          <div class="total-info">共 {{ total }} 条记录</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { DataAnalysis, Download } from '@element-plus/icons-vue';
import * as echarts from 'echarts';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const meterInfo = ref({});
const dateRange = ref([]);
const usageRecords = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const chartTimeType = ref('day');

// 图表实例
let usageChart = null;
let usageStatChart = null;
let costChart = null;

// DOM引用
const usageChartRef = ref(null);
const usageStatChartRef = ref(null);
const costChartRef = ref(null);

// 获取电表信息
const fetchMeterInfo = async () => {
  loading.value = true;
  try {
    // 这里替换为实际的API调用
    const res = await getMeterDetail(route.params.id);
    meterInfo.value = res;
  } catch (error) {
    ElMessage.error('获取电表信息失败');
    console.error('获取电表信息失败', error);
  } finally {
    loading.value = false;
  }
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    // 这里替换为实际的API调用
    const res = await getMeterUsageData({
      meterId: route.params.id,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      timeType: chartTimeType.value
    });
    
    usageRecords.value = res.records;
    total.value = res.total;
    
    // 渲染图表
    renderCharts(res.chartData);
  } catch (error) {
    ElMessage.error('获取电表数据失败');
    console.error('获取电表数据失败', error);
  } finally {
    loading.value = false;
  }
};

// 渲染图表
const renderCharts = (chartData) => {
  if (!chartData) return;
  
  // 用电量趋势图
  if (usageChartRef.value) {
    if (!usageChart) {
      usageChart = echarts.init(usageChartRef.value);
    }
    
    const usageOption = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['用电量']
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
        data: chartData.dates
      },
      yAxis: {
        type: 'value',
        name: '用电量(度)'
      },
      series: [
        {
          name: '用电量',
          type: 'line',
          smooth: true,
          data: chartData.usages,
          areaStyle: {
            opacity: 0.3
          },
          lineStyle: {
            width: 2
          },
          itemStyle: {
            color: '#409EFF'
          }
        }
      ]
    };
    
    usageChart.setOption(usageOption);
  }
  
  // 用电量统计饼图
  if (usageStatChartRef.value) {
    if (!usageStatChart) {
      usageStatChart = echarts.init(usageStatChartRef.value);
    }
    
    const usageStatOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        data: ['峰时用电', '谷时用电', '平时用电']
      },
      series: [
        {
          name: '用电量分布',
          type: 'pie',
          radius: ['50%', '70%'],
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
          data: [
            { value: chartData.peakUsageTotal, name: '峰时用电' },
            { value: chartData.valleyUsageTotal, name: '谷时用电' },
            { value: chartData.normalUsageTotal, name: '平时用电' }
          ]
        }
      ]
    };
    
    usageStatChart.setOption(usageStatOption);
  }
  
  // 电费统计图
  if (costChartRef.value) {
    if (!costChart) {
      costChart = echarts.init(costChartRef.value);
    }
    
    const costOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['电费']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: chartData.dates.slice(-7)
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '金额(元)'
        }
      ],
      series: [
        {
          name: '电费',
          type: 'bar',
          barWidth: '60%',
          data: chartData.costs.slice(-7),
          itemStyle: {
            color: '#67C23A'
          }
        }
      ]
    };
    
    costChart.setOption(costOption);
  }
};

// 切换图表类型
const switchChartType = () => {
  loadData();
};

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page;
  loadData();
};

// 导出数据
const exportData = async () => {
  try {
    // 这里替换为实际的API调用
    await exportMeterData({
      meterId: route.params.id,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    });
    ElMessage.success('数据导出成功');
  } catch (error) {
    ElMessage.error('数据导出失败');
    console.error('数据导出失败', error);
  }
};

// 返回详情页
const goBack = () => {
  router.push(`/admin/meter/detail/${route.params.id}`);
};

// 初始化
onMounted(() => {
  fetchMeterInfo();
  
  // 设置默认日期范围为近30天
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  dateRange.value = [
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  ];
  
  loadData();
  
  // 窗口大小变化时重绘图表
  window.addEventListener('resize', handleResize);
});

// 组件卸载前清理图表实例
onBeforeUnmount(() => {
  if (usageChart) {
    usageChart.dispose();
    usageChart = null;
  }
  
  if (usageStatChart) {
    usageStatChart.dispose();
    usageStatChart = null;
  }
  
  if (costChart) {
    costChart.dispose();
    costChart = null;
  }
  
  window.removeEventListener('resize', handleResize);
});

// 处理窗口大小变化
const handleResize = () => {
  usageChart && usageChart.resize();
  usageStatChart && usageStatChart.resize();
  costChart && costChart.resize();
};
</script>

<style scoped>
@import '@/styles/admin-card.scss';

.meter-data-container {
  padding: 20px;
  background-color: #f5f7fa;
}

.meter-data-content {
  padding: 10px 0;
}

.charts-container {
  margin: 20px 0;
}

.chart-card {
  height: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-content {
  height: 300px;
}

:deep(.el-descriptions__label) {
  width: 80px;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style> 