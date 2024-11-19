<template>
  <div class="user-form">
    <el-card>
      <template #header>
      </template>
      <el-form ref="userFormRef" :model="userForm" :rules="rules" label-width="120px">
        <el-form-item label="用户姓名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户姓名"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入电话"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="userForm.address" placeholder="请输入地址"></el-input>
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="userForm.userType" placeholder="请选择用户类型">
            <el-option label="居民用户" value="居民用户"></el-option>
            <el-option label="商业用户" value="商业用户"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

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
  padding: 20px;
  background-color: #f5f7fa;
  /* 居中 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.el-card {
  border: none;
  border-radius: 16px;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  width: 60vh;
}

.el-card :deep(.el-card__header) {
  border-bottom: none;
  padding: 20px;
}

.el-card :deep(.el-card__body) {
  padding: 0px 40px 20px 20px;
  
}
</style> 