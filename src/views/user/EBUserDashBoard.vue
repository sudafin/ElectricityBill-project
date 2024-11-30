<template>
  <div class="user-dashboard">
    <el-card class="filter-card">
      <template #header>
        <div class="header">
          <div class="search-area">
            <div class="search-row">
              <el-input
                v-model="searchText"
                placeholder="搜索用户名或电话"
                clearable
                @clear="fetchUserList"
                @keyup.enter="fetchUserList"
                class="search-input"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-select
                v-model="searchUserType"
                clearable
                placeholder="用户类型"
                @change="fetchUserList"
                class="filter-select"
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
                <el-option label="全部" value=""></el-option>
                <el-option label="居民用户" value="居民用户"></el-option>
                <el-option label="商业用户" value="商业用户"></el-option>
              </el-select>
              <el-select
                v-model="searchAccountStatus"
                clearable
                placeholder="账号状态"
                @change="fetchUserList"
                class="filter-select"
              >
                <template #prefix>
                  <el-icon><InfoFilled /></el-icon>
                </template>
                <el-option label="全部" value=""></el-option>
                <el-option label="正常" value="正常"></el-option>
                <el-option label="欠费" value="欠费"></el-option>
              </el-select>
              <el-input
                v-model="searchMeterNo"
                placeholder="电表编号"
                clearable
                @clear="fetchUserList"
                @keyup.enter="fetchUserList"
                class="meter-input"
              >
                <template #prefix>
                  <el-icon><Odometer /></el-icon>
                </template>
              </el-input>
              <el-date-picker
                v-model="searchDateRange"
                type="daterange"
                unlink-panels
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                class="filter-date-range"
              >
                <template #prefix>
                  <el-icon><Calendar /></el-icon>
                </template>
              </el-date-picker>
            </div>
          </div>
          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>搜索
            </el-button>
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>新增用户
            </el-button>
            <el-button type="danger" @click="handleBatchDelete" :disabled="!selectedUserIds.length">
              <el-icon><Delete /></el-icon>批量删除
            </el-button>
          </div>
        </div>
      </template>
      <!-- 表格 -->
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="userList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="用户ID"></el-table-column>
        <el-table-column prop="username" label="用户姓名"></el-table-column>
        <el-table-column prop="phone" label="电话"></el-table-column>
        <el-table-column prop="meterNo" label="电表编号"></el-table-column>
        <el-table-column prop="address" label="地址"></el-table-column>
        <el-table-column prop="userType" label="用户类型"></el-table-column>
        <el-table-column label="账号状态">
          <template #default="{ row }">
            <el-tag :type="row.accountStatus === '正常' ? 'success' : 'danger'">
              {{ row.accountStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="当前电费余额"></el-table-column>
        <el-table-column prop="electricityUsage" label="用电量"></el-table-column>
        <el-table-column prop="lastPaymentDate" label="最近缴费时间"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showDetail(row.id)">详情</el-button>
            <el-button type="success" link @click="handlePayment(row)">缴费</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          :disabled="loading"
          @current-change="handlePageChange"
          layout="prev, pager, next, jumper"
          prev-text="上一页"
          next-text="下一页"
        ></el-pagination>
        <div class="total">共 {{ total }} 条</div>
      </div>
    </el-card>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailVisible" title="用户详情" size="50%" :with-header="false" direction="rtl">
      <div class="drawer-content">
        <div class="drawer-header">
          <h3 class="drawer-title">用户详情</h3>
        </div>
        <div class="drawer-body">
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
          <div class="payment-history">
            <el-table :data="currentUser.paymentHistory" stripe>
              <el-table-column prop="date" label="缴费日期"></el-table-column>
              <el-table-column prop="amount" label="缴费金额"></el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Search, User, InfoFilled, Calendar, Plus, Delete, Odometer } from '@element-plus/icons-vue'
import { getUserList } from '@/api/user';
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
const searchDateRange = ref([]);
const searchMeterNo = ref('');

const columns = [
  { type: 'selection', width: '55' },
  { prop: 'id', label: '用户ID' },
  { prop: 'username', label: '用户姓名' },
  { prop: 'phone', label: '电话' },
  { prop: 'meterNo', label: '电表编号' },
  { prop: 'address', label: '地址' },
  { prop: 'userType', label: '用户类型' },
  { prop: 'accountStatus', label: '账号状态', slotName: 'accountStatus' },
  { prop: 'balance', label: '当前电费余额' },
  { prop: 'electricityUsage', label: '用电量' },
  { prop: 'lastPaymentDate', label: '最近缴费时间' },
  { prop: 'actions', label: '操作', width: '200px', fixed: 'right' },
];

const fetchUserList = async (page = currentPage.value, shouldResetPage = false) => {
  loading.value = true;
  
  if (shouldResetPage) {
    currentPage.value = 1; // 重置页码
  } else {
    currentPage.value = page;
  }

  const userPageQuery = {
    page: currentPage.value,
    pageSize: pageSize.value,
    userType: searchUserType.value,
    accountStatus: searchAccountStatus.value,
    meterNo: searchMeterNo.value,
    startDate: searchDateRange.value && searchDateRange.value.length === 2 ? searchDateRange.value[0] : undefined,
    endDate: searchDateRange.value && searchDateRange.value.length === 2 ? searchDateRange.value[1] : undefined,
    name: searchText.value && !isNaN(searchText.value) ? undefined : searchText.value,
    phone: searchText.value && isNaN(searchText.value) ? undefined : searchText.value
  };

  try {
    const res = await getUserList(userPageQuery);

    userList.value = res.list;
    total.value = Number(res.total);
  } catch (err) {
    console.error(err);
    ElMessage.error('获取用户列表失败');
  }

  loading.value = false;
};

onMounted(() => {
  fetchUserList(1); // 组件初始化时获取第一页数据
});

const detailVisible = ref(false);
const currentUser = ref({});

const showDetail = async (userId) => {
  try {
    const res = await getUserDetail(userId);
    currentUser.value = {
      ...res.data,
      paymentHistory: [
        { date: '2023-05-01', amount: 100 },
        { date: '2023-04-01', amount: 80 },
      ],
    };
    detailVisible.value = true;
  } catch (err) {
    console.error(err);
    ElMessage.error('获取用户详情失败');
  }
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
      userList.value = userList.value.filter(item => !selectedUserIds.value.includes(item.id));
      total.value = userList.value.length;
      
      // 更新 selectedUserIds,只保留还存在于 userList 中的行
      selectedUserIds.value = selectedUserIds.value.filter(id => userList.value.some(item => item.id === id));
      
      ElMessage.success('删除成功');
    })
    .catch(() => {});
};

