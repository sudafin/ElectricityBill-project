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
  const routeOptions = {
    path: item.path,
    query: item.query || {}
  };
  
  // 如果有路由参数，添加到导航选项中
  if (item.params && Object.keys(item.params).length > 0) {
    routeOptions.params = item.params;
  }
  
  // 使用name导航可以保证参数被正确解析
  if (item.name) {
    router.push({ 
      name: item.name, 
      params: item.params || {}, 
      query: item.query || {} 
    });
  } else {
    router.push(routeOptions);
  }
};

// 更新面包屑
const updateBreadcrumb = () => {
  // 获取当前路由的信息
  const { path, meta, name, fullPath, query, params } = route;
  
  // 如果路由没有标题或被标记为隐藏，则不在面包屑中显示
  if (!meta || !meta.title || meta.hidden) return;
  
  // 获取路由的基础路径（移除参数部分）
  const basePath = path.split('/').slice(0, -1).join('/');
  
  // 特殊处理：对于详情页面，保留其父级（列表页面）
  const isDetailPage = path.includes('/detail/') || path.includes('/payment/');
  
  // 检查当前路由是否已经在面包屑列表中
  const existingIndex = breadcrumbList.value.findIndex(item => 
    item.path === path || (item.name === name && name) || 
    (isDetailPage && item.path === basePath)
  );
  
  // 检查是否为支付详情或支付页面，它们是paymentDashboard的子页面
  const isPaymentSubpage = path.includes('/paymentDashboard/');
  const parentPath = '/user/paymentDashboard';
  
  // 检查当前面包屑中是否有父路由
  const parentIndex = isPaymentSubpage ? 
    breadcrumbList.value.findIndex(item => item.path === parentPath) : -1;
  
  if (existingIndex !== -1) {
    // 如果已存在，截断到该项
    breadcrumbList.value = breadcrumbList.value.slice(0, existingIndex + 1);
    
    // 更新该项的信息（可能参数变了）
    breadcrumbList.value[existingIndex] = {
      title: meta.title,
      path: path,
      name: name,
      query: query,
      params: params,
      fullPath: fullPath
    };
  } else if (isPaymentSubpage && parentIndex !== -1) {
    // 对于支付相关子页面，保留父路由并添加当前页面
    breadcrumbList.value = breadcrumbList.value.slice(0, parentIndex + 1);
    
    // 添加当前路由
    breadcrumbList.value.push({
      title: meta.title,
      path: path,
      name: name,
      query: query,
      params: params,
      fullPath: fullPath
    });
  } else {
    // 如果不存在，添加到列表末尾
    breadcrumbList.value.push({
      title: meta.title,
      path: path,
      name: name,
      query: query,
      params: params,
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

  // 当前路径是否为详情页
  const isDetailPage = route.path.includes('/detail/') || route.path.includes('/payment/');
  const basePath = route.path.split('/').slice(0, -1).join('/');
  
  // 如果有历史记录，检查是否可以保留
  if (history.length > 0) {
    const lastItem = history[history.length - 1];
    
    // 检查最后一项是否为当前路由
    if (lastItem.path === route.path || 
        (lastItem.name && lastItem.name === route.name) ||
        (isDetailPage && history.some(item => item.path === basePath))) {
      // 如果是详情页并且历史中有父级路径，保留历史
      breadcrumbList.value = history;
      
      // 如果当前路由不在历史记录的末尾，添加它
      if (lastItem.path !== route.path && lastItem.name !== route.name) {
        updateBreadcrumb();
      }
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
  border-radius: 10px;
  padding: 10px 20px;
  box-shadow: none !important;
  border: 1px solid #ebeef5;
  display: inline-block;
  margin: 10px 0px 10px 0px;
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