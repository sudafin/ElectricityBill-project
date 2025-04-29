<template>
  <div class="rate-form-container">
    <h2>{{ pageTitle }}</h2>
    
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="140px"
      :disabled="type === 'detail'"
      v-loading="loading"
    >
      <!-- 用户类型 -->
      <el-form-item label="用户类型" prop="userType">
        <el-select v-model="form.userType" placeholder="请选择用户类型" style="width: 100%" :disabled="type === 'detail'">
          <el-option
            v-for="item in userTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <!-- 费率设置部分 -->
      <div class="form-section">
        <div class="section-title">费率设置</div>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="峰时电价" prop="peakPrice">
              <el-input v-model="form.peakPrice" placeholder="请输入峰时电价" :disabled="type === 'detail'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="平时电价" prop="flatPrice">
              <el-input v-model="form.flatPrice" placeholder="请输入平时电价" :disabled="type === 'detail'" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="谷时电价" prop="valleyPrice">
              <el-input v-model="form.valleyPrice" placeholder="请输入谷时电价" :disabled="type === 'detail'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="夏季尖峰电价" prop="summerPeakPrice">
              <el-input v-model="form.summerPeakPrice" placeholder="请输入夏季尖峰电价" :disabled="type === 'detail'" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="折扣率" prop="discount">
              <el-input v-model="form.discount" placeholder="请输入折扣率" :disabled="type === 'detail'" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      
      <!-- 时段设置部分 -->
      <div class="form-section">
        <div class="section-title">时段设置</div>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="峰时段" prop="peakStart">
              <el-time-picker
                v-model="form.peakStart"
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                placeholder="开始时间"
                :disabled="type === 'detail'"
              />
              <span style="margin: 0 10px;">至</span>
              <el-time-picker
                v-model="form.peakEnd"
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                placeholder="结束时间"
                :disabled="type === 'detail'"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="谷时段" prop="valleyStart">
              <el-time-picker
                v-model="form.valleyStart"
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                placeholder="开始时间"
                :disabled="type === 'detail'"
              />
              <span style="margin: 0 10px;">至</span>
              <el-time-picker
                v-model="form.valleyEnd"
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                placeholder="结束时间"
                :disabled="type === 'detail'"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="夏季时段">
          <el-date-picker
            v-model="summerStartDate"
            type="date"
            format="M.D"
            value-format="M.D"
            placeholder="开始日期"
            style="width: 180px"
            :disabled="type === 'detail'"
          />
          <span class="date-separator">至</span>
          <el-date-picker
            v-model="summerEndDate"
            type="date"
            format="M.D"
            value-format="M.D"
            placeholder="结束日期"
            style="width: 180px"
            :disabled="type === 'detail'"
          />
        </el-form-item>
      </div>
      
      <!-- 生效设置部分 -->
      <div class="form-section">
        <div class="section-title">生效设置</div>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生效日期" prop="effectiveDate">
              <el-date-picker
                v-model="form.effectiveDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :disabled="type === 'detail'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="失效日期" prop="expireDate">
              <el-date-picker
                v-model="form.expireDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :disabled="type === 'detail'"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status" :disabled="type === 'detail'">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>
      
      <el-form-item v-if="type !== 'detail'">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="goBack">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Calendar } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getUserTypeList } from '@/api/admin/admin';
import { getRateDetail, createRate, editRate } from '@/api/admin/rate';

const route = useRoute();
const router = useRouter();
const loading = ref(false);

// 根据路由确定当前操作类型
const type = computed(() => {
  if (route.name === 'RateCreate') return 'add';
  if (route.name === 'RateEdit') return 'edit';
  return 'detail';
});

// 页面标题
const pageTitle = computed(() => {
  if (type.value === 'add') return '新增费率';
  if (type.value === 'edit') return '编辑费率';
  return '费率详情';
});

const formRef = ref(null);
const form = reactive({
  id: route.params.id || '', // 直接从路由参数获取ID
  userType: '',
  peakPrice: '',
  flatPrice: '',
  valleyPrice: '',
  summerPeakPrice: '',
  peakStart: '',
  peakEnd: '',
  valleyStart: '',
  valleyEnd: '',
  summerPeriod: '',
  status: 1,
  effectiveDate: '',
  expireDate: '',
  discount: ''
});

// 夏季时段的开始和结束日期
const summerStartDate = ref('');
const summerEndDate = ref('');

// 监听夏季时段日期变化，更新form.summerPeriod
watch([summerStartDate, summerEndDate], ([start, end]) => {
  if (start && end) {
    form.summerPeriod = `${start}至${end}`;
  } else {
    form.summerPeriod = '';
  }
});

