<!-- 反馈表单组件 -->
<template>
  <div class="feedback-form">
    <el-form ref="feedbackFormRef" :model="feedbackForm" :rules="rules" label-position="top">
      <div class="form-header">
        <div class="form-icon">
          <el-icon class="feedback-icon"><ChatLineSquare /></el-icon>
        </div>
        <div class="form-title">
          <h3>我们重视您的每一条反馈</h3>
          <p>请详细描述您遇到的问题或建议，帮助我们提升服务质量</p>
        </div>
      </div>
      
      <el-divider content-position="center">填写信息</el-divider>
      
      <el-form-item label="反馈类型" prop="type">
        <el-radio-group v-model="feedbackForm.type" class="type-radio-group">
          <el-radio-button v-for="item in feedbackTypes" :key="item.value" :label="item.value">
            <el-icon><component :is="getTypeIcon(item.value)" /></el-icon>
            <span>{{ item.label }}</span>
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="反馈内容" prop="content">
        <el-input
          v-model="feedbackForm.content"
          type="textarea"
          :rows="5"
          placeholder="请详细描述您遇到的问题或建议"
          class="full-width content-textarea"
        />
      </el-form-item>
      
      <el-form-item label="联系方式" prop="contact">
        <el-input
          v-model="feedbackForm.contact"
          placeholder="请留下您的电话或邮箱，方便我们回复您"
          class="full-width"
        >
          <template #prefix>
            <el-icon><Message /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="上传截图" prop="screenshot">
        <el-upload
          class="upload-area"
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          list-type="picture-card"
          :limit="3"
        >
          <template #default>
            <el-icon class="upload-icon"><Plus /></el-icon>
            <div class="upload-text">点击上传</div>
          </template>
          <template #tip>
            <div class="el-upload__tip">支持jpg/png文件，大小不超过2MB，最多上传3张</div>
          </template>
        </el-upload>
      </el-form-item>
      
      <el-form-item class="form-actions">
        <el-button type="primary" @click="submitFeedback" :icon="Check" round>提交反馈</el-button>
        <el-button @click="resetForm" :icon="Refresh" round>重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  ChatLineSquare, 
  Message, 
  Plus, 
  Check, 
  Refresh, 
  Warning, 
  Star, 
  Service, 
  Document, 
  Setting 
} from '@element-plus/icons-vue';

// 表单ref
const feedbackFormRef = ref(null);

// 反馈类型选项
const feedbackTypes = [
  { value: 'bug', label: '系统故障' },
  { value: 'feature', label: '功能建议' },
  { value: 'usability', label: '体验问题' },
  { value: 'content', label: '内容相关' },
  { value: 'other', label: '其他问题' }
];

// 获取类型对应的图标
const getTypeIcon = (type) => {
  const icons = {
    'bug': 'Warning',
    'feature': 'Star',
    'usability': 'Setting',
    'content': 'Document',
    'other': 'Service'
  };
  return icons[type] || 'ChatLineSquare';
};

// 文件列表
const fileList = ref([]);

// 表单数据
const feedbackForm = reactive({
  type: '',
  content: '',
  contact: '',
  screenshot: null
});

// 表单验证规则
const rules = {
  type: [
    { required: true, message: '请选择反馈类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请填写反馈内容', trigger: 'blur' },
    { min: 10, message: '内容至少10个字符', trigger: 'blur' }
  ],
  contact: [
    { pattern: /^1[3-9]\d{9}$|^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/, message: '请输入正确的手机号或邮箱', trigger: 'blur' }
  ]
};

// 处理文件变化
const handleFileChange = (file) => {
  feedbackForm.screenshot = file.raw;
};

// 提交表单
const submitFeedback = () => {
  feedbackFormRef.value.validate((valid) => {
    if (valid) {
      // 这里应该实现实际的提交逻辑，这里只是模拟
      setTimeout(() => {
        ElMessage.success('感谢您的反馈，我们会尽快处理！');
        resetForm();
      }, 1000);
    } else {
      return false;
    }
  });
};

// 重置表单
const resetForm = () => {
  feedbackFormRef.value.resetFields();
  fileList.value = [];
  feedbackForm.screenshot = null;
};

// 暴露方法供父组件调用
defineExpose({
  resetForm
});
</script>

<style scoped>
.feedback-form {
  padding: 10px 0;
  max-width: 800px;
  margin: 0 auto;
}

.form-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.form-icon {
  background-color: #ecf5ff;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.feedback-icon {
  font-size: 30px;
  color: #409eff;
}

.form-title h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
}

.form-title p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.type-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
}

.type-radio-group :deep(.el-radio-button__inner) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80px;
  width: 100px;
  border-radius: 8px;
  padding: 0;
  border: 1px solid #dcdfe6;
}

.type-radio-group :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 8px;
}

.type-radio-group :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 8px;
}

.type-radio-group :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #ecf5ff;
  color: #409eff;
  border-color: #409eff;
  box-shadow: none;
}

.type-radio-group :deep(.el-radio-button__inner:hover) {
  color: #409eff;
}

.type-radio-group :deep(.el-radio-button__inner .el-icon) {
  font-size: 24px;
  margin-bottom: 8px;
}

.content-textarea :deep(.el-textarea__inner) {
  resize: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.6;
}

.full-width {
  width: 100%;
}

.upload-area {
  width: 100%;
}

.upload-area :deep(.el-upload--picture-card) {
  width: 120px;
  height: 120px;
  border-radius: 8px;
}

.upload-icon {
  font-size: 28px;
  color: #c0c4cc;
}

.upload-text {
  margin-top: 8px;
  color: #909399;
}

.el-upload__tip {
  line-height: 1.5;
  margin-top: 5px;
  color: #909399;
}

.form-actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.form-actions .el-button {
  min-width: 120px;
  padding: 12px 20px;
}
</style> 