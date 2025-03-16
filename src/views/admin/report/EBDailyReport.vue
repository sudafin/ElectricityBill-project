<template>
  <EBChart :option="props.dailyElectricityUsageOption || props.dailyFeeAmountOption" height="120px" />
</template>

<script setup>
import { defineProps } from 'vue';
import EBChart from '@/components/EBChart.vue';

const props = defineProps({
  dailyElectricityUsageOption: {
    type: Object,
    required: true
  },
  dailyFeeAmountOption: {
    type: Object,
    required: true
  }
});
</script> 