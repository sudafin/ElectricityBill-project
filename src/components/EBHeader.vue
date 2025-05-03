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
import { ElMessage, ElMessageBox } from 'element-plus'
import { SwitchButton } from '@element-plus/icons-vue'
import { removeAdminToken, removeAdminInfo, removeAdminRefreshToken } from '@/utils/auth'

const router = useRouter()
const adminStore = useAdminStore()
// 使用假数据替换用户名和角色
const adminInfo = ref({
  username: adminStore.adminInfo.userName || '管理员',
  role: adminStore.adminInfo.roleName || '未知角色',
  avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
})

const handleLogout = async () => {
  try {
    // 使用确认对话框
    ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        // 调用 store 的 logout 方法
        await adminStore.logout()
        
        // 额外确保所有 token 和信息都被清除
        removeAdminToken()
        removeAdminRefreshToken()
        removeAdminInfo()
        
        ElMessage.success('退出登录成功')
        
        // 先导航到登录页，再在导航完成后刷新页面
        router.push('/login/admin')
      } catch (error) {
        console.error('退出登录失败:', error)
        ElMessage.error('退出登录失败，请重试')
      }
    }).catch(() => {
      // 用户取消退出登录操作
      ElMessage.info('已取消退出操作')
    })
  } catch (error) {
    console.error('退出登录对话框错误:', error)
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