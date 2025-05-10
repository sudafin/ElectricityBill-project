<template>
  <div class="eb-chart-container">
    <div class="chart-toolbar" v-if="showToolbar">
      <el-tooltip content="刷新图表">
        <el-button type="primary" :icon="Refresh" circle size="small" @click="refreshChart" />
      </el-tooltip>
      <el-tooltip content="下载数据">
        <el-button type="success" :icon="Download" circle size="small" @click="downloadData" />
      </el-tooltip>
      <el-tooltip content="切换主题">
        <el-button type="warning" :icon="Brush" circle size="small" @click="toggleTheme" />
      </el-tooltip>
      <el-tooltip content="导出图片">
        <el-button type="info" :icon="Picture" circle size="small" @click="exportImage" />
      </el-tooltip>
      <el-tooltip content="全屏查看">
        <el-button 
          :type="isFullscreen ? 'danger' : 'default'" 
          :icon="isFullscreen ? Crop : FullScreen" 
          circle 
          size="small" 
          @click="toggleFullscreen" 
        />
      </el-tooltip>
    </div>
    <div 
      class="eb-chart" 
      ref="chartRef" 
      :style="{
        height: height,
        maxHeight: isFullscreen ? '90vh' : maxHeight
      }"
      :class="{ 'fullscreen-chart': isFullscreen }"
    ></div>
    <div class="chart-loading" v-if="loading">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span class="loading-text">加载中...</span>
    </div>
    <div class="chart-message" v-if="isEmpty">
      <el-empty description="暂无数据" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineProps, watch, onBeforeUnmount, nextTick } from 'vue';
import * as echarts from 'echarts';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh, Download, Brush, Picture, FullScreen, Crop, Loading } from '@element-plus/icons-vue';

const props = defineProps({
  option: {
    type: Object,
    default: () => ({}),
  },
  height: {
    type: String,
    default: '400px',
  },
  maxHeight: {
    type: String,
    default: '600px',
  },
  loading: {
    type: Boolean,
    default: false
  },
  showToolbar: {
    type: Boolean,
    default: false
  },
  autoResize: {
    type: Boolean,
    default: true
  },
  chartTheme: {
    type: String,
    default: 'default' // default, dark, ...
  }
});

const chartRef = ref(null);
let chart = null;
const isFullscreen = ref(false);
const currentTheme = ref(props.chartTheme);
const themes = ['default', 'dark', 'vintage', 'macarons', 'roma', 'shine', 'infographic'];
let themeIndex = themes.indexOf(currentTheme.value);

// 是否为空数据
const isEmpty = computed(() => {
  // 判断图表数据是否为空
  if (!props.option || !props.option.series) return true;
  
  // 检查所有系列是否都没有数据或数据为空数组
  const series = Array.isArray(props.option.series) ? props.option.series : [props.option.series];
  return series.every(serie => !serie.data || serie.data.length === 0);
});

// 图表大小调整处理函数
const handleResize = () => {
  if (!chart) return;
  
  // 使用requestAnimationFrame执行resize操作，提高性能
  window.requestAnimationFrame(() => {
    chart.resize();
  });
};

// 刷新图表
const refreshChart = () => {
  if (!chart) return;
  
  chart.clear();
  nextTick(() => {
    initChart();
    ElMessage.success('图表已刷新');
  });
};

// 下载数据
const downloadData = () => {
  if (!props.option || !props.option.series) {
    ElMessage.warning('无数据可下载');
    return;
  }
  
  try {
    // 提取数据
    const series = Array.isArray(props.option.series) ? props.option.series : [props.option.series];
    const seriesNames = series.map(s => s.name || '数据');
    
    // 获取X轴数据作为标签（如果存在）
    let categories = [];
    if (props.option.xAxis && props.option.xAxis.data) {
      categories = props.option.xAxis.data;
    }
    
    // 构建CSV数据
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // 添加标题行
    csvContent += "类别," + seriesNames.join(",") + "\r\n";
    
    // 添加数据行
    if (categories.length > 0) {
      // 如果有类别数据，按类别组织
      categories.forEach((category, index) => {
        let row = category;
        series.forEach(s => {
          row += "," + (s.data && s.data[index] !== undefined ? s.data[index] : "");
        });
        csvContent += row + "\r\n";
      });
    } else {
      // 如果没有类别，直接输出数据
      series.forEach(s => {
        if (s.data) {
          csvContent += s.name + "," + s.data.join(",") + "\r\n";
        }
      });
    }
    
    // 创建下载链接
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "chart_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    ElMessage.success('数据已下载');
  } catch (error) {
    console.error('下载数据失败:', error);
    ElMessage.error('下载数据失败');
  }
};

