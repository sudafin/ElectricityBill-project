<template>
  <el-dialog
    v-model="dialogVisible"
    width="780px"
    :close-on-click-modal="false"
    class="role-user-form glass-dialog"
    destroy-on-close
  >
    <template #header>
      <div class="dialog-header">
        <div class="header-content">
          <div class="title">
            {{ isEdit ? '查看当前角色信息' : 
                        (activeTab === 'role' ? '新增角色' : '新增人员') }}
          </div>
          <div class="subtitle">
            {{ isEdit ? '查看当前角色信息' :
                        (activeTab === 'role' ? '配置角色信息及权限' : '创建新管理员账号') }}
          </div>
        </div>
      </div>  
    </template>

    <el-tabs v-model="activeTab" class="custom-tabs">
      <el-tab-pane name="admin" >
        <template #label>
          <div class="tab-label">
            <el-icon><Avatar /></el-icon>
            <span>{{ isEdit ? '查看管理员个人信息' : '新增管理员' }}</span>
          </div>
        </template>
        <el-form
          ref="adminFormRef"
          :model="adminForm"
          :rules="adminRules"
          label-width="120px"
          class="glass-form"
        >
          <el-form-item label="账号" prop="account">
            <el-input 
              v-model="adminForm.account" 
              placeholder="请输入账号"
              class="glass-input"
              :disabled="isEdit"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item 
            label="密码" 
            prop="password"
          >
            <el-input 
              v-model="adminForm.password" 
              type="password" 
              placeholder="请输入密码"
              class="glass-input"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item 
            label="确认密码" 
            prop="confirmPassword"
          >
            <el-input 
              v-model="adminForm.confirmPassword" 
              type="password" 
              placeholder="请再次输入密码"
              class="glass-input"
              show-password
            >
              <template #prefix>
                <el-icon><Key /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="角色" prop="role">
            <el-select 
              v-model="adminForm.adminRole" 
              placeholder="请选择角色"
              class="glass-select"
            >
              <el-option 
                v-for="(option, index) in roleOptions" 
                :key="index"
                :label="option.label" 
                :value="option.value"
              >
                <div class="select-option">
                  <el-icon>
                    <component :is="option.icon" />
                  </el-icon>
                  <span>{{ option.label }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane name="role">
        <template #label>
          <div class="tab-label">
            <el-icon><UserFilled /></el-icon>
            <span>{{ isEdit ? '管理员权限信息' : '新增角色' }}</span>
          </div>
        </template>
        <el-form
          ref="roleFormRef"
          :model="roleForm"
          :rules="roleRules"
          label-width="120px"
          class="glass-form"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input 
              v-model="roleForm.roleName" 
              placeholder="请输入角色名称"
              class="glass-input"
              :disabled="isEdit"
            >
              <template #prefix>
                <el-icon><Edit /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input 
              v-model="roleForm.roleDesc" 
              placeholder="请输入角色描述"
              class="glass-input"
              type="textarea"
              :rows="3"
              :disabled="isEdit"
            />
          </el-form-item>
          <el-form-item label="权限设置" prop="permissionItem" >
            <div class="permission-tree-container">
              <el-tree
                ref="permissionTree"
                :data="permissionList"
                :props="permissionProps"
                show-checkbox
                node-key="permissionId"
                class="permission-tree glass-tree"
                :default-expand-all="true"
              />
            </div>
          </el-form-item>
        </el-form>
      </el-tab-pane>


    </el-tabs>

    <template #footer v-if="!isInfo">
      <div class="dialog-footer">
        <el-button class="glass-button" @click="closeDialog" >
          <el-icon><Close /></el-icon>
          取消
        </el-button>
        <el-button class="glass-button-primary" type="primary" @click="submitForm">
          <el-icon><Check /></el-icon>
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, nextTick, computed ,onMounted} from 'vue';
import { useUserStore } from '@/store/user.js';
import { ElMessage } from 'element-plus';
import {
  UserFilled,
  Avatar,
  Edit,
  User,
  Lock,
  Key,
  Management,
  Operation,
  Close,
  Check,
  Monitor
} from '@element-plus/icons-vue';
import { createRoleOrAdmin,editAdmin,getRoleList } from '@/api/admin/role.js';
import { getPublicKey } from '@/api/admin/user.js';
import { encryptWithRSA } from '@/utils/encrypt.js';

