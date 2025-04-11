<template>
  <div class="rate-form">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="140px"
      :disabled="type === 'detail'"
    >
      <!-- 用户类型 -->
      <el-form-item label="用户类型" prop="user_type">
        <el-select v-model="form.user_type" placeholder="请选择用户类型" style="width: 100%">
          <el-option label="居民用户" value="居民用户" />
          <el-option label="商业用户" value="商业用户" />
        </el-select>
      </el-form-item>
      
      <!-- 费率设置部分 -->
      <div class="form-section">
        <div class="section-title">费率设置</div>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="峰时电价" prop="peak_price">
              <el-input v-model="form.peak_price" placeholder="请输入峰时电价">
                <template #append>元/度</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="平时电价" prop="flat_price">
              <el-input v-model="form.flat_price" placeholder="请输入平时电价">
                <template #append>元/度</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="谷时电价" prop="valley_price">
              <el-input v-model="form.valley_price" placeholder="请输入谷时电价">
                <template #append>元/度</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="夏季尖峰电价" prop="summer_peak_price">
              <el-input v-model="form.summer_peak_price" placeholder="请输入夏季尖峰电价">
                <template #append>元/度</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="折扣率" prop="discount">
              <el-input v-model="form.discount" placeholder="请输入折扣率">
                <template #append>%</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      
      <!-- 时段设置部分 -->
      <div class="form-section">
        <div class="section-title">时段设置</div>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="峰时段开始时间" prop="peak_start">
              <el-time-picker 
                v-model="form.peak_start" 
                placeholder="选择峰时段开始时间" 
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="峰时段结束时间" prop="peak_end">
              <el-time-picker 
                v-model="form.peak_end" 
                placeholder="选择峰时段结束时间" 
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="谷时段开始时间" prop="valley_start">
              <el-time-picker 
                v-model="form.valley_start" 
                placeholder="选择谷时段开始时间" 
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="谷时段结束时间" prop="valley_end">
              <el-time-picker 
                v-model="form.valley_end" 
                placeholder="选择谷时段结束时间" 
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="夏季时段" prop="summer_period">
          <el-input v-model="form.summer_period" placeholder="例如: 06-01至08-31">
            <template #prefix>
              <el-icon><Calendar /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </div>
      
      <!-- 生效设置部分 -->
      <div class="form-section">
        <div class="section-title">生效设置</div>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生效日期" prop="effective_date">
              <el-date-picker 
                v-model="form.effective_date" 
                type="date" 
                placeholder="选择生效日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="失效日期" prop="expire_date">
              <el-date-picker 
                v-model="form.expire_date" 
                type="date" 
                placeholder="选择失效日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </div>
      
      <!-- 创建/更新信息 -->
      <div v-if="type === 'detail' || type === 'edit'" class="form-section">
        <div class="section-title">其他信息</div>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="创建人">{{ form.created_by }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ form.created_at }}</el-descriptions-item>
          <el-descriptions-item label="更新人">{{ form.updated_by }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ form.updated_at }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <!-- 表单按钮 -->
      <div class="form-actions">
        <el-button v-if="type !== 'detail'" type="primary" @click="submitForm">
          {{ type === 'add' ? '添加' : '保存修改' }}
        </el-button>
        <el-button @click="cancelForm">{{ type === 'detail' ? '关闭' : '取消' }}</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineProps, defineEmits } from 'vue';
import { Calendar } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  formData: {
    type: Object,
    default: () => ({})
  },
  type: {
    type: String,
    default: 'add' // add, edit, detail
  }
});

const emit = defineEmits(['submit', 'cancel']);

const formRef = ref(null);
const form = reactive({
  id: '',
  user_type: '',
  peak_price: '',
  flat_price: '',
  valley_price: '',
  summer_peak_price: '',
  peak_start: '',
  peak_end: '',
  valley_start: '',
  valley_end: '',
  summer_period: '',
  status: 1,
  effective_date: '',
  expire_date: '',
  discount: '',
  created_by: '',
  updated_by: '',
  created_at: '',
  updated_at: ''
});

// 表单验证规则
const rules = {
  user_type: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ],
  peak_price: [
    { required: true, message: '请输入峰时电价', trigger: 'blur' },
    { pattern: /^\d+(\.\d{1,4})?$/, message: '请输入有效的数字(最多4位小数)', trigger: 'blur' }
  ],
  flat_price: [
    { required: true, message: '请输入平时电价', trigger: 'blur' },
    { pattern: /^\d+(\.\d{1,4})?$/, message: '请输入有效的数字(最多4位小数)', trigger: 'blur' }
  ],
  valley_price: [
    { required: true, message: '请输入谷时电价', trigger: 'blur' },
    { pattern: /^\d+(\.\d{1,4})?$/, message: '请输入有效的数字(最多4位小数)', trigger: 'blur' }
  ],
  peak_start: [
    { required: true, message: '请选择峰时段开始时间', trigger: 'change' }
  ],
  peak_end: [
    { required: true, message: '请选择峰时段结束时间', trigger: 'change' }
  ],
  effective_date: [
    { required: true, message: '请选择生效日期', trigger: 'change' }
  ]
};

// 初始化表单数据
onMounted(() => {
  if (props.formData && Object.keys(props.formData).length > 0) {
    Object.keys(form).forEach(key => {
      if (props.formData[key] !== undefined) {
        form[key] = props.formData[key];
      }
    });
  }
});

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    const formData = { ...form };
    emit('submit', formData);
  } catch (error) {
    ElMessage.error('表单验证失败，请检查输入');
    console.error('表单验证失败:', error);
  }
};

// 取消操作
const cancelForm = () => {
  emit('cancel');
};
</script>

<style scoped>
.rate-form {
  padding: 0 20px;
}

.form-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fb;
  border-radius: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 3px solid #409EFF;
}

.form-actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

:deep(.el-input-group__append) {
  padding: 0 12px;
  color: #606266;
  background-color: #f5f7fa;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-descriptions__label) {
  width: 120px;
}
</style> 