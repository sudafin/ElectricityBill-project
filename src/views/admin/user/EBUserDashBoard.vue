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
            type="success" 
            class="action-button" 
            size="default"
            @click="handleAddUserType"
          >
            <el-icon><Plus /></el-icon>新增用户类型
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
          actions-fixed="right"
          :auto-height="true"
          pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          @selection-change="handleSelectionChange"
          @page-change="handlePageChange"
          :row-style="{ height: '55px' }"
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
            <el-descriptions-item label="身份证号">{{ currentUser.idCardNo }}</el-descriptions-item>
            <el-descriptions-item label="地址">{{ currentUser.address }}</el-descriptions-item>
            <el-descriptions-item label="电表编号">{{ currentUser.meterId }}</el-descriptions-item>
            <el-descriptions-item label="用户类型">{{ currentUser.userType }}</el-descriptions-item>
            <el-descriptions-item label="账号状态">
              <el-tag :type="currentUser.accountStatus === '正常' ? 'success' : 'danger'">
                {{ currentUser.accountStatus }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="欠费账单数">{{ currentUser.outstandingBill || 0 }}</el-descriptions-item>
            <el-descriptions-item label="当月用电量">{{ currentUser.currentMonthlyElectricityUsage !== null ? currentUser.currentMonthlyElectricityUsage : '0' }}</el-descriptions-item>
            <el-descriptions-item label="最近缴费时间">{{ currentUser.lastPaymentDate }}</el-descriptions-item>
          </el-descriptions>
          <el-divider></el-divider>
          <div class="payment-history">
            <h4>缴费记录</h4>
            <el-table :data="currentUser.userPaymentRecordVOList" stripe>
              <el-table-column prop="paymentTime" label="缴费时间" width="180"></el-table-column>
              <el-table-column prop="paymentAmount" label="缴费金额" width="120"></el-table-column>
              <el-table-column prop="paymentStatus" label="支付状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.paymentStatus === '成功' ? 'success' : 'danger'">
                    {{ row.paymentStatus }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="paymentMethod" label="支付方式" width="100"></el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </el-drawer>
    
    <!-- 用户类型表单 -->
    <EBUserTypeForm
      v-model:visible="userTypeFormVisible"
      @success="handleUserTypeSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Search, User, InfoFilled, Calendar, Plus, Delete, Odometer } from '@element-plus/icons-vue';
import { getUserList, getUserDetail, deleteUser, getUserTypeList } from '@/api/admin/admin.js';
import { EBFilterBar, EBTable } from '@/components';
import EBUserTypeForm from './EBUserTypeForm.vue';

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
  { prop: 'username', label: '用户姓名', minWidth: '100' },
  { prop: 'phone', label: '电话', minWidth: '120' },
  { prop: 'meterId', label: '电表编号', minWidth: '120' },
  { prop: 'address', label: '地址', minWidth: '180' },
  { prop: 'userType', label: '用户类型', minWidth: '100' },
  { 
    prop: 'accountStatus', 
    label: '账号状态',
    minWidth: '100',
    type: 'tag',
    tagMap: {
      '正常': 'success',
      '欠费': 'danger'
    }
  },
  { prop: 'lastPaymentDate', label: '最近缴费时间', minWidth: '140', type: 'date' },
  { prop: 'idCardNo', label: '身份证号', minWidth: '180' }
];

// 获取用户列表
const fetchUserList = async (page = 1, shouldResetPage = false) => {
  loading.value = true;
  
  if (shouldResetPage) {
    currentPage.value = 1; // 重置页码
  } else {
    currentPage.value = page;
  }

  // 创建条件查询对象，确保精简参数，移除不必要的字段
  const userPageQuery = {
    pageNo: currentPage.value,
    pageSize: pageSize.value
  };
  
  // 只有在有值时才添加筛选条件
  if (searchUserType.value) userPageQuery.userType = searchUserType.value;
  if (searchAccountStatus.value) userPageQuery.accountStatus = searchAccountStatus.value;
  if (searchMeterNo.value) userPageQuery.meterId = searchMeterNo.value;
  
  if (searchDateRange.value && searchDateRange.value.length === 2) {
    userPageQuery.startDate = searchDateRange.value[0];
    userPageQuery.endDate = searchDateRange.value[1];
  }
  
  if (searchText.value) {
    if (!isNaN(searchText.value)) {
      userPageQuery.phone = searchText.value;
    } else {
      userPageQuery.name = searchText.value;
    }
  }
  
  try {
    const res = await getUserList(userPageQuery);
    
    if (res && res.list) {
      userList.value = res.list;
      total.value = Number(res.total || 0);
    } else if (res && Array.isArray(res)) {
      // 处理可能的直接返回数组的情况
      userList.value = res;
      total.value = res.length;
    } else {
      console.warn('用户列表数据格式异常:', res);
      userList.value = [];
      total.value = 0;
    }
    
    // 数据加载完成后手动更新表格布局
    nextTick(() => {
      if (userTableRef.value) {
        userTableRef.value.doLayout && userTableRef.value.doLayout();
      }
    });
    
    return res;
  } catch (err) {
    console.error('获取用户列表失败:', err);
    ElMessage.error('获取用户列表失败');
    userList.value = [];
    total.value = 0;
    return null;
  } finally {
    loading.value = false;
  }
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
  try {
    const userDetail = await fetchUserDetail(userId);
    
    // 删除id字段
    if (userDetail && userDetail.id) {
      delete userDetail.id;
    }
    
    // 将billRecords映射到userPaymentRecordVOList
    if (userDetail && userDetail.billRecords && Array.isArray(userDetail.billRecords)) {
      userDetail.userPaymentRecordVOList = userDetail.billRecords.map(bill => {
        return {
          paymentTime: bill.paymentDate,
          paymentAmount: bill.billTotalAmount,
          paymentStatus: bill.paymentMethod ? '成功' : '未支付',
          paymentMethod: bill.paymentMethod || ' ',
          operator: '系统',
          remark: `用电量: ${bill.usageAmount} 度`
        };
      });
    } else {
      userDetail.userPaymentRecordVOList = [];
    }
    
    currentUser.value = userDetail;
    detailVisible.value = true;
  } catch (error) {
    console.error('获取用户详情失败:', error);
    ElMessage.error('获取用户详情失败');
  }
};

const handleCreate = () => {
  // 跳转到用户新增页面
  router.push({ name: 'AdminUserForm' });
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
    selectedUserIds.value = selectedUserIds.value.join(',');
    const res = await deleteUser(selectedUserIds.value);
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
    name: 'AdminUserEdit', 
    params: { id: row.id }
  });
};

