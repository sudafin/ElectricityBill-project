<template>
  <div class="log-setting">
    <el-card>
      <EBTable
        :loading="loading"
        :columns="columns"
        :data="logList"
      >
        <template #actions="{ row }">
          <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
        </template>
      </EBTable>
      <EBPagination
        :total="total"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        @current-change="fetchLogList"
        @size-change="fetchLogList(1)"
      />
    </el-card>
    
    <el-dialog
      v-model="dialogVisible"
      title="日志详情"
      width="50%"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="操作用户">{{ logDetail.username }}</el-descriptions-item>
        <el-descriptions-item label="操作模块">{{ logDetail.module }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">{{ logDetail.action }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ logDetail.timestamp }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions
        class="margin-top"
        :column="1"
        border
      >
        <el-descriptions-item label="请求参数">
          <pre>{{ logDetail.params }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useSettingStore } from '@/store/setting';
import EBTable from '@/components/EBTable.vue';
import EBPagination from '@/components/EBPagination.vue';

const settingStore = useSettingStore();

const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const dialogVisible = ref(false);
const logDetail = ref({});

const columns = [
  { prop: 'username', label: '操作用户' },
  { prop: 'module', label: '操作模块' },
  { prop: 'action', label: '操作类型' },
  { prop: 'timestamp', label: '操作时间' },
  { prop: 'actions', label: '操作', width: '100px', fixed: 'right' },
];

const fetchLogList = async (page = currentPage.value) => {
  loading.value = true;
  currentPage.value = page;
  await settingStore.fetchLogList({
    page: currentPage.value,
    size: pageSize.value,
  });
  loading.value = false;
};

fetchLogList();

const handleDetail = (row) => {
  logDetail.value = row;
  dialogVisible.value = true;
};
</script>

<style scoped>
.margin-top {
  margin-top: 20px;
}

pre {
  font-size: 14px;
  font-family: Consolas, Monaco, monospace;
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style> 