<template>
  <el-header class="eb-header">
    <div class="eb-header-side">
      <!-- 左侧可以放置面包屑导航或页面标题 -->
    </div>
    <div class="eb-header-center">
      <img src="@/assets/images/logo.png"
           alt="logo"
           class="eb-logo">
    </div>
    <div class="eb-header-right">
      <div class="eb-user-info">
        <div class="user-info-container">
          <el-avatar :size="40"
                     :src="adminInfo.avatar"
                     class="user-avatar"></el-avatar>
          <div class="user-details">
            <span class="user-name">{{ adminInfo.username }}</span>
            <span class="user-role">{{ adminInfo.role }}</span>
          </div>
        </div>
        <el-button type="text" @click="handleLogout" class="logout-button">
          退出登录
        </el-button>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/store/admin'
import { ElMessage } from 'element-plus'
import { SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const adminStore = useAdminStore()
// 使用假数据替换用户名和角色
const adminInfo = ref({
  username: adminStore.adminInfo.userName,
  role: adminStore.adminInfo.roleName,
  avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
})

const handleLogout = async () => {
  try {
    await adminStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/login/admin')
    window.location.reload();
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
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

.eb-header-side {
  flex: 1;
  display: flex;
  align-items: center;
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

.eb-logo {
  height: 36px;
  margin: 0 auto;
}

.eb-user-info {
  display: flex;
  align-items: center;
  gap: 5px;
}

.user-info-container {
  display: flex;
  align-items: center;
}

.user-avatar {
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.user-details {
  margin: 0 10px;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.2;
}

.user-role {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}

.logout-button {
  font-size: 14px;
  color: #409EFF;
  margin-left: 0;
  padding-left: 5px;
}

.logout-button:hover {
  color: #66b1ff;
  text-decoration: underline;
}
</style>