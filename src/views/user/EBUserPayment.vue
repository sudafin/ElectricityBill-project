<template>
  <div class="user-payment">
    <el-card>
      <template #header>
        <div class="header">
          <span>用户缴费</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="当前余额">{{ user.balance }}</el-descriptions-item>
        <el-descriptions-item label="电价类型">{{ user.electricityType }}</el-descriptions-item>
        <el-descriptions-item label="用电时间段">{{ user.usageTimeRange }}</el-descriptions-item>
      </el-descriptions>
      <el-divider></el-divider>
      <EBForm
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="缴费金额" prop="amount">
          <el-input-number v-model="form.amount" :min="0" :step="10"></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">立即缴费</el-button>
        </el-form-item>
      </EBForm>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EBForm from '@/components/EBForm.vue';

const route = useRoute();
const router = useRouter();
const user = ref({});
const form = reactive({
  amount: 0,
});
const rules = {
  amount: [
    { required: true, message: '请输入缴费金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '缴费金额不能小于0', trigger: ['blur', 'change'] },
  ],
};

const formRef = ref(null);

onMounted(() => {
  // 模拟获取用户信息
  const userId = route.params.id;
  user.value = {
    id: userId,
    balance: 100,
    electricityType: '居民用电',
    usageTimeRange: '08:00 - 22:00',
  };
});

const submitForm = async () => {
  await formRef.value.validate();
  
  // 模拟提交缴费
  console.log('缴费金额:', form.amount);
  
  router.push({ name: 'UserDetail', params: { id: user.value.id } });
};
</script> 