<template>
  <div class="profile-page">
    <!-- 基本信息部分 -->
    <div class="profile-section" v-loading="loading">
      <div class="section-title">基本信息</div>
      
      <div class="info-item">
        <div class="item-label">姓名</div>
        <div class="item-content">
          <el-input v-model="userInfo.name" placeholder="请输入姓名" class="borderless-input"></el-input>
        </div>
      </div>
      
      <div class="info-item">
        <div class="item-label">手机号码</div>
        <div class="item-content disabled">{{ userInfo.phone }}</div>
      </div>
    </div>

    <!-- 用电信息部分 -->
    <div class="profile-section">
      <div class="section-title">用电信息</div>
      
      <div class="info-item">
        <div class="item-label">用户类型</div>
        <div class="item-content disabled">{{ electricityInfo.userType }}</div>
      </div>
      
      
      <div class="info-item">
        <div class="item-label">用电地址</div>
        <div class="item-content">
          <el-input v-model="electricityInfo.address" placeholder="请输入用电地址" class="borderless-input"></el-input>
        </div>
      </div>
    </div>

    <!-- 通知设置部分 -->
    <div class="profile-section">
      <div class="section-title">通知设置</div>
      
      <div class="info-item switch-item">
        <div class="item-label">账单提醒</div>
        <div class="item-content">
          <el-switch v-model="notificationSettings.billReminder"></el-switch>
        </div>
        <div class="item-desc">开启后，账单生成时将收到提醒</div>
      </div>
      
      <div class="info-item switch-item">
        <div class="item-label">缴费提醒</div>
        <div class="item-content">
          <el-switch v-model="notificationSettings.paymentReminder"></el-switch>
        </div>
        <div class="item-desc">开启后，缴费截止日前将收到提醒</div>
      </div>
    </div>

    <!-- 账户安全部分 -->
    <div class="profile-section">
      <div class="section-title">账户安全</div>
      
      <div class="info-item" @click="showChangePasswordDialog">
        <div class="item-label">登录密码</div>
        <div class="item-content clickable">
          <span>修改密码</span>
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="save-button-container">
      <el-button type="primary" @click="handleSave" :loading="saving" size="large" round>保存修改</el-button>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="85%" :close-on-click-modal="false" top="25vh">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-position="top" class="password-form">
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input v-model="passwordForm.currentPassword" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="changePassword" :loading="passwordChanging">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { ArrowRight } from '@element-plus/icons-vue';
import { getUserProfile, updateUserProfile, changePassword as changePasswordApi } from '@/api/user/profile';
import { getPublicKey } from '@/api/user/user';
import { encryptWithRSA } from '@/utils/encrypt';
import { useUserStore } from '@/store/user';
import router from '@/router';
// 获取用户store
const userStore = useUserStore();

// 组件状态
const loading = ref(false);
const saving = ref(false);
const passwordDialogVisible = ref(false);
const passwordChanging = ref(false);

// 表单引用
const passwordFormRef = ref(null);

// 用户基本信息
const userInfo = reactive({
  name: '',
  phone: '',
});

// 用电信息
const electricityInfo = reactive({
  userType: '',
  address: '',
});

