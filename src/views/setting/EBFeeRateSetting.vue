<template>
  <div class="fee-rate-setting">
    <el-card class="filter-card">
      <template #header>
        <div class="header">
          <span>费率设置</span>
        </div>
      </template>
      <EBForm
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="住宅费率" prop="houseFeeRate">
          <el-input v-model.number="form.houseFeeRate">
            <template #append>元/度</template>
          </el-input>
        </el-form-item>
        <el-form-item label="商业费率" prop="businessFeeRate">
          <el-input v-model.number="form.businessFeeRate">
            <template #append>元/度</template>
          </el-input>
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
import { ref, reactive } from 'vue'
import { useSettingStore } from '@/store/setting'
import EBForm from '@/components/EBForm.vue'
import { ElMessage } from 'element-plus'

const settingStore = useSettingStore()

const form = reactive({
  houseFeeRate: 0,
  businessFeeRate: 0,
})

const rules = {
  houseFeeRate: [
    { required: true, message: '请输入住宅费率', trigger: 'blur' },
    { type: 'number', message: '费率必须为数字', trigger: ['blur', 'change'] },
  ],
  businessFeeRate: [
    { required: true, message: '请输入商业费率', trigger: 'blur' },
    { type: 'number', message: '费率必须为数字', trigger: ['blur', 'change'] },
  ],
}

const formRef = ref(null)

const fetchFeeRate = async () => {
  try {
    const { data } = await settingStore.fetchFeeRate()
    Object.assign(form, data)
  } catch (error) {
    ElMessage.error('获取费率失败')
  }
}

fetchFeeRate()

const submitForm = async () => {
  try {
    await formRef.value.validate()
    await settingStore.updateFeeRate(form)
    ElMessage.success('费率设置成功')
  } catch (error) {
    ElMessage.error('费率设置失败')
  }
}

const resetForm = () => {
  formRef.value.resetFields()
}
</script>

<style scoped>
.fee-rate-setting {
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