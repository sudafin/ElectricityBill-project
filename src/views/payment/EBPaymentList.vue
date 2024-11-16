<template>
  <div class="payment-list">
    <el-card>
      <template #header>
        <div class="header">
          <el-input
            v-model="searchText"
            placeholder="请输入用户名"
            clearable
            @clear="fetchPaymentList"
            @keyup.enter="fetchPaymentList"
          >
            <template #append>
              <el-button icon="Search" @click="fetchPaymentList"></el-button>
            </template>
          </el-input>
        </div>
      </template>
      <EBTable
        :loading="loading"
        :columns="columns"
        :data="paymentList"
      >
        <template #status="{ row }">
          <el-tag :type="row.status === '已支付' ? 'success' : 'warning'">{{ row.status }}</el-tag>
        </template>
        <template #actions="{ row }">
          <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
        </template>
      </EBTable>
      <EBPagination
        :total="total"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        @current-change="fetchPaymentList"
        @size-change="fetchPaymentList(1)"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePaymentStore } from '@/store/payment';
import EBTable from '@/components/EBTable.vue';
import EBPagination from '@/components/EBPagination.vue';

const router = useRouter();
const paymentStore = usePaymentStore();

const searchText = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

const columns = [
  { prop: 'username', label: '用户名' },
  { prop: 'amount', label: '支付金额' },
  { prop: 'paymentMethod', label: '支付方式' },
  { prop: 'status', label: '支付状态' },
  { prop: 'paymentDate', label: '支付日期' },
  { prop: 'actions', label: '操作', width: '100px', fixed: 'right' },
];

const fetchPaymentList = async (page = currentPage.value) => {
  loading.value = true;
  currentPage.value = page;
  await paymentStore.fetchPaymentList({
    page: currentPage.value,
    size: pageSize.value,
    username: searchText.value,
  });
  loading.value = false;
};

fetchPaymentList();

const handleDetail = (row) => {
  router.push({ name: 'PaymentDetail', params: { id: row.id } });
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.el-input {
  width: 300px;
}
</style> 