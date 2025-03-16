<template>
  <div class="eb-page-container">
    <el-card class="eb-card">
      <template #header v-if="$slots.header">
        <div class="eb-header">
          <slot name="header"></slot>
        </div>
      </template>
      <slot></slot>
    </el-card>
    <slot name="extra"></slot>
  </div>
</template>

<script setup>
// 这个组件主要提供页面的基本布局结构
</script>

<style scoped>
.eb-page-container {
  padding: 20px;
  background-color: #f5f7fa;
}

.eb-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.eb-header {
  margin-bottom: 0;
  padding: 5px 0;
}
</style> 