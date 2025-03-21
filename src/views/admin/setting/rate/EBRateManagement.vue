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
            <div class="info-value" style="width: 200px;">{{ formatReportCycle(currentSettings.reportGenerateCycle) }}</div>
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
        <!-- 费率设置部分 -->
        <transition name="fade-transform" mode="out-in">
          <div v-show="activeSection === 'rate'" class="form-section">
            <div class="rate-forms">
              <el-form
                ref="rateFormRef"
                :model="rateForm"
                :rules="rateRules"
                label-width="120px"
                class="glass-form"
              >
                <!-- 住宅费率 -->
                <el-form-item label="住宅费率" prop="houseFeeRate">
                  <div class="rate-input">
                    <el-input 
                      v-model="rateForm.houseFeeRate"
                      class="glass-input"
                      placeholder="请输入住宅费率"
                    >
                      <template #prefix>
                        <el-icon><House /></el-icon>
                      </template>
                      <template #append>元/度</template>
                    </el-input>
                    <div class="rate-buttons">
                      <el-button
                        type="primary"
                        class="glass-button-primary"
                        @click="submitRateForm('houseFeeRate')"
                      >
                        <el-icon><Check /></el-icon>
                        保存
                      </el-button>
                      <el-button 
                        class="glass-button" 
                        @click="resetRateForm"
                      >
                        <el-icon><RefreshRight /></el-icon>
                        重置
                      </el-button>
                    </div>
                  </div>
                </el-form-item>

                <!-- 商业费率 -->
                <el-form-item label="商业费率" prop="businessFeeRate">
                  <div class="rate-input">
                    <el-input 
                      v-model="rateForm.businessFeeRate"
                      class="glass-input"
                      placeholder="请输入商业费率"
                    >
                      <template #prefix>
                        <el-icon><Shop /></el-icon>
                      </template>
                      <template #append>元/度</template>
                    </el-input>
                    <div class="rate-buttons">
                      <el-button
                        type="primary"
                        class="glass-button-primary"
                        @click="submitRateForm('businessFeeRate')"
                      >
                        <el-icon><Check /></el-icon>
                        保存
                      </el-button>
                      <el-button 
                        class="glass-button" 
                        @click="resetRateForm"
                      >
                        <el-icon><RefreshRight /></el-icon>
                        重置
                      </el-button>
                    </div>
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </transition>

        <!-- 参数设置部分 -->
        <transition name="fade-transform" mode="out-in">
          <div v-show="activeSection === 'param'" class="form-section">
            <el-form
              ref="paramFormRef"
              :model="paramForm"
              :rules="paramRules"
              label-width="150px"
              class="glass-form"
            >
              <el-form-item label="缴费提醒时间" prop="paymentRemindDays">
                <div class="param-input">
                  <el-input 
                    v-model.number="paramForm.paymentRemindDays"
                    class="glass-input"
                  >
                    <template #prefix>
                      <el-icon><Bell /></el-icon>
                    </template>
                    <template #append>天</template>
                  </el-input>
                  <div class="param-buttons">
                    <el-button
                      type="primary"
                      class="glass-button-primary"
                      @click="submitParamForm"
                    >
                      <el-icon><Check /></el-icon>
                      保存
                    </el-button>
                    <el-button 
                      class="glass-button" 
                      @click="resetParamForm"
                    >
                      <el-icon><RefreshRight /></el-icon>
                      重置
                    </el-button>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="异常用电提醒阈值" prop="abnormalUsageThreshold">
                <div class="param-input">
                  <el-input 
                    v-model.number="paramForm.abnormalUsageThreshold"
                    class="glass-input"
                  >
                    <template #prefix>
                      <el-icon><Warning /></el-icon>
                    </template>
                    <template #append>度</template>
                  </el-input>
                  <div class="param-buttons">
                    <el-button
                      type="primary"
                      class="glass-button-primary"
                      @click="submitParamForm"
                    >
                      <el-icon><Check /></el-icon>
                      保存
                    </el-button>
                    <el-button 
                      class="glass-button" 
                      @click="resetParamForm"
                    >
                      <el-icon><RefreshRight /></el-icon>
                      重置
                    </el-button>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="报表生成周期" prop="reportGenerateCycle">
                <div class="param-input">
                  <el-select 
                    v-model="paramForm.reportGenerateCycle" 
                    placeholder="请选择报表生成周期"
                    style="width: 200px;"
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
                  <div class="param-buttons">
                    <el-button
                      type="primary"
                      class="glass-button-primary"
                      @click="submitParamForm"
                    >
                      <el-icon><Check /></el-icon>
                      保存
                    </el-button>
                    <el-button 
                      class="glass-button" 
                      @click="resetParamForm"
                    >
                      <el-icon><RefreshRight /></el-icon>
                      重置
                    </el-button>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </transition>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
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
import { getRateList, updateRate } from '@/api/admin/rate.js';

