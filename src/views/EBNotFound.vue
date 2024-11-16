<template>
  <div class="not-found">
    <h1>404</h1>
    <p>抱歉,您访问的页面不存在。</p>
    <el-button type="primary" @click="goBack">返回上一页</el-button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
}

h1 {
  font-size: 100px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 20px;
}

p {
  font-size: 20px;
  margin-bottom: 20px;
}
</style> 