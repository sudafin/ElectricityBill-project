<template>
  <div class="user-dashboard">
    <div class="content-wrapper">
      <!-- 添加标题区域 -->
      <div class="dashboard-header">
        <div class="title-area">
          <el-icon class="header-icon"><User /></el-icon>
          <h2 class="header-title">用户管理</h2>
        </div>
      </div>
      
      <!-- 使用新的筛选栏组件，添加buttonSize属性 -->
      <EBFilterBar
        :filters="filterConfig"
        :initial-values="initialFilterValues"
        button-size="default"
        @search="handleFilterSearch"
        @reset="clearSearch"
      >
        <!-- 添加额外按钮，确保使用相同的尺寸 -->
        <template #append-buttons>
          <el-button 
            type="primary" 
            class="action-button" 
            size="default"
            @click="handleCreate"
          >
            <el-icon><Plus /></el-icon>新增用户
          </el-button>
          <el-button 
            type="danger" 
            class="action-button" 
            size="default"
            @click="handleBatchDelete" 
            :disabled="!selectedUserIds.length"
          >
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
        </template>
      </EBFilterBar>

      <!-- 使用新的表格组件，设置border为false -->
      <div class="table-container">
        <EBTable
          ref="userTableRef"
          :columns="tableColumns"
          :data="userList"
          :loading="loading"
          :border="false"
          selection
          show-actions
          actions-width="180"
          :auto-height="true"
          pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          @selection-change="handleSelectionChange"
          @page-change="handlePageChange"
        >
          <!-- 账号状态列自定义渲染 -->
          <template #accountStatus="{ row }">
            <el-tag :type="row.accountStatus === '正常' ? 'success' : 'danger'">
              {{ row.accountStatus }}
            </el-tag>
          </template>

          <!-- 操作列 -->
          <template #actions="{ row }">
            <el-button type="primary" link size="small" @click="showDetail(row.id)">详情</el-button>
            <el-button type="warning" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </EBTable>
      </div>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailVisible" title="用户详情" size="50%" :with-header="false" direction="rtl">
      <div class="drawer-content">
        <div class="drawer-header">
          <h3 class="drawer-title">用户详情</h3>
        </div>
        <div class="drawer-body">
          <el-descriptions :column="2" border>
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
            <el-descriptions-item label="当前剩余用电量">{{ currentUser.electricityUsage }}</el-descriptions-item>
          </el-descriptions>
          <el-divider></el-divider>
          <div class="payment-history">
            <h4>缴费记录</h4>
            <el-table :data="currentUser.userPaymentRecordVOList" stripe>
              <el-table-column prop="paymentTime" label="缴费时间" width="180"></el-table-column>
              <el-table-column prop="paymentAmount" label="缴费金额" width="120"></el-table-column>
              <el-table-column prop="accountStatus" label="支付状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.paymentStatus === '成功' ? 'success' : 'danger'">
                    {{ row.paymentStatus }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="paymentMethod" label="支付方式" width="100"></el-table-column>
              <el-table-column prop="operator" label="操作人员" width="120"></el-table-column>
              <el-table-column prop="remark" label="备注"></el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Search, User, InfoFilled, Calendar, Plus, Delete, Odometer } from '@element-plus/icons-vue';
import { getUserList, getUserDetail, deleteUser } from '@/api/admin/user.js';
import { EBFilterBar, EBTable } from '@/components';

const router = useRouter();
const userTableRef = ref(null);

// 筛选条件相关
const searchText = ref('');
const searchUserType = ref('');
const searchAccountStatus = ref('');
const searchDateRange = ref([]);
const searchMeterNo = ref('');

// 筛选条件配置
const filterConfig = [
  {
    type: 'input',
    field: 'searchText',
    label: '用户姓名',
    placeholder: '请输入用户名或电话'
  },
  {
    type: 'select',
    field: 'searchUserType',
    label: '用户类型',
    options: [
      { label: '全部', value: '' },
      { label: '居民用户', value: '居民用户' },
      { label: '商业用户', value: '商业用户' }
    ]
  },
  {
    type: 'select',
    field: 'searchAccountStatus',
    label: '账号状态',
    options: [
      { label: '全部', value: '' },
      { label: '正常', value: '正常' },
      { label: '欠费', value: '欠费' }
    ]
  },
  {
    type: 'input',
    field: 'searchMeterNo',
    label: '电表编号',
    placeholder: '请输入电表编号'
  },
  {
    type: 'daterange',
    field: 'searchDateRange',
    label: '日期范围'
  }
];

// 初始值
const initialFilterValues = {
  searchText: '',
  searchUserType: '',
  searchAccountStatus: '',
  searchMeterNo: '',
  searchDateRange: []
};

// 表格相关
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const userList = ref([]);
const total = ref(0);
const selectedUserIds = ref([]);