const userStore = useUserStore()
const props = defineProps({
  visible: Boolean,
  editData: Object,
  permissions: Array,
  roleOptions: Array,
});
//success是一个自定义事件，用来通知父组件刷新列表,父组件通过@success="handleRoleUserFormSuccess"监听
const emit = defineEmits(['update:visible','success']);
const dialogVisible = ref(false);
const activeTab = ref('admin');
const isEdit = ref(false);
const permissionList = ref([]);
const roleFormRef = ref(null);
const adminFormRef = ref(null);
const permissionTree = ref(null);
const isInfo = ref(false);

// 角色规则 - 根据查看状态动态设置规则
const roleRules = computed(() => ({
  roleName: [
    { 
      required: true, 
      message: '请输入角色名称', 
      trigger: 'blur',
      // 查看时不验证角色名称
      validator: (rule, value, callback) => {
        if (isEdit.value) {
          callback();
        } else if (!value) {
          callback(new Error('请输入角色名称'));
        } else {
          callback();
        }
      }
    }
  ],
  roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }],
  permissionsTree: 
  //只要一个以上的处理框就可以
  { required: true, message: '请选择权限', trigger: 'change' }
}));

// 管理员规则
const adminRules = computed(() => ({
  account: [
    { required: !isEdit.value, message: '请输入账号', trigger: 'blur' },
    { min: 8, max: 16, message: '账号长度应为8-16位', trigger: 'blur' },
    { pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/, message: '账号应包含数字和字母', trigger: 'blur' },
  ],
  adminRole: [{ required: true, message: '请选择角色', trigger: 'change' }],
  
    password: [
      { required: !isEdit.value, message: '请输入密码', trigger: 'blur' },
      { min: 8, max: 16, message: '密码长度应为8-16位', trigger: 'blur' },
      { pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/, message: '密码应包含数字和字母', trigger: 'blur' },
    ],
    confirmPassword: [
      { required: !isEdit.value, message: '请再次输入密码', trigger: 'blur' },
      { min: 8, max: 16, message: '密码长度应为8-16位', trigger: 'blur' },
      { pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/, message: '密码应包含数字和字母', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (value !== adminForm.password) {
            callback(new Error('两次输入的密码不一致'));
          } else {
            callback();
          }
        },
        trigger: 'blur',
      },
    ],
}));


// 表单数据
const roleForm = reactive({
  roleName: '',
  roleDesc: '',
});

const adminForm = reactive({
  adminId: '',
  account: '',
  password: '',
  confirmPassword: '',
  adminRole: '',
});

// 重置表单函数 - 移到前面
const resetForm = () => {
  if (roleFormRef.value) {
    roleFormRef.value.resetFields();
  }
  if (adminFormRef.value) {
    adminFormRef.value.resetFields();
  }
  if (permissionTree.value) {
    permissionTree.value.setCheckedKeys([]);
  }
  
  // 重置角色表单
  Object.assign(roleForm, {
    roleName: '',
    roleDesc: '',
  });
  
  // 重置管理员表单
  Object.assign(adminForm, {
    adminId: '',
    account: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  
  activeTab.value = 'admin';
  isEdit.value = false;
};

// 监听查看数据变化
watch(
  () => props.editData,
  // newVal不为空,说明是查看状态
  (newVal) => {
    if (newVal) {
      isEdit.value = true;
        // 角色查看
      activeTab.value = 'admin';
      // 用户查看 - 始终设置用户信息
      Object.assign(adminForm, { 
        adminId: newVal.adminId || '',
        account: newVal.account || '',
        role: newVal.role || '',
      });
      Object.assign(roleForm, {
        roleName: newVal.role || '',
        roleDesc: newVal.roleDesc || '',
      });
      if (permissionTree.value) {
        permissionTree.value.setCheckedKeys(props.permissionList.map(item => item.permissionId));
      }
    } else {
      isEdit.value = false;
      resetForm();
    }
  },
  { immediate: true }
);

//监视activeTab
watch(activeTab, (val) => {
  permissionList.value= props.permissions;
  
  if(val === 'role'){
    //如果现在role页面且处于查看状态那么说明正在查看权限信息,需要把权限选择框禁用
    if(isEdit.value){
      // 将原来的数据加上disable字段,有在permission的children里面的数据也有disabled字段
      const newPermissionList = props.permissions.map(item => {
        //增减disable字段,因为后端没有穿过来同时需要在permissionTree去声明这个字段
        const newItem = {
          ...item,
          disabled: true
        };
        if (item.children && item.children.length > 0) {
          newItem.children = item.children.map(child => ({
            ...child,
            disabled: true
          }));
        }
        return newItem;
      });
      permissionList.value = newPermissionList;
      //将选项全选
      const getAllPermissionIds = (list) => {
        let ids = [];
        list.forEach(item => {
          ids.push(item.permissionId);
          if (item.children && item.children.length > 0) {
            ids = ids.concat(getAllPermissionIds(item.children));
          }
        });
        return ids;
      };
      permissionTree.value.setCheckedKeys(getAllPermissionIds(permissionList.value));
      isInfo.value = true;
    }else{
      isInfo.value = false;
    }
  }else{
    isInfo.value = false;
  }
  
},
{ immediate: true });

// 权限树属性设置
const permissionProps = {
  children: 'children',
  label: 'permissionName',
  disabled: 'disabled',
};


const closeDialog = () => {
  dialogVisible.value = false;
};

// 监听对话框显示状态
watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val;
  }
);

