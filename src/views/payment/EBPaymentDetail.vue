<template>
  <div class="payment-detail">
    <el-card>
      <template #header>
        <div class="header">
          <span>支付详情</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">{{ paymentDetail.username }}</el-descriptions-item>
        <el-descriptions-item label="支付金额">{{ paymentDetail.amount }} 元</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ paymentDetail.paymentMethod }}</el-descriptions-item>
        <el-descriptions-item label="支付状态">
          <el-tag :type="paymentDetail.status === '已支付' ? 'success' : 'warning'">{{ paymentDetail.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付日期">{{ paymentDetail.paymentDate }}</el-descriptions-item>
      </el-descriptions>
      <div class="actions">
        <el-button @click="handleBack">返回</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePaymentStore } from '@/store/payment';

const route = useRoute();
const router = useRouter();
const paymentStore = usePaymentStore();

const paymentDetail = ref({});

const fetchPaymentDetail = async () => {
  const { data } = await paymentStore.fetchPaymentDetail(route.params.id);
  paymentDetail.value = data;
};

fetchPaymentDetail();

const handleBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  margin-top: 20px;
  text-align: right;
}
</style> 