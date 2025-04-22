<template>
  <div class="eb-batch-actions">
    <slot></slot>
  </div>
</template>

<script setup>
// 这个组件主要是提供样式和结构，内容通过插槽传入
</script>

<style scoped>
.eb-batch-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 