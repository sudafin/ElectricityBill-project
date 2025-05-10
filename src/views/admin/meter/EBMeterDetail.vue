<template>
  <div class="meter-detail-container">
    <el-card class="admin-card">
      <template #header>
        <div class="header">
          <h3 class="header-title">
            <el-icon><Odometer /></el-icon>
            电表详情
          </h3>
          <div class="header-actions">
            <el-button @click="goBack">返回列表</el-button>
            <el-button type="primary" @click="handleEdit">编辑</el-button>
          </div>
        </div>
      </template>
      
      <div class="meter-detail" v-loading="loading">
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="电表编号">{{ meterDetail.meterNo }}</el-descriptions-item>
          <el-descriptions-item label="电表型号">{{ meterDetail.model }}</el-descriptions-item>
          <el-descriptions-item label="安装日期">{{ meterDetail.installDate }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag 
              :type="meterDetail.status === '正常' ? 'success' : meterDetail.status === '故障' ? 'danger' : 'info'"
            >
              {{ meterDetail.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="绑定用户" :span="2">
            <template v-if="meterDetail.userId">
              <div class="bind-user-info">
                <span>{{ meterDetail.username || '未知用户' }}</span>
                <el-tag size="small" type="success">已绑定</el-tag>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="handleUnbind"
                >
                  解除绑定
                </el-button>
              </div>
            </template>
            <template v-else>
              <div class="bind-user-info">
                <span class="no-bind-text">未绑定用户</span>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="showBindDialog"
                >
                  绑定用户
                </el-button>
              </div>
            </template>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ meterDetail.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ meterDetail.updatedAt }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="meter-data" v-if="meterDetail.userId">
          <el-divider content-position="left">电表数据统计</el-divider>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card shadow="hover" class="data-card">
                <template #header>
                  <div class="data-card-header">
                    <span>本月用电量</span>
                  </div>
                </template>
                <div class="data-card-content">
                  <div class="data-value">{{ meterData.monthUsage || 0 }}</div>
                  <div class="data-unit">千瓦时</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" class="data-card">
                <template #header>
                  <div class="data-card-header">
                    <span>本月电费</span>
                  </div>
                </template>
                <div class="data-card-content">
                  <div class="data-value">¥{{ meterData.monthCost || 0 }}</div>
                  <div class="data-unit">元</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" class="data-card">
                <template #header>
                  <div class="data-card-header">
                    <span>年累计用电量</span>
                  </div>
                </template>
                <div class="data-card-content">
                  <div class="data-value">{{ meterData.yearUsage || 0 }}</div>
                  <div class="data-unit">千瓦时</div>
                </div>
              </el-card>
            </el-col>
          </el-row>
          <div class="view-more">
            <el-button type="primary" text @click="viewMoreData">
              查看更多数据
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
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
        :meter="meterDetail" 
        @success="handleBindSuccess" 
        @cancel="bindDialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Odometer, ArrowRight } from '@element-plus/icons-vue';
import EBMeterBindUser from './EBMeterBindUser.vue';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const bindDialogVisible = ref(false);
const meterDetail = ref({});
const meterData = ref({});

// 获取电表详情
const fetchMeterDetail = async (id) => {
  loading.value = true;
  try {
    // 这里替换为实际的API调用
    const res = await getMeterDetail(id);
    meterDetail.value = res;
    
    if (res.userId) {
      fetchMeterData(id);
    }
  } catch (error) {
    ElMessage.error('获取电表详情失败');
    console.error('获取电表详情失败', error);
  } finally {
    loading.value = false;
  }
};

// 获取电表数据统计
const fetchMeterData = async (id) => {
  try {
    // 这里替换为实际的API调用
    const res = await getMeterData(id);
    meterData.value = res;
  } catch (error) {
    console.error('获取电表数据失败', error);
  }
};

// 编辑电表
const handleEdit = () => {
  router.push(`/admin/meter/edit/${route.params.id}`);
};

// 返回列表
const goBack = () => {
  router.push('/admin/meter');
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
      await unbindMeterUser(meterDetail.value.id);
      meterDetail.value.userId = null;
      meterDetail.value.username = '';
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
  meterDetail.value.userId = userData.id;
  meterDetail.value.username = userData.username;
  ElMessage.success('绑定用户成功');
  
  // 绑定成功后获取电表数据
  fetchMeterData(meterDetail.value.id);
};

// 查看更多数据
const viewMoreData = () => {
  router.push(`/admin/meter/data/${route.params.id}`);
};

onMounted(() => {
  fetchMeterDetail(route.params.id);
});
</script>

<style scoped>
@import '@/styles/admin-card.scss';

.meter-detail-container {
  padding: 20px;
  background-color: #f5f7fa;
}

.meter-detail {
  padding: 10px 0;
}

.bind-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.no-bind-text {
  color: #909399;
}

.meter-data {
  margin-top: 20px;
}

.data-card {
  height: 100%;
  transition: all 0.3s;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.data-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.data-unit {
  margin-top: 5px;
  color: #909399;
  font-size: 14px;
}

.view-more {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

:deep(.el-descriptions__label) {
  width: 120px;
}
</style> 