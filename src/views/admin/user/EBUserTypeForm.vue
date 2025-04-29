<template>
  <el-dialog
    v-model="dialogVisible"
    title="新增用户类型"
    width="500px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <el-form
      ref="userTypeFormRef"
      :model="userTypeForm"
      :rules="rules"
      label-width="120px"
      label-position="right"
      class="user-type-form"
    >
      <el-form-item label="类型名称" prop="typeName">
        <el-input v-model="userTypeForm.typeName" placeholder="请输入用户类型名称"></el-input>
      </el-form-item>
      <el-form-item label="类型描述" prop="description">
        <el-input 
          v-model="userTypeForm.description" 
          type="textarea" 
          placeholder="请输入用户类型描述" 
          :rows="3"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { addUserType } from '@/api/admin/admin.js';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'success']);

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

const userTypeFormRef = ref(null);
const submitting = ref(false);

// 用户类型表单数据
const userTypeForm = reactive({
  typeName: '',
  description: ''
});

// 表单验证规则
const rules = {
  typeName: [
    { required: true, message: '用户类型名称不能为空', trigger: 'blur' },
    { max: 20, message: '用户类型名称不能超过20个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '描述不能为空', trigger: 'blur' },
    { max: 100, message: '描述不能超过100个字符', trigger: 'blur' }
  ]
};

// 提交表单
const submitForm = () => {
  if (!userTypeFormRef.value) return;
  
  userTypeFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    console.log('提交用户类型数据:', userTypeForm);
    submitting.value = true;
    try {
      const res = await addUserType(userTypeForm);
      console.log('添加用户类型结果:', res);
      ElMessage.success('用户类型添加成功');
      emit('success');
      closeDialog();
    } catch (error) {
      console.error('添加用户类型失败:', error);
      ElMessage.error('添加用户类型失败: ' + (error.message || '未知错误'));
    } finally {
      submitting.value = false;
    }
  });
};

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false;
  if (userTypeFormRef.value) {
    userTypeFormRef.value.resetFields();
  }
};
</script>

<style scoped>
.user-type-form {
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style> 