<template>
  <el-header class="eb-header">
    <div class="eb-header-left">
      <span class="eb-title">电费管理系统</span>
    </div>
    <div class="eb-header-right">
      <el-dropdown>
        <el-avatar :size="40" :src="avatarUrl"></el-avatar>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人中心</el-dropdown-item>
            <el-dropdown-item divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup>
import { ref } from 'vue';

const avatarUrl = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png');
</script>

<style scoped>
.eb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  background-color: #fff;
  color: #333;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.eb-title {
  font-size: 20px;
  font-weight: bold;
}

.eb-header-right {
  display: flex;
  align-items: center;
}

.eb-header-right .el-dropdown {
  margin-left: 20px;
}
</style> 