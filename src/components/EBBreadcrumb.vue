<template>
  <div v-if="breadcrumbList.length > 0" class="eb-breadcrumb-container">
    <el-breadcrumb class="eb-breadcrumb" separator="/">
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbList"
        :key="index"
        :to="{ name: item.redirect || item.name, params: item.params }"
        :class="{ 'current-route': index === breadcrumbList.length - 1 }"
      >
        {{ item.meta.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
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
.eb-breadcrumb-container {
  background-color: #fff;
  border-radius: 20px;
  padding: 10px 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: inline-block;
  margin: 10px 10px -5px 18px;
}

.eb-breadcrumb :deep(.el-breadcrumb__inner) {
  color: #333;
  font-weight: bold;
}

.eb-breadcrumb :deep(.el-breadcrumb__inner):hover {
  color: #6B97FF;
}

.eb-breadcrumb :deep(.current-route .el-breadcrumb__inner) {
  color: #6B97FF;
}

.eb-breadcrumb :deep(.el-breadcrumb__separator) {
  color: #999;
}
</style> 