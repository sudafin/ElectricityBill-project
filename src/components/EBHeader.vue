<template>
  <el-header class="eb-header">
    <div class="eb-header-side">
      <!-- 左侧留空 -->
    </div>
    <div class="eb-header-center">
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
  height: 64px;
  background-color: #fff;
  padding: 0 24px;
  border-bottom: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05) !important;
}

.eb-header-side {
  flex: 1;
}

.eb-header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.eb-header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.eb-user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.eb-user-info:hover {
  background-color: #f0f2f5;
}

.eb-user-details {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
}

.eb-user-name {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  margin-top: 0;
}

.eb-logo {
  height: 32px;
}

:focus-visible {
  outline: none;
}
</style>