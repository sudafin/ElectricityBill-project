<template>
  <div class="payment-panel">
    <div class="panel-header">
      <div class="header-spacer"></div>
      <div class="panel-actions">
        <el-button type="primary" @click="refreshData" :loading="loading" size="medium">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <div class="panel-content" v-loading="loading">
      <!-- 缴费统计卡片 -->
      <el-row :gutter="20" class="summary-cards">
        <el-col :span="8">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <div class="card-icon total">
                <el-icon><Money /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">总缴费金额</div>
                <div class="card-value">{{ paymentStats.totalAmount }} 元</div>
                <div class="card-description">
                  本年度累计
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <div class="card-icon count">
                <el-icon><Document /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">缴费次数</div>
                <div class="card-value">{{ paymentStats.totalCount }} 次</div>
                <div class="card-description">
                  本年度累计
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <div class="card-icon payment">
                <el-icon><Wallet /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">当前待缴费</div>
                <div class="card-value">{{ currentBill.amount || '0.00' }} 元</div>
                <div class="card-description">
                  <router-link to="/user/payment" class="pay-now-link" v-if="currentBill.amount > 0">
                    <el-button type="danger" size="small" plain>立即缴费</el-button>
                  </router-link>
                  <span v-else>无待缴费账单</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 最近缴费记录 -->
      <el-card class="records-card">
        <template #header>
          <div class="card-header">
            <h3>近期缴费记录</h3>
            <div class="header-actions">
              <router-link to="/user/payment" class="view-detail-link">
                <el-button type="primary" text size="medium">
                  缴费中心
                  <el-icon><Right /></el-icon>
                </el-button>
              </router-link>
              <router-link to="/user/payment/history" class="view-detail-link">
                <el-button type="primary" text size="medium">
                  查看全部记录
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
              </router-link>
            </div>
          </div>
        </template>
        <el-table :data="recentPayments" style="width: 100%" border stripe>
          <el-table-column prop="paymentDate" label="缴费日期" width="160" />
          <el-table-column prop="billPeriod" label="账单周期" width="180" />
          <el-table-column prop="amount" label="金额(元)" width="120" />
          <el-table-column prop="paymentMethod" label="缴费方式" width="120" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag 
                :type="scope.row.status === '成功' ? 'success' : scope.row.status === '失败' ? 'danger' : 'warning'"
              >
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 无记录提示 -->
        <div v-if="recentPayments.length === 0" class="no-data">
          <el-empty description="暂无缴费记录"></el-empty>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh, Money, Document, Wallet, ArrowRight, Right } from '@element-plus/icons-vue';

const loading = ref(false);

// 电费统计数据
const paymentStats = reactive({
  totalAmount: 2350.50,
  totalCount: 12,
  averageMonthly: 195.88
});

// 当前账单信息
const currentBill = reactive({
  amount: 186.90,
  dueDate: '2023-03-25'
});

// 最近缴费记录 - 最多显示5条
const recentPayments = ref([
  { paymentDate: '2023-03-15', billPeriod: '2023-02-01 至 2023-02-28', amount: 186.9, paymentMethod: '微信支付', status: '成功' },
  { paymentDate: '2023-02-15', billPeriod: '2023-01-01 至 2023-01-31', amount: 196.0, paymentMethod: '支付宝', status: '成功' },
  { paymentDate: '2023-01-16', billPeriod: '2022-12-01 至 2022-12-31', amount: 217.0, paymentMethod: '银行卡', status: '成功' },
]);

// 刷新数据
const refreshData = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('缴费记录已更新');
  }, 800);
};

onMounted(() => {
  // 初始加载
  refreshData();
});
</script>

<style scoped>
.payment-panel {
  width: 100%;
}

.panel-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 15px;
}

.header-spacer {
  flex: 1;
}

.panel-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* 统一按钮样式 */
.panel-actions .el-button {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  border-radius: 4px;
  height: 36px;
}

.summary-cards {
  margin-bottom: 20px;
}

.summary-card {
  border-radius: 4px;
  border: none;
  height: 100%;
  transition: all 0.2s;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.summary-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.summary-card :deep(.el-card__body) {
  padding: 16px;
}

.card-content {
  display: flex;
  align-items: center;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.card-icon .el-icon {
  font-size: 24px;
  color: white;
}

.card-icon.total {
  background-color: #409EFF;
}

.card-icon.count {
  background-color: #67C23A;
}

.card-icon.payment {
  background-color: #E6A23C;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.card-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.card-description {
  font-size: 12px;
  color: #909399;
}

.pay-now-link {
  text-decoration: none;
}

.records-card {
  margin-bottom: 20px;
  border-radius: 4px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.records-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.records-card :deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f9f9f9;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

/* 表格样式 */
.records-card :deep(.el-table) {
  border: none;
  --el-table-border-color: #f0f0f0;
}

.records-card :deep(.el-table--border) {
  border: none;
  box-shadow: none;
}

.records-card :deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 500;
  color: #606266;
}

.records-card :deep(.el-table td), .records-card :deep(.el-table th) {
  padding: 10px 0;
}

.records-card :deep(.el-button.is-text) {
  color: #409EFF;
}

.records-card :deep(.el-tag) {
  border-radius: 2px;
}

/* 卡片头部按钮样式 */
.card-header .el-button--text {
  padding: 8px 15px;
  color: #409EFF;
  height: 36px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.card-header .el-button--text .el-icon {
  font-size: 14px;
  margin-left: 4px;
}

/* 去除链接下划线 */
.view-detail-link {
  text-decoration: none;
}

.no-data {
  padding: 20px 0;
}
</style> 