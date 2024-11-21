<template>
  <EBChart :option="props.monthlyElectricityUsageOption || props.monthlyFeeAmountOption" height="240px" />
</template>

<script setup>
import { defineProps } from 'vue';
import EBChart from '@/components/EBChart.vue';

const props = defineProps({
  monthlyElectricityUsageOption: {
    type: Object,
    required: true
  },
  monthlyFeeAmountOption: {
    type: Object,
    required: true
  }
});
</script> 