<template>
  <div class="fee-detail">
    <el-card>
      <template #header>
        <div class="header">
          <span>费用详情</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">{{ feeDetail.username }}</el-descriptions-item>
        <el-descriptions-item label="用电量">{{ feeDetail.electricityUsage }} 度</el-descriptions-item>
        <el-descriptions-item label="费用金额">{{ feeDetail.amount }} 元</el-descriptions-item>
        <el-descriptions-item label="费用类型">{{ feeDetail.feeType }}</el-descriptions-item>
        <el-descriptions-item label="缴费状态">{{ feeDetail.paymentStatus }}</el-descriptions-item>
        <el-descriptions-item label="缴费日期">{{ feeDetail.paymentDate }}</el-descriptions-item>
      </el-descriptions>
      <div class="actions">
        <el-button type="primary" @click="handleEdit">编辑</el-button>
        <el-button @click="handleBack">返回</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFeeStore } from '@/store/fee';

const route = useRoute();
const router = useRouter();
const feeStore = useFeeStore();

const feeDetail = ref({});

const fetchFeeDetail = async () => {
  const { data } = await feeStore.fetchFeeDetail(route.params.id);
  feeDetail.value = data;
};

fetchFeeDetail();

const handleEdit = () => {
  router.push({ name: 'FeeEdit', params: { id: route.params.id } });
};

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