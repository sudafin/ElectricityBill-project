<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <el-icon><Odometer /></el-icon>
          <span class="header-title">电表维修</span>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" v-loading="loading">
        <el-form-item label="电表编号" prop="meterNo">
          <el-input v-model="form.meterNo" disabled />
        </el-form-item>
        <el-form-item label="电表型号" prop="model">
          <el-input v-model="form.model" disabled />
        </el-form-item>
        <el-form-item label="安装位置" prop="installPlace">
          <el-input v-model="form.installPlace" disabled />
        </el-form-item>
        <el-form-item label="绑定用户" prop="username">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        <el-form-item label="维修类型" prop="inspectionType">
          <el-select v-model="form.inspectionType" placeholder="请选择维修类型">
            <el-option label="定期检查" value="定期检查" />
            <el-option label="故障维修" value="故障维修" />
            <el-option label="零件更换" value="零件更换" />
            <el-option label="紧急维修" value="紧急维修" />
          </el-select>
        </el-form-item>
        <el-form-item label="故障描述" prop="faultDescription">
          <el-input 
            v-model="form.faultDescription" 
            type="textarea" 
            :rows="4" 
            placeholder="请描述故障情况" 
          />
        </el-form-item>
        <el-form-item label="维修状态" prop="inspectionStatus">
          <el-select v-model="form.inspectionStatus" placeholder="请选择维修状态">
            <el-option label="待处理" value="待处理" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </el-form-item>
        <el-form-item label="检测人员" prop="inspectorName">
          <el-input 
            v-model="form.inspectorName" 
            placeholder="请输入检测人员姓名" 
          />
        </el-form-item>
        <el-form-item label="解决方案" prop="solution">
          <el-input 
            v-model="form.solution" 
            type="textarea" 
            :rows="4" 
            placeholder="请描述解决方案" 
          />
        </el-form-item>
        <el-form-item label="维修时间" prop="inspectionTime">
          <el-date-picker
            v-model="form.inspectionTime"
            type="datetime"
            placeholder="选择维修时间"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="form.remark" 
            type="textarea" 
            :rows="3" 
            placeholder="可以添加备注信息" 
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">提交</el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Odometer, Warning, Check } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getMeterDetail, inspectionCreate } from '@/api/admin/meter';

const route = useRoute();
const router = useRouter();
const meterId = route.params.id;
const loading = ref(false);
const submitting = ref(false);
const formRef = ref(null);

const form = reactive({
  meterId: route.params.id,
  meterNo: route.params.id,
  model: '',
  installPlace: '',
  username: '',
  inspectionType: '',
  inspectionTime: new Date(),
  inspectionStatus: '待处理',
  faultDescription: '',
  solution: '',
  inspectorName: '',
  remark: '',
});

const rules = {
  inspectionType: [
    { required: true, message: '请选择维修类型', trigger: 'change' }
  ],
  faultDescription: [
    { required: true, message: '请描述故障情况', trigger: 'blur' }
  ],
  inspectionStatus: [
    { required: true, message: '请选择维修状态', trigger: 'change' }
  ],
  inspectionTime: [
    { required: true, message: '请选择维修时间', trigger: 'change' }
  ],
  inspectorName: [
    { required: true, message: '请输入检测人员姓名', trigger: 'blur' }
  ]
};

// 获取电表详情
const fetchMeterDetail = async () => {
  loading.value = true;
  try {
    const res = await getMeterDetail(meterId);
    console.log('获取电表详情:', res);
    if (res) {
      form.model = res.model || '';
      form.installPlace = res.installPlace || '';
      form.username = res.username || '未绑定';
    } else {
      ElMessage.error('获取电表详情失败');
    }
  } catch (error) {
    console.error('获取电表详情失败:', error);
    ElMessage.error('获取电表详情失败');
  } finally {
    loading.value = false;
  }
};

// 提交表单
const submitForm = async () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        console.log('提交维修信息:', form);
        await inspectionCreate({
          meterId: form.meterId,
          inspectionType: form.inspectionType,
          inspectionTime: form.inspectionTime,
          status: form.inspectionStatus,
          faultDescription: form.faultDescription,
          solution: form.solution,
          inspectorName: form.inspectorName,
          remark: form.remark
        });
        ElMessage.success('维修信息提交成功');
        goBack();
      } catch (error) {
        console.error('提交维修信息失败:', error);
        ElMessage.error('提交维修信息失败');
      } finally {
        submitting.value = false;
      }
    } else {
      ElMessage.warning('请完善表单信息');
      return false;
    }
  });
};

// 返回列表页
const goBack = () => {
  router.push('/admin/meter/list');
};

onMounted(() => {
  console.log('电表维修页面加载, ID:', meterId);
  fetchMeterDetail();
});
</script>

<style scoped>
.box-card {
  margin: 20px auto;
  max-width: 800px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
}

:deep(.el-input-number) {
  width: 200px;
}
</style> 