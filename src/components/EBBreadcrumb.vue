<template>
  <!-- 不为空时显示面包屑 -->
  <div v-if="breadcrumbList.length > 0" class="eb-breadcrumb-container">
    <!-- separator="/" 表示使用斜杠作为分隔符 -->
    <el-breadcrumb class="eb-breadcrumb" separator="|">
      <!-- 遍历面包屑列表 :key 是唯一标识符  :to 是跳转的路径  :class 是当前路由的样式 -->
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbList"
        :key="item.path + index"
        @click="handleBreadcrumbClick(index)"
        :class="{ 'current-route': index === breadcrumbList.length - 1 }"
      >
        <!-- 显示面包屑的标题 -->
        {{ item.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const breadcrumbList = ref([]);

// 设置localStorage中历史记录的键名
const BREADCRUMB_HISTORY_KEY = 'eb-breadcrumb-history';

// 从localStorage获取历史面包屑
const loadBreadcrumbHistory = () => {
  try {
    const savedHistory = localStorage.getItem(BREADCRUMB_HISTORY_KEY);
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    console.error('加载面包屑历史记录失败:', error);
    return [];
  }
};

// 保存面包屑历史到localStorage
const saveBreadcrumbHistory = (history) => {
  try {
    localStorage.setItem(BREADCRUMB_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('保存面包屑历史记录失败:', error);
  }
};

// 处理面包屑点击
const handleBreadcrumbClick = (index) => {
  // 如果点击的是当前项，不做任何操作
  if (index === breadcrumbList.value.length - 1) return;
  
  // 获取点击的项
  const item = breadcrumbList.value[index];
  
  // 截断面包屑历史到点击的位置
  breadcrumbList.value = breadcrumbList.value.slice(0, index + 1);
  
  // 保存更新后的历史
  saveBreadcrumbHistory(breadcrumbList.value);
  
  // 导航到点击的路由
  router.push({
    path: item.path,
    query: item.query || {}
  });
};

// 更新面包屑
const updateBreadcrumb = () => {
  // 获取当前路由的信息
  const { path, meta, name, fullPath, query } = route;
  
  // 如果路由没有标题或被标记为隐藏，则不在面包屑中显示
  if (!meta || !meta.title || meta.hidden) return;
  
  // 检查当前路由是否已经在面包屑列表中
  const existingIndex = breadcrumbList.value.findIndex(item => 
    item.path === path || (item.name === name && name)
  );
  
  if (existingIndex !== -1) {
    // 如果已存在，截断到该项
    breadcrumbList.value = breadcrumbList.value.slice(0, existingIndex + 1);
    
    // 更新该项的信息（可能参数变了）
    breadcrumbList.value[existingIndex] = {
      title: meta.title,
      path: path,
      name: name,
      query: query,
      fullPath: fullPath
    };
  } else {
    // 如果不存在，添加到列表末尾
    breadcrumbList.value.push({
      title: meta.title,
      path: path,
      name: name,
      query: query,
      fullPath: fullPath
    });
  }
  
  // 保存到localStorage
  saveBreadcrumbHistory(breadcrumbList.value);
};

// 监听路由变化
watch(() => route.fullPath, () => {
  updateBreadcrumb();
}, { immediate: true });

// 组件挂载时加载历史记录
onMounted(() => {
  // 初始化时，尝试从localStorage加载历史记录
  const history = loadBreadcrumbHistory();
  
  // 如果有历史记录且当前路由与最后一条记录不同，才设置历史
  if (history.length > 0) {
    const lastItem = history[history.length - 1];
    
    // 检查最后一项是否为当前路由
    if (lastItem.path === route.path || (lastItem.name && lastItem.name === route.name)) {
      breadcrumbList.value = history;
    } else {
      // 清空历史，从当前路由开始重新记录
      breadcrumbList.value = [];
      updateBreadcrumb();
    }
  } else {
    // 无历史记录，初始化当前路由
    updateBreadcrumb();
  }
});
</script>

<style scoped>
.eb-breadcrumb-container {
  background-color: #fff;
  border-radius: 20px;
  padding: 10px 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: inline-block;
  margin: 10px 10px 0px 18px;
  max-width: calc(100% - 36px);
  overflow: hidden;
}

.eb-breadcrumb :deep(.el-breadcrumb__inner) {
  color: #333;
  font-weight: bold;
  cursor: pointer;
}

.eb-breadcrumb :deep(.el-breadcrumb__inner):hover {
  color: #6B97FF;
}

.eb-breadcrumb :deep(.current-route .el-breadcrumb__inner) {
  color: #6B97FF;
  cursor: default;
}

.eb-breadcrumb :deep(.el-breadcrumb__separator) {
  color: #999;
}

/* 允许长面包屑滚动查看 */
.eb-breadcrumb {
  white-space: nowrap;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
}

.eb-breadcrumb::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}
</style> 