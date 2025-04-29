<template>
  <div class="user-login-page" :class="{ 'animate-in': mounted }">
    <div class="login-header">
      <img src="@/assets/images/logo.png" alt="Logo" class="login-logo">
    </div>
    
    <div class="login-content">
      <div class="login-title">
        <h2>用户登录</h2>
        <p>欢迎使用电费账单系统</p>
      </div>
      
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
        <el-form-item prop="account">
          <el-input
            v-model="loginForm.account"
            placeholder="请输入账号"
            size="large"
            prefix-icon="User"
          ></el-input>
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            size="large"
            prefix-icon="Lock"
          ></el-input>
        </el-form-item>
        
        <el-form-item prop="captcha">
          <div class="captcha-container">
            <el-input
              v-model="loginForm.captcha"
              placeholder="请输入验证码"
              size="large"
              style="width: calc(100% - 110px)"
              prefix-icon="Key"
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
          <div class="remember-me">
            <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" class="login-button" @click="handleLogin" :loading="loading" size="large" round>登录</el-button>
        </el-form-item>
        
        <el-form-item>
          <div class="forgot-password-container">
            <span class="forgot-password" @click="goToForgotPassword">忘记密码?</span>
          </div>
        </el-form-item>
        
        <el-form-item>
          <div class="admin-link-container">
            <span class="admin-link" @click="switchToAdminLogin">管理员请点击 <i class="admin-arrow">></i></span>
          </div>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="login-footer">
      <div class="wave-container">
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
      </div>
    </div>
    
    <!-- 背景动画元素 -->
    <div class="animated-bg">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>
      <div class="floating-circle circle-4"></div>
      <div class="floating-circle circle-5"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { ElMessage } from 'element-plus';
import { User, Lock, Key } from '@element-plus/icons-vue';
import { encryptWithRSA } from '@/utils/encrypt';
import { getPublicKey, getCaptcha } from '@/api/user/user';
import { v4 as uuidv4 } from 'uuid';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const mounted = ref(false); // 用于控制进入动画

const switchToAdminLogin = () => {
  router.push('/login/admin');
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
    { min: 6, max: 16, message: '账号长度应为6-16位', trigger: 'blur' },
    { pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/, message: '账号应包含数字和字母', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 16, message: '密码长度应为6-16位', trigger: 'blur' },
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
  
  try {
    const res = await getCaptcha(uuid);
    captchaUrl.value = URL.createObjectURL(new Blob([res], { type: 'image/png' }));
  } catch (error) {
    console.error('获取验证码失败:', error);
    ElMessage.error('获取验证码失败，请刷新页面重试');
  }
};

// 刷新验证码
const refreshCaptcha = () => {
  loginForm.captcha = '';
  loginForm.uuid = '';
  fetchCaptcha();
};

// 跳转到忘记密码页面
const goToForgotPassword = () => {
  ElMessage.info('忘记密码功能即将上线');
  // router.push('/forgot-password'); // 实际忘记密码页面路由
};

// 在组件挂载时获取公钥
onMounted(async () => {
  try {
    const publicKey = await fetchPublicKey();
    userStore.setPublicKey(publicKey);
    fetchCaptcha();
    
    // 添加短暂延迟后触发进入动画
    setTimeout(() => {
      mounted.value = true;
    }, 100);
  } catch (error) {
    ElMessage.error('网络出现问题,请刷新页面重试');
  }
});

// 登录
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const encryptedPassword = encryptWithRSA(loginForm.password, userStore.publicKey);
        await userStore.login({
          account: loginForm.account,
          password: encryptedPassword,
          code: loginForm.captcha,
          key: loginForm.uuid,
          rememberMe: loginForm.rememberMe
        });
        
        ElMessage.success('登录成功');
        router.push('/user/dashboard');
      } catch (error) {
        console.error('登录失败:', error);
        ElMessage.error('登录失败: ' + (error.message || '用户名或密码错误'));
        // 登录失败时刷新验证码
        refreshCaptcha();
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.error('请填写正确的账号和密码');
    }
  });
};
</script>

<style scoped>
.user-login-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}

