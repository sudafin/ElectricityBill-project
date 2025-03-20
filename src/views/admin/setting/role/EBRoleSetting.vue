<template>
  <div class="role-setting">
    <el-card class="admin-card">
      <template #header>
        <div class="header">
          <h3 class="header-title">
            <el-icon><Setting /></el-icon>
            角色权限管理
          </h3>
          <div class="search-area">
            <el-input
              v-model="searchText"
              placeholder="搜索用户名"
              clearable
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-select
              v-model="searchRole"
              clearable
              placeholder="角色"
              class="filter-select glass-select"
            >
              <el-option label="全部" value=""></el-option>
              <el-option 
                v-for="option in roleOptions" 
                :key="option.value" 
                v-bind="option"
              >
                <div class="select-option">
                  <el-icon><component :is="option.icon" /></el-icon>
                  <span>{{ option.label }}</span>
                </div>
              </el-option>
            </el-select>

            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              class="date-picker glass-date-picker"
            />
          </div>
          <div class="action-buttons">
            <el-button 
              type="primary" 
              @click="handleSearch"
            >
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button 
              type="danger" 
              class="action-button"
              :disabled="!selectedRows.length"
              :class="{ 'is-disabled': !selectedRows.length }"
              @click="handleBatchDelete"
            >
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
            <el-button 
              type="primary" 
              class="action-button"
              @click="handleAddRole"
            >
              <el-icon><Plus /></el-icon>
              新增角色
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        ref="tableRef"
        :data="adminList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        class="admin-table"
      >
        <el-table-column type="selection" width="55"  />
        <el-table-column prop="adminId" label="用户编号"  />
        <el-table-column prop="account" label="用户名"  />
        <el-table-column prop="role" label="角色" >
          <template #default="{ row }">
            <el-tag 
              :type="row.role === '系统管理员' ? 'danger' : 
              row.role === '运营人员' ? 'primary' : row.role === '操作员' ? 'success' : 'info'"
            >
              {{ row.role}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间">
          <template #default="{ row }">
            {{ row.createTime }}
          </template>
        </el-table-column>
        <el-table-column 
          label="操作" 
          align="center" 
        >
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button 
               type="primary" 
                link
                @click="handleEdit(row)"
              >
                查看
              </el-button>
              <el-button 
                type="danger" 
                link
                @click="handleDelete(row)"
              >
                删除
              </el-button>
              <el-button 
                type="primary" 
                link
                @click="handleUpdateStatus(row)"
              >
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="admin-pagination">
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
        <div class="total-info">共 {{ total }} 条记录</div>
      </div>
    </el-card>
    
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
import { getAdminList,deleteAdmin,updateStatus,getPermissionList,getAdminDetail,getRoleList } from '@/api/role.js';
import { getPublicKey } from '@/api/user.js';
import { useUserStore } from '@/store/user.js';

const userStore = useUserStore()
// 表格数据
const loading = ref(false);
const adminList = ref([]);
const selectedRows = ref([]);
const currentPage = ref(1);
const pageSize = ref(5);
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

// 获取用户列表
const fetchAdminList = async (page = currentPage.value,
shouldResetPage = false) => {
  loading.value = true;

  if(shouldResetPage){
    currentPage.value = 1;
  }else{
    currentPage.value = page;
  }
  try {
    // 构建查询参数
    const res = await getAdminList({  
      //searchText判断是数字还是中文
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
})
const handleSearch = () => {
  fetchAdminList(1,true);
}
const handlePageChange = (page) => {
  fetchAdminList(page);
}


// 删除单个用户
const handleDelete = async (row) => {
  ElMessageBox.confirm('确定删除该管理员吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async() => {
      const res = await deleteAdmin(row.adminId)
      if(res.code ===200){
        fetchAdminList(1,true);
        ElMessage.success("删除成功")
      }else{
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
  ElMessageBox.confirm(`确定删除选中的 ${selectedRows.value.length} 条管理员吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      selectedRows.value  = selectedRows.value.join(',');
      const res = await deleteAdmin(selectedRows.value);
      if(res.code ===200){
        fetchAdminList(1,true);
        ElMessage.success("删除成功")
      }else{
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
  if(res.code === 200){
    fetchAdminList(1,true);
    ElMessage.success("更新状态成功");
  }else{
    ElMessage.error("更新状态失败");
  }
}


// 子组件通知父组件编辑成功
const handleRoleUserFormSuccess = (type, data, isEdit) => {
  if(type === 'execSuccess'){
    fetchAdminList(1,true);
  }
}

</script>

<style scoped>
@import '@/styles/admin-card.scss';

.role-setting {
  padding: 20px;
  background-color: #f5f7fa;
}

/* 玻璃态卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  border-radius: 16px !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.6) !important;
  overflow: hidden;
}

/* 头部样式调整 */
.header {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: nowrap;
  margin-bottom: 20px;
}

.search-area {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.search-input-wrapper {
  width: 220px;
}

.filter-select {
  width: 120px;
}

.date-picker {
  width: 280px;
}

/* 玻璃态输入框 */
.glass-input :deep(.el-input__wrapper),
.glass-select :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(8px);
  box-shadow: 
    0 2px 12px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.7) !important;
  border-radius: 8px;
}

/* 按钮样式调整 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.glass-button-primary,
.glass-button-danger,
.glass-button {
  height: 40px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  transition: all 0.3s;
}

.glass-button-primary {
  background: linear-gradient(135deg, #409eff, #36acfe) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.glass-button-danger {
  background: #f56c6c !important;
  border: none !important;
  color: #ffffff !important;
  box-shadow: none !important;
  height: 32px;
  padding: 0 16px;
  font-size: 14px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.glass-button-danger:not(.is-disabled):hover {
  background: #ff7875 !important;
}

/* 禁用状态样式 */
.glass-button-danger.is-disabled {
  background: #fab6b6 !important;
  color: #ffffff !important;
  cursor: not-allowed;
}

.glass-button-danger.is-disabled:hover {
  background: #fab6b6 !important;
}

/* 图标样式 */
.glass-button-danger .el-icon {
  font-size: 14px;
  margin-right: 4px;
}

.glass-button {
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: #606266;
}

.glass-button:hover,
.glass-button-primary:hover,
.glass-button-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}


/* 分页样式 */
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


.data-statistics {
  color: #606266;
  font-size: 14px;
}

.data-statistics .highlight {
  color: #409eff;
  font-weight: 600;
  margin: 0 4px;
}

/* 优化分页组件样式 */
:deep(.el-pagination) {
  --el-pagination-button-bg-color: transparent;
  --el-pagination-hover-color: #409eff;
}

:deep(.el-pagination .el-select .el-input) {
  width: 100px;
}

:deep(.el-pagination .el-select .el-input .el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.8);
}

:deep(.el-pagination button) {
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
}

:deep(.el-pagination button:hover) {
  background-color: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
}

:deep(.el-pagination .el-pager li) {
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
}

:deep(.el-pagination .el-pager li:hover) {
  background-color: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
}

:deep(.el-pagination .el-pager li.active) {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

/* 删除确认框样式 */
.delete-confirm {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
}

.warning-icon {
  font-size: 24px;
  color: #f56c6c;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 选择器选项样式 */
.select-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-option .el-icon {
  font-size: 16px;
  color: #409eff;
}

/* 日期选择器样式 */
.glass-date-picker :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(8px);
  box-shadow: 
    0 2px 12px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.7) !important;
  border-radius: 8px;
}

.glass-date-picker :deep(.el-input__wrapper:hover) {
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(64, 158, 255, 0.3) !important;
}

.glass-date-picker :deep(.el-input__wrapper.is-focus) {
  box-shadow: 
    0 4px 16px rgba(64, 158, 255, 0.1),
    0 0 0 1px #409eff !important;
}

/* 响应式布局调整 */
@media screen and (max-width: 1400px) {
  .search-input-wrapper {
    width: 200px;
  }
  
  .filter-select {
    width: 100px;
  }
  
  .date-picker {
    width: 260px;
  }
  
  .glass-button-primary,
  .glass-button-danger {
    padding: 0 12px;
  }
}

@media screen and (max-width: 1200px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-area {
    margin-bottom: 12px;
  }
  
  .search-input-wrapper,
  .filter-select,
  .date-picker {
    flex: 1;
  }
  
  .action-buttons {
    justify-content: flex-end;
    margin-left: 0;
  }
}

/* 搜索框样式优化 */
.glass-input :deep(.el-input__wrapper),
.glass-select :deep(.el-input__wrapper),
.glass-date-picker :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(8px);
  box-shadow: none !important; /* 移除默认阴影 */
  border: 1px solid #dcdfe6 !important; /* 添加边框 */
  border-radius: 4px;
  transition: all 0.3s ease;
}

.glass-input :deep(.el-input__wrapper:hover),
.glass-select :deep(.el-input__wrapper:hover),
.glass-date-picker :deep(.el-input__wrapper:hover) {
  border-color: #c0c4cc !important;
}

.glass-input :deep(.el-input__wrapper.is-focus),
.glass-select :deep(.el-input__wrapper.is-focus),
.glass-date-picker :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff !important;
  box-shadow: 0 0 0 1px #409eff !important;
}

/* 表格样式优化 */
.glass-table {
  margin-top: 24px;
  border-radius: 8px;
  overflow: hidden;
}

.glass-table :deep(.el-table__header-wrapper) {
  border-radius: 8px 8px 0 0;
}

.glass-table :deep(.el-table__header) {
  background: #f5f7fa;
}

.glass-table :deep(.el-table__row) {
  background: #ffffff;
}

/* 调整表格内边距和行高 */
.glass-table :deep(.el-table td),
.glass-table :deep(.el-table th) {
  padding: 16px 0;
}

/* 调整表格列间距 */
.glass-table :deep(.el-table .cell) {
  padding: 0 16px;
  line-height: 24px;
}

/* 表格hover效果优化 */
.glass-table :deep(.el-table__row:hover > td) {
  background: #f5f7fa !important;
}

/* 表格边框和分割线 */
.glass-table :deep(.el-table__inner-wrapper::before) {
  display: none; /* 移除顶部边框 */
}

.glass-table :deep(.el-table__border-left-patch) {
  display: none;
}

.glass-table :deep(.el-table--border::after) {
  display: none;
}

/* 表格内容垂直居中 */
.glass-table :deep(.el-table .cell) {
  display: flex;
  align-items: center;
}

/* 操作列按钮样式 */
.glass-table :deep(.el-button--link) {
  height: 32px;
  padding: 0 8px;
}

/* 表格内标签样式优化 */
.glass-tag {
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 500;
}

/* 选择列样式优化 */
.glass-table :deep(.el-table-column--selection .cell) {
  padding-right: 14px;
}

.glass-table :deep(.el-checkbox__inner) {
  border-radius: 4px;
  width: 16px;
  height: 16px;
}

/* 分页区域样式优化 */
.pagination-wrapper {
  margin-top: 24px;
  padding: 16px 24px;
  border-radius: 8px;
}

/* 搜索区域间距优化 */
.search-area {
  gap: 16px;
  margin-right: 16px;
}

.search-input-wrapper {
  width: 240px;
}

.filter-select {
  width: 140px;
}

.date-picker {
  width: 320px;
}

/* 按钮组间距优化 */
.action-buttons {
  gap: 16px;
}

/* 响应式布局优化 */
@media screen and (max-width: 1400px) {
  .search-input-wrapper {
    width: 220px;
  }
  
  .filter-select {
    width: 120px;
  }
  
  .date-picker {
    width: 300px;
  }
}

/* 统一按钮样式 */
.action-button {
  height: 32px;
  padding: 0 16px;
  font-size: 14px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  transition: all 0.2s ease;
}

/* 主要按钮（搜索和新增） */
.action-button[type="primary"] {
  background: #409eff !important;
  color: #ffffff !important;
}

.action-button[type="primary"]:hover {
  background: #66b1ff !important;
}

/* 危险按钮（批量除） */
.action-button[type="danger"] {
  background: #f56c6c !important;
  color: #ffffff !important;
}

.action-button[type="danger"]:hover:not(.is-disabled) {
  background: #ff7875 !important;
}

/* 禁用状态 */
.action-button.is-disabled {
  background: #fab6b6 !important;
  color: #ffffff !important;
  cursor: not-allowed;
}

/* 按钮组样式 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 图标样式 */
.action-button .el-icon {
  font-size: 14px;
}

/* 操作列样式优化 */
.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 操作按钮样式 */
.operation-buttons :deep(.el-button--link) {
  height: 28px;
  padding: 0;
  font-size: 14px;
}

.operation-buttons :deep(.el-button--link.el-button--primary) {
  color: #409eff;
}

.operation-buttons :deep(.el-button--link.el-button--primary:hover) {
  color: #66b1ff;
}

.operation-buttons :deep(.el-button--link.el-button--danger) {
  color: #f56c6c;
}

.operation-buttons :deep(.el-button--link.el-button--danger:hover) {
  color: #ff7875;
}
</style> 