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
            :rows="5"
            placeholder="请输入内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="草稿">草稿</el-radio>
            <el-radio label="已发送">已发送</el-radio>
          </el-radio-group>
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
import { useNotificationStore } from '@/store/notification';
import EBForm from '@/components/EBForm.vue';

const route = useRoute();
const router = useRouter();
const notificationStore = useNotificationStore();

const isEdit = ref(!!route.params.id);
const form = reactive({
  title: '',
  content: '',
  status: '草稿',
});
const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

const formRef = ref(null);

const submitForm = async () => {
  await formRef.value.validate();
  if (isEdit.value) {
    await notificationStore.updateNotification({ id: route.params.id, ...form });
  } else {
    await notificationStore.createNotification(form);
  }
  router.push({ name: 'NotificationList' });
};

const resetForm = () => {
  formRef.value.resetFields();
};

if (isEdit.value) {
  const { data } = await notificationStore.fetchNotificationDetail(route.params.id);
  Object.assign(form, data);
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 