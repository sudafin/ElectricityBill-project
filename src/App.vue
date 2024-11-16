<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import EBBasicLayout from '@/layouts/EBBasicLayout.vue';
import EBBlankLayout from '@/layouts/EBBlankLayout.vue';

const route = useRoute();

const layout = computed(() => {
  if (route.meta.layout === 'blank') {
    return EBBlankLayout;
  }
  return EBBasicLayout;
});
</script>

<style>
body {
  background: #fff;
}
</style> 