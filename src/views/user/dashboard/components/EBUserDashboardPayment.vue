<template>
  <div class="payment-panel">
    <div class="panel-header">
      <div class="header-spacer"></div>
      <div class="panel-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          size="small"
          style="width: 260px;"
          @change="filterRecords"
        ></el-date-picker>
        <el-select v-model="statusFilter" placeholder="支付状态" size="small" style="width: 120px;" @change="filterRecords">
          <el-option label="全部" value="all"></el-option>
          <el-option label="成功" value="success"></el-option>
          <el-option label="失败" value="failed"></el-option>
          <el-option label="处理中" value="processing"></el-option>
        </el-select>
        <EBButton type="primary" @click="refreshData" :loading="loading" size="small">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </EBButton>
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
              <div class="card-icon average">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">平均每月缴费</div>
                <div class="card-value">{{ paymentStats.averageMonthly }} 元</div>
                <div class="card-description">
                  本年度平均
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 缴费记录表格 -->
      <el-card class="records-card">
        <template #header>
          <div class="card-header">
            <h3>缴费记录列表</h3>
            <router-link to="/user/payment/history">
              <EBButton type="primary" text>
                查看全部记录
                <el-icon><ArrowRight /></el-icon>
              </EBButton>
            </router-link>
          </div>
        </template>
        <el-table :data="filteredPayments" style="width: 100%" border stripe>
          <el-table-column prop="paymentDate" label="缴费日期" width="160" sortable />
          <el-table-column prop="billPeriod" label="账单周期" width="180" />
          <el-table-column prop="amount" label="金额(元)" width="120" sortable />
          <el-table-column prop="paymentMethod" label="缴费方式" width="120" />
          <el-table-column prop="transactionNo" label="交易号" width="160" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag 
                :type="scope.row.status === '成功' ? 'success' : scope.row.status === '失败' ? 'danger' : 'warning'"
              >
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <router-link :to="`/user/payment/detail/${scope.row.id}`">
                <el-button type="primary" text size="small">查看详情</el-button>
              </router-link>
              <el-button 
                type="success" 
                text 
                size="small" 
                @click="downloadReceipt(scope.row)" 
                :disabled="scope.row.status !== '成功'"
              >
                下载凭证
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalRecords"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh, Money, Document, TrendCharts, ArrowRight } from '@element-plus/icons-vue';
import { EBButton } from '@/components';

const loading = ref(false);
const dateRange = ref([]);
const statusFilter = ref('all');
const currentPage = ref(1);
const pageSize = ref(10);
const totalRecords = ref(0);

// 缴费统计数据 - 使用本地假数据
const paymentStats = reactive({
  totalAmount: 2350.50,
  totalCount: 12,
  averageMonthly: 195.88
});

