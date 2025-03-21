<template>
  <div class="notification-form">
    <el-card>
      <template #header>
        <div class="header">
          <span>{{ isEdit ? '编辑通知' : '新增通知' }}</span>
        </div>
      </template>
      <el-form
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
        <el-form-item label="类型" prop="type" >
          <el-select v-model="form.type" placeholder="请选择通知类型" style="width: 200px;">
            <el-option label="系统通知" value="系统通知"></el-option>
            <el-option label="审批通知" value="审批通知"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="级别" prop="level">
          <el-radio-group v-model="form.level">
            <el-radio :value="'普通'">普通</el-radio>
            <el-radio :value="'重点'">重点</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="到期时间" prop="expireTime">
          <el-date-picker v-model="form.expireTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择到期时间"  unlink-panels></el-date-picker>
        </el-form-item>
        <el-form-item label="发送对象" prop="senderList">
          <el-select v-model="form.senderList" multiple placeholder="请选择发送对象" style="width: 360px;">
            <el-option label="系统管理员" value="系统管理员"></el-option>
            <el-option label="运营人员" value="运营人员"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">
            <el-icon><Check /></el-icon>
            保存</el-button>
          <el-button @click="resetForm">
            <el-icon><RefreshRight /></el-icon>
            重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createNotification } from '@/api/admin/notification.js';
import { ElMessage } from 'element-plus';


const router = useRouter();

const form = reactive({
  title: '',
  content: '',
  type: '',
  level: '',
  senderList: [],
  expireTime: '',
});
const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  type: [{ required: true, message: '请选择通知类型', trigger: 'change' }],
  level: [{ required: true, message: '请选择级别', trigger: 'change' }],
  senderList: [{ required: true, message: '请选择发送对象', trigger: 'change' }],
  expireTime: [{ required: true, message: '请选择到期时间', trigger: 'change' }],
};

const formRef = ref(null);

const submitForm = async () => {
  console.log('提交表单', form);
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await createNotification(form);
        if(res.code === 200){
          ElMessage.success('新增通知成功');
          router.push({ name: 'NotificationList' });
        } else if(res.code === 400) {
          ElMessage.error('参数错误,请检查输入');
        } else {
          ElMessage.error('新增通知失败');
        }
      } catch(err) {
        console.error(err);
        ElMessage.error('系统错误,请稍后重试');
      }
    }
  });
  
};

const resetForm = () => {
  formRef.value.resetFields();
};

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