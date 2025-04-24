<template>
  <div class="meter-form-container">
    <el-card class="admin-card">
      <template #header>
        <div class="header">
          <h3 class="header-title">
            <el-icon><Odometer /></el-icon>
            {{ formMode === 'create' ? '新增电表' : formMode === 'edit' ? '编辑电表' : '电表详情' }}
          </h3>
          <div class="header-actions">
            <el-button type="primary" @click="submitForm" :loading="submitting" v-if="formMode !== 'view'">保存</el-button>
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
        :disabled="formMode === 'view'"
      >
        <!-- 基本信息部分 -->
        <div class="form-section">
          <h4 class="section-title">基本信息</h4>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="电表编号" prop="meterNo" v-if="formMode !== 'create'">
                <el-input v-model="meterForm.meterNo" placeholder="请输入电表编号" :disabled="formMode === 'edit'" />
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
                  type="datetime"
                  placeholder="选择安装日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD HH:mm:ss"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="绑定用户" prop="username">
                <div class="bind-user-info" v-if="formMode !== 'create'">
                  <template v-if="meterForm.userId || meterForm.username">
                    <div class="user-info">
                      <span>{{ meterForm.username || '未知用户' }}</span>
                      <el-tag size="small" type="success">已绑定</el-tag>
                    </div>
                    <el-button 
                      type="danger" 
                      link 
                      @click="handleUnbind"
                      v-if="formMode === 'edit'"
                    >
                      解除绑定
                    </el-button>
                  </template>
                  <template v-else>
                    <span class="no-bind-text">未绑定用户</span>
                    <el-button 
                      type="primary" 
                      @click="showBindDialog"
                      v-if="formMode === 'edit'"
                    >
                      绑定用户
                    </el-button>
                  </template>
                </div>
                <span v-else class="no-bind-text">新创建电表暂不支持绑定用户</span>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <!-- 读表数据部分 -->
        <div class="form-section">
          <h4 class="section-title">读表数据</h4>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="开始读表日期" prop="startMeterReadingDate">
                <el-date-picker
                  v-model="meterForm.startMeterReadingDate"
                  type="datetime"
                  placeholder="选择开始读表日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最近读表日期" prop="lastMeterReadingDate">
                <el-date-picker
                  v-model="meterForm.lastMeterReadingDate"
                  type="datetime"
                  placeholder="选择最近读表日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="周期开始读数" prop="startReading">
                <el-input-number
                  v-model="meterForm.startReading"
                  :precision="2"
                  :step="1"
                  :min="0"
                  style="width: 100%"
                  placeholder="请输入周期开始读数"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="周期当前读数" prop="endingReading">
                <el-input-number
                  v-model="meterForm.endingReading"
                  :precision="2"
                  :step="1"
                  :min="0"
                  style="width: 100%"
                  placeholder="请输入周期当前读数"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <!-- 检测信息部分 -->
        <div class="form-section" v-if="formMode === 'view' || formMode === 'edit'">
          <h4 class="section-title">最近检测记录</h4>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="检测类型" prop="inspectionType">
                <el-select v-model="meterForm.inspectionType" placeholder="请选择检测类型" style="width: 100%">
                  <el-option label="常规检查" value="常规检查" />
                  <el-option label="故障检修" value="故障检修" />
                  <el-option label="校准" value="校准" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="检测结果" prop="inspectionResult">
                <el-select v-model="meterForm.inspectionResult" placeholder="请选择检测结果" style="width: 100%">
                  <el-option label="正常" value="正常" />
                  <el-option label="故障" value="故障" />
                  <el-option label="已修复" value="已修复" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="检测时间" prop="inspectionTime">
                <el-date-picker
                  v-model="meterForm.inspectionTime"
                  type="datetime"
                  placeholder="选择检测时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="检测人员" prop="inspectorName">
                <el-input v-model="meterForm.inspectorName" placeholder="请输入检测人员" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="meterForm.remark"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入备注"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="处理状态" prop="inspectionStatus">
                <el-select v-model="meterForm.inspectionStatus" placeholder="请选择处理状态" style="width: 100%">
                  <el-option label="待处理" value="待处理" />
                  <el-option label="处理中" value="处理中" />
                  <el-option label="已完成" value="已完成" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <!-- 操作按钮 -->

      </el-form>
      
      <!-- 如果是详情模式，展示维修历史记录 -->
      <div class="inspection-history" v-if="formMode === 'view'">
        <h4 class="section-title">维修历史记录</h4>
        <el-table
          :data="inspectionHistory"
          style="width: 100%"
          v-loading="historyLoading"
          :empty-text="historyLoading ? '加载中...' : '暂无维修记录'"
        >
          <el-table-column prop="inspectionTime" label="维修时间" width="180" />
          <el-table-column prop="inspectionType" label="维修类型" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag 
                :type="row.inspectionStatus === '已完成' ? 'success' : 
                       row.inspectionStatus === '处理中' ? 'warning' : 'info'"
              >
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="faultDescription" label="故障描述" show-overflow-tooltip />
          <el-table-column prop="solution" label="解决方案" show-overflow-tooltip />
          <el-table-column prop="inspectorName" label="维修人员" width="120" />
        </el-table>
        
        <div class="add-inspection" v-if="inspectionHistory.length > 0">
          <el-button type="primary" @click="handleRepair">
            添加新维修记录
          </el-button>
        </div>
        <el-empty v-else description="暂无维修记录" v-loading="historyLoading">
          <el-button type="primary" @click="handleRepair">添加维修记录</el-button>
        </el-empty>
      </div>
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
import { getMeterDetail, createMeter, editMeter, getMeterModel, getMeterInspectionHistory } from '@/api/admin/meter';
import request from '@/utils/request';
import { bindMeter } from '@/api/admin/user';

