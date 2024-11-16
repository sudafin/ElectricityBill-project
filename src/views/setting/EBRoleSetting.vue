<template>
  <div class="role-setting">
    <el-card>
      <template #header>
        <div class="header">
          <el-button type="primary" @click="handleCreate">新增角色</el-button>
        </div>
      </template>
      <EBTable
        :loading="loading"
        :columns="columns"
        :data="roleList"
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
        @current-change="fetchRoleList"
        @size-change="fetchRoleList(1)"
      />
    </el-card>
    
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="resetForm"
    >
      <EBForm
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="角���名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="form.roleDesc" placeholder="请输入角色描述"></el-input>
        </el-form-item>
        <el-form-item label="权限设置" prop="permissions">
          <el-tree
            ref="permissionTree"
            :data="permissionList"
            :props="permissionProps"
            show-checkbox
            node-key="permissionId"
            class="permission-tree"
          ></el-tree>
        </el-form-item>
      </EBForm>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useSettingStore } from '@/store/setting';
import EBTable from '@/components/EBTable.vue';
import EBPagination from '@/components/EBPagination.vue';
import EBForm from '@/components/EBForm.vue';

const settingStore = useSettingStore();

const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('');

const columns = [
  { prop: 'roleName', label: '角色名称' },
  { prop: 'roleDesc', label: '角色描述' },
  { prop: 'actions', label: '操作', width: '150px', fixed: 'right' },
];

const form = reactive({
  roleId: '',
  roleName: '',
  roleDesc: '',
  permissions: [],
});

const rules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }],
  permissions: [{ required: true, message: '请选择权限', trigger: 'change' }],
};

const permissionList = ref([]);
const permissionProps = {
  children: 'children',
  label: 'permissionName',
};

const formRef = ref(null);
const permissionTree = ref(null);

const fetchRoleList = async (page = currentPage.value) => {
  loading.value = true;
  currentPage.value = page;
  await settingStore.fetchRoleList({
    page: currentPage.value,
    size: pageSize.value,
  });
  loading.value = false;
};

fetchRoleList();

const fetchPermissionList = async () => {
  const { data } = await settingStore.fetchPermissionList();
  permissionList.value = data;
};

fetchPermissionList();

const handleCreate = () => {
  dialogTitle.value = '新增角色';
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogTitle.value = '编辑角色';
  Object.assign(form, row);
  form.permissions = row.permissions.map((item) => item.permissionId);
  dialogVisible.value = true;
  nextTick(() => {
    permissionTree.value.setCheckedKeys(form.permissions);
  });
};

const handleDelete = async (row) => {
  await settingStore.deleteRole(row.roleId);
  await fetchRoleList();
};

const submitForm = async () => {
  await formRef.value.validate();
  form.permissions = permissionTree.value.getCheckedKeys();
  if (form.roleId) {
    await settingStore.updateRole(form);
  } else {
    await settingStore.createRole(form);
  }
  dialogVisible.value = false;
  await fetchRoleList();
};

const resetForm = () => {
  formRef.value.resetFields();
  permissionTree.value.setCheckedKeys([]);
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.permission-tree {
  max-height: 400px;
  overflow-y: auto;
}
</style> 