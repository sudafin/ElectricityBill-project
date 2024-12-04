<template>
  <el-header class="eb-header">
    <div class="eb-header-left">
      <img src="@/assets/images/logo.png"
           alt="logo"
           class="eb-logo">
    </div>
    <div class="eb-header-right">
      <div class="eb-user-details">
        <span class="eb-user-name">{{ adminInfo.username }} | {{ adminInfo.role }}</span>
      </div>
      <el-dropdown>
        <div class="eb-user-info">
          <el-avatar :size="42"
                     :src="adminInfo.avatar"></el-avatar>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item divided
                              @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
const router = useRouter()
const userStore = useUserStore()
// 使用假数据替换用户名和角色
const adminInfo = ref({
  username: userStore.adminInfo.userName,
  role: userStore.adminInfo.roleName,
  avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
})

const handleLogout = async () => {
  try {
    await userStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}
</script>

<style scoped>
.eb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  background-color: #f5f7fa;
  padding: 0 20px;
  border-bottom: 1px solid #e4e7ed;
}

.eb-header-right {
  display: flex;
  align-items: center;
}

.eb-user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.eb-user-details {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
}

.eb-user-name {
  font-size: 14px;
  font-weight: 100;
  color: rgb(126, 164, 251);
  margin-top: 2px;
}

.eb-header-left {
  display: flex;
  align-items: center;
}

.eb-logo {
  height: 50px;
  margin-left: 30px;
}
:focus-visible {
  outline: none;
}
</style>