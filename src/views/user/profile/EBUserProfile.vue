<template>
  <EBPageLayout>
    <template #header>
      <div class="eb-profile-header">
        <div class="header-spacer"></div>
        <el-button type="primary" @click="handleSave" :loading="saving">保存修改</el-button>
      </div>
    </template>

    <div class="profile-container" v-loading="loading">
      <el-row :gutter="20">
        <el-col :span="6">
          <!-- 用户信息卡片 -->
          <el-card class="user-card">
            <div class="user-card-content">
              <div class="user-avatar">
                <el-avatar :size="100" :src="userInfo.avatar" :icon="UserFilled">{{ userInfo.name?.charAt(0) }}</el-avatar>
                <div class="upload-avatar">
                  <el-upload
                    class="avatar-uploader"
                    action="#"
                    :show-file-list="false"
                    :before-upload="beforeAvatarUpload"
                  >
                    <el-button type="primary" size="small" text>更换头像</el-button>
                  </el-upload>
                </div>
              </div>
              <div class="user-name">{{ userInfo.name }}</div>
              <div class="user-role">{{ userInfo.role }}</div>
              <div class="user-id">用户ID：{{ userInfo.userId }}</div>
              <div class="user-status" :class="{ 'active': userInfo.status === '正常' }">
                状态：{{ userInfo.status }}
              </div>
            </div>
          </el-card>

          <!-- 账户安全卡片 -->
          <el-card class="security-card">
            <template #header>
              <div class="card-header">
                <h3>账户安全</h3>
              </div>
            </template>
            <div class="security-item">
              <div class="security-item-title">
                <span>登录密码</span>
                <span class="security-level good">强</span>
              </div>
              <div class="security-item-desc">
                用于登录系统，建议定期修改
              </div>
              <el-button type="primary" link @click="showChangePasswordDialog">修改</el-button>
            </div>
            <el-divider></el-divider>
            <div class="security-item">
              <div class="security-item-title">
                <span>手机绑定</span>
                <span class="security-status">{{ userInfo.phone ? '已绑定' : '未绑定' }}</span>
              </div>
              <div class="security-item-desc">
                {{ userInfo.phone ? `已绑定手机：${formatPhone(userInfo.phone)}` : '绑定手机后可用于登录和找回密码' }}
              </div>
              <el-button type="primary" link @click="showChangePhoneDialog">
                {{ userInfo.phone ? '修改' : '绑定' }}
              </el-button>
            </div>
            <el-divider></el-divider>
            <div class="security-item">
              <div class="security-item-title">
                <span>邮箱绑定</span>
                <span class="security-status">{{ userInfo.email ? '已绑定' : '未绑定' }}</span>
              </div>
              <div class="security-item-desc">
                {{ userInfo.email ? `已绑定邮箱：${formatEmail(userInfo.email)}` : '绑定邮箱后可用于登录和找回密码' }}
              </div>
              <el-button type="primary" link @click="showChangeEmailDialog">
                {{ userInfo.email ? '修改' : '绑定' }}
              </el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :span="18">
          <!-- 基本信息卡片 -->
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <h3>基本信息</h3>
              </div>
            </template>
            <el-form :model="userInfo" label-width="100px" label-position="left">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="姓名">
                    <el-input v-model="userInfo.name" placeholder="请输入姓名"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="性别">
                    <el-select v-model="userInfo.gender" style="width: 100%;">
                      <el-option label="男" value="男"></el-option>
                      <el-option label="女" value="女"></el-option>
                      <el-option label="保密" value="保密"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="手机号码">
                    <el-input v-model="userInfo.phone" placeholder="请输入手机号码" disabled></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="邮箱">
                    <el-input v-model="userInfo.email" placeholder="请输入邮箱" disabled></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="注册时间">
                    <el-input v-model="userInfo.registerTime" disabled></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="最后登录">
                    <el-input v-model="userInfo.lastLoginTime" disabled></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>

          <!-- 用电信息卡片 -->
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <h3>用电信息</h3>
              </div>
            </template>
            <el-form :model="electricityInfo" label-width="100px" label-position="left">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="用户编号">
                    <el-input v-model="electricityInfo.accountNo" disabled></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="用户类型">
                    <el-input v-model="electricityInfo.userType" disabled></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="电表编号">
                    <el-input v-model="electricityInfo.meterNo" disabled></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="电表类型">
                    <el-input v-model="electricityInfo.meterType" disabled></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="用电地址">
                    <el-input v-model="electricityInfo.address" placeholder="请输入用电地址"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="缴费方式">
                    <el-select v-model="electricityInfo.paymentMethod" style="width: 100%;">
                      <el-option label="自动扣款" value="自动扣款"></el-option>
                      <el-option label="手动缴费" value="手动缴费"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="电费账单">
                    <el-select v-model="electricityInfo.billNotification" style="width: 100%;">
                      <el-option label="短信通知" value="短信通知"></el-option>
                      <el-option label="邮件通知" value="邮件通知"></el-option>
                      <el-option label="短信+邮件" value="短信+邮件"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>

          <!-- 通知设置卡片 -->
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <h3>通知设置</h3>
              </div>
            </template>
            <el-form :model="notificationSettings" label-width="200px" label-position="left">
              <el-form-item label="账单提醒">
                <el-switch v-model="notificationSettings.billReminder"></el-switch>
                <span class="setting-desc">开启后，账单生成时将收到提醒</span>
              </el-form-item>
              <el-form-item label="缴费提醒">
                <el-switch v-model="notificationSettings.paymentReminder"></el-switch>
                <span class="setting-desc">开启后，缴费截止日前将收到提醒</span>
              </el-form-item>
              <el-form-item label="余额不足提醒">
                <el-switch v-model="notificationSettings.balanceReminder"></el-switch>
                <span class="setting-desc">开启后，余额低于设定值时将收到提醒</span>
              </el-form-item>
              <el-form-item label="用电异常提醒">
                <el-switch v-model="notificationSettings.usageAlert"></el-switch>
                <span class="setting-desc">开启后，用电量异常时将收到提醒</span>
              </el-form-item>
              <el-form-item label="系统通知">
                <el-switch v-model="notificationSettings.systemNotification"></el-switch>
                <span class="setting-desc">开启后，接收系统维护、更新等通知</span>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="30%">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
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
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="changePassword" :loading="passwordChanging">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改手机号对话框 -->
    <el-dialog v-model="phoneDialogVisible" :title="userInfo.phone ? '修改手机号' : '绑定手机号'" width="30%">
      <el-form :model="phoneForm" :rules="phoneRules" ref="phoneFormRef" label-width="100px">
        <el-form-item v-if="userInfo.phone" label="当前手机号">
          <el-input :value="formatPhone(userInfo.phone)" disabled></el-input>
        </el-form-item>
        <el-form-item label="新手机号" prop="newPhone">
          <el-input v-model="phoneForm.newPhone" placeholder="请输入新手机号"></el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="verificationCode">
          <div class="verification-code-input">
            <el-input v-model="phoneForm.verificationCode" placeholder="请输入验证码"></el-input>
            <el-button :disabled="codeSending" @click="sendVerificationCode">
              {{ codeButtonText }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="phoneDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="changePhone" :loading="phoneChanging">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改邮箱对话框 -->
    <el-dialog v-model="emailDialogVisible" :title="userInfo.email ? '修改邮箱' : '绑定邮箱'" width="30%">
      <el-form :model="emailForm" :rules="emailRules" ref="emailFormRef" label-width="100px">
        <el-form-item v-if="userInfo.email" label="当前邮箱">
          <el-input :value="formatEmail(userInfo.email)" disabled></el-input>
        </el-form-item>
        <el-form-item label="新邮箱" prop="newEmail">
          <el-input v-model="emailForm.newEmail" placeholder="请输入新邮箱"></el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="verificationCode">
          <div class="verification-code-input">
            <el-input v-model="emailForm.verificationCode" placeholder="请输入验证码"></el-input>
            <el-button :disabled="emailCodeSending" @click="sendEmailVerificationCode">
              {{ emailCodeButtonText }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="emailDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="changeEmail" :loading="emailChanging">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </EBPageLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { EBPageLayout } from '@/components';
import { UserFilled } from '@element-plus/icons-vue';

// 修改默认头像，不使用外部URL
// const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
// 改为使用空字符串，让Element Plus使用默认头像
const defaultAvatar = '';

// 组件状态
const loading = ref(false);
const saving = ref(false);
const passwordDialogVisible = ref(false);
const phoneDialogVisible = ref(false);
const emailDialogVisible = ref(false);
const passwordChanging = ref(false);
const phoneChanging = ref(false);
const emailChanging = ref(false);

// 验证码发送状态
const codeSending = ref(false);
const countdown = ref(60);
const codeButtonText = ref('获取验证码');
const emailCodeSending = ref(false);
const emailCountdown = ref(60);
const emailCodeButtonText = ref('获取验证码');

// 表单引用
const passwordFormRef = ref(null);
const phoneFormRef = ref(null);
const emailFormRef = ref(null);

// 用户基本信息 - 使用本地假数据
const userInfo = reactive({
  userId: 'U202303001',
  name: '张三',
  gender: '男',
  avatar: '',
  phone: '13800138000',
  email: 'zhangsan@example.com',
  role: '普通用户',
  status: '正常',
  registerTime: '2023-01-15 10:30:45',
  lastLoginTime: '2023-03-20 08:25:16'
});

// 用电信息 - 使用本地假数据
const electricityInfo = reactive({
  accountNo: 'E202301150001',
  userType: '居民用电',
  meterNo: 'M2023011500123',
  meterType: '智能电表',
  address: '北京市海淀区西二旗大街58号院',
  paymentMethod: '手动缴费',
  billNotification: '短信+邮件'
});

// 通知设置 - 使用本地假数据
const notificationSettings = reactive({
  billReminder: true,
  paymentReminder: true,
  balanceReminder: true,
  usageAlert: true,
  systemNotification: true
});

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 手机表单
const phoneForm = reactive({
  newPhone: '',
  verificationCode: ''
});

// 邮箱表单
const emailForm = reactive({
  newEmail: '',
  verificationCode: ''
});

// 密码表单验证规则
const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8个字符', trigger: 'blur' }
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

// 手机表单验证规则
const phoneRules = {
  newPhone: [
    { required: true, message: '请输入新手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码为6位数字', trigger: 'blur' }
  ]
};

// 邮箱表单验证规则
const emailRules = {
  newEmail: [
    { required: true, message: '请输入新邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码为6位数字', trigger: 'blur' }
  ]
};

// 加载用户信息
const loadUserInfo = () => {
  loading.value = true;

  // 模拟加载用户信息
  setTimeout(() => {
    loading.value = false;
  }, 800);
};

// 保存修改
const handleSave = () => {
  saving.value = true;

  // 模拟保存操作
  setTimeout(() => {
    ElMessage.success('保存成功');
    saving.value = false;
  }, 1000);
};

// 显示修改密码对话框
const showChangePasswordDialog = () => {
  passwordDialogVisible.value = true;
  passwordForm.currentPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
};

// 显示修改手机号对话框
const showChangePhoneDialog = () => {
  phoneDialogVisible.value = true;
  phoneForm.newPhone = '';
  phoneForm.verificationCode = '';
};

// 显示修改邮箱对话框
const showChangeEmailDialog = () => {
  emailDialogVisible.value = true;
  emailForm.newEmail = '';
  emailForm.verificationCode = '';
};

// 发送验证码
const sendVerificationCode = () => {
  if (!phoneForm.newPhone) {
    ElMessage.warning('请先输入手机号');
    return;
  }

  if (!/^1[3-9]\d{9}$/.test(phoneForm.newPhone)) {
    ElMessage.warning('请输入正确的手机号码');
    return;
  }

  codeSending.value = true;
  codeButtonText.value = `${countdown.value}秒后重新获取`;

  // 模拟发送验证码
  const timer = setInterval(() => {
    countdown.value--;
    codeButtonText.value = `${countdown.value}秒后重新获取`;

    if (countdown.value <= 0) {
      clearInterval(timer);
      codeSending.value = false;
      countdown.value = 60;
      codeButtonText.value = '获取验证码';
    }
  }, 1000);

  // 假装发送成功
  setTimeout(() => {
    ElMessage.success(`验证码已发送至 ${phoneForm.newPhone}`);
  }, 500);
};

// 发送邮箱验证码
const sendEmailVerificationCode = () => {
  if (!emailForm.newEmail) {
    ElMessage.warning('请先输入邮箱');
    return;
  }

  // 简单的邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailForm.newEmail)) {
    ElMessage.warning('请输入正确的邮箱地址');
    return;
  }

  emailCodeSending.value = true;
  emailCodeButtonText.value = `${emailCountdown.value}秒后重新获取`;

  // 模拟发送验证码
  const timer = setInterval(() => {
    emailCountdown.value--;
    emailCodeButtonText.value = `${emailCountdown.value}秒后重新获取`;

    if (emailCountdown.value <= 0) {
      clearInterval(timer);
      emailCodeSending.value = false;
      emailCountdown.value = 60;
      emailCodeButtonText.value = '获取验证码';
    }
  }, 1000);

  // 假装发送成功
  setTimeout(() => {
    ElMessage.success(`验证码已发送至 ${emailForm.newEmail}`);
  }, 500);
};

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return;

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordChanging.value = true;

      // 模拟修改密码
      setTimeout(() => {
        ElMessage.success('密码修改成功');
        passwordChanging.value = false;
        passwordDialogVisible.value = false;
      }, 1000);
    }
  });
};

