<template>
  <div class="notification-list">
    <el-card>
      <template #header>
        <div class="header">
          <el-button type="primary" @click="handleCreate">新增通知</el-button>
        </div>
      </template>
      <EBTable
        :loading="loading"
        :columns="columns"
        :data="notificationList"
      >
        <template #status="{ row }">
          <el-tag :type="row.status === '已发送' ? 'success' : 'warning'">{{ row.status }}</el-tag>
        </template>
        <template #actions="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </EBTable>
      <EBPagination
        :total="total"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        @current-change="fetchNotificationList"
        @size-change="fetchNotificationList(1)"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/store/notification';
import EBTable from '@/components/EBTable.vue';
import EBPagination from '@/components/EBPagination.vue';

const router = useRouter();
const notificationStore = useNotificationStore();

const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

const columns = [
  { prop: 'title', label: '标题' },
  { prop: 'content', label: '内容' },
  { prop: 'status', label: '状态' },
  { prop: 'createdAt', label: '创建时间' },
  { prop: 'actions', label: '操作', width: '150px', fixed: 'right' },
];

const fetchNotificationList = async (page = currentPage.value) => {
  loading.value = true;
  currentPage.value = page;
  await notificationStore.fetchNotificationList({
    page: currentPage.value,
    size: pageSize.value,
  });
  loading.value = false;
};

fetchNotificationList();

const handleCreate = () => {
  router.push({ name: 'NotificationCreate' });
};

const handleEdit = (row) => {
  router.push({ name: 'NotificationEdit', params: { id: row.id } });
};

const handleDelete = async (row) => {
  await notificationStore.deleteNotification(row.id);
  await fetchNotificationList();
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}
</style> 