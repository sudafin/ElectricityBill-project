<template>
  <div class="reconciliation-list">
    <el-card>
      <template #header>
        <div class="header">
          <el-input
            v-model="searchText"
            placeholder="请输入用户名或费用类型"
            clearable
            @clear="fetchReconciliationList"
            @keyup.enter="fetchReconciliationList"
          >
            <template #append>
              <el-button icon="Search" @click="fetchReconciliationList"></el-button>
            </template>
          </el-input>
        </div>
      </template>
      <EBTable
        :loading="loading"
        :columns="columns"
        :data="reconciliationList"
      >
        <template #status="{ row }">
          <el-tag :type="row.status === '已对账' ? 'success' : 'warning'">{{ row.status }}</el-tag>
        </template>
        <template #actions="{ row }">
          <el-button type="primary" link @click="handleApprove(row)">审批</el-button>
        </template>
      </EBTable>
      <EBPagination
        :total="total"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        @current-change="fetchReconciliationList"
        @size-change="fetchReconciliationList(1)"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useReconciliationStore } from '@/store/reconciliation';
import EBTable from '@/components/EBTable.vue';
import EBPagination from '@/components/EBPagination.vue';

const router = useRouter();
const reconciliationStore = useReconciliationStore();

const searchText = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

const columns = [
  { prop: 'username', label: '用户名' },
  { prop: 'feeType', label: '费用类型' },
  { prop: 'amount', label: '费用金额' },
  { prop: 'status', label: '对账状态' },
  { prop: 'actions', label: '操作', width: '100px', fixed: 'right' },
];

const fetchReconciliationList = async (page = currentPage.value) => {
  loading.value = true;
  currentPage.value = page;
  await reconciliationStore.fetchReconciliationList({
    page: currentPage.value,
    size: pageSize.value,
    username: searchText.value,
    feeType: searchText.value,
  });
  loading.value = false;
};

fetchReconciliationList();

const handleApprove = (row) => {
  router.push({ name: 'ReconciliationApprove', params: { id: row.id } });
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