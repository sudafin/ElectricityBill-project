<template>
  <div class="user-list">
    <el-card>
      <template #header>
        <div class="header">
          <el-button type="primary" @click="handleCreate">新增用户</el-button>
          <el-input
            v-model="searchText"
            placeholder="请输入用户名或邮箱"
            clearable
            @clear="fetchUserList"
            @keyup.enter="fetchUserList"
          >
            <template #append>
              <el-button icon="Search" @click="fetchUserList"></el-button>
            </template>
          </el-input>
        </div>
      </template>
      <EBTable
        :loading="loading"
        :columns="columns"
        :data="userList"
      >
        <template #actions="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </EBTable>
      <EBPagination
        :total="total"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        @current-change="fetchUserList"
        @size-change="fetchUserList(1)"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import EBTable from '@/components/EBTable.vue';
import EBPagination from '@/components/EBPagination.vue';

const router = useRouter();

const searchText = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const userList = ref([]);
const total = ref(0);

const columns = [
  { prop: 'username', label: '用户名' },
  { prop: 'email', label: '邮箱' },
  { prop: 'phone', label: '手机号' },
  { prop: 'role', label: '角色' },
  { prop: 'actions', label: '操作', width: '150px', fixed: 'right' },
];

const fetchUserList = async (page = currentPage.value) => {
  loading.value = true;
  currentPage.value = page;
  
  // 模拟从后端获取数据
  const mockData = [
    { id: 1, username: 'admin', email: 'admin@example.com', phone: '13800000000', role: 'admin' },
    { id: 2, username: 'user', email: 'user@example.com', phone: '13800000001', role: 'user' },
  ];
  userList.value = mockData;
  total.value = mockData.length;
  
  loading.value = false;
};

onMounted(() => {
  fetchUserList();
});

const handleCreate = () => {
  router.push({ name: 'UserCreate' });
};

const handleEdit = (row) => {
  router.push({ name: 'UserEdit', params: { id: row.id } });
};

const handleDelete = async (row) => {
  // 模拟删除用户
  userList.value = userList.value.filter(user => user.id !== row.id);
  total.value = userList.value.length;
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.el-input {
  width: 300px;
}
</style> 