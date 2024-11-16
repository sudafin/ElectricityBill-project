<template>
  <el-breadcrumb v-if="breadcrumbList.length > 0" class="eb-breadcrumb" separator="/">
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbList"
      :key="index"
      :to="{ name: item.redirect || item.name, params: item.params }"
    >
      {{ item.meta.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const breadcrumbList = ref([]);
let currentModule = null;

const generateBreadcrumb = () => {
  const matched = route.matched;

  // 检查是否切换了模块
  const moduleRoute = matched.find(item => item.meta && item.meta.title && item.children);
  if (moduleRoute && moduleRoute.name !== currentModule) {
    currentModule = moduleRoute.name;
    breadcrumbList.value = [moduleRoute];
  }

  // 添加当前路由
  const currentRoute = matched[matched.length - 1];
  if (currentRoute && currentRoute.meta && currentRoute.meta.title) {
    const index = breadcrumbList.value.findIndex(item => item.name === currentRoute.name);
    if (index !== -1) {
      breadcrumbList.value.splice(index);
    }
    breadcrumbList.value.push(currentRoute);
  }
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