// 用户类型选项
const userTypeOptions = ref([]);

// 表单验证规则
const rules = {
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ],
  peakPrice: [
    { required: true, message: '请输入峰时电价', trigger: 'blur' },
    { pattern: /^\d+(\.\d{1,4})?$/, message: '请输入有效的数字(最多4位小数)', trigger: 'blur' }
  ],
  flatPrice: [
    { required: true, message: '请输入平时电价', trigger: 'blur' },
    { pattern: /^\d+(\.\d{1,4})?$/, message: '请输入有效的数字(最多4位小数)', trigger: 'blur' }
  ],
  valleyPrice: [
    { required: true, message: '请输入谷时电价', trigger: 'blur' },
    { pattern: /^\d+(\.\d{1,4})?$/, message: '请输入有效的数字(最多4位小数)', trigger: 'blur' }
  ],
  peakStart: [
    { required: true, message: '请选择峰时段开始时间', trigger: 'change' }
  ],
  peakEnd: [
    { required: true, message: '请选择峰时段结束时间', trigger: 'change' }
  ],
  effectiveDate: [
    { required: true, message: '请选择生效日期', trigger: 'change' }
  ]
};

// 获取用户类型列表
const fetchUserTypes = async () => {
  try {
    const res = await getUserTypeList();
    
    if (res && Array.isArray(res)) {
      userTypeOptions.value = res
        .filter(type => type && type.trim() !== '')
        .map(type => ({ label: type, value: type }));
    }
  } catch (error) {
    console.error('获取用户类型列表失败:', error);
    userTypeOptions.value = [
      { label: '居民用户', value: '居民用户' },
      { label: '商业用户', value: '商业用户' }
    ];
  }
};

// 获取费率详情
const fetchRateDetail = async (id) => {
  loading.value = true;
  try {
    const response = await getRateDetail(id);
    console.log('获取费率详情:', response);
    
    // 保留ID并将其他字段复制到表单对象
    const currentId = form.id; // 保存当前ID（来自URL）
    
    // 使用展开运算符创建新对象，不直接修改form引用
    const newData = { ...response };
    delete newData.id; // 删除API返回的ID（如果有）
    
    // 合并数据，保留原始ID
    Object.assign(form, newData);
    form.id = currentId; // 确保ID保持不变
    
    // 处理夏季时段，拆分为两个日期
    if (form.summerPeriod && form.summerPeriod.includes('至')) {
      const [start, end] = form.summerPeriod.split('至');
      summerStartDate.value = start.trim();
      summerEndDate.value = end.trim();
    }
    
    console.log('表单数据已设置:', form);
  } catch (error) {
    ElMessage.error('获取费率详情失败');
    console.error('获取费率详情失败', error);
  } finally {
    loading.value = false;
  }
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    // 复制表单数据，准备提交
    const formData = { ...form };
    
    // 确保夏季时段格式正确
    if (summerStartDate.value && summerEndDate.value) {
      formData.summerPeriod = `${summerStartDate.value}至${summerEndDate.value}`;
    }
    
    // 将数字字段转换为数字类型
    ['peakPrice', 'flatPrice', 'valleyPrice', 'summerPeakPrice', 'discount'].forEach(numField => {
      if (formData[numField] !== '' && formData[numField] !== undefined) {
        formData[numField] = parseFloat(formData[numField]);
      }
    });
    
    // 确保状态是数字
    formData.status = parseInt(formData.status);
    
    if (type.value === 'add') {
      await createRate(formData);
      ElMessage.success('新增费率成功');
    } else if (type.value === 'edit') {
      const id = formData.id;
      delete formData.id; // 删除id字段，因为它在URL中已包含
      await editRate(id, formData);
      ElMessage.success('修改费率成功');
    }
    
    // 操作成功后返回列表页
    goBack();
  } catch (error) {
    ElMessage.error('表单验证失败，请检查输入');
    console.error('表单验证失败:', error);
  }
};

// 返回上一页
const goBack = () => {
  router.push({ name: 'RateSetting' });
};

// 组件挂载
onMounted(async () => {
  // 先获取用户类型列表
  await fetchUserTypes();
  
  // 如果是编辑或详情模式，获取费率详情
  if (type.value === 'edit' || type.value === 'detail') {
    const id = route.params.id;
    if (id) {
      await fetchRateDetail(id);
    } else {
      ElMessage.error('未找到费率ID');
      goBack();
    }
  }
});
</script>

<style scoped>
.rate-form-container {
  padding: 20px;
}

.date-separator {
  margin: 0 10px;
}
</style> 