<template>
  <div class="user-form">
    <el-card class="glass-card">
      <template #header>
        <div class="form-header">
          <div class="title">用户信息</div>
          <div class="subtitle">请填写用户基本信息</div>
        </div>
      </template>
      <el-form 
        ref="userFormRef" 
        :model="userForm" 
        :rules="rules" 
        label-width="120px"
        class="glass-form"
      >
        <el-form-item label="用户姓名" prop="username">
          <el-input 
            v-model="userForm.username" 
            placeholder="请输入用户姓名"
            class="glass-input"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input 
            v-model="userForm.phone" 
            placeholder="请输入电话"
            class="glass-input"
          >
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input 
            v-model="userForm.address" 
            placeholder="请输入地址"
            class="glass-input"
          >
            <template #prefix>
              <el-icon><Location /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select 
            v-model="userForm.userType" 
            placeholder="请选择用户类型"
            class="glass-select"
          >
            <el-option label="居民用户" value="居民用户">
              <template #default="{ label }">
                <el-icon><House /></el-icon>
                <span style="margin-left: 8px">{{ label }}</span>
              </template>
            </el-option>
            <el-option label="商业用户" value="商业用户">
              <template #default="{ label }">
                <el-icon><Shop /></el-icon>
                <span style="margin-left: 8px">{{ label }}</span>
              </template>
            </el-option>
          </el-select>
        </el-form-item>
        <div class="form-buttons">
          <el-button 
            class="glass-button" 
            @click="resetForm"
          >
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
          <el-button 
            class="glass-button-primary" 
            type="primary" 
            @click="submitForm"
          >
            <el-icon><Check /></el-icon>
            提交
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { 
  User, 
  Phone, 
  Location, 
  House, 
  Shop, 
  RefreshRight, 
  Check 
} from '@element-plus/icons-vue';

const router = useRouter();
const userFormRef = ref(null);

const isEdit = ref(false);
const userForm = reactive({
  username: '',
  phone: '',
  address: '',
  userType: '',
});

const rules = reactive({
  username: [{ required: true, message: '请输入用户姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }],
});

const submitForm = async () => {
  userFormRef.value.validate((valid) => {
    if (valid) {
      // 提交表单
      console.log('提交表单:', userForm);
      ElMessage.success('提交成功');
      router.push({ name: 'UserDashboard' });
    } else {
      console.log('表单验证失败!');
      return false;
    }
  });
};

const resetForm = () => {
  userFormRef.value.resetFields();
};
</script>

<style scoped>
.user-form {
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f8fb 0%, #e9ecf1 100%);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 60px;
}

/* 玻璃态卡片优化 */
.glass-card {
  width: 600px;
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.6) !important;
  border-radius: 24px !important;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.7) !important;
}

/* 表单头部样式优化 */
.form-header {
  padding: 24px 28px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6));
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
  position: relative;
  padding-left: 16px;
}

.title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background: linear-gradient(to bottom, #409eff, #36acfe);
  border-radius: 2px;
}

.subtitle {
  font-size: 14px;
  color: #606266;
  margin-left: 16px;
  opacity: 0.8;
}

/* 表单元素样式优化 */
.glass-form {
  padding: 32px;
}

.glass-input :deep(.el-input__wrapper),
.glass-select :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(8px);
  box-shadow: 
    0 2px 12px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.7) !important;
  border-radius: 12px;
  padding: 8px 16px;
  height: 44px;
}

.glass-input :deep(.el-input__prefix),
.glass-select :deep(.el-input__prefix) {
  color: #409eff;
  font-size: 16px;
  margin-right: 8px;
}

/* 按钮样式优化 */
.glass-button-primary,
.glass-button {
  height: 44px;
  padding: 0 24px;
  font-weight: 500;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.glass-button-primary {
  background: linear-gradient(135deg, #409eff, #36acfe) !important;
  border: none !important;
  box-shadow: 
    0 4px 12px rgba(64, 158, 255, 0.3),
    0 0 0 1px rgba(64, 158, 255, 0.1) !important;
}

.glass-button {
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  color: #606266;
}

.glass-button:hover,
.glass-button-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4) !important;
}

.form-buttons {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* 表单项样式优化 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #2c3e50;
  font-size: 15px;
}

.el-form-item {
  margin-bottom: 28px;
}

/* 动画效果 */
.glass-card,
.glass-input :deep(.el-input__wrapper),
.glass-select :deep(.el-input__wrapper),
.glass-button,
.glass-button-primary {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 选择器选项样式 */
:deep(.el-select-dropdown__item) {
  display: flex;
  align-items: center;
  padding: 8px 16px;
}

:deep(.el-select-dropdown__item .el-icon) {
  margin-right: 8px;
  font-size: 16px;
  color: #409eff;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: rgba(144, 147, 153, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(144, 147, 153, 0.5);
}

::-webkit-scrollbar-track {
  background: transparent;
}
</style> 