// 缴费记录 - 使用本地假数据
const paymentRecords = ref([
  { id: 1, paymentDate: '2023-03-15', billPeriod: '2023-02-01 至 2023-02-28', amount: 186.9, paymentMethod: '微信支付', transactionNo: 'WX202303151234', status: '成功' },
  { id: 2, paymentDate: '2023-02-15', billPeriod: '2023-01-01 至 2023-01-31', amount: 196.0, paymentMethod: '支付宝', transactionNo: 'ZFB202302151456', status: '成功' },
  { id: 3, paymentDate: '2023-01-16', billPeriod: '2022-12-01 至 2022-12-31', amount: 217.0, paymentMethod: '银行卡', transactionNo: 'BANK202301161023', status: '成功' },
  { id: 4, paymentDate: '2022-12-15', billPeriod: '2022-11-01 至 2022-11-30', amount: 203.0, paymentMethod: '微信支付', transactionNo: 'WX202212150945', status: '成功' },
  { id: 5, paymentDate: '2022-11-16', billPeriod: '2022-10-01 至 2022-10-31', amount: 189.0, paymentMethod: '支付宝', transactionNo: 'ZFB202211161532', status: '成功' },
  { id: 6, paymentDate: '2022-10-15', billPeriod: '2022-09-01 至 2022-09-30', amount: 220.5, paymentMethod: '微信支付', transactionNo: 'WX202210151022', status: '成功' },
  { id: 7, paymentDate: '2022-09-15', billPeriod: '2022-08-01 至 2022-08-31', amount: 230.0, paymentMethod: '银行卡', transactionNo: 'BANK202209151245', status: '成功' },
  { id: 8, paymentDate: '2022-08-16', billPeriod: '2022-07-01 至 2022-07-31', amount: 245.5, paymentMethod: '支付宝', transactionNo: 'ZFB202208161356', status: '成功' },
  { id: 9, paymentDate: '2022-07-15', billPeriod: '2022-06-01 至 2022-06-30', amount: 210.0, paymentMethod: '微信支付', transactionNo: 'WX202207150857', status: '成功' },
  { id: 10, paymentDate: '2022-06-15', billPeriod: '2022-05-01 至 2022-05-31', amount: 195.0, paymentMethod: '银行卡', transactionNo: 'BANK202206151503', status: '成功' },
  { id: 11, paymentDate: '2022-05-16', billPeriod: '2022-04-01 至 2022-04-30', amount: 175.5, paymentMethod: '支付宝', transactionNo: 'ZFB202205161133', status: '成功' },
  { id: 12, paymentDate: '2022-04-15', billPeriod: '2022-03-01 至 2022-03-31', amount: 182.0, paymentMethod: '微信支付', transactionNo: 'WX202204151023', status: '成功' }
]);

// 筛选后的缴费记录
const filteredPayments = computed(() => {
  let result = paymentRecords.value;
  
  // 按日期范围筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const startDate = new Date(dateRange.value[0]);
    const endDate = new Date(dateRange.value[1]);
    endDate.setHours(23, 59, 59); // 设置为当天结束时间
    
    result = result.filter(item => {
      const paymentDate = new Date(item.paymentDate);
      return paymentDate >= startDate && paymentDate <= endDate;
    });
  }
  
  // 按状态筛选
  if (statusFilter.value !== 'all') {
    const statusMap = {
      success: '成功',
      failed: '失败',
      processing: '处理中'
    };
    result = result.filter(item => item.status === statusMap[statusFilter.value]);
  }
  
  totalRecords.value = result.length;
  
  // 分页
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return result.slice(startIndex, endIndex);
});

// 刷新数据
const refreshData = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('缴费记录已更新');
  }, 800);
};

// 筛选记录
const filterRecords = () => {
  currentPage.value = 1; // 筛选后重置为第一页
  refreshData();
};

// 处理每页条数变化
const handleSizeChange = (size) => {
  pageSize.value = size;
};

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page;
};

// 下载缴费凭证
const downloadReceipt = (row) => {
  ElMessageBox.alert(
    `凭证信息：<br>
    交易号：${row.transactionNo}<br>
    缴费日期：${row.paymentDate}<br>
    缴费金额：${row.amount}元<br>
    支付方式：${row.paymentMethod}<br>
    <br>
    <strong>已生成电子回执，正在下载...</strong>`,
    '电费缴纳回执',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定'
    }
  );
  
  setTimeout(() => {
    ElMessage.success('回执下载成功');
  }, 1500);
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
  margin-bottom: 20px;
}

.header-spacer {
  flex: 1;
}

.panel-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.summary-cards {
  margin-bottom: 20px;
}

.summary-card {
  height: 120px;
  transition: all 0.3s;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.card-icon .el-icon {
  font-size: 30px;
  color: white;
}

.card-icon.total {
  background: linear-gradient(135deg, #F56C6C 0%, #f78989 100%);
}

.card-icon.count {
  background: linear-gradient(135deg, #409EFF 0%, #79bbff 100%);
}

.card-icon.average {
  background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.card-description {
  font-size: 12px;
  color: #909399;
}

.records-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 