watch(dialogVisible, (val) => {
  emit('update:visible', val);
  if (!val) {
    resetForm();
  }
});


// 修改提交表单方法
const submitForm = async () => {
  if (activeTab.value === 'role') {
    roleFormRef.value.validate(async (valid) => {
      if (valid) {
        const role = {
          isRole : true,
          role: roleForm.roleName,
          roleDesc: roleForm.roleDesc,
          permissionIdList: [ ...permissionTree.value.getHalfCheckedKeys(),...permissionTree.value.getCheckedKeys()],
        };
        const res = await createRoleOrAdmin(role);  
        if(res.code === 200){
          ElMessage.success(isEdit.value ? '查看角色成功' : '新增角色成功');
          emit('success', 'execSuccess', role, isEdit.value);
          closeDialog();
        }else{
          ElMessage.error(res.msg);
        }
      }
    });
  } else if (activeTab.value === 'admin') {
    adminFormRef.value.validate(async (valid) => {
        if(isEdit.value){
          if (valid) {
            // 构造提交数据，只包含必要字段
            const submitData = {
              account: adminForm.account,
              role: adminForm.adminRole,
              password: adminForm.password ? encryptWithRSA(adminForm.password, userStore.publicKey) : '',
            };
            const res = await editAdmin(props.editData.adminId,submitData);
            if(res.code === 200){   
              //TODO 因为后端每次重新启动公钥就会刷新,所以需要重新获取公钥
              ElMessage.success(isEdit.value ? '查看管理员成功' : '新增管理员成功');
              //emit用来通知父组件刷新列表第一个参数是自定义事件名，第二个后面是参数数据
              emit('success',"execSuccess", submitData, isEdit.value);
              closeDialog();
            }else if(res.code === 401){
              await userStore.logout()
              ElMessage.success(res.msg)
              closeDialog();
              //跳转到登录页面
              router.push('/login');
            }else{
              ElMessage.error(res.msg);
            }
          }
        }else{
          if (valid) {
            const publicKey = await getPublicKey();
            // 构造提交数据，只包含必要字段
            const submitData = {
              isRole : false,
              account: adminForm.account,
              role: adminForm.adminRole,
              password: encryptWithRSA(adminForm.password, publicKey),
              permissionList: permissionList.value,
              roleDesc: roleForm.roleDesc,
            };
            const res = await createRoleOrAdmin(submitData);
            if(res.code === 200){
              ElMessage.success(isEdit.value ? '查看管理员成功' : '新增管理员成功');
              emit('success',"execSuccess", submitData, isEdit.value);
              closeDialog();
            } else {
              ElMessage.error(res.msg);
            }
          }
      }
    });
  }
};

</script>

