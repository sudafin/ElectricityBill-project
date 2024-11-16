<template>
  <div class="fee-form">
    <el-card>
      <template #header>
        <div class="header">
          <span>{{ isEdit ? '编辑费用' : '新增费用' }}</span>
        </div>
      </template>
      <EBForm
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择用户">
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.username"
              :value="user.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用电量" prop="electricityUsage">
          <el-input v-model.number="form.electricityUsage" placeholder="请输入用电量"></el-input>
        </el-form-item>
        <el-form-item label="费用金额" prop="amount">
          <el-input v-model.number="form.amount" placeholder="请输入费用金额"></el-input>
        </el-form-item>
        <el-form-item label="费用类型" prop="feeType">
          <el-select v-model="form.feeType" placeholder="请选择费用类型">
            <el-option label="住宅" value="住宅"></el-option>
            <el-option label="商业" value="商业"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="缴费状态" prop="paymentStatus">
          <el-select v-model="form.paymentStatus" placeholder="请选择缴费状态">
            <el-option label="未支付" value="未支付"></el-option>
            <el-option label="已支付" value="已支付"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="缴费日期" prop="paymentDate">
          <el-date-picker
            v-model="form.paymentDate"
            type="date"
            placeholder="请选择缴费日期"
            style="width: 100%"
          ></el-date-picker>
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
import { useUserStore } from '@/store/user';
import { useFeeStore } from '@/store/fee';
import EBForm from '@/components/EBForm.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const feeStore = useFeeStore();

const isEdit = ref(!!route.params.id);
const form = reactive({
  userId: '',
  electricityUsage: '',
  amount: '',
  feeType: '',
  paymentStatus: '',
  paymentDate: '',
});
const rules = {
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  electricityUsage: [
    { required: true, message: '请输入用电量', trigger: 'blur' },
    { type: 'number', message: '用电量必须为数字', trigger: ['blur', 'change'] },
  ],
  amount: [
    { required: true, message: '请输入费用金额', trigger: 'blur' },
    { type: 'number', message: '费用金额必须为数字', trigger: ['blur', 'change'] },
  ],
  feeType: [{ required: true, message: '请选择费用类型', trigger: 'change' }],
  paymentStatus: [{ required: true, message: '请选择缴费状态', trigger: 'change' }],
  paymentDate: [{ required: true, message: '请选择缴费日期', trigger: 'change' }],
};

const formRef = ref(null);
const userList = ref([]);

const fetchUserList = async () => {
  const { data } = await userStore.fetchUserList();
  userList.value = data.list;
};

fetchUserList();

const submitForm = async () => {
  await formRef.value.validate();
  if (isEdit.value) {
    await feeStore.updateFee({ id: route.params.id, ...form });
  } else {
    await feeStore.createFee(form);
  }
  router.push({ name: 'FeeList' });
};

const resetForm = () => {
  formRef.value.resetFields();
};

if (isEdit.value) {
  const { data } = await feeStore.fetchFeeDetail(route.params.id);
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