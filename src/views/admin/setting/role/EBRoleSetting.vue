<template>
  <div class="role-setting">
    <div class="content-wrapper">
      <!-- 添加标题区域 -->
      <div class="dashboard-header">
        <div class="title-area">
          <el-icon class="header-icon"><Setting /></el-icon>
          <h2 class="header-title">角色权限管理</h2>
        </div>
      </div>
      
      <!-- 使用新的筛选栏组件 -->
      <EBFilterBar
        :filters="filterConfig"
        :initial-values="initialFilterValues"
        button-size="default"
        @search="handleFilterSearch"
        @reset="clearSearch"
      >
        <!-- 添加额外按钮 -->
        <template #append-buttons>
          <el-button 
            type="primary" 
            class="action-button" 
            size="default"
            @click="handleAddRole"
          >
            <el-icon><Plus /></el-icon>新增角色
          </el-button>
          <el-button 
            type="danger" 
            class="action-button" 
            size="default"
            @click="handleBatchDelete" 
            :disabled="!selectedRows.length"
          >
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
        </template>
      </EBFilterBar>

      <!-- 使用新的表格组件 -->
      <div class="table-container">
        <EBTable
          ref="tableRef"
          :columns="tableColumns"
          :data="adminList"
          :loading="loading"
          :border="false"
          selection
          show-actions
          actions-width="200"
          :auto-height="true"
          pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          @selection-change="handleSelectionChange"
          @page-change="handlePageChange"
        >
          <!-- 角色列自定义渲染 -->
          <template #role="{ row }">
            <el-tag 
              :type="row.role === '系统管理员' ? 'danger' : 
              row.role === '运营人员' ? 'primary' : row.role === '操作员' ? 'success' : 'info'"
            >
              {{ row.role}}
            </el-tag>
          </template>

          <!-- 状态列自定义渲染 -->
          <template #status="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>

          <!-- 操作列 -->
          <template #actions="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">查看</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
            <el-button type="primary" link size="small" @click="handleUpdateStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </EBTable>
      </div>
    </div>
    
    <!-- 新增/编辑角色人员表单 -->
    <EBRoleUserForm
      v-model:visible="roleUserFormVisible"
      :edit-data="editData"
      :permissions="permissions"
      :role-options="roleOptions"
      @success="handleRoleUserFormSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Search, 
  Plus, 
  Delete, 
  Warning,
  Management,
  Operation,
  Setting
} from '@element-plus/icons-vue';
import EBRoleUserForm from './EBRoleUserForm.vue';
import { getAdminList, deleteAdmin, updateStatus, getPermissionList, getAdminDetail, getRoleList } from '@/api/admin/role.js';
import { getPublicKey } from '@/api/admin/user.js';
import { useUserStore } from '@/store/user.js';
import { EBFilterBar, EBTable } from '@/components';

const userStore = useUserStore();
// 表格数据
const loading = ref(false);
const adminList = ref([]);
const selectedRows = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const editData = ref(null);

// 搜索条件
const searchText = ref('');
const searchRole = ref('');
// 添加日期范围数据
const dateRange = ref([]);
// 表单显示控制
const roleUserFormVisible = ref(false);

// 角色选项
const roleOptions = ref([]);
// 获取角色列表
const getRoleOptions = async () => {
  const res = await getRoleList();
  roleOptions.value = res;
};

// 筛选条件配置
const filterConfig = [
  {
    type: 'input',
    field: 'searchText',
    label: '用户名',
    placeholder: '请输入用户名'
  },
  {
    type: 'select',
    field: 'searchRole',
    label: '角色',
    options: [
      { label: '全部', value: '' },
      { label: '系统管理员', value: '系统管理员' },
      { label: '运营人员', value: '运营人员' },
      { label: '操作员', value: '操作员' }
    ]
  },
  {
    type: 'daterange',
    field: 'dateRange',
    label: '创建时间'
  }
];

