<template>
  <div class="fee-rate-setting">
    <el-card>
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
          <el-button type="primary" @click="submitForm">保存</el-button>
        </el-form-item>
      </EBForm>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useSettingStore } from '@/store/setting';
import EBForm from '@/components/EBForm.vue';

const settingStore = useSettingStore();

const form = reactive({
  houseFeeRate: 0,
  businessFeeRate: 0,
});

const rules = {
  houseFeeRate: [
    { required: true, message: '请输入住宅费率', trigger: 'blur' },
    { type: 'number', message: '费率必须为数字', trigger: ['blur', 'change'] },
  ],
  businessFeeRate: [
    { required: true, message: '请输入商业费率', trigger: 'blur' },
    { type: 'number', message: '费率必须为数字', trigger: ['blur', 'change'] },
  ],
};

const formRef = ref(null);

const fetchFeeRate = async () => {
  const { data } = await settingStore.fetchFeeRate();
  Object.assign(form, data);
};

fetchFeeRate();

const submitForm = async () => {
  await formRef.value.validate();
  await settingStore.updateFeeRate(form);
  ElMessage.success('费率设置成功');
};
</script> 