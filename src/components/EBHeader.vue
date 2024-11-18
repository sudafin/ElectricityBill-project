<template>
  <el-header class="eb-header">
    <div class="eb-header-left">
      <img src="@/assets/images/logo.png" alt="logo" class="eb-logo">
    </div>
    <div class="eb-header-right">
      <el-dropdown>
        <div class="eb-avatar-wrapper">
          <el-avatar :size="45" :src="avatarUrl"></el-avatar>
          <!-- <span class="eb-user-name">Admin</span> -->
        </div>
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
  background-color: white;
  padding: 0 20px;
  box-shadow: 0 2px 12px #fff
}

.eb-title {
  font-size: 20px;
  font-weight: 600;
}

.eb-header-right {
  display: flex;
  align-items: center;
}

.eb-header-right .el-dropdown {
  margin-left: 20px;
}

.eb-avatar-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 30px;
  transition: all 0.5s;
}

.eb-avatar-wrapper:hover {
  background-color:transparent;
}

.eb-user-name {
  margin-left: 10px;
  color: #fff;
  font-weight: 600;
}

.eb-header-left {
  display: flex;
  align-items: center;
}

.eb-logo {
  height: 50px;
  margin-left: 30px;

}
</style> 