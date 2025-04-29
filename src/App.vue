<template>
  <!-- 根据路由元信息确定布局 :is是vue的动态组件指令, 根据变量layout的值来决定渲染哪个组件 -->
    <router-view />
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import EBBasicLayout from '@/layouts/EBAdminLayout.vue'; // 管理主页面
import EBLogin from '@/views/login/EBAdminLogin.vue'; // 登录页面
import EBBlankLayout from '@/layouts/EBBlankLayout.vue'; // 空白页面


</script>

<style>
/* 基础重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  background: #f0f2f5;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  line-height: 1.5;
}

/* 链接样式重置 */
a {
  text-decoration: none;
  color: inherit;
}

/* 列表样式重置 */
ul, ol {
  list-style: none;
}

/* 图片样式 */
img {
  max-width: 100%;
  display: block;
}

/* 表格样式重置 */
table {
  border-collapse: collapse;
  border-spacing: 0;
}

/* 表单元素样式统一 */
button, input, select, textarea {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  outline: none;
}

/* 防止文本溢出 */
.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 清除浮动 */
.clearfix:after {
  content: "";
  display: table;
  clear: both;
}
</style> 