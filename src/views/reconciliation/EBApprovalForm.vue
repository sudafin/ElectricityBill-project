<template>
  <div class="approval-form">
    <el-card>
      <template #header>
        <div class="header">
          <span>对账单审批</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">{{ reconciliationDetail.username }}</el-descriptions-item>
        <el-descriptions-item label="费用类型">{{ reconciliationDetail.feeType }}</el-descriptions-item>
        <el-descriptions-item label="费用金额">{{ reconciliationDetail.amount }} 元</el-descriptions-item>
        <el-descriptions-item label="对账状态">
          <el-tag :type="reconciliationDetail.status === '已对账' ? 'success' : 'warning'">{{ reconciliationDetail.status }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <div class="approval-result">
        <el-radio-group v-model="approvalResult">
          <el-radio label="通过">通过</el-radio>
          <el-radio label="不通过">不通过</el-radio>
        </el-radio-group>
      </div>
      <div class="actions">
        <el-button type="primary" @click="submitApproval">提交</el-button>
        <el-button @click="handleBack">返回</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useReconciliationStore } from '@/store/reconciliation';

const route = useRoute();
const router = useRouter();
const reconciliationStore = useReconciliationStore();

const reconciliationDetail = ref({});
const approvalResult = ref('通过');

const fetchReconciliationDetail = async () => {
  const { data } = await reconciliationStore.fetchReconciliationDetail(route.params.id);
  reconciliationDetail.value = data;
};

fetchReconciliationDetail();

const submitApproval = async () => {
  await reconciliationStore.approveReconciliation({
    id: route.params.id,
    approvalResult: approvalResult.value,
  });
  router.push({ name: 'ReconciliationList' });
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

.approval-result {
  margin: 20px 0;
}

.actions {
  text-align: right;
}
</style> 