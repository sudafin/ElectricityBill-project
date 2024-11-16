<template>
  <div class="user-form">
    <el-card>
      <template #header>
        <div class="header">
          <span>{{ isEdit ? '编辑用户' : '新增用户' }}</span>
        </div>
      </template>
      <EBForm
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="普通用户" value="user"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </EBForm>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import EBForm from '@/components/EBForm.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const isEdit = ref(!!route.params.id);
const form = reactive({
  username: '',
  email: '',
  phone: '',
  role: '',
});
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: ['blur', 'change'] },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
};

const formRef = ref(null);

const submitForm = async () => {
  await formRef.value.validate();
  if (isEdit.value) {
    await userStore.updateUser({ id: route.params.id, ...form });
  } else {
    await userStore.createUser(form);
  }
  router.push({ name: 'UserList' });
};

const resetForm = () => {
  formRef.value.resetFields();
};

if (isEdit.value) {
  const user = await userStore.fetchUserDetail(route.params.id);
  Object.assign(form, user);
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 