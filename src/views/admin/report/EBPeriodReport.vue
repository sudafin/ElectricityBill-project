<template>
  <div class="period-report">
    <div class="report-header">
      <h3>{{ getReportTitle() }}</h3>
      <div class="chart-actions">
        <el-radio-group v-model="chartType" size="small" @change="changeChartType">
          <el-radio-button label="bar">柱状图</el-radio-button>
          <el-radio-button label="line">折线图</el-radio-button>
          <el-radio-button label="area">面积图</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div class="chart-container">
      <EBChart :option="currentChartOption" />
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, computed, watch } from 'vue';
import EBChart from '@/components/EBChart.vue';

const props = defineProps({
  // 支持所有原有组件的属性
  dailyElectricityUsageOption: {
    type: Object,
    default: () => ({})
  },
  dailyFeeAmountOption: {
    type: Object,
    default: () => ({})
  },
  monthlyElectricityUsageOption: {
    type: Object,
    default: () => ({})
  },
  monthlyFeeAmountOption: {
    type: Object,
    default: () => ({})
  },
  yearlyElectricityUsageOption: {
    type: Object,
    default: () => ({})
  },
  yearlyFeeAmountOption: {
    type: Object,
    default: () => ({})
  },
  // 报表内容类型
  contentType: {
    type: String,
    default: 'electricity' // 'electricity' 或 'fee'
  }
});

// 图表类型
const chartType = ref('bar');

// 获取报表标题
const getReportTitle = () => {
  const contentTypeText = props.contentType === 'electricity' ? '用电量' : '电费';
  return `${contentTypeText}统计`;
};

// 获取相应的基础图表配置
const getBaseChartOption = () => {
  // 只使用日报数据
  return props.contentType === 'electricity' ? props.dailyElectricityUsageOption : props.dailyFeeAmountOption;
};

// 当前图表选项
const currentChartOption = computed(() => {
  const baseOption = getBaseChartOption();
  
  if (!baseOption || !baseOption.series || baseOption.series.length === 0) {
    return baseOption;
  }
  
  // 创建选项的深拷贝，避免修改原始数据
  const option = JSON.parse(JSON.stringify(baseOption));
  
  // 根据图表类型修改图表配置
  if (option.series && option.series.length > 0) {
    // 设置图表类型
    option.series[0].type = chartType.value;
    
    // 根据图表类型设置特殊属性
    if (chartType.value === 'line') {
      option.series[0].smooth = true;
    } else if (chartType.value === 'area') {
      option.series[0].type = 'line'; // 面积图实际上是带有areaStyle的线图
      option.series[0].smooth = true;
      option.series[0].areaStyle = option.series[0].areaStyle || {};
    }
  }
  
  return option;
});

// 切换图表类型
const changeChartType = (type) => {
  chartType.value = type;
};

// 监听数据变化，重置图表类型
watch(() => props.contentType, () => {
  // 根据内容类型设置默认图表类型
  if (props.contentType === 'electricity') {
    chartType.value = 'bar';  // 电量默认使用柱状图
  } else {
    chartType.value = 'line'; // 电费默认使用折线图
  }
}, { immediate: true });
</script>

<style scoped>
.period-report {
  width: 100%;
  margin-bottom: 20px;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.report-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-actions {
  display: flex;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 350px;
}
</style> 