// 添加搜索处理函数
const handleSearch = () => {
  fetchUserList(1, true); // 点击搜索按钮时,从第一页开始搜索,并重置页码
};

// 修改其他输入框和选择器的事件处理
const handleInputChange = () => {
  // 输入变化时不立即搜索，等待用户点击搜索按钮
};

const handlePageChange = (page) => {
  fetchUserList(page);
};
</script>

<style scoped>
.user-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
}

.filter-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.search-area {
  flex: 1;
  background: #fff;
  padding: 12px;
  border-radius: 8px;
  min-width: 0;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  width: 100%;
}

.search-input {
  width: 180px;
  flex-shrink: 0;
}

.filter-select {
  width: 120px;
  flex-shrink: 0;
}

.filter-date-range {
  width: 240px;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  gap: 8px;
  padding: 12px 0;
  flex-shrink: 0;
  margin-left: auto; /* 确保按钮靠右对齐 */
}

.action-buttons .el-button {
  min-width: 88px; /* 设置最小宽度确保按钮大小一致 */
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center; /* 确保图标和文字居中对齐 */
  gap: 4px;
  white-space: nowrap;
}

.action-buttons .el-button .el-icon {
  margin-right: 4px;
}

:deep(.el-select-dropdown__item) {
  padding: 8px 12px;
}

:deep(.el-select-dropdown__item.selected) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: bold;
}

/* 添加响应式布局 */
@media screen and (max-width: 768px) {
  .header {
    flex-direction: column;
  }
  
  .filter-options {
    flex-direction: column;
  }
  
  .filter-select,
  .filter-date-range {
    width: 100%;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: flex-end;
  }
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.total {
  color: #999;
  font-size: 14px;
}

.el-drawer {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
}

.drawer-header {
  margin-bottom: 20px;
}

.drawer-title {
  font-size: 18px;
  font-weight: bold;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
}

.payment-history {
  margin-top: 20px;
}

.search-date-range {
  width: 260px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.meter-input {
  width: 140px;
  flex-shrink: 0;
}

/* 响应式布局调整 */
@media screen and (max-width: 1400px) {
  .search-row {
    flex-wrap: wrap;
    gap: 8px;
  }

  .search-input,
  .filter-select,
  .meter-input,
  .filter-date-range {
    flex: 1;
    min-width: 160px;
  }
}
</style> 