// 初始值
const initialFilterValues = {
  searchText: '',
  searchRole: '',
  dateRange: []
};

// 表格列配置
const tableColumns = [
  { prop: 'adminId', label: '用户编号' },
  { prop: 'account', label: '用户名' },
  { prop: 'role', label: '角色' },
  { 
    prop: 'status', 
    label: '状态',
    type: 'tag',
    tagMap: {
      1: 'success',
      0: 'danger'
    }
  },
  { prop: 'createTime', label: '创建时间' }
];

// 获取用户列表
const fetchAdminList = async (page = currentPage.value, shouldResetPage = false) => {
  loading.value = true;

  if(shouldResetPage) {
    currentPage.value = 1;
  } else {
    currentPage.value = page;
  }
  try {
    // 构建查询参数
    const res = await getAdminList({  
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      account: searchText.value,
      role: searchRole.value,
      startDate: dateRange.value && dateRange.value.length === 2 ? dateRange.value[0] : undefined,
      endDate: dateRange.value && dateRange.value.length === 2 ? dateRange.value[1] : undefined,
    });
    
    adminList.value = res.list;
    total.value = Number(res.total); 
  } catch (error) {
    ElMessage.error('获取管理员列表失败');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    await getRoleOptions();
    await fetchAdminList(1, true);
    const publicKey = await getPublicKey();
    userStore.setPublicKey(publicKey);
  } catch (error) {
    console.error('初始化数据时出错:', error);
  }
});

// 处理筛选搜索
const handleFilterSearch = (filterValues) => {
  // 更新筛选值
  searchText.value = filterValues.searchText || '';
  searchRole.value = filterValues.searchRole || '';
  dateRange.value = filterValues.dateRange || [];
  
  // 重新加载数据
  fetchAdminList(1, true);
};

// 清空搜索条件
const clearSearch = () => {
  searchText.value = '';
  searchRole.value = '';
  dateRange.value = [];
};

const handlePageChange = (page) => {
  fetchAdminList(page);
};

// 删除单个用户
const handleDelete = async (row) => {
  ElMessageBox.confirm('确定删除该管理员吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async() => {
      const res = await deleteAdmin(row.adminId)
      if(res.code === 200) {
        fetchAdminList(1, true);
        ElMessage.success("删除成功")
      } else {
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

// 表格选择事件
const handleSelectionChange = (selectionRows) => {
  selectedRows.value = selectionRows.map(row => row.adminId);
};

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的管理员');
    return;
  }
  
  ElMessageBox.confirm(`确定删除选中的 ${selectedRows.value.length} 条管理员吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const ids = selectedRows.value.join(',');
      const res = await deleteAdmin(ids);
      if(res.code === 200) {
        fetchAdminList(1, true);
        ElMessage.success("删除成功")
      } else {
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {
      ElMessage.error('网络错误');
    });
};

const permissions = ref([]);

// 新增角色/人员
const handleAddRole = async () => {
  const res = await getPermissionList();    
  permissions.value = res;
  roleUserFormVisible.value = true;
};

// 查看管理员
const handleEdit = async (row) => {
  // 分别构造管理员信息
  const editDataObj = {
    // 用户基本信息
    adminId: row.adminId,
    account: row.account,
    role: row.role,
    roleDesc: row.roleDesc,
  };
  const res = await getAdminDetail(row.adminId);
  permissions.value = res.permissionList;
  editData.value = editDataObj;
  roleUserFormVisible.value = true;
};

const handleUpdateStatus = async (row) => {
  const res = await updateStatus(row.adminId);
  if(res.code === 200) {
    fetchAdminList(1, true);
    ElMessage.success("更新状态成功");
  } else {
    ElMessage.error("更新状态失败");
  }
};

// 子组件通知父组件编辑成功
const handleRoleUserFormSuccess = (type, data, isEdit) => {
  if(type === 'execSuccess') {
    fetchAdminList(1, true);
  }
};
</script>

<style scoped>
.role-setting {
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
</style> 