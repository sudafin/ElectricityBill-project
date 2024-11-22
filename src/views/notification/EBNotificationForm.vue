<template>
  <div class="notification-form">
    <el-card>
      <template #header>
        <div class="header">
          <span>{{ isEdit ? '编辑通知' : '新增通知' }}</span>
        </div>
      </template>
      <EBForm
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题"></el-input>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            placeholder="请输入内容"
            :autosize="{ minRows: 3, maxRows: 8 }"
          ></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择通知类型">
            <el-option label="系统通知" value="system"></el-option>
            <el-option label="审批通知" value="approval"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="普通">普通</el-radio>
            <el-radio label="重点">重点</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="发送对象" prop="recipients">
          <el-select v-model="form.recipients" multiple placeholder="请选择发送对象">
            <el-option label="全体用户" value="all"></el-option>
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="运营人员" value="operator"></el-option>
            <el-option label="客服人员" value="customer_service"></el-option>
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
import EBForm from '@/components/EBForm.vue';

const route = useRoute();
const router = useRouter();

const isEdit = ref(!!route.params.id);
const form = reactive({
  title: '',
  content: '',
  type: '',
  status: '普通',
  recipients: [],
});
const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  type: [{ required: true, message: '请选择通知类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  recipients: [{ required: true, message: '请选择发送对象', trigger: 'change' }],
};

const formRef = ref(null);

const submitForm = async () => {
  await formRef.value.validate();
  
  // 模拟提交表单
  console.log('提交表单', form);
  
  router.push({ name: 'NotificationList' });
};

const resetForm = () => {
  formRef.value.resetFields();
};

// 编辑时填充表单数据
if (isEdit.value) {
  // 模拟通知详情数据
  const mockData = {
    id: route.params.id,
    title: '关于系统升级的通知',
    content: '为了提供更好的服务,我们将于2023年7月1日对系统进行升级,升级期间可能会影响部分功能的使用,请您提前做好准备。',
    type: 'system',
    status: '重点',
    recipients: ['all'],
  };
  
  Object.assign(form, mockData);
}
</script>

<style scoped>
.notification-form {
  padding: 20px;
  background-color: #f5f7fa;
}

.el-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.el-button {
  min-width: 88px;
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
}

.el-button .el-icon {
  margin-right: 4px;
}
</style> 