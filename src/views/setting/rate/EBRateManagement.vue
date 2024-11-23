<template>
  <div class="rate-management">
    <!-- 当前设置信息展示卡片 -->
    <div class="info-cards">
      <el-card class="glass-card info-card">
        <div class="info-header">
          <div class="info-title">
            <el-icon><Money /></el-icon>
            费率信息
          </div>
          <div class="info-subtitle">当前费率设置</div>
        </div>
        <div class="info-content">
          <div class="info-item">
            <div class="info-label">住宅费率</div>
            <div class="info-value highlight">{{ currentSettings.houseFeeRate }} 元/度</div>
          </div>
          <div class="info-item">
            <div class="info-label">商业费率</div>
            <div class="info-value highlight">{{ currentSettings.businessFeeRate }} 元/度</div>
          </div>
        </div>
      </el-card>

      <el-card class="glass-card info-card">
        <div class="info-header">
          <div class="info-title">
            <el-icon><Setting /></el-icon>
            参数信息
          </div>
          <div class="info-subtitle">当前参数设置</div>
        </div>
        <div class="info-content">
          <div class="info-item">
            <div class="info-label">缴费提醒时间</div>
            <div class="info-value">{{ currentSettings.paymentRemindDays }} 天</div>
          </div>
          <div class="info-item">
            <div class="info-label">异常用电阈值</div>
            <div class="info-value">{{ currentSettings.abnormalUsageThreshold }} 度</div>
          </div>
          <div class="info-item">
            <div class="info-label">报表生成周期</div>
            <div class="info-value">{{ formatReportCycle(currentSettings.reportGenerateCycle) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">最后更新时间</div>
            <div class="info-value time">{{ formatDate(currentSettings.lastUpdateTime) }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 设置表单 -->
    <el-card class="glass-card setting-card">
      <div class="setting-header">
        <div class="switch-buttons">
          <el-button 
            :class="['switch-button', { active: activeSection === 'rate' }]"
            @click="activeSection = 'rate'"
          >
            <el-icon><Money /></el-icon>
            费率设置
          </el-button>
          <el-button 
            :class="['switch-button', { active: activeSection === 'param' }]"
            @click="activeSection = 'param'"
          >
            <el-icon><Setting /></el-icon>
            参数设置
          </el-button>
        </div>
      </div>

      <div class="setting-content">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="150px"
          class="glass-form"
        >
          <!-- 费率设置部分 -->
          <transition name="fade-transform" mode="out-in">
            <div v-show="activeSection === 'rate'" class="form-section">
              <el-form-item label="住宅费率" prop="houseFeeRate">
                <el-input 
                  v-model.number="form.houseFeeRate"
                  class="glass-input"
                >
                  <template #prefix>
                    <el-icon><House /></el-icon>
                  </template>
                  <template #append>元/度</template>
                </el-input>
              </el-form-item>
              <el-form-item label="商业费率" prop="businessFeeRate">
                <el-input 
                  v-model.number="form.businessFeeRate"
                  class="glass-input"
                >
                  <template #prefix>
                    <el-icon><Shop /></el-icon>
                  </template>
                  <template #append>元/度</template>
                </el-input>
              </el-form-item>
            </div>
          </transition>

          <!-- 参数设置部分 -->
          <transition name="fade-transform" mode="out-in">
            <div v-show="activeSection === 'param'" class="form-section">
              <el-form-item label="缴费提醒时间" prop="paymentRemindDays">
                <el-input 
                  v-model.number="form.paymentRemindDays"
                  class="glass-input"
                >
                  <template #prefix>
                    <el-icon><Bell /></el-icon>
                  </template>
                  <template #append>天</template>
                </el-input>
              </el-form-item>
              <el-form-item label="异常用电提醒阈值" prop="abnormalUsageThreshold">
                <el-input 
                  v-model.number="form.abnormalUsageThreshold"
                  class="glass-input"
                >
                  <template #prefix>
                    <el-icon><Warning /></el-icon>
                  </template>
                  <template #append>度</template>
                </el-input>
              </el-form-item>
              <el-form-item label="报表生成周期" prop="reportGenerateCycle">
                <el-select 
                  v-model="form.reportGenerateCycle" 
                  placeholder="请选择报表生成周期"
                  class="glass-select"
                >
                  <el-option 
                    v-for="(option, index) in cycleOptions" 
                    :key="index"
                    :label="option.label"
                    :value="option.value"
                  >
                    <div class="select-option">
                      <el-icon><Calendar /></el-icon>
                      <span>{{ option.label }}</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </div>
          </transition>

          <el-form-item>
            <div class="form-buttons">
              <el-button 
                class="glass-button" 
                @click="resetForm"
              >
                <el-icon><RefreshRight /></el-icon>
                重置
              </el-button>
              <el-button 
                type="primary" 
                class="glass-button-primary"
                @click="submitForm"
              >
                <el-icon><Check /></el-icon>
                保存
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useSettingStore } from '@/store/setting';
import { ElMessage } from 'element-plus';
import {
  Money,
  Setting,
  RefreshRight,
  Check,
  InfoFilled,
  House,
  Shop,
  Bell,
  Warning,
  Calendar
} from '@element-plus/icons-vue';

// 当前设置信息
const currentSettings = reactive({
  houseFeeRate: 0,
  businessFeeRate: 0,
  paymentRemindDays: 0,
  abnormalUsageThreshold: 0,
  reportGenerateCycle: '',
  lastUpdateTime: null,
});

// 格式化报表周期显示
const formatReportCycle = (cycle) => {
  const cycleMap = {
    daily: '日报',
    weekly: '周报',
    monthly: '月报'
  };
  return cycleMap[cycle] || cycle;
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '暂无更新';
  return new Date(date).toLocaleString();
};

// 获取当前设置信息
const fetchCurrentSettings = async () => {
  try {
    const [feeData, paramData] = await Promise.all([
      settingStore.fetchFeeRate(),
      settingStore.fetchParams()
    ]);
    
    Object.assign(currentSettings, {
      ...feeData.data,
      ...paramData.data,
      lastUpdateTime: new Date()
    });
  } catch (error) {
   
  }
};

// 在提交成功后更新当前设置信息
const submitForm = async () => {
  try {
    await formRef.value.validate();
    await Promise.all([
      settingStore.updateFeeRate({
        houseFeeRate: form.houseFeeRate,
        businessFeeRate: form.businessFeeRate,
      }),
      settingStore.updateParams({
        paymentRemindDays: form.paymentRemindDays,
        abnormalUsageThreshold: form.abnormalUsageThreshold,
        reportGenerateCycle: form.reportGenerateCycle,
      }),
    ]);
    ElMessage.success('保存成功');
    // 更新当前设置信息
    fetchCurrentSettings();
  } catch (error) {
    ElMessage.error('保存失败');
  }
};

// 初始化时获取当前设置信息
fetchCurrentSettings();

// 修改表单数据结构
const form = reactive({
  // 费率设置部分
  houseFeeRate: 0,
  businessFeeRate: 0,
  rateName: '', // 添加费率名称字段
  
  // 参数设置部分
  paymentRemindDays: 0,
  abnormalUsageThreshold: 0,
  reportGenerateCycle: '',
});

// 修改验证规则
const rules = {
  // 费率验证规则
  rateName: [
    { required: true, message: '请输入费率名称', trigger: 'blur' }
  ],
  houseFeeRate: [
    { required: true, message: '请输入住宅费率', trigger: 'blur' },
    { type: 'number', message: '费率必须为数字', trigger: ['blur', 'change'] },
  ],
  businessFeeRate: [
    { required: true, message: '请输入商业费率', trigger: 'blur' },
    { type: 'number', message: '费率必须为数字', trigger: ['blur', 'change'] },
  ],
  // 参数验证规则
  paymentRemindDays: [
    { required: true, message: '请输入缴费提醒时间', trigger: 'blur' },
    { type: 'number', message: '提醒时间必须为数字', trigger: ['blur', 'change'] },
  ],
  abnormalUsageThreshold: [
    { required: true, message: '请输入异常用电提醒阈值', trigger: 'blur' },
    { type: 'number', message: '阈值必须为数字', trigger: ['blur', 'change'] },
  ],
  reportGenerateCycle: [
    { required: true, message: '请选择报表生成周期', trigger: 'change' }
  ],
};

// 添加切换状态
const activeSection = ref('rate');

// 修改周期选项配置
const cycleOptions = [
  { label: '日报', value: 'daily' },
  { label: '周报', value: 'weekly' },
  { label: '月报', value: 'monthly' }
];
</script>

<style scoped>
.rate-management {
  padding: 26px;
  background-color: #f5f7fa;
}
/* 新增和优化的样式 */
.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.info-card {
  height: 100%;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.info-header {
  margin-bottom: 20px;
}

.info-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.info-subtitle {
  font-size: 14px;
  color: #909399;
  margin-left: 28px;
}

.info-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}

.info-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.info-value {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.info-value.highlight {
  color: #409eff;
}

.info-value.time {
  font-size: 16px;
  color: #909399;
}

/* 切换按钮样式优化 */
.switch-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
}

.switch-button {
  height: 44px;
  padding: 0 32px;
  font-size: 16px;
  border-radius: 22px;
  transition: all 0.3s ease;
}

.switch-button.active {
  background: linear-gradient(135deg, #409eff, #36acfe);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(64, 158, 255, 0.3);
}

/* 表单动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.5s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 响应式优化 */
@media screen and (max-width: 768px) {
  .info-cards {
    grid-template-columns: 1fr;
  }
  
  .info-content {
    grid-template-columns: 1fr;
  }
  
  .switch-button {
    padding: 0 20px;
    font-size: 14px;
  }
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
</style> 