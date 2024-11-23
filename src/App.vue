<template>
  <!-- 根据路由元信息确定布局 :is是vue的动态组件指令, 根据变量layout的值来决定渲染哪个组件 -->
  <component :is="layout">
    <router-view />
  </component>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import EBBasicLayout from '@/layouts/EBBasicLayout.vue'; // 管理主页面
import EBLogin from '@/views/login/EBLogin.vue'; // 登录页面
import EBBlankLayout from '@/layouts/EBBlankLayout.vue'; // 空白页面

const route = useRoute();

// 根据路由元信息确定布局
const layout = computed(() => {
  switch (route.meta.layout) {
    // 登录页面
    case 'login':
      //返回组件
      return EBLogin;
    // 空白页面布局
    case 'blank':
      return EBBlankLayout;
    // 默认布局界面
    case 'default':
      return EBBasicLayout;
  }
});
</script>

<style>
body {
  width: 100%;
  height: 100%;
  background: #f0f2f5;
}
</style> 