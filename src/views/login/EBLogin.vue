<template>
  <div class="login-page">
    <!-- 添加切换按钮 -->
    <div class="switch-login-type" @click="switchToUserLogin">
      <span>用户登录</span>
      <div class="arrow-icon">
        <i class="el-icon-arrow-right"></i>
      </div>
    </div>
    
    <div class="login-container">
      <!-- 左侧装饰区域 -->
      <div class="login-decoration">
        <div class="decoration-content">
          <div class="circles">
            <div class="circle-1"></div>
            <div class="circle-2"></div>
            <div class="circle-3"></div>
          </div>
          <div class="wave-group">
            <div class="wave wave-1"></div>
            <div class="wave wave-2"></div>
            <div class="wave wave-3"></div>
          </div>
          <div class="floating-squares">
            <div class="square square-1"></div>
            <div class="square square-2"></div>
            <div class="square square-3"></div>
          </div>
        </div>
      </div>
      <!-- 右侧登录表单 -->
      <div class="login-box">
        <div class="login-box-inner">
          <div class="login-header">
            <h2 class="welcome-text">Hello !</h2>
            <p class="sub-title">欢迎使用电费管理系统</p>
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
              <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
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
import { getPublicKey, getCaptcha } from '@/api/admin/user';
import { v4 as uuidv4 } from 'uuid';

const router = useRouter();
const userStore = useUserStore();

// 添加切换到用户登录的方法
const switchToUserLogin = () => {
  router.push('/userlogin');
};

const loginForm = reactive({
  account: '',
  password: '',
  rememberMe: false,
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
  const uuid = uuidv4();
  loginForm.uuid = uuid;
  const res = await getCaptcha(uuid);
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
    fetchCaptcha();
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
        const encryptedPassword = encryptWithRSA(loginForm.password, userStore.publicKey);
        await userStore.login({
          account: loginForm.account,
          password: encryptedPassword,
          code: loginForm.captcha,
          key: loginForm.uuid,
          rememberMe: loginForm.rememberMe
        });
        router.push('/dashboard');
      } catch (error) {
        ElMessage.error('登录失败');
      }
    } else {
      ElMessage.error('请填写正确的账号和密码');
    }
  });
};
</script>

<style scoped>
/* 添加切换登录类型按钮样式 */
.switch-login-type {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  font-size: 14px;
  color: #486AE6;
  transition: all 0.3s ease;
  z-index: 20;
}

.switch-login-type:hover {
  background-color: rgba(235, 240, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(75, 106, 230, 0.15);
}

.switch-login-type span {
  margin-right: 4px;
}

.arrow-icon {
  display: inline-flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.switch-login-type:hover .arrow-icon {
  transform: translateX(3px);
}

.login-page {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('/src/assets/images/background.jpg');
  background-size: cover;
  background-position: center;
  overflow: hidden;
  position: relative; /* 确保可以相对此定位 */
}

.login-container {
  width: 1000px;
  height: 600px;
  display: flex;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  background: white;
  overflow: hidden;
}

.login-decoration {
  flex: 1;
  background: linear-gradient(135deg, #7B9CFF 0%, #486AE6 100%);
  position: relative;
  overflow: hidden;
}

.decoration-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.circles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.circle-1, .circle-2, .circle-3 {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: -50px;
  animation: float 6s ease-in-out infinite;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 40%;
  right: -30px;
  animation: float 8s ease-in-out infinite;
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: 10%;
  left: 30%;
  animation: float 7s ease-in-out infinite;
}

.wave-group {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  transform-origin: center bottom;
}

.wave-1 {
  animation: wave 10s linear infinite;
}

.wave-2 {
  animation: wave 15s linear infinite;
  opacity: 0.5;
}

.wave-3 {
  animation: wave 20s linear infinite;
  opacity: 0.2;
}

.floating-squares {
  position: absolute;
  width: 100%;
  height: 100%;
}

.square {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.square-1 {
  width: 50px;
  height: 50px;
  top: 20%;
  left: 20%;
  transform: rotate(45deg);
}

.square-2 {
  width: 30px;
  height: 30px;
  top: 50%;
  right: 20%;
  transform: rotate(30deg);
}

.square-3 {
  width: 40px;
  height: 40px;
  bottom: 30%;
  left: 40%;
  transform: rotate(60deg);
}

@keyframes float {
  0% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0) rotate(0); }
}

@keyframes wave {
  0% { transform: translateX(0) scaleY(0.1); }
  50% { transform: translateX(-25%) scaleY(0.2); }
  100% { transform: translateX(-50%) scaleY(0.1); }
}

.login-box {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-box-inner {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.welcome-text {
  font-size: 32px;
  color: #333;
  margin-bottom: 10px;
}

.sub-title {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.login-form {
  width: 100%;
}

.login-form :deep(.el-input__wrapper) {
  background-color: #ffffff;
  border: 1px solid #dcdcdc;
  box-shadow: none;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #6A8CFF inset;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #6A8CFF inset;
}

.login-button {
  width: 100%;
  background: linear-gradient(135deg, #7B9CFF 0%, #486AE6 100%);
  border: none;
  height: 44px;
  font-size: 16px;
  margin-top: 20px;
}

.login-button:hover {
  background: linear-gradient(135deg, #8BABFF 0%, #5C7FFF 100%);
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