// 表格列配置
const tableColumns = [
  { prop: 'username', label: '用户姓名' },
  { prop: 'phone', label: '电话' },
  { prop: 'meterNo', label: '电表编号' },
  { prop: 'address', label: '地址' },
  { prop: 'userType', label: '用户类型' },
  { 
    prop: 'accountStatus', 
    label: '账号状态',
    type: 'tag',
    tagMap: {
      '正常': 'success',
      '欠费': 'danger'
    }
  },
  { prop: 'balance', label: '当前电费余额' },
  { prop: 'electricityUsage', label: '用电量' },
  { prop: 'lastPaymentDate', label: '最近缴费时间', type: 'date' }
];

// 获取用户列表
const fetchUserList = async (page = currentPage.value, shouldResetPage = false) => {
  loading.value = true;
  
  if (shouldResetPage) {
    currentPage.value = 1; // 重置页码
  } else {
    currentPage.value = page;
  }

  // 创建条件查询对象
  const userPageQuery = {
    pageNo: currentPage.value,
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
    
    // 数据加载完成后手动更新表格布局
    nextTick(() => {
      if (userTableRef.value) {
        userTableRef.value.doLayout && userTableRef.value.doLayout();
      }
    });
  } catch (err) {
    console.error(err);
    ElMessage.error('获取用户列表失败');
  }
  loading.value = false;
};

// 处理筛选搜索
const handleFilterSearch = (filterValues) => {
  // 更新筛选值
  searchText.value = filterValues.searchText || '';
  searchUserType.value = filterValues.searchUserType || '';
  searchAccountStatus.value = filterValues.searchAccountStatus || '';
  searchMeterNo.value = filterValues.searchMeterNo || '';
  searchDateRange.value = filterValues.searchDateRange || [];
  
  // 重新加载数据
  fetchUserList(1, true);
};

// 获取用户详情
const fetchUserDetail = async (userId) => {
  const res = await getUserDetail(userId);
  return res;
};

const detailVisible = ref(false);
const currentUser = ref({});

const showDetail = async (userId) => {
  const userDetail = await fetchUserDetail(userId);
  currentUser.value = userDetail;
  detailVisible.value = true;
};

const handleCreate = () => {
  // 跳转到用户新增页面
  router.push({ name: 'UserForm' });
};

// 删除单个用户
const handleDelete = async (row) => {
  ElMessageBox.confirm('确定删除该用户吗?', '提示', { 
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deleteUser(row.id);
      fetchUserList();
      ElMessage.success('删除成功');
    })
    .catch(() => {});
};

// 批量删除用户
const handleSelectionChange = (selection) => {
  selectedUserIds.value = selection.map((row) => row.id);
};

const handleBatchDelete = async () => {
  if (selectedUserIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的用户');
    return;
  }
  
  ElMessageBox.confirm(`确定删除选中的 ${selectedUserIds.value.length} 个用户吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  .then(async () => {
    const ids = selectedUserIds.value.join(',');
    const res = await deleteUser(ids);
    if(res.code === 200){
      fetchUserList();
      ElMessage.success('删除成功');
    } else {
      ElMessage.error('删除失败');
    }
  })
  .catch(() => {});
};

// 分页
const handlePageChange = (page) => {
  fetchUserList(page);
};

// 清空搜索条件
const clearSearch = () => {
  searchText.value = '';
  searchUserType.value = '';
  searchAccountStatus.value = '';
  searchMeterNo.value = '';
  searchDateRange.value = [];
};

// 编辑用户
const handleEdit = (row) => {
  router.push({ 
    name: 'UserEdit', 
    params: { id: row.id }
  });
};

onMounted(() => {
  fetchUserList(1); // 组件初始化时获取第一页数据
});
</script>

<style scoped>
.user-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
}

.content-wrapper {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.content-wrapper:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

/* 标题区域样式 */
.dashboard-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 20px;
  color: #409EFF;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.5;
}

.table-container {
  padding: 0 20px 20px 20px;
  background-color: #fff;
  border-radius: 0 0 8px 8px;
}

/* 自定义表头样式 */
:deep(.el-table th.el-table__cell) {
  background-color: #f8f9fb;
  color: #606266;
  font-weight: 500;
  padding: 12px 0;
}

/* 统一移除EBFilterBar和EBTable的边框样式 */
:deep(.eb-filter-bar .filter-container) {
  box-shadow: none;
  border-radius: 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 0;
}

:deep(.eb-table .el-table) {
  border: none;
}

:deep(.eb-pagination) {
  padding-top: 15px;
}

/* 统一操作区按钮样式 */
:deep(.action-button) {
  min-width: 90px;
}

:deep(.el-button--link) {
  min-width: auto;
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

.payment-history h4 {
  margin-bottom: 10px;
}
</style> 
