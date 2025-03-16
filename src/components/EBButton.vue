<template>
  <el-button 
    class="capsule-button" 
    v-bind="$attrs" 
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </el-button>
</template>

<script setup>
defineEmits(['click']);
</script>

<style scoped>
/* 样式已在全局样式文件中定义 */
</style> 