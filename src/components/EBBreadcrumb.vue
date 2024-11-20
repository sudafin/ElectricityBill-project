<template>
  <!-- 不为空时显示面包屑 -->
  <div v-if="breadcrumbList.length > 0" class="eb-breadcrumb-container">
    <!-- separator="/" 表示使用斜杠作为分隔符 -->
    <el-breadcrumb class="eb-breadcrumb" separator="|">
      <!-- 遍历面包屑列表 :key 是唯一标识符  :to 是跳转的路径  :class 是当前路由的样式 -->
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbList"
        :key="index"
        :to="{ name: item.redirect || item.name, params: item.params }"
        :class="{ 'current-route': index === breadcrumbList.length - 1 }"
      >
        <!-- 显示面包屑的标题 -->
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
let currentModuleName = null;

const generateBreadcrumb = () => {
  // 获取当前路由的全部匹配路径  从父路径到子路径 一个父路径一个数组元素,比如说我们的user模块,它就有三个元素, 第一个元素就是'/' 开头全部数据包括子路径 ,第二个元素就是'/user' 开头全部数据包括子路径,第三个元素就是'/user/dashboard' 开头全部数据包括子路径
  const matched = route.matched;


  /**
   * 找到当前的路径和切换模块路径
   */
  // 找到当前页面的模块路径,所以需要包括children
  const moduleRoute = matched.find(item => item.meta && item.meta.title && item.children);
  //如果模块路径存在且当前页面的模块不属于当前模块的名字,那么就会需要替换面包屑
  if (moduleRoute && moduleRoute.name !== currentModuleName) {
    // 重新赋值当前模块的名字
    currentModuleName = moduleRoute.name;
    // 如果当前模块没有子模块children:true 我们自己设置的备注值,那么就只显示当前模块
    if(!moduleRoute.meta.children) {
      breadcrumbList.value = [moduleRoute];
    }else{
      //如果当前有子模块, 需要把上一个不是当前模块的元素全部删除
      breadcrumbList.value.splice(0);
    }
  }

  /*
  确保没有重复路径
  */
  // 获取当前路由的最后一个元素也就是当前元素
  const currentRoute = matched[matched.length - 1];
  if (currentRoute && currentRoute.meta && currentRoute.meta.title) {
    // 找到当前元素在breadcrumbList中的位置,如果没有找到说明breadcrumbList中没有当前元素,那么就添加当前元素,如果有索引说明breadcrumbList中已经有当前元素,那么就删除breadcrumbList中当前元素,然后重新添加, 这一步是为了保证breadcrumbList中只有一个当前元素
    const index = breadcrumbList.value.findIndex(item => item.name === currentRoute.name);
    if (index !== -1) {
      // 删除breadcrumbList中从index开始到最后的所有元素
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