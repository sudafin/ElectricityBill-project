<template>
  <div class="user-form">
    <el-card class="glass-card">
      <template #header>
        <div class="form-header">
          <div class="title">用户信息</div>
          <div class="subtitle">请填写或修改用户基本信息</div>
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
          <el-input v-model="userForm.username" placeholder="请输入用户姓名"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入电话"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="userForm.address" placeholder="请输入地址"></el-input>
        </el-form-item>
        <el-form-item label="电表编号" prop="meterNo">
          <el-input v-model="userForm.meterNo" placeholder="请输入电表编号"></el-input>
        </el-form-item>
        <el-form-item label="用户状态" prop="accountStatus">
          <el-select v-model="userForm.accountStatus" placeholder="请选择用户状态">
            <el-option label="正常" value="正常"></el-option>
            <el-option label="欠费" value="欠费"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="userForm.userType" placeholder="请选择用户类型">
            <el-option label="居民用户" value="居民用户"></el-option>
            <el-option label="商业用户" value="商业用户"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="电费余额" prop="balance">
          <el-input-number v-model="userForm.balance" :precision="2" :step="0.1"></el-input-number>
        </el-form-item>
        <div class="form-buttons">
          <el-button 
            class="glass-button" 
            @click="resetForm"
            :disabled="isEdit"
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
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
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
import { getUserDetail, editUser, createUser } from '@/api/user.js';

const router = useRouter();
const userFormRef = ref(null);

const route = useRoute();
const isEdit = ref(false);
const userForm = reactive({
  username: '',
  phone: '',
  address: '',
  meterNo: '',
  accountStatus: '',
  userType: '',
  balance: 0,
});
const rules = reactive({
  username: [{ required: true, message: '请输入用户姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' },{
    validator: (rule, value, callback) => {
      if (!value || !/^\d{11}$/.test(value)) {
        callback(new Error('请输入正确的电话号码'));
      }
      callback();
    },
  }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }],
  meterNo: [{ required: true, message: '请输入电表编号', trigger: 'blur' }],
});

onMounted(async () => {
  const userId = route.params.id;
  //假如路由参数有id，则表示是编辑用户
  if (userId) {
    isEdit.value = true;
    try {
      const res = await getUserDetail(userId);
      const { username, phone, address, meterNo, accountStatus, userType, balance } = res;
      userForm.username = username;
      userForm.phone = phone;
      userForm.address = address;
      userForm.meterNo = meterNo;
      userForm.accountStatus = accountStatus;
      userForm.userType = userType;
      userForm.balance = balance;
    } catch (error) {
      console.error('获取用户详情失败:', error);
      ElMessage.error('获取用户详情失败,请稍后再试');
    }
  }
});


const submitForm = async () => {
  //如果表单验证通过，则提交表单
  userFormRef.value.validate(async (valid) => {
    if (valid) {
      //查看是否是编辑用户
      if (isEdit.value) {
        // 编辑用户
        const res = await editUser(userForm);
        if(res.code === 200){
          ElMessage.success('编辑用户成功');
          router.push({ name: 'UserDashboard' });
        } else {
          ElMessage.error('编辑用户失败');
        }
      } else {
        // 新增用户
        const res = await createUser(userForm);
        console.log("新增用户:", res);
        if(res.code === 200){
          ElMessage.success('新增用户成功');
          router.push({ name: 'UserDashboard' });
        } else {
          ElMessage.error('新增用户失败');
        }
      }
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
  padding: 10px;
  min-height: 60vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 5px;
}

.glass-card {
  width: 600px;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(174, 171, 171, 0.6) !important;
  box-shadow: 
    0 6px 24px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.7) !important;
  border-radius: 20px !important;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 10px 32px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.8) !important;
}

.form-header {
  padding: 20px 24px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 5px;
  letter-spacing: 0.5px;
  position: relative;
  padding-left: 14px;
}

.title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background: linear-gradient(to bottom, #3498db, #2980b9);
  border-radius: 2px;
}

.subtitle {
  font-size: 13px;
  color: #475669;
  margin-left: 14px;
  opacity: 0.9;
}

.glass-form {
  padding: 0px;
}

.glass-input :deep(.el-input__wrapper),
.glass-select :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(8px);
  box-shadow: 
    0 2px 10px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.8) !important;
  border-radius: 10px;
  padding: 6px 12px;
  height: 40px;
}

.glass-input :deep(.el-input__prefix),
.glass-select :deep(.el-input__prefix) {
  color: #3498db;
  font-size: 15px;
  margin-right: 6px;
}

.glass-button-primary,
.glass-button {
  height: 40px;
  padding: 0 20px;
  font-weight: 500;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.glass-button-primary {
  background: linear-gradient(135deg, #5abdff, #799af0) !important;
  border: none !important;
  box-shadow: 
    0 4px 10px rgba(52, 152, 219, 0.4),
    0 0 0 1px rgba(52, 152, 219, 0.2) !important;
}

.glass-button {
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.6) !important;
  color: #475669;
}

.glass-button:hover,
.glass-button-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(52, 152, 219, 0.5) !important;
}

.form-buttons {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  gap: 14px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #1f2d3d;
  font-size: 14px;
}

.el-form-item {
  margin-bottom: 24px;
}

:deep(.el-select-dropdown__item) {
  display: flex;
  align-items: center;
  padding: 6px 12px;
}

:deep(.el-select-dropdown__item .el-icon) {
  margin-right: 6px;
  font-size: 15px;
  color: #3498db;
}

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