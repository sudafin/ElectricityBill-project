<template>
  <!-- 根据路由元信息确定布局 :is是vue的动态组件指令, 根据变量layout的值来决定渲染哪个组件 -->
    <router-view />
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import EBBasicLayout from '@/layouts/EBAdminLayout.vue'; // 管理主页面
import EBLogin from '@/views/login/EBLogin.vue'; // 登录页面
import EBBlankLayout from '@/layouts/EBBlankLayout.vue'; // 空白页面


</script>

<style>
body {
  width: 100%;
  height: 100%;
  background: #f0f2f5;
}
</style> 