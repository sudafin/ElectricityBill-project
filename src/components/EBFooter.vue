<template>
  <el-footer class="eb-footer">
    <span>&copy; {{ currentYear }} 电费管理系统. All rights reserved.</span>
  </el-footer>
</template>

<script setup>
import { ref } from 'vue';

const currentYear = ref(new Date().getFullYear());
</script>

<style scoped>
.eb-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 14px;
}
</style> 