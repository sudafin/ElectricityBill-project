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
import { getPublicKey, getCaptcha } from '@/api/admin/user';
import { v4 as uuidv4 } from 'uuid';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const mounted = ref(false); // 用于控制进入动画

const switchToAdminLogin = () => {
  router.push('/login');
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
    // 注释掉实际的网络请求
    // const publicKey = await getPublicKey();
    // return publicKey;
    
    // 返回模拟的公钥数据
    return 'mock-public-key-data';
  } catch (error) {
    console.error('获取公钥失败:', error);
    throw error;
  }
}

// 获取验证码的方法
const fetchCaptcha = async () => {
  const uuid = uuidv4();
  loginForm.uuid = uuid;
  
  // 注释掉实际的网络请求
  // const res = await getCaptcha(uuid);
  // captchaUrl.value = URL.createObjectURL(new Blob([res], { type: 'image/png' }));
  
  // 使用模拟的验证码图片URL
  captchaUrl.value = 'data:image/png;base64,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';
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
        // 注释掉实际的登录请求
        // const encryptedPassword = encryptWithRSA(loginForm.password, userStore.publicKey);
        // await userStore.login({
        //   account: loginForm.account,
        //   password: encryptedPassword,
        //   code: loginForm.captcha,
        //   key: loginForm.uuid,
        //   rememberMe: loginForm.rememberMe
        // });
        
        // 等待一秒模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 直接模拟登录成功
        ElMessage.success('登录成功');
        router.push('/user/dashboard');
      } catch (error) {
        ElMessage.error('登录失败');
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