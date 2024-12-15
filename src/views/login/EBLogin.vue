<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-box">
        <div class="login-box-inner">
          <div class="login-header">
            <img src="@/assets/images/logo.png" alt="logo" class="login-logo">
          </div>
          <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
            <el-form-item prop="account">
              <el-input
                v-model="loginForm.account"
                placeholder="请输入账号"
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
            <el-form-item prop="captcha">
              <div class="captcha-container">
                <el-input
                  v-model="loginForm.captcha"
                  placeholder="请输入验证码"
                  size="large"
                  style="width: calc(100% - 120px)"
                ></el-input>
                <img
                  :src="captchaUrl"
                  alt="验证码"
                  class="captcha-img"
                  @click="refreshCaptcha"
                />
              </div>
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
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { ElMessage } from 'element-plus';
import { encryptWithRSA } from '@/utils/encrypt';
import { getPublicKey,getCaptcha } from '@/api/user';
import { v4 as uuidv4 } from 'uuid';

const router = useRouter();
const userStore = useUserStore();

const loginForm = reactive({
  account: '',
  password: '',
  captcha: '',
  uuid: '',
});

const loginRules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 8, max: 16, message: '账号长度应为8-16位', trigger: 'blur' },
    { pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/, message: '账号应包含数字和字母', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 16, message: '密码长度应为8-16位', trigger: 'blur' },
    { pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/, message: '密码应包含数字和字母', trigger: 'blur' },
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
  ],
};

const loginFormRef = ref(null);

const captchaUrl = ref('');

// 获取公钥
async function fetchPublicKey() {
  try {
    const publicKey = await getPublicKey();
    return publicKey;
  } catch (error) {
    console.error('获取公钥失败:', error);
    throw error;
  }
}

// 获取验证码的方法
const fetchCaptcha = async () => {
  //生成uuid
  const uuid = uuidv4();
  loginForm.uuid = uuid;
  const res = await getCaptcha(uuid);
  //返回的是PNG格式的验证码图片，通过HTTP响应头content-type: image/png返回
  captchaUrl.value = URL.createObjectURL(new Blob([res], { type: 'image/png' }));
};

// 刷新验证码
const refreshCaptcha = () => {
  loginForm.captcha = '';
  loginForm.uuid = '';
  fetchCaptcha();
};

// 在组件挂载时获取公钥
onMounted(async () => {
  try {
    const publicKey = await fetchPublicKey();
    userStore.setPublicKey(publicKey);
    fetchCaptcha(); // 获取验证码
  } catch (error) {
    ElMessage.error('网络出现问题,请刷新页面重试');
  }
});

// 登录
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 使用 store 中的公钥加密密码
        const encryptedPassword = encryptWithRSA(loginForm.password, userStore.publicKey);
        // 发送登录请求
        await userStore.login({
          account: loginForm.account,
          password: encryptedPassword,
          //验证码
          code: loginForm.captcha,
          key: loginForm.uuid,
        });
        router.push('/dashboard');
      } catch (error) {
      }
    } else {
      ElMessage.error('请填写正确的账号和密码');
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

.captcha-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.captcha-img {
  height: 40px;
  cursor: pointer;
  border-radius: 4px;
}
</style> 