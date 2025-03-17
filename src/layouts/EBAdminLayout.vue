<template>
  <div class="admin-layout">
    <EBAdminSidebar />
    <div class="right-container" :class="{ 'sidebar-expanded': sidebarExpanded }">
      <EBHeader />
      <main class="admin-main">
        <router-view />
      </main>
      <footer class="admin-footer">
        <p>© 2023 电费收缴管理系统 版权所有</p>
      </footer>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="400px"
      destroy-on-close
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入原密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPasswordChange">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import EBAdminSidebar from '@/components/EBAdminSidebar.vue';
import EBHeader from '@/components/EBHeader.vue';

const router = useRouter();
const avatarUrl = ref('/images/avatar/admin-avatar.png');
const adminName = ref('管理员');
const sidebarExpanded = ref(false);
const passwordDialogVisible = ref(false);
const passwordFormRef = ref(null);

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

const handleSidebarToggle = (event) => {
  sidebarExpanded.value = event.detail.expanded;
};

onMounted(() => {
  document.addEventListener('adminSidebarToggle', handleSidebarToggle);
});

onUnmounted(() => {
  document.removeEventListener('adminSidebarToggle', handleSidebarToggle);
});

const goToProfile = () => {
  router.push('/admin/profile');
};

const showChangePassword = () => {
  passwordDialogVisible.value = true;
};

const submitPasswordChange = () => {
  passwordFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟密码修改请求
      setTimeout(() => {
        ElMessage.success('密码修改成功');
        passwordDialogVisible.value = false;
        passwordForm.value = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      }, 1000);
    }
  });
};

const handleLogout = () => {
  ElMessageBox.confirm('确认退出登录?', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 模拟登出操作
    setTimeout(() => {
      ElMessage.success('已成功退出登录');
      router.push('/login');
    }, 500);
  }).catch(() => {
    // 取消操作
  });
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.right-container {
  flex: 1;
  margin-left: 60px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}

.right-container.sidebar-expanded {
  margin-left: 200px;
}

.admin-header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  z-index: 10;
}

.admin-header-left {
  display: flex;
  align-items: center;
}

.admin-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.admin-header-right {
  display: flex;
  align-items: center;
}

.admin-avatar {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.admin-name {
  margin: 0 8px;
  font-size: 14px;
  color: #333;
}

.admin-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.admin-footer {
  height: 50px;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  font-size: 12px;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
}
</style> 