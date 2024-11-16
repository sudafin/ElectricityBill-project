<template>
  <div class="eb-chart" ref="chartRef"></div>
</template>

<script setup>
import { ref, onMounted, defineProps, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  option: {
    type: Object,
    default: () => ({}),
  },
});

const chartRef = ref(null);
let chart = null;

onMounted(() => {
  chart = echarts.init(chartRef.value);
  chart.setOption(props.option);
});

watch(
  () => props.option,
  (newVal) => {
    chart.setOption(newVal);
  },
  { deep: true }
);
</script>

<style scoped>
.eb-chart {
  width: 100%;
  height: 400px;
}
</style> 