// 切换主题
const toggleTheme = () => {
  // 切换主题索引
  themeIndex = (themeIndex + 1) % themes.length;
  currentTheme.value = themes[themeIndex];
  
  // 根据主题重新初始化图表
  initChart();
  ElMessage.success(`已切换为${currentTheme.value}主题`);
};

// 导出图片
const exportImage = () => {
  if (!chart) {
    ElMessage.warning('图表未初始化');
    return;
  }
  
  try {
    // 获取图表的DataURL
    const dataURL = chart.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    });
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = '图表导出.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    ElMessage.success('图表已导出为图片');
  } catch (error) {
    console.error('导出图片失败:', error);
    ElMessage.error('导出图片失败');
  }
};

// 切换全屏显示
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  
  // 全屏时添加滚动锁定
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden';
    // 添加点击其他区域退出全屏的事件
    setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    }, 100);
  } else {
    document.body.style.overflow = '';
    document.removeEventListener('mousedown', handleOutsideClick);
  }
  
  // 延迟重新调整大小
  setTimeout(() => {
    handleResize();
  }, 300);
};

// 处理全屏外点击事件
const handleOutsideClick = (event) => {
  if (isFullscreen.value && chartRef.value && !chartRef.value.contains(event.target)) {
    toggleFullscreen();
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
    // 根据当前主题创建图表实例
    chart = echarts.init(chartRef.value, currentTheme.value);
    
    // 添加图表点击事件
    chart.on('click', params => {
      // 触发自定义事件
      const event = new CustomEvent('chart-click', { 
        detail: params,
        bubbles: true 
      });
      chartRef.value.dispatchEvent(event);
    });
    
    // 设置选项配置
    if (props.option && Object.keys(props.option).length > 0) {
      chart.setOption(props.option, true);
    }
    
    // 立即执行一次resize确保正确尺寸
    handleResize();
    
    // 延时进行额外的resize调用，确保在各种复杂场景下正确显示
    setTimeout(() => {
      handleResize();
    }, 100);
  }
};

onMounted(() => {
  // 使用nextTick确保DOM已渲染
  nextTick(() => {
    if (!props.loading) {
      initChart();
    }
    
    // 添加窗口大小变化的监听器
    if (props.autoResize) {
      window.addEventListener('resize', handleResize);
    }
  });
});

onBeforeUnmount(() => {
  // 移除所有事件监听器，避免内存泄漏
  if (props.autoResize) {
    window.removeEventListener('resize', handleResize);
  }
  document.removeEventListener('mousedown', handleOutsideClick);
  
  // 恢复body滚动
  document.body.style.overflow = '';
  
  // 销毁图表实例
  if (chart) {
    chart.dispose();
    chart = null;
  }
});

// 监听选项和加载状态变化
watch(
  [() => props.option, () => props.loading],
  ([newOption, newLoading]) => {
    // 当数据加载完成时初始化图表
    if (!newLoading && newOption) {
      nextTick(() => {
        initChart();
      });
    }
  },
  { deep: true }
);

// 导出接口供父组件调用
defineExpose({
  getChart: () => chart,
  refreshChart,
  downloadData,
  exportImage
});
</script>

<style scoped>
.eb-chart-container {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.eb-chart {
  width: 100% !important;
  min-height: 300px;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
}

.fullscreen-chart {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  width: 90vw !important;
  height: 80vh !important;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  animation: pop-in 0.3s ease;
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.chart-toolbar {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.chart-toolbar:hover {
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.fullscreen-chart .chart-toolbar {
  top: 20px;
  right: 20px;
}

/* 增大工具栏按钮 */
:deep(.chart-toolbar .el-button.el-button--small.is-circle) {
  width: 36px;
  height: 36px;
  font-size: 16px;
}

.chart-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9;
}

.loading-icon {
  font-size: 32px;
  color: #409EFF;
  animation: spin 1.5s linear infinite;
}

.loading-text {
  margin-top: 10px;
  color: #606266;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.chart-message {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 8;
}
</style> 