// 通知设置
const notificationSettings = reactive({
  billReminder: true,
  paymentReminder: true,
});

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 密码表单验证规则
const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 加载用户信息
const loadUserInfo = async () => {
  loading.value = true;
  
  try {
    const response = await getUserProfile();
    
    // 直接使用响应数据，不检查code字段
    if (response) {
      // 更新用户基本信息
      userInfo.name = response.username || '';
      userInfo.phone = response.phone || '';
      
      // 更新用电信息 - 字段名映射
      electricityInfo.userType = response.electricityInfo?.userType || response.userType || '';
      electricityInfo.address = response.electricityInfo?.address || response.address || '';
      
      // 更新通知设置
      notificationSettings.billReminder = response.notificationSettings?.billReminder ?? 
                                         response.billReminder ?? true;
      notificationSettings.paymentReminder = response.notificationSettings?.paymentReminder ?? 
                                           response.paymentReminder ?? true;

      console.log('用户信息加载成功');
    } else {
      console.error('获取用户信息响应异常:', response);
      ElMessage.error('获取用户信息失败');
      setDefaultValues();
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ElMessage.error('获取用户信息失败，请稍后重试');
    
    // 设置默认值以防请求失败
    setDefaultValues();
  } finally {
    loading.value = false;
  }
};

// 设置默认值（请求失败时使用）
const setDefaultValues = () => {
  userInfo.name = '用户';
  userInfo.phone = '未绑定';
  electricityInfo.userType = '普通用户';
  electricityInfo.address = '';
  notificationSettings.billReminder = true;
  notificationSettings.paymentReminder = true;
};

// 保存修改
const handleSave = async () => {
  saving.value = true;
  
  // 构造提交的数据
  const profileData = {
    name: userInfo.name,
    billReminder: notificationSettings.billReminder,
    paymentReminder: notificationSettings.paymentReminder,
    address: electricityInfo.address
  };
  
  try {
    console.log('开始保存用户信息:', JSON.stringify(profileData));
    const response = await updateUserProfile(profileData);
    console.log('保存用户信息响应:', JSON.stringify(response));
    
    // 无需检查code，直接处理成功情况
    ElMessage.success('保存成功');
  } catch (error) {
    console.error('保存用户信息失败:', error);
    ElMessage.error('保存失败，请稍后重试');
  } finally {
    saving.value = false;
  }
};

// 显示修改密码对话框
const showChangePasswordDialog = () => {
  passwordDialogVisible.value = true;
  passwordForm.currentPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
};

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return;

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordChanging.value = true;
      
      try {
        // 获取公钥 - 优先使用store中存储的公钥，没有则重新获取
        let publicKey = userStore.publicKey;
        if (!publicKey) {
          publicKey = await getPublicKey();
          userStore.setPublicKey(publicKey);
        }
        
        // 使用RSA加密密码
        const encryptedCurrentPassword = encryptWithRSA(passwordForm.currentPassword, publicKey);
        const encryptedNewPassword = encryptWithRSA(passwordForm.newPassword, publicKey);
        
        const passwordData = {
          currentPassword: encryptedCurrentPassword,
          newPassword: encryptedNewPassword,
          confirmPassword: encryptedNewPassword // 后端可能不需要，但为保持一致也加密
        };
        
        console.log('开始修改密码...');
        const response = await changePasswordApi(passwordData);
        debugger;
        if(response.code && response.code === 400){
          ElMessage.error(response.msg);
          return;
        }else{
          // 无需检查code，直接处理成功情况
          ElMessage.success('密码修改成功');
          passwordDialogVisible.value = false;

          //清楚token
          userStore.logout();
          // 跳转登录页面
          router.push('/login/user');
      
          //刷新页面
          window.location.reload();
        
        }
        
      } catch (error) {
        console.error('密码修改失败:', error);
        ElMessage.error('密码修改失败，请稍后重试');
      } finally {
        passwordChanging.value = false;
      }
    }
  });
};

onMounted(() => {
  loadUserInfo();
});
</script>

<style scoped>
.profile-page {
  background-color: #fff;
  min-height: calc(100vh - 140px); /* 减去头部和底部高度 */
  padding-bottom: 20px; /* 减少底部填充 */
  position: relative;
  overflow-y: visible; /* 不使用自身滚动，依赖父容器滚动 */
  box-sizing: border-box;
}

.profile-section {
  margin-bottom: 12px;
  background-color: #fff;
}

.section-title {
  padding: 16px 16px 8px;
  font-size: 15px;
  font-weight: 500;
  color: #666;
}

.info-item {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  width: 100%;
  box-sizing: border-box;
}

.info-item:active {
  background-color: #f9f9f9;
}

.item-label {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.item-content {
  font-size: 14px;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  overflow: hidden; /* 防止溢出 */
}

.item-content.disabled {
  color: #999;
}

.item-content.clickable {
  color: #666;
}

.item-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.switch-item {
  margin-bottom: 8px;
}

.borderless-input {
  width: 100%;
}

.borderless-input :deep(.el-input__wrapper) {
  box-shadow: none !important;
  padding: 0;
  width: 100%;
}

.borderless-input :deep(.el-input__inner) {
  height: 24px;
  font-size: 14px;
  width: 100%;
}

.save-button-container {
  position: relative; /* 改为相对定位，跟随表单流 */
  display: flex;
  justify-content: center;
  padding: 24px 16px;
  margin-top: 20px;
  background-color: #fff;
  box-sizing: border-box;
  width: 100%;
}

.save-button-container .el-button {
  width: 90%;
  height: 44px;
  font-size: 16px;
  max-width: 400px;
}

:deep(.el-dialog) {
  border-radius: 8px;
  margin: 0 auto !important;
  overflow: hidden;
  box-sizing: border-box;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  max-width: 360px; /* 限制最大宽度 */
}

:deep(.el-dialog__header) {
  padding: 12px 16px;
  margin: 0;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  box-sizing: border-box;
}

:deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 500;
}

:deep(.el-dialog__headerbtn) {
  top: 12px;
}

:deep(.el-dialog__body) {
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
  box-sizing: border-box;
}

:deep(.el-dialog__footer) {
  padding: 10px 16px;
  border-top: 1px solid #f0f0f0;
  box-sizing: border-box;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.dialog-footer .el-button {
  flex: 1;
  margin: 0 6px;
  height: 36px;
  font-size: 14px;
}

.password-form {
  margin: 0;
}

.password-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.password-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.password-form :deep(.el-form-item__label) {
  padding-bottom: 4px;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.2;
}

.password-form :deep(.el-form-item__content) {
  width: 100%;
}

.password-form :deep(.el-input__wrapper) {
  padding: 0 12px;
}

.password-form :deep(.el-input__inner) {
  height: 36px;
  line-height: 36px;
}
</style> 