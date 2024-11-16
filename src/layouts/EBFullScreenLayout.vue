<template>
  <div class="eb-fullscreen-layout">
    <router-view></router-view>
  </div>
</template>

<script setup>
</script>

<style scoped>
.eb-fullscreen-layout {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
}
</style> 