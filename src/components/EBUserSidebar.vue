<template>
  <div class="mobile-navbar">
    <div 
      v-for="item in navItems" 
      :key="item.path" 
      class="nav-item" 
      :class="{ active: isActive(item.path) }"
      @click="navigateTo(item)"
    >
      <div class="nav-icon">
        <el-icon><component :is="item.icon" /></el-icon>
      </div>
      <div class="nav-text">{{ item.title }}</div>
      <div class="ripple-effect" v-if="isActive(item.path)"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  House, 
  Wallet, 
  User, 
  QuestionFilled
} from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';

const router = useRouter();
const route = useRoute();

const navItems = computed(() => [
  { title: '概览', path: '/user/dashboard', icon: 'House' },
  { title: '缴费', path: '/user/paymentDashboard', icon: 'Wallet' },
  { title: '我的', path: '/user/profile', icon: 'User' },
  { title: '帮助', path: '/user/help', icon: 'QuestionFilled' }
]);

const isActive = (path) => {
  if (path === 'logout') return false;
  return route.path.startsWith(path);
};

const navigateTo = (item) => {
  if (item.path === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      localStorage.removeItem('token');
      router.push('/login');
    }).catch(() => {});
  } else {
    router.push(item.path);
  }
};
</script>

<style scoped>
.mobile-navbar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #ffffff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
  height: 60px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  border-radius: 12px 12px 0 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 0;
  width: 100%;
  max-width: 70px;
  height: 100%;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.nav-icon {
  font-size: 22px;
  color: #909399;
  margin-bottom: 2px;
  transition: all 0.3s ease;
}

.nav-text {
  font-size: 12px;
  color: #909399;
  transition: all 0.3s ease;
}

.nav-item.active .nav-icon,
.nav-item.active .nav-text {
  color: #409EFF;
  font-weight: 500;
}

.nav-item:hover .nav-icon,
.nav-item:hover .nav-text {
  color: #79bbff;
}

.nav-item.active {
  transform: translateY(-4px);
}

/* 水波纹效果 */
.ripple-effect {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background-color: #409EFF;
  border-radius: 50%;
  z-index: 1;
}

.ripple-effect::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 18px;
  height: 18px;
  background-color: rgba(64, 158, 255, 0.2);
  border-radius: 50%;
  animation: ripple 1.5s infinite;
}

@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 0.8;
  }
  100% {
    width: 24px;
    height: 24px;
    opacity: 0;
  }
}
</style>