.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.login-header {
  padding: 30px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.login-logo {
  height: 50px;
  width: auto;
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.login-content {
  flex: 1;
  padding: 0 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 10;
}

.login-title {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-title h2 {
  font-size: 28px;
  color: #333;
  font-weight: 600;
  margin: 0 0 10px 0;
}

.login-title p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.login-form {
  width: 100%;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 15px;
  animation: slideIn 0.5s ease-out;
  animation-fill-mode: both;
}

.login-form :deep(.el-form-item:nth-child(1)) { animation-delay: 0.1s; }
.login-form :deep(.el-form-item:nth-child(2)) { animation-delay: 0.2s; }
.login-form :deep(.el-form-item:nth-child(3)) { animation-delay: 0.3s; }
.login-form :deep(.el-form-item:nth-child(4)) { animation-delay: 0.4s; }
.login-form :deep(.el-form-item:nth-child(5)) { animation-delay: 0.5s; }
.login-form :deep(.el-form-item:nth-child(6)) { animation-delay: 0.6s; }

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.login-form :deep(.el-input__wrapper) {
  background-color: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  box-shadow: none;
  padding: 4px 15px;
  transition: all 0.3s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #6A8CFF inset;
  transform: translateY(-2px);
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #6A8CFF inset;
  transform: translateY(-2px);
}

.login-form :deep(.el-input__prefix-inner .el-icon) {
  font-size: 18px;
  color: #909399;
}

.captcha-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.captcha-img {
  height: 40px;
  cursor: pointer;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.captcha-img:hover {
  transform: scale(1.05);
}

.remember-me {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 5px;
}

.forgot-password {
  color: #6A8CFF;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.forgot-password:hover {
  color: #486AE6;
  text-decoration: underline;
}

.login-button {
  width: 100%;
  background: linear-gradient(135deg, #7B9CFF 0%, #486AE6 100%);
  border: none;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 10px;
  transition: all 0.3s ease;
}

.login-button:hover {
  background: linear-gradient(135deg, #8BABFF 0%, #5C7FFF 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(75, 106, 230, 0.2);
}

.login-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  overflow: hidden;
  z-index: 2;
}

.wave-container {
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background: rgba(123, 156, 255, 0.1);
  border-radius: 100%;
  transform-origin: center bottom;
}

.wave:nth-child(1) {
  animation: wave 10s linear infinite;
  z-index: 3;
  opacity: 0.3;
}

.wave:nth-child(2) {
  animation: wave 15s linear infinite reverse;
  z-index: 2;
  opacity: 0.2;
}

.wave:nth-child(3) {
  animation: wave 20s linear infinite;
  z-index: 1;
  opacity: 0.1;
}

@keyframes wave {
  0% { transform: translateX(0) scaleY(0.2); }
  50% { transform: translateX(-25%) scaleY(0.3); }
  100% { transform: translateX(-50%) scaleY(0.2); }
}

/* 浮动圆形背景元素 */
.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.05;
  background: linear-gradient(135deg, #7B9CFF 0%, #486AE6 100%);
  z-index: 1;
}

.circle-1 {
  width: 150px;
  height: 150px;
  top: -30px;
  right: -30px;
  animation: float 15s ease-in-out infinite;
}

.circle-2 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: -20px;
  animation: float 18s ease-in-out infinite 2s;
}

.circle-3 {
  width: 120px;
  height: 120px;
  bottom: 30%;
  right: -40px;
  animation: float 20s ease-in-out infinite 1s;
}

.circle-4 {
  width: 60px;
  height: 60px;
  top: 40%;
  left: 10%;
  animation: float 12s ease-in-out infinite 3s;
}

.circle-5 {
  width: 100px;
  height: 100px;
  bottom: 25%;
  left: -30px;
  animation: float 16s ease-in-out infinite 4s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(10px, 15px) rotate(5deg); }
  50% { transform: translate(5px, 10px) rotate(10deg); }
  75% { transform: translate(15px, 5px) rotate(5deg); }
}

/* 移动端适配 */
@media screen and (max-height: 700px) {
  .login-title {
    margin-bottom: 20px;
  }
  
  .login-title h2 {
    font-size: 24px;
  }
  
  .login-form .el-form-item {
    margin-bottom: 12px;
  }
}

/* 添加管理员链接样式 */
.admin-link-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
}

.admin-link {
  color: #7B9CFF;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
}

.admin-link:hover {
  color: #486AE6;
}

.admin-arrow {
  display: inline-block;
  margin-left: 4px;
  font-style: normal;
  transition: transform 0.3s ease;
}

.admin-link:hover .admin-arrow {
  transform: translateX(3px);
}
</style> 