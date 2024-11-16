<template>
  <div class="fee-list">
    <el-card>
      <template #header>
        <div class="header">
          <el-input
            v-model="searchText"
            placeholder="请输入用户名或费用类型"
            clearable
            @clear="fetchFeeList"
            @keyup.enter="fetchFeeList"
          >
            <template #append>
              <el-button icon="Search" @click="fetchFeeList"></el-button>
            </template>
          </el-input>
        </div>
      </template>
      <EBTable
        :loading="loading"
        :columns="columns"
        :data="feeList"
      >
        <template #actions="{ row }">
          <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
        </template>
      </EBTable>
      <EBPagination
        :total="total"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        @current-change="fetchFeeList"
        @size-change="fetchFeeList(1)"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFeeStore } from '@/store/fee';
import EBTable from '@/components/EBTable.vue';
import EBPagination from '@/components/EBPagination.vue';

const router = useRouter();
const feeStore = useFeeStore();

const searchText = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

const columns = [
  { prop: 'username', label: '用户名' },
  { prop: 'electricityUsage', label: '用电量' },
  { prop: 'amount', label: '费用金额' },
  { prop: 'feeType', label: '费用类型' },
  { prop: 'paymentStatus', label: '缴费状态' },
  { prop: 'actions', label: '操作', width: '100px', fixed: 'right' },
];

const fetchFeeList = async (page = currentPage.value) => {
  loading.value = true;
  currentPage.value = page;
  await feeStore.fetchFeeList({
    page: currentPage.value,
    size: pageSize.value,
    username: searchText.value,
    feeType: searchText.value,
  });
  loading.value = false;
};

fetchFeeList();

const handleDetail = (row) => {
  router.push({ name: 'FeeDetail', params: { id: row.id } });
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