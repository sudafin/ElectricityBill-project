<template>
  <el-breadcrumb class="eb-breadcrumb" separator="/">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index" :to="item.path">
      {{ item.meta.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const breadcrumbList = ref([]);

const generateBreadcrumb = () => {
  breadcrumbList.value = route.matched.filter(item => item.meta && item.meta.title);
};

watch(
  () => route.path,
  () => {
    generateBreadcrumb();
  },
  { immediate: true }
);
</script>

<style scoped>
.eb-breadcrumb {
  margin: 20px;
}
</style> 