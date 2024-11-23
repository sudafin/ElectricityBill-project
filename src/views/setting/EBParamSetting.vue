<template>
  <div class="param-setting">
    <el-card class="filter-card">
      <template #header>
        <div class="header">
          <span>参数设置</span>
        </div>
      </template>
      <EBForm
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="150px"
      >
        <el-form-item label="缴费提醒时间" prop="paymentRemindDays">
          <el-input v-model.number="form.paymentRemindDays">
            <template #append>天</template>
          </el-input>
        </el-form-item>
        <el-form-item label="异常用电提醒阈值" prop="abnormalUsageThreshold">
          <el-input v-model.number="form.abnormalUsageThreshold">
            <template #append>度</template>
          </el-input>
        </el-form-item>
        <el-form-item label="报表生成周期" prop="reportGenerateCycle">
          <el-select v-model="form.reportGenerateCycle" placeholder="请选择报表生成周期">
            <el-option label="日报" value="daily"></el-option>
            <el-option label="周报" value="weekly"></el-option>
            <el-option label="月报" value="monthly"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <div class="action-buttons">
            <el-button type="primary" @click="submitForm">保存</el-button>
            <el-button @click="resetForm">重置</el-button>
          </div>
        </el-form-item>
      </EBForm>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useSettingStore } from '@/store/setting';
import EBForm from '@/components/EBForm.vue';
import { ElMessage } from 'element-plus';

const settingStore = useSettingStore();

const form = reactive({
  paymentRemindDays: 0,
  abnormalUsageThreshold: 0,
  reportGenerateCycle: '',
});

const rules = {
  paymentRemindDays: [
    { required: true, message: '请输入缴费提醒时间', trigger: 'blur' },
    { type: 'number', message: '缴费提醒时间必须为数字', trigger: ['blur', 'change'] },
  ],
  abnormalUsageThreshold: [
    { required: true, message: '请输入异常用电提醒阈值', trigger: 'blur' },
    { type: 'number', message: '异常用电提醒阈值必须为数字', trigger: ['blur', 'change'] },
  ],
  reportGenerateCycle: [{ required: true, message: '请选择报表生成周期', trigger: 'change' }],
};

const formRef = ref(null);

const fetchParams = async () => {
  try {
    const { data } = await settingStore.fetchParams();
    Object.assign(form, data);
  } catch (error) {
    ElMessage.error('获取参数失败');
  }
};

fetchParams();

const submitForm = async () => {
  try {
    await formRef.value.validate();
    await settingStore.updateParams(form);
    ElMessage.success('参数设置成功');
  } catch (error) {
    ElMessage.error('参数设置失败');
  }
};

const resetForm = () => {
  formRef.value.resetFields();
};
</script>

<style scoped>
.param-setting {
  padding: 20px;
  background-color: #f5f7fa;
}

.filter-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-buttons .el-button {
  min-width: 88px;
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
}

.action-buttons .el-button .el-icon {
  margin-right: 4px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-input,
.el-select {
  width: 100%;
}
</style> 