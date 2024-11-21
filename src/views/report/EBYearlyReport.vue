<template>
  <EBChart :option="props.yearlyElectricityUsageOption || props.yearlyFeeAmountOption" height="240px" />
</template>

<script setup>
import { defineProps } from 'vue';
import EBChart from '@/components/EBChart.vue';

const props = defineProps({
  yearlyElectricityUsageOption: {
    type: Object,
    required: true
  },
  yearlyFeeAmountOption: {
    type: Object,
    required: true
  }
});
</script> 