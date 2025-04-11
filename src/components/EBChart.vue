<template>
  <div class="eb-chart" ref="chartRef" :style="{height: '100%'}"></div>
</template>

<script setup>
import { ref, onMounted, defineProps, watch, onBeforeUnmount, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  option: {
    type: Object,
    default: () => ({}),
  },
  height: {
    type: String,
    default: '400px',
  }
});

const chartRef = ref(null);
let chart = null;

// 图表大小调整处理函数
const handleResize = () => {
  if (chart) {
    chart.resize();
  }
};

// 初始化或重新创建图表
const initChart = () => {
  // 如果已经存在图表实例，先销毁它
  if (chart) {
    chart.dispose();
    chart = null;
  }
  
  // 确保DOM元素存在
  if (chartRef.value) {
    // 创建新的图表实例
    chart = echarts.init(chartRef.value);
    // 设置选项配置
    chart.setOption(props.option, true); // 使用true参数完全替换之前的配置
    
    // 立即执行一次resize确保正确尺寸
    handleResize();
    
    // 添加额外的resize调用以确保在各种情况下都能正确显示
    setTimeout(() => {
      handleResize();
    }, 0);
    
    setTimeout(() => {
      handleResize();
    }, 200);
    
    setTimeout(() => {
      handleResize();
    }, 500);
  }
};

onMounted(() => {
  // 使用nextTick确保DOM已渲染
  nextTick(() => {
    // 延迟初始化，确保容器已经完全渲染
    setTimeout(() => {
      initChart();
      
      // 添加窗口大小变化的监听器
      window.addEventListener('resize', handleResize);
    }, 50);
  });
});

onBeforeUnmount(() => {
  // 移除窗口大小变化的监听器，避免内存泄漏
  window.removeEventListener('resize', handleResize);
  
  // 销毁图表实例
  if (chart) {
    chart.dispose();
    chart = null;
  }
});

// 监听选项变化，完全重新渲染图表
watch(
  () => props.option,
  (newVal) => {
    if (newVal) {
      // 当选项变化时，完全重新创建图表以避免叠加问题
      nextTick(() => {
        initChart();
      });
    }
  },
  { deep: true }
);
</script>

<style scoped>
.eb-chart {
  width: 100% !important;
  height: 100% !important;
  min-height: 300px;
  display: block; /* 改为block以确保正确的尺寸计算 */
}
</style> 