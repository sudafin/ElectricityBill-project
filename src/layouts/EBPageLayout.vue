
<template>
  <div class="eb-page-container">
    <div class="eb-content-wrapper">
      <div v-if="$slots.header" class="eb-header">
        <slot name="header"></slot>
      </div>
      <div class="eb-content">
        <slot></slot>
      </div>
    </div>
    <slot name="extra"></slot>
  </div>
</template>

<script setup>
// 这个组件主要提供用户端页面的基本布局结构
</script>

<style scoped>
.eb-page-container {
  padding: 0;
  background-color: transparent;
  min-height: 100%;
  position: relative;
}

.eb-content-wrapper {
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  border: none;
  position: relative;
  margin-bottom: 16px;
}

.eb-header {
  padding: 12px 24px;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
}

.eb-content {
  padding: 20px;
  background-color: #ffffff;
}

/* 重置子元素阴影设置，允许卡片阴影 */
:deep(*) {
  filter: none !important;
}
</style> 