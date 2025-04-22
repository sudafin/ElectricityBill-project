<template>
  <div class="meter-form-container">
    <el-card class="admin-card">
      <template #header>
        <div class="header">
          <h3 class="header-title">
            <el-icon><Odometer /></el-icon>
            {{ isEdit ? '编辑电表' : '新增电表' }}
          </h3>
          <div class="header-actions">
            <el-button @click="goBack">返回列表</el-button>
            <el-button type="primary" @click="submitForm" :loading="submitting">保存</el-button>
          </div>
        </div>
      </template>
      
      <el-form 
        ref="formRef"
        :model="meterForm"
        :rules="rules"
        label-width="120px"
        class="meter-form"
        v-loading="loading"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电表编号" prop="meterNo">
              <el-input v-model="meterForm.meterNo" placeholder="请输入电表编号" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电表型号" prop="model">
              <el-select v-model="meterForm.model" placeholder="请选择电表型号" style="width: 100%">
                <el-option
                  v-for="item in meterModels"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="安装位置" prop="installPlace">
              <el-input v-model="meterForm.installPlace" placeholder="请输入安装位置" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电表状态" prop="status">
              <el-select v-model="meterForm.status" placeholder="请选择电表状态" style="width: 100%">
                <el-option label="正常" value="正常" />
                <el-option label="故障" value="故障" />
                <el-option label="停用" value="停用" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="安装日期" prop="installDate">
              <el-date-picker
                v-model="meterForm.installDate"
                type="date"
                placeholder="选择安装日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" v-if="isEdit">
          <el-col :span="24">
            <el-form-item label="绑定用户">
              <div class="bind-user-info">
                <template v-if="meterForm.userId">
                  <div class="user-info">
                    <span>{{ meterForm.username || '未知用户' }}</span>
                    <el-tag size="small" type="success">已绑定</el-tag>
                  </div>
                  <el-button 
                    type="danger" 
                    link 
                    @click="handleUnbind"
                  >
                    解除绑定
                  </el-button>
                </template>
                <template v-else>
                  <span class="no-bind-text">未绑定用户</span>
                  <el-button 
                    type="primary" 
                    @click="showBindDialog"
                  >
                    绑定用户
                  </el-button>
                </template>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    
    <!-- 绑定用户弹窗 -->
    <el-dialog
      v-model="bindDialogVisible"
      title="绑定用户"
      width="550px"
      destroy-on-close
    >
      <EBMeterBindUser 
        :meter="meterForm" 
        @success="handleBindSuccess" 
        @cancel="bindDialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Odometer } from '@element-plus/icons-vue';
import EBMeterBindUser from './EBMeterBindUser.vue';
import { getMeterDetail, createMeter, editMeter, getMeterModel } from '@/api/admin/meter';

const route = useRoute();
const router = useRouter();
const formRef = ref(null);
const loading = ref(false);
const submitting = ref(false);
const bindDialogVisible = ref(false);

const isEdit = computed(() => route.params.id !== undefined);

const meterForm = reactive({
  id: null,
  meterNo: '',
  model: '',
  installDate: '',
  installPlace: '',
  status: '正常',
  userId: null,
  username: ''
});

const meterModels = ref([]);

const rules = {
  meterNo: [
    { required: true, message: '请输入电表编号', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  model: [
    { required: true, message: '请选择电表型号', trigger: 'change' }
  ],
  installPlace: [
    { required: true, message: '请输入安装位置', trigger: 'blur' }
  ],
  installDate: [
    { required: true, message: '请选择安装日期', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择电表状态', trigger: 'change' }
  ]
};

// 获取电表型号列表
const fetchMeterModels = async () => {
  try {
    const res = await getMeterModel();
    meterModels.value = res || [];
  } catch (error) {
    console.error('获取电表型号列表失败', error);
  }
};

// 获取电表详情
const fetchMeterDetail = async (id) => {
  loading.value = true;
  try {
    // 这里替换为实际的API调用
    const res = await getMeterDetail(id);
    Object.assign(meterForm, res);
  } catch (error) {
    ElMessage.error('获取电表详情失败');
    console.error('获取电表详情失败', error);
  } finally {
    loading.value = false;
  }
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        if (isEdit.value) {
          // 编辑电表
          await updateMeter(meterForm);
          ElMessage.success('电表更新成功');
        } else {
          // 新增电表
          await createMeter(meterForm);
          ElMessage.success('电表创建成功');
        }
        goBack();
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新电表失败' : '创建电表失败');
        console.error(isEdit.value ? '更新电表失败' : '创建电表失败', error);
      } finally {
        submitting.value = false;
      }
    }
  });
};

// 解除绑定
const handleUnbind = () => {
  ElMessageBox.confirm('确定要解除该电表与用户的绑定关系吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 这里替换为实际的API调用
      await unbindMeterUser(meterForm.id);
      meterForm.userId = null;
      meterForm.username = '';
      ElMessage.success('解除绑定成功');
    } catch (error) {
      ElMessage.error('解除绑定失败');
      console.error('解除绑定失败', error);
    }
  }).catch(() => {});
};

// 显示绑定对话框
const showBindDialog = () => {
  bindDialogVisible.value = true;
};

// 绑定成功回调
const handleBindSuccess = (userData) => {
  bindDialogVisible.value = false;
  meterForm.userId = userData.id;
  meterForm.username = userData.username;
  ElMessage.success('绑定用户成功');
};

// 返回列表
const goBack = () => {
  router.push('/admin/meter');
};

onMounted(() => {
  fetchMeterModels();
  if (isEdit.value) {
    fetchMeterDetail(route.params.id);
  }
});
</script>

<style scoped>
@import '@/styles/admin-card.scss';

.meter-form-container {
  padding: 20px;
  background-color: #f5f7fa;
}

.meter-form {
  padding: 20px 0;
}

.bind-user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.no-bind-text {
  color: #909399;
}
</style> 