// 用户类型表单相关
const userTypeFormVisible = ref(false);

// 处理添加用户类型
const handleAddUserType = () => {
  userTypeFormVisible.value = true;
};

// 用户类型添加成功
const handleUserTypeSuccess = () => {
  ElMessage.success('用户类型添加成功');
  // 刷新用户类型列表
  fetchUserTypeList();
};

// 获取用户类型列表
const fetchUserTypeList = async () => {
  try {
    const res = await getUserTypeList();
    
    // 更新筛选器选项
    const userTypeFilterOption = filterConfig.find(f => f.field === 'searchUserType');
    
    if (userTypeFilterOption) {
      // 保存全部选项
      const defaultOption = { label: '全部', value: '' };
      
      // 如果是简单的字符串数组 (List<String>)
      if (Array.isArray(res) && res.length > 0 && typeof res[0] === 'string') {
        userTypeFilterOption.options = [
          defaultOption,
          ...res.map(typeName => ({ label: typeName, value: typeName }))
        ];
      } 
      // 如果是对象数组 (List<UserType>)
      else if (Array.isArray(res) && res.length > 0 && typeof res[0] === 'object') {
        userTypeFilterOption.options = [
          defaultOption,
          ...res.map(type => ({ label: type.typeName, value: type.typeName }))
        ];
      }
      // 如果返回为空或非数组，保持默认选项
      else {
        console.warn('获取用户类型列表返回数据异常:', res);
        userTypeFilterOption.options = [
          defaultOption,
          { label: '居民用户', value: '居民用户' },
          { label: '商业用户', value: '商业用户' }
        ];
      }
    }
    
    return res;
  } catch (error) {
    console.error('获取用户类型列表失败:', error);
    return null;
  }
};

// 组件挂载时加载数据
onMounted(async () => {
  try {
    // 先加载用户类型列表，用于筛选
    await fetchUserTypeList();
    
    // 加载用户列表数据
    await fetchUserList(1, true);
  } catch (error) {
    console.error('数据加载失败:', error);
    ElMessage.error('数据加载失败，请刷新页面重试');
  }
});
</script>

<style scoped>
.user-dashboard {
  padding: 0px;
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

/* 自定义表格单元格样式 */
:deep(.el-table td.el-table__cell) {
  padding: 12px 0;
  height: 55px;
  line-height: 20px;
}

/* 确保表格内容垂直居中 */
:deep(.el-table .cell) {
  display: flex;
  align-items: center;
  height: 100%;
}

/* 标签特殊处理，避免由于flex布局导致的显示问题 */
:deep(.el-table .el-tag) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 操作列的特殊处理 */
:deep(.el-table .cell .el-button) {
  margin: 0 5px;
}

:deep(.el-table .cell .el-button--link) {
  height: auto;
  padding: 4px 0;
}

/* 固定列阴影效果优化 */
:deep(.el-table .is-right-fixed) {
  box-shadow: -5px 0 5px -5px rgba(0, 0, 0, 0.12);
}

:deep(.el-table .is-right-fixed .cell) {
  padding-left: 10px;
  padding-right: 10px;
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