const route = useRoute();
const router = useRouter();
const formRef = ref(null);
const loading = ref(false);
const historyLoading = ref(false);
const submitting = ref(false);
const bindDialogVisible = ref(false);
const inspectionHistory = ref([]);

// 根据查询参数确定表单模式：创建、编辑或查看
const formMode = computed(() => {
  return route.query.mode || 'create';
});

// 根据当前模式设置页面标题
const pageTitle = computed(() => {
  switch(formMode.value) {
    case 'create': return '新增电表';
    case 'edit': return '编辑电表';
    case 'view': return '电表详情';
    default: return '电表表单';
  }
});

const meterForm = reactive({
  id: route.query.id,
  meterNo: route.query.id,
  model: '',
  installDate: '',
  installPlace: '',
  status: '正常',
  userId: null,
  username: '',
  
  // 读表数据
  startMeterReadingDate: null,
  lastMeterReadingDate: null,
  startReading: null,
  endingReading: null,
  // 检测信息
  inspectionType: '',
  inspectionId:'',
  inspectionResult: '',
  faultDescription: '',
  solution: '',
  inspectorName: '',
  inspectionTime: null,
  remark: '',
  inspectionStatus: ''
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
  ],
  // 读表数据验证规则
  startReading: [
    { required: false, message: '请输入周期开始读数', trigger: 'blur' }
  ],
  endingReading: [
    { required: false, message: '请输入周期当前读数', trigger: 'blur' }
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
    const res = await getMeterDetail(id);
    console.log('获取电表详情:', res);
    
    // 确保数据字段的一致性
    if (res.username && !res.userId) {
      console.warn('电表数据中有username但没有userId，设置默认userId');
      res.userId = res.username ? 'temp-id' : null;
    }
    
    Object.assign(meterForm, res);
    
    // 如果是查看模式，加载维修历史记录
    if (formMode.value === 'view') {
      fetchInspectionHistory(id);
    }
  } catch (error) {
    ElMessage.error('获取电表详情失败');
    console.error('获取电表详情失败', error);
  } finally {
    loading.value = false;
  }
};

// 获取维修历史记录
const fetchInspectionHistory = async (id) => {
  historyLoading.value = true;
  try {
    const res = await getMeterInspectionHistory(id);
    console.log('获取维修历史记录响应:', res);
    inspectionHistory.value = res || [];
  } catch (error) {
    console.error('获取维修历史记录失败', error);
  } finally {
    historyLoading.value = false;
  }
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        // 创建一个新的对象，不修改原始表单
        const formData = { ...meterForm };
        
        // 创建模式下移除电表编号字段
        if (formMode.value === 'create') {
          delete formData.meterNo;
        }
        
        if (formMode.value === 'edit') {
          // 编辑电表
          await editMeter(formData);
          ElMessage.success('电表更新成功');
        } else {
          // 新增电表
          await createMeter(formData);
          ElMessage.success('电表创建成功');
        }
        goBack();
      } catch (error) {
        ElMessage.error(formMode.value === 'edit' ? '更新电表失败' : '创建电表失败');
        console.error(formMode.value === 'edit' ? '更新电表失败' : '创建电表失败', error);
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
      // 使用新的 bindMeter API 进行解绑操作
      const res = await bindMeter({
        meterId: route.query.id,
        userId: meterForm.userId || '',
        status: 2 // 2表示解绑
      });
      
      if (res && res.code === 200) {
        meterForm.userId = null;
        meterForm.username = '';
        ElMessage.success('解除绑定成功');
      } else {
        ElMessage.error(res?.msg || '解除绑定失败');
      }
    } catch (error) {
      ElMessage.error('解除绑定失败');
      console.error('解除绑定失败', error);
    }
  }).catch(() => {
    console.log('取消解除绑定操作');
  });
};

// 显示绑定对话框
const showBindDialog = () => {
  bindDialogVisible.value = true;
};

// 绑定成功回调
const handleBindSuccess = (userData) => {
  bindDialogVisible.value = false;
  console.log('绑定成功，用户数据:', userData);
  
  // 确保设置正确的用户ID和用户名
  meterForm.userId = userData.id;
  meterForm.username = userData.username;
  
  ElMessage.success('绑定用户成功');
};

// 维修电表
const handleRepair = () => {
  router.push(`/admin/meter/repair/${route.query.id}`);
};

// 返回列表
const goBack = () => {
  router.push('/admin/meter/list');
};

onMounted(() => {
  console.log('电表表单加载，模式:', formMode.value, '，ID:', route.query.id);
  fetchMeterModels();
  
  // 如果是编辑或查看模式，获取电表详情
  if (formMode.value === 'edit' || formMode.value === 'view') {
    if (route.query.id) {
      fetchMeterDetail(route.query.id);
    } else {
      ElMessage.error('缺少电表ID参数');
      goBack();
    }
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

.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px dashed #ebeef5;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 500;
  color: #409EFF;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background-color: #409EFF;
  border-radius: 2px;
}

.form-footer {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 20px;
}

.inspection-history {
  margin-top: 30px;
}

.add-inspection {
  margin-top: 20px;
  text-align: center;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input-number .el-input__inner) {
  text-align: left;
}

:deep(.el-card__header) {
  padding: 15px 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: 10px;
}
</style> 