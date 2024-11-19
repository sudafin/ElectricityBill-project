<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-box">
        <div class="login-box-inner">
          <div class="login-header">
            <img src="@/assets/images/logo.png" alt="logo" class="login-logo">
          </div>
          <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                size="large"
              ></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                size="large"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="login-button" @click="handleLogin" size="large">登录</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();

const loginForm = reactive({
  username: '',
  password: '',
});

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

const loginFormRef = ref(null);

const handleLogin = async () => {
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await userStore.login(loginForm);
        router.push('/dashboard');
      } catch (error) {
        ElMessage.error('登录失败,请检查用户名和密码');
      }
    } else {
      ElMessage.error('请填写正确的用户名和密码');
    }
  });
};
</script>

<style scoped>
.login-page {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-container {
  width: 100%;
  max-width: 600px;
  padding: 60px;
  border-radius: 10px;
  box-shadow: 0px 14px 80px rgba(34, 35, 58, 0.2);
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  border-radius: 10px;
  background: linear-gradient(to bottom right, #ffffff, #f3e5f5);
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.1);
}

.login-box-inner {
  width: 100%;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.login-logo {
  width: 300px;
  height: 80px;
  margin-bottom: 20px;
  margin-left: 30px;
}

.login-form {
  width: 100%;
}

.login-button {
  width: 100%;
  background-color: #3f51b5;
  border-color: #3f51b5;
}
</style> 