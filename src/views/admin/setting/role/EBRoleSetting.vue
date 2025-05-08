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
            <el-icon><Plus /></el-icon>新增角色或管理员
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
            <el-button type="warning" link size="small" @click="handleModifyRole(row)">修改</el-button>
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

    <!-- 修改角色对话框 -->
    <el-dialog
      v-model="roleModifyDialogVisible"
      title="修改角色或密码"
      width="450px"
      :close-on-click-modal="false"
      @closed="resetRoleForm"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleFormRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="选择角色" prop="role">
          <el-select v-model="roleForm.role" placeholder="请选择角色" filterable>
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <div style="display: flex; align-items: center;">
                <el-icon class="el-icon--left" v-if="item.icon">
                  <component :is="item.icon" />
                </el-icon>
                <span>{{ item.label }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设置新密码" prop="password">
          <el-input 
            v-model="roleForm.password" 
            placeholder="如不需修改密码可留空" 
            type="password" 
            show-password
          />
        </el-form-item>
        <div class="form-tip">
          <el-alert
            title="提示：您可以同时修改角色和密码，也可以只修改其中一项"
            type="info"
            :closable="false"
            show-icon
          />
        </div>
      </el-form>
      <template #footer>
        <el-button @click="roleModifyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRoleAndPassword" :loading="roleSubmitting">确定</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
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
import { 
  getAdminList, 
  deleteAdmin, 
  updateStatus, 
  getPermissionList, 
  getAdminDetail, 
  getRoleList,
  updateRole,
  editAdmin
} from '@/api/admin/role.js';
import { getPublicKey } from '@/api/admin/admin.js';
import { useAdminStore } from '@/store/admin.js';
import { EBFilterBar, EBTable } from '@/components';
import JSEncrypt from 'jsencrypt';

const adminStore = useAdminStore();
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
  try {
    const res = await getRoleList();
    roleOptions.value = res;
    
    // 更新筛选条件的角色选项
    if (res && res.length > 0) {
      // 构建新的角色选项数组，保留"全部"选项
      const roleFilterOptions = [
        { label: '全部', value: '' }
      ];
      
      // 将API返回的角色数据添加到选项中
      res.forEach(role => {
        roleFilterOptions.push({
          label: role.label,
          value: role.value
        });
      });
      
      // 更新筛选配置中的角色选项
      filterConfig.value[1].options = roleFilterOptions;
    }
  } catch (error) {
    console.error('获取角色列表失败:', error);
    ElMessage.error('获取角色列表失败');
  }
};

// 筛选条件配置
const filterConfig = ref([
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
      { label: '全部', value: '' }
    ]
  },
  {
    type: 'daterange',
    field: 'dateRange',
    label: '创建时间'
  }
]);

// 初始值
const initialFilterValues = {
  searchText: '',
  searchRole: '',
  dateRange: []
};

// 表格列配置
const tableColumns = [
  { prop: 'adminId', label: '用户编号', minWidth: '100' },
  { prop: 'account', label: '用户名', minWidth: '120' },
  { prop: 'role', label: '角色', minWidth: '120' },
  { 
    prop: 'status', 
    label: '状态',
    minWidth: '100',
    type: 'tag',
    tagMap: {
      1: 'success',
      0: 'danger'
    }
  },
  { prop: 'createTime', label: '创建时间', minWidth: '180' }
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
    // 先获取角色列表，这样筛选条件能立即更新
    await getRoleOptions();
    // 再获取管理员列表
    await fetchAdminList(1, true);
    const publicKey = await getPublicKey();
    adminStore.setPublicKey(publicKey);
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

// 修改角色相关
const roleModifyDialogVisible = ref(false);
const roleFormRef = ref(null);
const roleSubmitting = ref(false);
const roleForm = reactive({
  role: '',
  password: ''
});

const resetRoleForm = () => {
  roleForm.role = '';
  roleForm.password = '';
  if (roleFormRef.value) {
    roleFormRef.value.resetFields();
  }
};

const roleFormRules = {
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  password: [
    { validator: (rule, value) => {
      if (value && value.length < 8) {
        return Promise.reject('密码长度不能小于8位');
      }
      return Promise.resolve();
    }, trigger: 'blur' }
  ]
};

// 当前正在修改的用户ID和用户名
const currentUserId = ref('');
const currentUserName = ref('');
const currentUserRole = ref('');
const publicKey = ref(''); // 存储公钥

// 打开修改角色对话框
const handleModifyRole = async (row) => {
  try {
    // 先获取公钥用于加密密码
    publicKey.value = await getPublicKey();
    
    // 设置当前用户信息
    currentUserId.value = row.adminId;
    currentUserName.value = row.account;
    currentUserRole.value = row.role;
    roleForm.role = row.role;
    
    // 打开对话框
    roleModifyDialogVisible.value = true;
  } catch (error) {
    console.error('获取公钥失败:', error);
    ElMessage.error('系统错误，无法修改用户信息');
  }
};

// 修改用户角色和密码
const submitRoleAndPassword = async () => {
  if (!roleFormRef.value) return;
  
  await roleFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    // 检查是否有修改
    if (!roleForm.password && roleForm.role === currentUserRole.value) {
      ElMessage.warning('未检测到任何修改');
      return;
    }
    
    roleSubmitting.value = true;
    try {
      // 准备请求数据
      const requestData = {
        role: roleForm.role
      };
      
      // 判断是否修改了角色
      const isRoleChanged = roleForm.role !== currentUserRole.value;
      
      // 判断是否修改了密码，如果修改了，使用公钥加密
      if (roleForm.password) {
        // 使用JSEncrypt进行RSA加密
        const jsEncrypt = new JSEncrypt();
        jsEncrypt.setPublicKey(publicKey.value);
        requestData.password = jsEncrypt.encrypt(roleForm.password);
      }
      
      // 设置isEditRole标识
      requestData.isEditRole = isRoleChanged;
      
      // 调用编辑API
      await editAdmin(currentUserId.value, requestData);
      
      // 构建成功消息
      let successMsg = '';
      if (isRoleChanged && roleForm.password) {
        successMsg = `已修改用户 ${currentUserName.value} 的角色和密码`;
      } else if (isRoleChanged) {
        successMsg = `已将用户 ${currentUserName.value} 的角色修改为 ${roleForm.role}`;
      } else {
        successMsg = `已修改用户 ${currentUserName.value} 的密码`;
      }
      
      ElMessage.success(successMsg);
      roleModifyDialogVisible.value = false;
      
      // 重新加载数据
      await fetchAdminList(1, true);
    } catch (error) {
      console.error('修改失败:', error);
      ElMessage.error('修改失败，请重试');
    } finally {
      roleSubmitting.value = false;
    }
  });
};
</script>

<style scoped>
.role-setting {
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
</style> 