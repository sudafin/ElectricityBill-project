<template>
  <div class="eb-blank-layout">
    <router-view></router-view>
  </div>
</template>

<script setup>
// 空的 setup 脚本
</script>

<style scoped>
.eb-blank-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}
</style> 