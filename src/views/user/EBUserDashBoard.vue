<template>
  <div class="user-dashboard">
    <el-card>
      <!-- 搜索栏 -->
      <template #header>
        <div class="header">
          <el-input
            v-model="searchText"
            placeholder="请输入用户名或电话"
            clearable
            @clear="fetchUserList"
            @keyup.enter="fetchUserList"
            class="search-input"
          >
            <template #append>
              <el-button icon="Search" @click="fetchUserList" class="search-button">搜索</el-button>
            </template>
          </el-input>
          <div class="search-options">
            <el-select v-model="searchUserType" clearable placeholder="用户类型" @change="fetchUserList" class="search-select">
              <el-option label="全部" value=""></el-option>
              <el-option label="居民用户" value="居民用户"></el-option>
              <el-option label="商业用户" value="商业用户"></el-option>
            </el-select>
            <el-select v-model="searchAccountStatus" clearable placeholder="账号状态" @change="fetchUserList" class="search-select">
              <el-option label="全部" value=""></el-option>
              <el-option label="正常" value="正常"></el-option>
              <el-option label="欠费" value="欠费"></el-option>
            </el-select>
          </div>
          <div class="table-operations">
            <el-button type="primary" @click="handleCreate">新增用户</el-button>
            <el-button type="danger" @click="handleBatchDelete" :disabled="!selectedUserIds.length">批量删除</el-button>
          </div>
        </div>
      </template>
      <!-- 表格 -->
      <EBTable
        ref="tableRef"
        :loading="loading"
        :columns="columns"
        :data="userList"
        :selection="true"
        @selection-change="handleSelectionChange"
      >
        <template #accountStatus="{ row }">
          <el-tag :type="row.accountStatus === '正常' ? 'success' : 'danger'">
            {{ row.accountStatus }}
          </el-tag>
        </template>
        <template #actions="{ row }">
          <el-button type="primary" link @click="showDetail(row)">详情</el-button>
          <el-button type="success" link @click="handlePayment(row)">缴费</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </EBTable>
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          :disabled="loading"
          @current-change="fetchUserList"
          layout="prev, pager, next, jumper"
          prev-text="上一页"
          next-text="下一页"
        ></el-pagination>
      </div>
    </el-card>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailVisible" title="用户详情" size="50%" :with-header="false" direction="rtl">
      <div class="drawer-content">
        <h3 class="drawer-title">用户详情</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
          <el-descriptions-item label="用户姓名">{{ currentUser.username }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ currentUser.phone }}</el-descriptions-item>
          <el-descriptions-item label="地址">{{ currentUser.address }}</el-descriptions-item>
          <el-descriptions-item label="用户类型">{{ currentUser.userType }}</el-descriptions-item>
          <el-descriptions-item label="账号状态">
            <el-tag :type="currentUser.accountStatus === '正常' ? 'success' : 'danger'">
              {{ currentUser.accountStatus }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="当前电费余额">{{ currentUser.balance }}</el-descriptions-item>
          <el-descriptions-item label="用电量">{{ currentUser.electricityUsage }}</el-descriptions-item>
        </el-descriptions>
        <el-divider></el-divider>
        <el-table :data="currentUser.paymentHistory" stripe>
          <el-table-column prop="date" label="缴费日期"></el-table-column>
          <el-table-column prop="amount" label="缴费金额"></el-table-column>
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import EBTable from '@/components/EBTable.vue';
const router = useRouter();

const searchText = ref('');
const searchUserType = ref('');
const searchAccountStatus = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const userList = ref([]);
const total = ref(0);
const selectedUserIds = ref([]);

const columns = [
  { type: 'selection', width: '55' },
  { prop: 'username', label: '用户姓名' },
  { prop: 'phone', label: '电话' },
  { prop: 'address', label: '地址' },
  { prop: 'userType', label: '用户类型' },
  { prop: 'accountStatus', label: '账号状态', slotName: 'accountStatus' },
  { prop: 'balance', label: '当前电费余额' },
  { prop: 'electricityUsage', label: '用电量' },
  { prop: 'actions', label: '操作', width: '200px', fixed: 'right' },
];

const fetchUserList = async (page = currentPage.value) => {
  loading.value = true;
  currentPage.value = page;
  
  // 模拟从后端获取数据,添加搜索条件
  let mockData = [
    { id: 1, username: '张三', phone: '13800000000', address: '北京市海淀区', userType: '居民用户', accountStatus: '正常', balance: 100, electricityUsage: 500 },
    { id: 2, username: '李四', phone: '13800000001', address: '上海市浦东新区', userType: '商业用户', accountStatus: '欠费', balance: -50, electricityUsage: 800 },
    { id: 3, username: '王五', phone: '13800000002', address: '广州市天河区', userType: '居民用户', accountStatus: '正常', balance: 200, electricityUsage: 300 },
  ];
  
  if (searchUserType.value) {
    mockData = mockData.filter(item => item.userType === searchUserType.value);
  }
  if (searchAccountStatus.value) {
    mockData = mockData.filter(item => item.accountStatus === searchAccountStatus.value);
  }
  if (searchText.value) {
    mockData = mockData.filter(item => item.username.includes(searchText.value) || item.phone.includes(searchText.value));
  }
  
  userList.value = mockData;
  total.value = mockData.length;
  
  loading.value = false;
};

onMounted(() => {
  fetchUserList();
});

const detailVisible = ref(false);
const currentUser = ref({});

const showDetail = (row) => {
  currentUser.value = {
    ...row,
    paymentHistory: [
      { date: '2023-05-01', amount: 100 },
      { date: '2023-04-01', amount: 80 },
    ],
  };
  detailVisible.value = true;
};

const handlePayment = (row) => {
  router.push({ name: 'UserPayment', params: { id: row.id } });
};

const handleCreate = () => {
  // 跳转到用户新增页面
  router.push({ name: 'UserForm' });
};

const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该用吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      // 模拟删除用户
      console.log('删除用户:', row);
      await fetchUserList();
      ElMessage.success('删除成功');
    })
    .catch(() => {});
};

const tableRef = ref(null);

const handleSelectionChange = (selectedRows) => {
  selectedUserIds.value = selectedRows.map((row) => row.id);
};

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定删除选中的 ${selectedUserIds.value.length} 个用户吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      // 模拟批量删除用户
      console.log('批量删除用户:', selectedUserIds.value);
      await fetchUserList();
      ElMessage.success('删除成功');
      tableRef.value.clearSelection();
    })
    .catch(() => {});
};
</script>

<style scoped>
.user-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
}

.search-card {
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #e0f2ff 0%, #d6e8ff 100%);
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.search-card :deep(.el-card__header) {
  border-bottom: none;
  padding: 20px;
}

.search-card :deep(.el-card__body) {
  padding: 0 20px 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 4px;
  box-shadow: none;
}

.search-button {
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 0 4px 4px 0;
  padding: 0 20px;
}

.search-options {
  display: flex;
  gap: 10px;
}

.search-select {
  width: 120px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.search-select .el-input__wrapper) {
  border-radius: 4px;
  box-shadow: none;
}

.table-operations {
  display: flex;
  gap: 10px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.pagination-info {
  color: #999;
}

.el-drawer {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.drawer-content {
  padding: 20px;
}

.drawer-title {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
}
</style> 