<style scoped>
/* 对话框基础样式 */
.glass-dialog :deep(.el-dialog) {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.6);
  overflow: hidden;
  max-width: 780px;
  width: 90vw;
  margin: 0 auto;
}

@media screen and (max-width: 768px) {
  .glass-dialog :deep(.el-dialog) {
    width: 95vw;
  }
  
  :deep(.el-form-item__label) {
    width: 90px !important;
  }
  
  :deep(.el-form-item__content) {
    width: calc(100% - 90px);
  }
}

/* 对话框头部样式 */
.dialog-header {
  padding: 24px 24px 0;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6));
}

.header-content {
  position: relative;
  padding-left: 16px;
}

.header-content::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: linear-gradient(to bottom, #409eff, #36acfe);
  border-radius: 2px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 14px;
  color: #606266;
  opacity: 0.8;
}

/* 标签页样式 */
.custom-tabs {
  padding: 0 24px;
}

.custom-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background: rgba(64, 158, 255, 0.1);
}

.custom-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  height: 48px;
  line-height: 48px;
  transition: all 0.3s;
}

.custom-tabs :deep(.el-tabs__item.is-active) {
  font-weight: 600;
  color: #409eff;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 表单样式 */
.glass-form {
  padding: 24px 20px;
  width: 100%;
  box-sizing: border-box;
}

/* 输入框样式 */
.glass-input :deep(.el-input__wrapper),
.glass-select :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  box-shadow: 
    0 2px 12px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  padding: 0 12px;
  height: 40px;
  box-sizing: border-box;
  width: 100%;
}

.glass-input :deep(.el-input__wrapper:hover),
.glass-select :deep(.el-input__wrapper:hover) {
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(64, 158, 255, 0.3);
}

.glass-input :deep(.el-input__wrapper.is-focus),
.glass-select :deep(.el-input__wrapper.is-focus) {
  box-shadow: 
    0 4px 16px rgba(64, 158, 255, 0.1),
    0 0 0 1px #409eff;
}

/* 文本域样式 */
.glass-input :deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  box-shadow: 
    0 2px 12px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  padding: 8px 12px;
  min-height: 80px;
  width: 100%;
  box-sizing: border-box;
}

/* 权限树样式 */
.permission-tree-container {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
}

.glass-tree {
  background: transparent;
}

.glass-tree :deep(.el-tree-node__content) {
  height: 40px;
  border-radius: 6px;
  margin: 4px 0;
  transition: all 0.3s;
}

.glass-tree :deep(.el-tree-node__content:hover) {
  background: rgba(64, 158, 255, 0.1);
}

/* 按钮样式 */
.dialog-footer {
  padding: 16px 24px;
  background: rgba(249, 250, 251, 0.8);
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.glass-button,
.glass-button-primary {
  height: 40px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  transition: all 0.3s;
}

.glass-button {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #606266;
}

.glass-button-primary {
  background: linear-gradient(135deg, #409eff, #36acfe);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.glass-button:hover,
.glass-button-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

/* 表单项样式 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}

.el-form-item {
  margin-bottom: 20px;
  width: 100%;
}

:deep(.el-form-item__content) {
  width: calc(100% - 120px);
  box-sizing: border-box;
}

/* 选择器下拉框样式 */
:deep(.el-select-dropdown) {
  width: auto !important;
  min-width: 200px !important;
}

:deep(.el-select-dropdown__item) {
  padding: 8px 12px;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: rgba(144, 147, 153, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(144, 147, 153, 0.5);
}

::-webkit-scrollbar-track {
  background: transparent;
}

/* 选择器选项样式优化 */
.select-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-option .el-icon {
  font-size: 16px;
  color: #409eff;
}

:deep(.el-select-dropdown__item) {
  padding: 8px 16px;
}

:deep(.el-select-dropdown__item.selected) {
  background-color: rgba(64, 158, 255, 0.1);
}

:deep(.el-select-dropdown__item:hover) {
  background-color: rgba(64, 158, 255, 0.1);
}

/* 禁用状态的输入框样式 */
.glass-input :deep(.el-input__wrapper.is-disabled) {
  background: rgba(245, 247, 250, 0.8) !important;
  color: #909399;
  cursor: not-allowed;
}
</style> 