// 修改手机号
const changePhone = async () => {
  if (!phoneFormRef.value) return;

  await phoneFormRef.value.validate(async (valid) => {
    if (valid) {
      phoneChanging.value = true;

      // 模拟修改手机号
      setTimeout(() => {
        userInfo.phone = phoneForm.newPhone;
        ElMessage.success('手机号修改成功');
        phoneChanging.value = false;
        phoneDialogVisible.value = false;
      }, 1000);
    }
  });
};

// 修改邮箱
const changeEmail = async () => {
  if (!emailFormRef.value) return;

  await emailFormRef.value.validate(async (valid) => {
    if (valid) {
      emailChanging.value = true;

      // 模拟修改邮箱
      setTimeout(() => {
        userInfo.email = emailForm.newEmail;
        ElMessage.success('邮箱修改成功');
        emailChanging.value = false;
        emailDialogVisible.value = false;
      }, 1000);
    }
  });
};

// 头像上传前处理
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg';
  const isPNG = file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG && !isPNG) {
    ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!');
    return false;
  }

  // 模拟上传成功
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    userInfo.avatar = reader.result;
    ElMessage.success('头像上传成功');
  };
  
  return false;  // 阻止默认上传行为
};

// 格式化手机号（保护隐私）
const formatPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

// 格式化邮箱（保护隐私）
const formatEmail = (email) => {
  if (!email) return '';
  const [name, domain] = email.split('@');
  
  if (name.length <= 3) {
    return `${name}***@${domain}`;
  } else {
    return `${name.substring(0, 3)}***@${domain}`;
  }
};

onMounted(() => {
  loadUserInfo();
});
</script>

<style scoped>
.eb-profile-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 5px 0;
}

.header-spacer {
  flex: 1;
}

.user-card {
  margin-bottom: 20px;
}

.user-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.user-avatar {
  position: relative;
  margin-bottom: 20px;
}

.upload-avatar {
  margin-top: 10px;
  text-align: center;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
}

.user-role {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.user-id,
.user-status {
  font-size: 12px;
  color: #606266;
  margin-bottom: 5px;
}

.user-status.active {
  color: #67C23A;
}

.security-card,
.info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.security-item {
  margin: 15px 0;
}

.security-item-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.security-level {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
}

.security-level.good {
  background-color: #67C23A;
  color: white;
}

.security-status {
  font-size: 12px;
  color: #67C23A;
}

.security-item-desc {
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
}

.setting-desc {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

.verification-code-input {
  display: flex;
  gap: 10px;
}

.verification-code-input .el-button {
  white-space: nowrap;
}
</style> 