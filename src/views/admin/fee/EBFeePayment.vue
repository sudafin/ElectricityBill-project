<template>
  <div class="user-payment">
    <el-card>
      <template #header>
        <div class="header">
          <span>用户缴费</span>
        </div>
      </template>
      <div class="bill-info">
        <h3>账单信息区域:</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ userBill.username }}</el-descriptions-item>
          <el-descriptions-item label="用户类型">{{ userBill.userType }}</el-descriptions-item>
          <el-descriptions-item label="电表编号">{{ userBill.meterNo }}</el-descriptions-item>
          <el-descriptions-item label="当前账单时间">{{ 
          new Date().toLocaleDateString().split('/').join
          ('-') }}</el-descriptions-item>
          <el-descriptions-item label="账单金额">¥{{ userBill.balance }}</el-descriptions-item>
          <el-descriptions-item label="未缴金额">¥{{ userBill.unpaidAmount }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <el-divider></el-divider>
      <div class="payment-input">
        <h3>缴费输入区域:</h3>
        <EBForm
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item label="缴费金额" prop="amount">
            <el-input-number v-model="form.amount" :min="0" :step="10"></el-input-number>
          </el-form-item>
          <el-form-item label="缴费方式" prop="paymentMethod">
            <el-select v-model="form.paymentMethod" placeholder="请选择缴费方式" class="payment-method-select">
              <el-option label="微信" value="微信"></el-option>
              <el-option label="支付宝" value="支付宝"></el-option>
              <el-option label="银行卡" value="银行卡"></el-option>
              <el-option label="现金" value="现金"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm">立即缴费</el-button>
          </el-form-item>
        </EBForm>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import EBForm from '@/components/EBForm.vue';
import { payUser, getUserBill } from '@/api/user.js';

const route = useRoute();
const router = useRouter();
const userBill = ref({});
const form = reactive({
  amount: 0,
  paymentMethod: '',
});
const rules = {
  amount: [
    { required: true, message: '请输入缴费金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '缴费金额不能小于0', trigger: ['blur', 'change'] },
  ],
  paymentMethod: [
    { required: true, message: '请选择缴费方式', trigger: 'change' },
  ],
};

const formRef = ref(null);

onMounted(async () => {
  //获取路径参数
  const userId = route.params.id;
  try {
    const res = await getUserBill(userId);
    userBill.value = res;
    form.amount = res.unpaidAmount;
  } catch (error) {
    console.error('获取用户账单失败:', error);
    ElMessage.error('获取用户账单失败,请稍后再试');
  }
});

const submitForm = async () => {
  // 使用 await 等待表单验证结果
  const valid = await formRef.value.validate();
  if (valid) {
    const userId = route.params.id;
    const { amount, paymentMethod } = form;
    try {
      const res = await payUser(userId, amount, paymentMethod);
      if(res.code === 200){
        ElMessage.success('缴费成功');
        // 缴费成功后刷新页面
        router.push({ name: 'UserDashboard' });
      } else {
        ElMessage.error('缴费失败');
      }
    } catch (error) { 
      // 处理异常错误
      console.error(error);
      ElMessage.error('缴费请求异常,请稍后重试');
    }
  } else {
    ElMessage.error('请输入正确的缴费金额和缴费方式');
  }
};
</script>

<style scoped>
.payment-method-select {
  width: 200px;
}
</style> 