// 当前设置信息
const currentSettings = reactive({
  houseFeeId:0,
  businessFeeId:0,
  houseFeeRate: 0,
  businessFeeRate: 0,
  paymentRemindDays: "7",
  abnormalUsageThreshold: "100",
  reportGenerateCycle: 'daily',
  lastUpdateTime: "2025/12/12",
});
// 添加切换状态
const activeSection = ref('rate');

// 修改周期选项配置
const cycleOptions = [
  { label: '日报', value: 'daily' },
  { label: '周报', value: 'weekly' },
  { label: '月报', value: 'monthly' }
];

// 定义 rateForm
const rateForm = reactive({
  houseFeeRate: '',
  businessFeeRate: '',
});
// 参数设置表单数据
const paramForm = reactive({
  paymentRemindDays: 0,
  abnormalUsageThreshold: 0,
  reportGenerateCycle: '',
});

// 定义费率表单验证规则
const rateRules = {
  houseFeeRate: [
    { required: true, message: '请输入住宅费率', trigger: 'blur' },
  ],
  businessFeeRate: [
    { required: true, message: '请输入商业费率', trigger: 'blur' },
  ],
};

// 定义参数设置表单验证规则
const paramRules = {
  paymentRemindDays: [
    { required: true, message: '请输入缴费提醒时间', trigger: 'blur' },
  ],
  abnormalUsageThreshold: [
    { required: true, message: '请输入异常用电提醒阈值', trigger: 'blur' },
  ],
  reportGenerateCycle: [
    { required: true, message: '请选择报表生成周期', trigger: 'change' }
  ],
};

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
    const res = await getRateList();
    res.forEach(item => {
      if(item.rateName === '居民电价') {
        currentSettings.houseFeeRate = item.rateValue;
        currentSettings.houseFeeId = item.rateId;
      } else if(item.rateName === '商业电价') {
        currentSettings.businessFeeRate = item.rateValue;
        currentSettings.businessFeeId = item.rateId;
      }
    });
  } catch (error) {
    console.log(error);
  }
};


// 初始化时获取当前设置信息
fetchCurrentSettings();



// 费率表单提交
const submitRateForm = async (type) => {
  try {
    let res = null;
    if(type === 'houseFeeRate'){
      let houseFeeRate = Number(rateForm.houseFeeRate).toFixed(2);
      //转换错误
      if(isNaN(houseFeeRate)){
        ElMessage.error('住宅费率输入错误');
        return;
      }
      res = await updateRate(currentSettings.houseFeeId,houseFeeRate);
    }else{
      let businessFeeRate = Number(rateForm.businessFeeRate).toFixed(2);
      //转换错误
      if(isNaN(businessFeeRate)){
        ElMessage.error('商业费率输入错误');
        return;
      }
      res = await updateRate(currentSettings.businessFeeId,businessFeeRate);
    }
    if(res.code === 200){
      ElMessage.success('费率保存成功');
      fetchCurrentSettings();
    }else{
      ElMessage.error('费率保存失败');
    }
  } catch (error) {
    ElMessage.error('费率保存失败');
  }
};

// 参数设置表单提交
const submitParamForm = async () => {
  try {
    //不用请求后端直接假数据生成,按照输入的数据生成
    currentSettings.paymentRemindDays = paramForm.paymentRemindDays;
    currentSettings.abnormalUsageThreshold = paramForm.abnormalUsageThreshold;
    currentSettings.reportGenerateCycle = paramForm.reportGenerateCycle;
    currentSettings.lastUpdateTime = new Date().toISOString();
    ElMessage.success('参数设置保存成功');
    fetchCurrentSettings();
  } catch (error) {
    ElMessage.error('参数设置保存失败');
  }
};


// 重置费率表单
const resetRateForm = () => {
  rateForm.houseFeeRate = '';
  rateForm.businessFeeRate = '';
};


// 重置参数设置表单
const resetParamForm = () => {
  paramForm.paymentRemindDays = 0;
  paramForm.abnormalUsageThreshold = 0;
  paramForm.reportGenerateCycle = '';
};
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
  width: 100px;
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

.rate-forms {
  margin-bottom: 24px;
}

.rate-input {
  display: flex;
  align-items: center;
  gap: 16px;
}

.rate-buttons {
  display: flex;
  gap: 16px;
}

.rate-buttons .el-button {
  width: 100px;
}

.param-input {
  display: flex;
  align-items: center;
  gap: 16px;
}

.param-buttons {
  display: flex;
  gap: 16px;
}

.param-buttons .el-button {
  width: 100px;
}
</style> 